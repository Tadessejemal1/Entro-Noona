import { json } from '@remix-run/node';
import { runAction } from '~/utils/run-action';
import * as api from '~/shared/api';
import * as database from '~/shared/database';
import { verifyHashFromHeader } from '~/utils/hash';
import { generateCode } from '~/utils/generateCode';
import { translateIcelandicChars } from '~/services/translation';

export const action = async ({ request }) => {
  // Verify if the request method is POST
  if (request.method !== 'POST') {
    return json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const webhookPayload = await request.json();
    let { data: event } = webhookPayload;

    console.log('Received event:', event);

    const companyId = event.company;
    verifyHashFromHeader(companyId, request.headers);

    const customerCode = generateCode();
    event = await addCustomerDetails(companyId, event, customerCode);

    const { title, description, bookingSuccessMessage } = await handleEventTitleAndDescription(event, customerCode);

    // Translate Icelandic characters for title and messages
    const translatedDescription = translateIcelandicChars(description);
    const translatedBookingSuccessMessage = translateIcelandicChars(bookingSuccessMessage);

    // Update event with new details
    updateEventFields(event, title, translatedDescription, translatedBookingSuccessMessage);

    const updateResult = await api.updateEventInNoona(event.id, event);

    // Confirm event in Noona if necessary
    await handleEventConfirmation(updateResult, event);

    // Fetch and process workflows
    const workflows = await database.getWorkflowsByCompanyIdAndTriggers(companyId, [
      'APPOINTMENT_BOOKED', 'TIME_BEFORE_APPOINTMENT', 'TIME_AFTER_APPOINTMENT'
    ]);

    // Execute workflows based on triggers
    await processWorkflows(workflows, event, title, translatedDescription, translatedBookingSuccessMessage);

    console.log('Webhook processed successfully.');
    return json({ message: 'Webhook received and event updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
};

// Handle updating customer details in the event
const addCustomerDetails = async (companyId, event, customerCode) => {
  const oauthToken = await database.getOAuthTokenByCompanyId(companyId);
  const customer = await api.getCustomer(event.customer, process.env.NOONA_API_TOKEN);

  // Safely access phone_country_code and phone_number, providing defaults if they're undefined
  const phoneCountryCode = customer.phone_country_code || '';
  const phoneNumber = customer.phone_number || '';
  return {
    ...event,
    customerEmail: customer.email,
    bookingCustomerPhone: `${phoneCountryCode}${phoneNumber}`,
    customerPhone: `${phoneCountryCode}${phoneNumber}`,
    companyId,
    customerCode,
  };
};

const removeCustomerCodeFromTitle = (title) => {
  return title.replace(/\(\d{6}\)$/, '').trim();
};
const handleEventTitleAndDescription = async (event, customerCode) => {
  let title, description, bookingSuccessMessage;
 
  //const eventTitle = removeCustomerCodeFromTitle(event.event_types[0]?.title);
  const eventTitle = event.event_types[0]?.title;
  if (event.recurring_event) {
    const previousEvent = await database.getPreviousRecurringEvent(
      event.recurring_event, event.customer, event.created_at
    );

    if (previousEvent) {
      console.log('Reusing title and description from previous recurring event.');
      return {
        title: previousEvent.title,
        description: previousEvent.description,
        bookingSuccessMessage: previousEvent.bookingSuccessMessage
      };
    }

    console.log('No previous event found. Generating new title and description for recurring event.');
    title = generateEventTitle(eventTitle, customerCode);
    description = generateEventDescription(customerCode, title);
    bookingSuccessMessage = description;

    // Store new recurring event details
    await database.storeRecurringEvent(
      event.recurring_event, event.customer, title, description, bookingSuccessMessage, formatDate(event.created_at)
    );

    // Execute actions for the first recurring event
    const firstEventWorkflows = await database.getWorkflowsByCompanyIdAndTriggers(event.company, [
      'APPOINTMENT_BOOKED', 'TIME_BEFORE_APPOINTMENT', 'TIME_AFTER_APPOINTMENT'
    ]);

    // Filter for workflows that should run immediately (APPOINTMENT_BOOKED) and match the event, excluding 'webhook'
    const immediateActions = firstEventWorkflows.filter(wf => 
      wf.trigger === 'APPOINTMENT_BOOKED' && 
      ['sms', 'email'].includes(wf.action) && // Include only 'sms' and 'email' actions
      isSameServiceType(wf, event)
    );

    for (const wf of immediateActions) {
      console.log(`Executing ${wf.action} action for the first recurring event today: ${wf.name}`);
      await runAction(wf, {
        ...event,
        eventTitle: title,
        eventDescription: description,
        bookingSuccessMessage,
      });
    }
  } else {
    console.log('Generating new title and description for non-recurring event.');
    title = generateEventTitle(eventTitle, customerCode);
    description = generateEventDescription(customerCode, title);
    bookingSuccessMessage = description;
  }

  return { title, description, bookingSuccessMessage };
};



// Update event with translated title, description, and messages
const updateEventFields = (event, title, description, bookingSuccessMessage) => {
  // Check if event.event_types exists and has at least one item
  if (!event.event_types || !event.event_types[0]) {
    console.error('Event types are missing or malformed:', event.event_types);
    throw new Error('Invalid event structure: event types are undefined or empty.');
  }
  // Update title and description
  event.event_types[0].title = title;
  event.event_types[0].description = description;
  // Ensure `connections` object exists
  if (!event.event_types[0].connections) {
    console.warn('Connections object is missing. Initializing it.');
    event.event_types[0].connections = {};
  }
  // Update booking success message
  event.event_types[0].connections.booking_success_message = bookingSuccessMessage;
};

// Confirm or update the event in Noona if necessary
const handleEventConfirmation = async (updateResult, event) => {
  if (updateResult && event.unconfirmed) {
    event.unconfirmed = false;
    await api.updateEventInNoona(event.id, { unconfirmed: false });
    console.log('Event updated and confirmed in Noona.');
  } else if (updateResult && !event.confirmed) {
    event.confirmed = true;
    await api.updateEventInNoona(event.id, { confirmed: true });
    console.log('Event confirmed in Noona.');
  } else if (!updateResult) {
    console.error('Failed to update event in Noona.');
  }
};

// Process workflows based on triggers
const processWorkflows = async (workflows, event, title, description, bookingSuccessMessage) => {
  const now = workflows.filter(wf => wf.trigger === 'APPOINTMENT_BOOKED');
  const beforeEvent = workflows.filter(wf => wf.trigger === 'TIME_BEFORE_APPOINTMENT');
  const afterEvent = workflows.filter(wf => wf.trigger === 'TIME_AFTER_APPOINTMENT');

  for (const wf of now) {
    if (!event.recurring_event && isSameServiceType(wf, event)) {
      console.log(`Executing immediate action for workflow today : ${wf.name}`);
      await runAction(wf, { ...event, eventTitle: title, eventDescription: description, bookingSuccessMessage });
    }
    if (event.recurring_event && isSameServiceType(wf, event)) {
    const { interval } = parseWorkflowSettings(wf);
    const dt = getDateOffset(event.starts_at, -interval.days, -interval.hours, -interval.minutes);
    await addToSchedule(wf, event, dt);

    // Retrieve the previous recurring event from the database
    const previousEvent = await database.getPreviousRecurringEvent(
      event.recurring_event, event.customer, event.created_at
    );

    let customerCode = null;
    if (previousEvent) {
      console.log('Reusing title, description, and customer code from previous recurring event today .');

      // Extract the customer code directly from the previous event's title
      customerCode = extractCustomerCodeFromTitle(previousEvent.title);

      if (!customerCode) {
        console.log('No customer code found in the previous event title today .');
      } else {
        console.log(`Extracted customer code from previous event title today: ${customerCode}`);
         // Always run the webhook action for recurring events
        if (wf.action === 'webhook') {
          console.log(`Executing webhook action for recurring event this time : ${wf.name}`);
          await runAction(wf, {
            ...event,
            eventTitle: event.event_types[0].title, // Current event's title or previous event's title
            eventDescription: event.event_types[0].description, // Current event's description or previous
            bookingSuccessMessage: event.event_types[0].connections.booking_success_message, // Use current or previous
            customerCode: customerCode // Use customer code from the previous event if available
          });
        }
      }
    }

  }
  }

for (const wf of beforeEvent) {
  if (event.recurring_event && isSameServiceType(wf, event)) {
    const { interval } = parseWorkflowSettings(wf);
    const dt = getDateOffset(event.starts_at, -interval.days, -interval.hours, -interval.minutes);
    await addToSchedule(wf, event, dt);
  }
}


for (const wf of afterEvent) {
    if (isSameServiceType(wf, event)) {
      const { interval } = parseWorkflowSettings(wf);
      const dt = getDateOffset(event.ends_at, interval.days, interval.hours, interval.minutes);
      await addToSchedule(wf, event, dt);
    }
  }
};


// Generates event title
const generateEventTitle = (originalTitle, customerCode) => `(${customerCode}) ${originalTitle}`;

// Generates event description
const generateEventDescription = (customerCode, title) => 
`Golfstöðin í Glæsibæ bíður þín.
Aðalinngangur er beint inn úr Glæsibæ en eftir kl 20 er gengið inn og út um hurð bakatil (austan megin). Nánari leiðbeiningar á www.golfstodin.is Ath. aðgangskóði þinn er: ${customerCode}]`;
// Parses workflow settings safely
const parseWorkflowSettings = (workflow) => {
    try {
        const settings = typeof workflow.settings === 'string' ? JSON.parse(workflow.settings) : workflow.settings;
        // Ensure the settings object exists and has an interval property
        return {
            interval: {
                days: settings?.interval?.days || 0,
                hours: settings?.interval?.hours || 0,
                minutes: settings?.interval?.minutes || 0,
            },
            serviceType: settings?.serviceType || [],
        };
    } catch (err) {
        console.error(`Error parsing settings for workflow ID: ${workflow.id}`, err);
        // Return default values in case of an error
        return {
            interval: {
                days: 0,
                hours: 0,
                minutes: 0,
            },
            serviceType: [],
        };
    }
};


// Utility function to check if event and workflow match the same service type
const isSameServiceType = (wf, event) => {
  const eventTypeId = event.event_types[0]?.id;
  const settings = parseWorkflowSettings(wf);
  return settings?.serviceType?.includes(eventTypeId);
};

// Formats the date to be used in DB
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date.toISOString().slice(0, 19).replace('T', ' ');
};

// Schedule task to the database
const addToSchedule = async (wf, event, timestamp) => {
  await database.addToScheduledTasks(wf, event, timestamp);
};

// Offset a date by days, hours, and minutes
const getDateOffset = (date, days, hours, minutes) => {
  const dt = new Date(date);
  dt.setDate(dt.getDate() + days);
  dt.setHours(dt.getHours() + hours);
  dt.setMinutes(dt.getMinutes() + minutes);
  return dt;
};


const extractCustomerCodeFromTitle = (title: string): string | null => {
  // Match six digits enclosed in parentheses anywhere in the string
  const match = title.match(/\((\d{6})\)/);
  if (match && match[1]) {
    return match[1]; // Return the 6-digit customer code
  }
  return null; // Return null if no match is found
};
