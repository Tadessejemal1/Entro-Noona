import { ActionFunction, json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  try {
    const payload = await request.json();
    console.log("Webhook received for event.updated:", payload);

    // Handle the webhook payload (e.g., update records)

    return json({ success: true });
  } catch (error) {
    console.error("Error processing event.updated webhook:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};

export default function WebhookEventUpdated() {
  return <div>Webhook for event.updated</div>;
}
