import { json } from "@remix-run/node"; // Import for Remix

// Fetch URLs from environment variables
const API_GET_BOOKING_URL = process.env.API_GET_BOOKING_URL || "";
const API_DELETE_BOOKING_URL = process.env.API_DELETE_BOOKING_URL || "";

if (!API_GET_BOOKING_URL || !API_DELETE_BOOKING_URL) {
  console.error("API URLs are not properly configured in the .env file.");
  throw new Error("Missing required API URLs in environment variables.");
}

// Fetch bookings from the API
const fetchBookings = async () => {
  console.log("Fetching bookings from API...");
  try {
    const response = await fetch(API_GET_BOOKING_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error(`Failed to fetch bookings. Status: ${response.status}`);
      throw new Error(`Failed to fetch bookings: ${response.statusText}`);
    }

    const bookings = await response.json();
    console.log(`Fetched ${bookings.length} bookings from API.`);
    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

// Delete booking via the API
const deleteBookingViaAPI = async (bookingId: string) => {
  console.log(`Attempting to delete booking with ID: ${bookingId}...`);
  try {
    const response = await fetch(API_DELETE_BOOKING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });

    if (!response.ok) {
      console.error(`Failed to delete booking. Status: ${response.status}`);
      throw new Error(`Failed to delete booking: ${response.statusText}`);
    }

    const deleteResponse = await response.json();
    console.log("Booking deleted successfully:", deleteResponse);
    return deleteResponse;
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
};

export const action = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    console.error("Invalid request method. Only POST is allowed.");
    return json({ message: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const webhookPayload = await request.json();
    console.log("Webhook received for event.deleted:", webhookPayload);

    const event = webhookPayload.data;

    // Skip recurring events
    if (event.recurring_event) {
      console.log("Skipping deletion for recurring event. No action required.");
      return json({ message: "Recurring events are ignored." }, { status: 200 });
    }

    // Safely access `event.event_types[0]?.title` with a default value
    const serviceName = event.event_types?.[0]?.title || "Unknown Service";

    // Construct search criteria
    const searchCriteria = {
      bookingCustomerName: event.customer_name || "Unknown Customer",
      isRecurring: event.recurring_event ? "true" : "false",
      serviceName: serviceName,
      rrule: event.rrule || "Never",
    };

    console.log("Search criteria:", searchCriteria);

    // Fetch all bookings
    const bookings = await fetchBookings();

    console.log(`Fetched ${bookings.length} bookings from API.`);

    // Find a matching booking
    const matchingBooking = bookings.find(
      (booking: any) =>
        booking.bookingCustomerName === searchCriteria.bookingCustomerName &&
        booking.isRecurring === searchCriteria.isRecurring &&
        booking.serviceName === searchCriteria.serviceName &&
        booking.rrule === searchCriteria.rrule
    );

    if (matchingBooking) {
      console.log("Matching booking found:", JSON.stringify(matchingBooking, null, 2));

      // Delete booking using the matched booking ID
      const deleteResponse = await deleteBookingViaAPI(matchingBooking.bookingId);

      console.log("Delete response:", deleteResponse);

      return json(
        { message: "Booking deleted successfully", data: deleteResponse },
        { status: 200 }
      );
    } else {
      console.log("No matching booking found for deletion.");
      return json({ message: "No matching booking found for deletion." }, { status: 404 });
    }
  } catch (error) {
    console.error("Error processing event.deleted webhook:", error);
    return json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
};
