import { json } from '@remix-run/node';
import * as database from '~/shared/database';
import { verifyHashFromHeader } from '~/utils/hash';
import { runAction } from '~/utils/run-action';
import { sendWebhook } from '~/services/webhookService'; // Assuming this is correctly implemented

// This function is invoked by an external scheduler/cron at an interval.
export const action = async ({ request }) => {
  console.log("Action called by cron task at:", new Date());

  verifyHashFromHeader("entronoona", request.headers);
  const now = new Date();

  // Step 1: Process Scheduled Tasks
  const scheduledTasks = await database.getScheduledTasks(now);
  for (const s of scheduledTasks) {
    const { wf, event } = s;
    const newTitle = event.event_types[0].title;
    const translatedDescription = event.event_types[0].description;
    const newCustomerCode = newTitle.match(/\d{6}/)?.[0];

    try {
      // Run the action
      await runAction(wf, {
        ...event,
        eventTitle: newTitle,
        eventDescription: translatedDescription,
        customerCode: newCustomerCode,
      });

      // Log the task as sent
      await database.addToSent(wf, event, now);

      // Remove the task after processing
      await database.deleteScheduledTask(s.id);
    } catch (error) {
      console.error(`Failed to process scheduled task ID: ${s.id}. Error: ${error.message}`);

      // Store the failed task in the failed webhooks table
      await database.storeFailedWebhook(wf.url, event, error.message);
    }
  }

  // Step 2: Send Failed Webhooks
  const failedResults = await sendFailedWebhooks();

  return json({
    ranAt: now,
    tasksProcessed: scheduledTasks.length,
    failedWebhooksProcessed: failedResults.length,
  });
};

const sendFailedWebhooks = async () => {
  console.log("Sending failed webhooks...");

  // Fetch failed webhooks from the database
  const failedWebhooks = await database.getFailedWebhooks();
  console.log("Fetched failed webhooks:", failedWebhooks);

  if (!failedWebhooks || failedWebhooks.length === 0) {
    console.log("No failed webhooks to send.");
    return [];
  }

  const processedResults = [];
  console.log("Processing failed webhooks...");
  
  for (const webhook of failedWebhooks) {
    console.log("Processing webhook:", webhook);

    const { url, data, id } = webhook; // Assuming `data` is JSON string in the database
    try {
      // Attempt to send the webhook
      const result = await sendWebhook(url, JSON.parse(data));

      if (result.status === 'success') {
        // Delete the webhook entry from the database after successful send
        await database.deleteFailedOperation(id);
        console.log(`Webhook sent successfully and deleted for ID: ${id}`);
        processedResults.push({ id, status: 'completed and deleted' });
      } else {
        console.error(`Sending failed webhook ID: ${id}. Status: ${result.status}`);
        processedResults.push({ id, status: 'failed to send' });
      }
    } catch (error) {
      console.error(`Error sending webhook ID: ${id}. Error: ${error.message}`);
      // No retry, just log the failure and move on
      processedResults.push({ id, status: 'failed', error: error.message });
    }
  }

  return processedResults;
};
