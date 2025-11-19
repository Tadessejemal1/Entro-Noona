import * as database from '~/shared/database'; // Adjust the path as necessary
import { sendEmailViaApi } from '../services/emailService';
import { sendSmsViaApi } from '../services/smsService';
import { sendWebhook } from '../services/webhookService';
import { replacePlaceholders, stripHtmlTags } from './placeholders';
import { formatPhoneNumber } from './formatPhoneNumber';

interface Event {
  companyId: string;
  customerEmail: string;
  customer_name: string;
  customerPhone: string;
  customerCode: string;
  id: string;
  starts_at?: Date;
  ends_at?: Date;
  eventTitle?: string;
  eventDescription?: string;
  recurring_event?: string; // Add recurring_event property
  rrule?: string;           // Add rrule property
}

interface Workflow {
  id: string;
  action: string;
  settings: string;
}

interface WorkflowSettings {
  emailTemplate?: {
    subject: string;
    body: string;
    recipients: string;
  };
  smsTemplate?: {
    body: string;
    recipients: string;
  };
}

export const runAction = async (wf: Workflow, event: Event) => {
  if (!event.companyId || !event.customerCode) {
    const missingField = !event.companyId ? 'companyId' : 'customerCode';
    console.error(`Missing ${missingField} in event:`, event);
    return { status: 'error', message: `Missing ${missingField}` };
  }

  let settings: WorkflowSettings;
  try {
    settings = JSON.parse(wf.settings);
  } catch (error) {
    console.error('Error parsing workflow settings:', error);
    return { status: 'error', message: 'Error parsing settings' };
  }

  const values = createValuesObject(event);

  console.log('Values object for action:', values);

  switch (wf.action) {
    case 'email':
      return await handleEmailAction(wf, settings, event, values);
    case 'sms':
      return await handleSmsAction(wf, settings, event, values);
    case 'webhook':
      return await handleWebhookAction(wf, settings, event, values);
    default:
      console.error('Action not implemented:', wf.action);
      return { status: 'error', message: 'Action not implemented' };
  }
};

const createValuesObject = (event: Event) => ({
  customerCode: event.customerCode,
  customerEmail: event.customerEmail,
  customerName: event.customer_name,
  customerPhone: event.customerPhone,
  eventTitle: event.eventTitle || "The Golf Session",
  eventDescription: event.eventDescription || "Enjoy a day on the green!"
});

async function handleEmailAction(wf: Workflow, settings: WorkflowSettings, event: Event, values: any) {
  const emailSubject = replacePlaceholders(settings.emailTemplate.subject, values);
  const emailBody = replacePlaceholders(settings.emailTemplate.body, values);
  const recipients = settings.emailTemplate.recipients.split(',').map(email => replacePlaceholders(email.trim(), values));

  const results = await Promise.all(recipients.map(recipient => sendEmailAndLog(recipient, wf, event, emailSubject, emailBody)));

  return { status: 'success', results };
}

async function sendEmailAndLog(recipient: string, wf: Workflow, event: Event, subject: string, body: string) {
  const result = await sendEmailViaApi(recipient, subject, body,event);
  const timestamp = new Date();
  await logAction(wf, event, 'email', result.status, { recipient, subject, body, error: result.error }, timestamp);
  return result;
}

async function handleSmsAction(wf: Workflow, settings: WorkflowSettings, event: Event, values: any) {
  let smsBody = stripHtmlTags(replacePlaceholders(settings.smsTemplate.body, values));

  const recipients = settings.smsTemplate.recipients.split(',')
    .map(recipient => formatPhoneNumber(replacePlaceholders(recipient.trim(), values)))
    .filter(phone => phone.startsWith('+'));

  if (recipients.length === 0) {
    return { status: 'failure', message: 'No valid recipients found' };
  }

  const results = await Promise.all(recipients.map(recipient => sendSmsAndLog(recipient, smsBody, wf, event)));

  return { status: 'success', results };
}

async function sendSmsAndLog(recipient: string, body: string, wf: Workflow, event: Event) {
  const result = await sendSmsViaApi(recipient, body,event);
  const timestamp = new Date();
  await logAction(wf, event, 'sms', result.status, { recipient, body, error: result.error }, timestamp);
  return result;
}

async function handleWebhookAction(wf: Workflow, settings: WorkflowSettings, event: Event, values: any) {
  const webhookUrl = 'https://eunitstest.onrender.com/api/addbooking';
  const eventData = formatEventData(event, values);

  console.log('EventData to store:', eventData);

  // Save event data to the database
  try {
    //await database.storeEvent(eventData);
    console.log('Event data saved to the database successfully.');
  } catch (error) {
    console.error('Error saving event data to the database:', error);
    return { status: 'error', message: 'Failed to save event data to database' };
  }

  // Send the webhook
  const result = await sendWebhook(webhookUrl, eventData);
  const responseToLog = formatWebhookResponse(result);

  const timestamp = new Date();
  await logAction(wf, event, 'webhook', result.status, responseToLog, timestamp);

  return result;
}


const formatWebhookResponse = (result: any) => {
  if (result && result.response && result.response.result) {
    const { bookingCode, bookingCustomerName, bookingCustomerPhone, bookingCompanyEmail, timestamp } = result.response.result;
    return { bookingCode, bookingCustomerName, bookingCustomerPhone, bookingCompanyEmail, timestamp };
  }
  return { error: "Invalid response format or missing result in the webhook response." };
};

async function logAction(wf: Workflow, event: Event, actionType: string, status: string, details: any, timestamp: Date) {
  await database.logAction(event.id, wf.id, event.companyId, actionType, status, details);
  await database.addToSent(wf, event, timestamp);
}

const formatEventData = (event: Event, values: any) => ({
  
  bookingStartsAtTime: Math.floor(new Date(event.starts_at).getTime() / 1000).toString(),
  bookingEndsAtTime: Math.floor(new Date(event.ends_at).getTime() / 1000).toString(),
  bookingStartDate: new Date(event.starts_at).toISOString().split('T')[0].replace(/-/g, '/'),
  bookingEndDate: new Date(event.ends_at).toISOString().split('T')[0].replace(/-/g, '/'),
  bookingCode: values.customerCode,
  bookingCustomerName: event.customer_name || "test",
  bookingCustomerPhone: event.customerPhone || "7771991",
  bookingCompanyEmail: event.customerEmail || "test@gmail.com",
  Connection: "Golf Session",
  status: "notdone",
  company: "Entro Test",
  timestamp: new Date().toISOString(),
  Integration: "Noona Golf Session",
  company_ID: "47",
  eConformationText: "false",
  bookingCustomerPhoneLocal: null,
  isRecurring: event.rrule ? 'true' : 'false', // Check if rrule exists in the event
  serviceName: event.eventTitle || "The Golf Session", // Set as the event title
  rrule: event.rrule ? extractFreqValue(event.rrule) : 'Never', // Set based on the recurrence rule
  RepeatsAppointment: event.rrule ? 'true' : 'false',
  bookingdescription: event.eventDescription
});

// Helper function to extract the FREQ value from the rrule string
const extractFreqValue = (rrule: string) => {
  // Use a regex to find the FREQ value in the rrule string
  const freqMatch = rrule.match(/FREQ=([^;]+)/);
  return freqMatch && freqMatch[1] ? freqMatch[1] : 'None';
};
