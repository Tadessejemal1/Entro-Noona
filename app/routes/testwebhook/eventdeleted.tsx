import { ActionFunction, json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  try {
    const payload = await request.json();
    console.log("Webhook received for event.deleted:", payload);

    // Handle the webhook payload (e.g., delete records)

    return json({ success: true });
  } catch (error) {
    console.error("Error processing event.deleted webhook:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};

export default function WebhookEventDeleted() {
  return <div>Webhook for event.deleted</div>;
}
