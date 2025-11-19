import { signSha256 } from "../utils/hash";

const NOONA_BASE_PATH = "https://api.noona.is/v1/hq";

// Function to get user details from token
export const getUserFromToken = async (token: string) => {
  const url = `${NOONA_BASE_PATH}/user`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  return await response.json();
};

// Function to exchange code for token
export const codeTokenExchange = async (code: string) => {
  const NOONA_CLIENT_ID = process.env.NOONA_CLIENT_ID;
  const NOONA_CLIENT_SECRET = process.env.NOONA_CLIENT_SECRET;

  const url = `${NOONA_BASE_PATH}/oauth/token?client_id=${NOONA_CLIENT_ID}&client_secret=${NOONA_CLIENT_SECRET}`;
  const data = { code, grant_type: "authorization_code" };

  const response = await fetch(url, {
    body: JSON.stringify(data),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`);
  }

  return await response.json();
};

// Function to get event types by company ID
export const getEventTypesByCompanyId = async (companyId: string, token: string) => {
  const url = `${NOONA_BASE_PATH}/companies/${companyId}/event_types`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event types: ${response.statusText}`);
  }

  const json = await response.json();
  console.log("Updated received event:", json);
  return json.map((eventType: any) => ({
    id: eventType.id,
    title: eventType.title,
    description: eventType.description,
  }));
};

// Function to get customer details
export const getCustomer = async (customerId: string, token: string) => {
  const url = `${NOONA_BASE_PATH}/customers/${customerId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch customer details: ${response.statusText}`);
  }

  return await response.json();
};

// Function to get existing webhooks for a company
export const getExistingWebhooks = async (companyId: string, token: string) => {
  const url = `${NOONA_BASE_PATH}/companies/${companyId}/webhooks`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch existing webhooks: ${response.statusText}`);
  }

  return await response.json();
};

// Function to create a new webhook dynamically for any event type
export const createWebhook = async (token: string, companyId: string, eventType: string) => {
  const hash = signSha256(companyId);
  const callbackUrlEnvKey = `${eventType.toUpperCase().replace(".", "_")}_CALLBACK_URL`;
  const callbackPath = process.env[callbackUrlEnvKey];

  if (!callbackPath) {
    throw new Error(`Environment variable ${callbackUrlEnvKey} is not defined.`);
  }

  const callbackUrl = `${process.env.APP_BASE_URL}/${callbackPath}`;
  console.log(`Constructed callback URL for ${eventType}: ${callbackUrl}`);

  const webhook = {
    title: `Entronoona ${eventType} webhook`,
    description: `EntroNoona ${eventType} webhook. Do not delete unless you know what you are doing.`,
    callback_url: callbackUrl,
    events: [eventType],
    headers: [
      {
        key: "x-entronoona-hash",
        values: [hash],
      },
    ],
    enabled: true,
    company: companyId,
  };

  const url = `${NOONA_BASE_PATH}/webhooks`;

  const response = await fetch(url, {
    body: JSON.stringify(webhook),
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to create webhook for ${eventType}: ${response.statusText}`);
  }

  return await response.json();
};

// Function to handle updated events triggered by the "event.updated" webhook
export const handleUpdatedEvent = async (event: any) => {
  try {
    console.log("Processing updated event:", event);

    const { id, company, event_types, starts_at } = event;

    // Validate necessary fields
    if (!id || !company || !event_types || !starts_at) {
      throw new Error("Invalid event payload: missing required fields");
    }

    console.log(`Event with ID ${id} updated successfully.`);
    return { success: true, message: "Event updated successfully" };
  } catch (error) {
    console.error("Error processing updated event:", error);
    throw error;
  }
};

// Function to delete an event triggered by the "event.deleted" webhook
export const deleteEventInNoona = async (eventId: string, token: string) => {
  const url = `${NOONA_BASE_PATH}/events/${eventId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete event: ${response.statusText}`);
  }

  console.log(`Event with ID ${eventId} deleted successfully.`);
  return response.status === 204; // Success
};

// Function to update an event in Noona
export const updateEventInNoona = async (eventId: string, event: any) => {
  const url = `${NOONA_BASE_PATH}/events/${eventId}`;
  const payload = {
    event_types: event.event_types,
    customer_name: event.customer_name,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    company: event.company,
    employee: event.employee,
    duration: event.duration,
    comment: event.comment,
    origin: event.origin,
    customer: event.customer,
    unconfirmed: event.unconfirmed,
    pinned: event.pinned,
    confirmed: event.confirmed,
    update_origin: event.update_origin,
  };

  const response = await fetch(url, {
    method: "POST", // Ensure this method is correct
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NOONA_API_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to update event: ${response.statusText}`);
  }

  return await response.json();
};
