//test webhook
import { ActionFunction, json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  try {
    const payload = await request.json();
    console.log("Webhook received for event.created:", payload);

    // Handle the webhook payload (e.g., save to the database)

    return json({ success: true });
  } catch (error) {
    console.error("Error processing event.created webhook:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};

export default function WebhookEventCreated() {
  return <div>Webhook for event.created</div>;
}
