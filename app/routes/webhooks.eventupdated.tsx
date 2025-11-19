import { json } from "@remix-run/node";
import * as database from '~/shared/database';

// Fetch URLs from environment variables
const API_GET_BOOKING_URL = process.env.API_GET_BOOKING_URL || "";
const API_UPDATE_BOOKING_URL = process.env.API_UPDATE_BOOKING_URL || "";
const API_DELETE_BOOKING_URL = process.env.API_DELETE_BOOKING_URL || "";

// Function to format the updated event data
const formatUpdatedEventData = (event: any) => {
  const eventTitle = event.event_types[0]?.title || "";
  const bookingCode = eventTitle.match(/\((\d{6})\)/)?.[1] || "Unknown";

  const formattedData = {
    bookingStartsAtTime: event.start_time,
    bookingEndsAtTime: event.end_time,
    bookingStartDate: new Date(event.starts_at)
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "/"),
    bookingEndDate: new Date(event.ends_at)
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "/"),
    bookingCode: bookingCode,
    bookingCustomerName: event.customer_name || "Unknown Customer",
    bookingCustomerPhone: event.customerPhone || "",
    bookingCompanyEmail: event.customerEmail || "",
    Connection: "Entro Test",
    status: "notdone",
    company: event.company || "Default Company",
    timestamp: new Date().toISOString(),
    Integration: "Entro Test",
    company_ID: "47",
    eConformationText: "false",
    bookingCustomerPhoneLocal: null,
    isRecurring: event.recurring_event ? "true" : "false",
    serviceName: eventTitle,
    rrule: event.rrule || "Never",
    RepeatsAppointment: event.recurring_event ? "true" : "false",
    bookingdescription: event.event_types[0]?.description || "",
    eventId: event.id,
  };

  console.log("Formatted Event Data:", JSON.stringify(formattedData, null, 2));
  return formattedData;
};

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

// Update booking via the API
const updateBookingViaAPI = async (updateData: any) => {
  console.log("Sending update request to API with data:", JSON.stringify(updateData, null, 2));
  try {
    const response = await fetch(API_UPDATE_BOOKING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      console.error(`Failed to update booking. Status: ${response.status}`);
      throw new Error(`Failed to update booking: ${response.statusText}`);
    }

    const updateResponse = await response.json();
    console.log("Booking updated successfully via API:", JSON.stringify(updateResponse, null, 2));
    return updateResponse;
  } catch (error) {
    console.error("Error updating booking:", error);
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

    // Ensure the webhook is an update event
    if (webhookPayload.type !== "event.updated") {
      console.error("Received non-update webhook. Ignoring.");
      return json({ message: "Webhook is not an update event." }, { status: 400 });
    }

    const { data: event } = webhookPayload;
    console.log("Received webhook payload:", JSON.stringify(event, null, 2));

    // Skip recurring events
    if (event.recurring_event) {
      console.log("Skipping recurring event. No action required.");
      return json({ message: "Recurring events are ignored." }, { status: 200 });
    }

    const searchCriteria = {
      bookingCustomerName: event.customer_name,
      isRecurring: event.recurring_event ? "true" : "false",
      serviceName: event.event_types[0]?.title || "",
      rrule: event.rrule || "Never",
    };

    console.log("Search criteria:", JSON.stringify(searchCriteria, null, 2));

    // Fetch bookings from the API
    const bookings = await fetchBookings();

    // Find the exact matching booking based on your criteria
    const matchingBooking = bookings.find(
      (booking: any) =>
        booking.bookingCustomerName === searchCriteria.bookingCustomerName &&
        booking.isRecurring === searchCriteria.isRecurring &&
        booking.serviceName === searchCriteria.serviceName &&
        booking.rrule === searchCriteria.rrule
    );

    if (matchingBooking) {
      const bookingId = matchingBooking.bookingId || matchingBooking.eventId;
      console.log("Matching booking found:", {
        bookingId,
        bookingCustomerName: matchingBooking.bookingCustomerName,
        serviceName: matchingBooking.serviceName,
      });

      // If the event status is cancelled, delete the booking via the API
      if (event.status === "cancelled") {
        console.log("Event status is cancelled. Initiating deletion process.");
        try {
          const deleteResponse = await deleteBookingViaAPI(bookingId);
          // Optionally, remove the booking from your local database as well
         // await database.deleteBookingFromDatabase(bookingId);
          console.log("Booking deleted successfully from API and database:", { bookingId });
          return json({ message: "Booking deleted successfully", data: deleteResponse }, { status: 200 });
        } catch (error) {
          console.error("Error during deletion process:", error);
          return json({ message: "Error deleting booking", error: error.message }, { status: 500 });
        }
      }

      // If not cancelled, proceed with update logic.
      const formattedEventData = formatUpdatedEventData(event);

      // Compare times and dates
      const isTimeDifferent =
        formattedEventData.bookingStartsAtTime !== matchingBooking.bookingStartsAtTime ||
        formattedEventData.bookingEndsAtTime !== matchingBooking.bookingEndsAtTime;
      const isDateDifferent =
        formattedEventData.bookingStartDate !== matchingBooking.bookingStartDate ||
        formattedEventData.bookingEndDate !== matchingBooking.bookingEndDate;

      if (isTimeDifferent || isDateDifferent) {
        console.log("Detected differences in booking times or dates. Preparing to update...", {
          isTimeDifferent,
          isDateDifferent,
        });

        const updateData = {
          ...matchingBooking,
          bookingStartsAtTime: formattedEventData.bookingStartsAtTime,
          bookingEndsAtTime: formattedEventData.bookingEndsAtTime,
          bookingStartDate: formattedEventData.bookingStartDate,
          bookingEndDate: formattedEventData.bookingEndDate,
        };

        console.log("Prepared update data for API:", {
          bookingId: updateData.bookingId || updateData.eventId,
          bookingStartsAtTime: updateData.bookingStartsAtTime,
          bookingEndsAtTime: updateData.bookingEndsAtTime,
          bookingStartDate: updateData.bookingStartDate,
          bookingEndDate: updateData.bookingEndDate,
        });

        try {
          const updateResponse = await updateBookingViaAPI(updateData);
          console.log("Booking updated successfully via API:", {
            bookingId: updateResponse.bookingId || updateResponse.eventId,
            status: updateResponse.status,
          });

          // Store the updated booking in the database
          await database.storeBookingInDatabase(formattedEventData.eventId, formattedEventData);
          console.log("Updated booking stored successfully in the database:", {
            bookingId: formattedEventData.eventId,
          });

          // Optionally retrieve all bookings for auditing purposes
          try {
            const allBookings = await database.getAllBookingsFromDatabase();
            console.log("Retrieved all bookings from the database for review:", allBookings);
          } catch (error) {
            console.error("Error retrieving all bookings from the database:", error);
          }

          return json({ message: "Booking updated and stored successfully", data: updateResponse }, { status: 200 });
        } catch (error) {
          console.error("Error during booking update process:", error);
          return json({ message: "Error updating booking", error: error.message }, { status: 500 });
        }
      } else {
        console.log("Booking times and dates are identical. No update required.", {
          bookingId,
        });
        return json({ message: "Booking times and dates are identical. No update performed." }, { status: 200 });
      }
    } else {
      console.log("No matching booking found in the database or API response.");
      return json({ message: "No matching booking found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
};