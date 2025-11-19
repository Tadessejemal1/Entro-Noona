import React from "react";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { json } from "@remix-run/node";
import { ArrowLeft, Zap, Trash } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import * as database from '~/shared/database';
import { protectEndpoint } from "~/utils/protect-endpoint";
import { getCompanyIdFromCookie } from "~/utils/session-helpers";

export const loader = async ({ request }) => {
  await protectEndpoint(request);
  const companyId = await getCompanyIdFromCookie(request);
  const sent = await database.getSentByCompanyId(companyId);
  return json({ sent });
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const sentId = formData.get("sentId");

  if (sentId) {
    try {
      await database.deleteSentById(sentId);
      return json({ success: true });
    } catch (error) {
      return json({ success: false, error: error.message });
    }
  }
  return json({ success: false, error: "No sent ID provided" });
};

const Sent = () => {
  const { sent } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleDelete = async (sentId: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const formData = new FormData();
      formData.append("sentId", sentId);

      try {
        await submit(formData, { method: "post" });
        toast.success("Sent item deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete sent item.");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Link to="/workflows">
            <button className="flex text-white bg-blue-500 rounded-full p-2 hover:bg-blue-600 text-sm items-center gap-1 justify-center">
              <ArrowLeft />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Sent</h1>
        </div>
      </div>
      <div>
        {sent.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white shadow-lg rounded-lg">
            <p className="text-gray-500 mb-2">No sent items available yet.</p>
          </div>
        ) : (
          sent.map((s) => (
            <div key={s.id} className="flex justify-between shadow rounded-lg w-full p-4 hover:bg-gray-100 my-2">
              <div className="flex items-center">
                <div className="px-4">
                  <Zap className="w-full h-full text-gray-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{s.wf.name}</h2>
                   <p className="text-lg text-gray-800">For: {JSON.parse(s.wf.settings).eventTitle}</p>
                  <p className="text-gray-600">Trigger: {s.wf.trigger}</p>
                  <p className="text-gray-600">Action: {s.wf.action}</p>
                  <p className="text-gray-600">Sent at: {new Date(s.dt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(s.id)}
                  className="flex items-center justify-center text-white bg-red-500 rounded-full p-2 hover:bg-red-600 hover:shadow-lg transition-transform transform hover:-translate-y-1"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sent;
