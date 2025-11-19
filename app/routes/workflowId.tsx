// File: app/routes/workflows/$workflowId.tsx

import { json, useLoaderData, ActionFunction, LoaderFunction, redirect } from '@remix-run/react';
import { getWorkflowById, updateWorkflowById } from '~/shared/database';

export const loader: LoaderFunction = async ({ params }) => {
    const workflow = await getWorkflowById(params.workflowId, 'your_company_id');
    if (!workflow) throw new Error('Workflow not found');
    return json(workflow);
};

export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    const subject = formData.get('subject');
    const body = formData.get('body');

    const settings = {
        emailTemplate: { subject, body }
    };

    await updateWorkflowById(params.workflowId, 'your_company_id', settings);
    return redirect(`/${params.workflowId}`);
};

