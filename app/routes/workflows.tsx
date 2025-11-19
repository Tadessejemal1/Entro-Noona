import React, { useState } from "react";
import { Link, useLoaderData } from "@remix-run/react";
import { Workflow as WorkflowIcon, Trash, CalendarCheck, CircleCheckBig } from "lucide-react";
import { json, redirect } from "@remix-run/node";
import { protectEndpoint } from "~/utils/protect-endpoint";
import { getCompanyIdFromCookie } from "~/utils/session-helpers";
import * as database from "~/shared/database";
import TemplateForm from "~/components/TemplateForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const loader = async ({ request }) => {
  try {
    await protectEndpoint(request);

    const companyId = await getCompanyIdFromCookie(request);
    if (!companyId) {
      throw new Response("Unauthorized: No valid session found.", { status: 401 });
    }

    const workflows = await database.getWorkflowsByCompanyId(companyId);
    return json({ workflows, companyId });
  } catch (error) {
    console.error("Error in loader:", error.message || error);
    if (error.status === 401) {
      throw redirect("/opencallback");
    }
    throw new Response("Failed to load workflows.", { status: 500 });
  }
};

const Workflow = () => {
  const { workflows, companyId } = useLoaderData<typeof loader>();
  const [expandedId, setExpandedId] = useState(null);

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (workflowId) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return;

    try {
      const response = await fetch("/deleteWorkflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `workflowId=${workflowId}`,
      });

      if (response.ok) {
        toast.success("Workflow deleted successfully!");
        window.location.reload();
      } else {
        throw new Error("Failed to delete workflow");
      }
    } catch (error) {
      console.error("Error deleting workflow:", error);
      toast.error("Failed to delete workflow");
    }
  };

  const handleSave = async (workflowId, { action, subject, body, recipients }) => {
    try {
      const response = await fetch("/updateWorkflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workflowId, companyId, action, subject, body, recipients }),
      });

      if (!response.ok) {
        throw new Error("Failed to update workflow");
      }

      const result = await response.json();
      toast.success(result.message);
    } catch (error) {
      console.error("Error updating workflow:", error);
      toast.error("Failed to update workflow");
    }
  };

  return (
    <WorkFlowTemplate>
      <ToastContainer />
      {workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white shadow-lg rounded-lg">
          <WorkflowIcon className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">No workflows available yet.</p>
          <p className="text-gray-400 mb-6">
            Send automated custom emails, SMS alerts, Webhook API notifications, and much more.
          </p>
        </div>
      ) : (
        workflows.map((workflow) => (
          <div key={workflow.id} className="shadow-lg rounded-lg mb-4">
            <button
              onClick={() => toggleAccordion(workflow.id)}
              className="flex justify-between items-center w-full p-4 bg-white rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <div className="flex items-center">
                <WorkflowIcon className="mr-4 w-6 h-6 text-blue-500" />
                <div className="text-left">
                  <p className="text-lg font-semibold text-gray-900">{workflow.name}</p>
                  <p className="text-lg text-gray-800">For: {JSON.parse(workflow.settings).eventTitle}</p>
                  <p className="text-sm text-gray-500">Trigger: {workflow.trigger}</p>
                  <p className="text-sm text-gray-500">Action: {workflow.action}</p>
                </div>
              </div>
              <div className="text-gray-500">{expandedId === workflow.id ? "-" : "+"}</div>
            </button>
            {expandedId === workflow.id && (
              <div className="p-4 bg-gray-50 border-t">
                {workflow.action === "email" && (
                  <TemplateForm
                    action="email"
                    initialData={JSON.parse(workflow.settings).emailTemplate || {
                      subject: "",
                      body: "",
                      recipients: "",
                    }}
                    onContinue={(data) => handleSave(workflow.id, data)}
                    buttonText="Save Changes"
                  />
                )}
                {workflow.action === "sms" && (
                  <TemplateForm
                    action="sms"
                    initialData={JSON.parse(workflow.settings).smsTemplate || { body: "", recipients: "" }}
                    onContinue={(data) => handleSave(workflow.id, data)}
                    buttonText="Save Changes"
                  />
                )}
                {workflow.action === "webhook" && (
                  <TemplateForm
                    action="webhook"
                    initialData={JSON.parse(workflow.settings).webhookTemplate || { body: "" }}
                    onContinue={(data) => handleSave(workflow.id, data)}
                    buttonText="Save Changes"
                  />
                )}
                <div className="flex justify-end mt-4">
                  <button
                    className="flex items-center justify-center text-white bg-red-500 rounded-full p-2 hover:bg-red-600 hover:shadow-lg transition-transform transform hover:-translate-y-1"
                    onClick={() => handleDelete(workflow.id)}
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </WorkFlowTemplate>
  );
};

const WorkFlowTemplate = ({ children }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">EntroNoona Workflows</h1>
        <div className="flex gap-2">
          <Link to="/scheduled">
            <button className="border-2 rounded-xl p-2 hover:bg-gray-300 text-sm flex items-center gap-1 w-[120px] justify-center">
              <CalendarCheck className="w-4" /> Scheduled
            </button>
          </Link>
          <Link to="/sent">
            <button className="border-2 rounded-xl p-2 hover:bg-gray-300 text-sm flex items-center gap-1 w-[120px] justify-center">
              <CircleCheckBig className="w-4" /> Sent
            </button>
          </Link>
          <Link to="/log">
            <button className="border-2 rounded-xl p-2 hover:bg-gray-300 text-sm flex items-center gap-1 w-[120px] justify-center">
              <CircleCheckBig className="w-4" /> View Log
            </button>
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
};

export default Workflow;
