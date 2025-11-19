import React, { useState } from 'react';
import { Link, json, useLoaderData } from "@remix-run/react";
import { ArrowLeft, Clock3, Trash } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import * as database from '~/shared/database';
import { protectEndpoint } from "~/utils/protect-endpoint";
import { getCompanyIdFromCookie } from "~/utils/session-helpers";

// Helper function to calculate time difference in a human-readable format
const getTimeInterval = (startTime) => {
  const now = new Date();
  const eventTime = new Date(startTime);
  const diffInMilliseconds = eventTime - now;

  // Calculate days, hours, minutes
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} days, ${hours % 24} hours, and ${minutes} minutes`;
  } else if (hours > 0) {
    return `${hours} hours and ${minutes} minutes`;
  } else {
    return `${minutes} minutes`;
  }
};

export const loader = async ({ request }) => {
  await protectEndpoint(request);
  const companyId = await getCompanyIdFromCookie(request);
  const scheduled = await database.getScheduledTasksByCompanyId(companyId);
  return json({ scheduled });
};

const Scheduled = () => {
  const { scheduled } = useLoaderData<typeof loader>();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this scheduled task?')) return;

    setLoading(true);
    try {
      const response = await fetch('/deleteScheduledTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
      });

      if (response.ok) {
        toast.success('Scheduled task deleted successfully!');
        window.location.reload();
      } else {
        throw new Error('Failed to delete scheduled task');
      }
    } catch (error) {
      console.error('Error deleting scheduled task:', error);
      toast.error('Failed to delete scheduled task');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-800">Scheduled Tasks</h1>
        </div>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {scheduled.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No scheduled tasks available.</p>
          </div>
        ) : (
          scheduled.map((s) => {
            // Parse the wf and event columns if they are strings
            const wf = typeof s.wf === 'string' ? JSON.parse(s.wf) : s.wf;
            const event = typeof s.event === 'string' ? JSON.parse(s.event) : s.event;
            const triggerTime = new Date(s.dt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
            const timeUntilTrigger = getTimeInterval(s.dt); // Calculate time interval

            return (
              <div key={s.id} className="flex justify-between items-center p-4 hover:bg-gray-100 border-b">
                <div className="flex items-center">
                  <Clock3 className="w-10 h-10 text-gray-500 mr-4" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{wf.name}</h2>
                    <p className="text-gray-600">Trigger: {wf.trigger}</p>
                    <p className="text-gray-600">Action: {wf.action}</p>
                    <p className="text-gray-600">Event Title: {event.event_types[0].title}</p>
                    <p className="text-gray-600">Will be triggered at: {triggerTime}</p>
                    <p className="text-gray-600">Time until trigger: {timeUntilTrigger}</p> {/* Display time interval */}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  ) : (
                    <Trash
                      className="w-8 text-gray-700 hover:text-red-500 hover:cursor-pointer"
                      onClick={() => handleDelete(s.id)}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Scheduled;
