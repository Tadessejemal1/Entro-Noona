import { json } from '@remix-run/node';
import { updateWorkflowById, getWorkflowById } from '~/shared/database'; // Adjust the path as necessary

export const action = async ({ request }) => {
  try {
    const { workflowId, companyId, action, subject, body, recipients } = await request.json();

    // Fetch the existing workflow to update its settings
    const workflow = await getWorkflowById(workflowId, companyId);
    const settings = JSON.parse(workflow.settings);

    // Update settings based on the action type
    if (action === 'sms') {
      settings.smsTemplate.body = body;
      settings.smsTemplate.recipients = recipients;
    } else if (action === 'email') {
      settings.emailTemplate.subject = subject;
      settings.emailTemplate.body = body;
      settings.emailTemplate.recipients = recipients;
    }

    // Update the workflow in the database
    await updateWorkflowById(workflowId, companyId, { settings });

    return json({ message: 'Workflow updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to update workflow:', error);
    return json({ message: 'Failed to update workflow', error: error.message }, { status: 500 });
  }
};
