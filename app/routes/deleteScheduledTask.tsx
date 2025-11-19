import { json } from '@remix-run/node';
import { deleteScheduledTask } from '~/shared/database'; // Ensure the path is correct
import { protectEndpoint } from '~/utils/protect-endpoint';

export const action = async ({ request }) => {
  await protectEndpoint(request);
  const { taskId } = await request.json();

  try {
    await deleteScheduledTask(taskId);
    return json({ message: 'Scheduled task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete scheduled task:', error);
    return json({ message: 'Failed to delete scheduled task', error: error.message }, { status: 500 });
  }
};
