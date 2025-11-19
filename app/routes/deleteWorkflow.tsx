import { redirect } from '@remix-run/node';
import * as database from '~/shared/database';
import { getCompanyIdFromCookie } from '~/utils/session-helpers';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const workflowId = formData.get('workflowId');
  const companyId = await getCompanyIdFromCookie(request);

  if (!workflowId) {
    return new Response('Workflow ID is required', { status: 400 });
  }

  await database.deleteWorkflowById(Number(workflowId), companyId);
  return redirect('/workflows'); // Redirecting to the workflow list page after deletion
};
