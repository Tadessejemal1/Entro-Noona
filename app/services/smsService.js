import { formatPhoneNumber } from '../utils/formatPhoneNumber';
import axios from 'axios';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN; 
const client = twilio(accountSid, authToken);

export const sendSmsViaApi = async (phone, message, event) => {
  const apiUrl = 'https://smsengine.onrender.com/api/smsapi';
  const fixedCompanyId = "2";
  const formattedPhone = formatPhoneNumber(phone);
  const noonaIntegration = "noona plugin";
  const isRecurringEvent = event.rrule ? 'true' : 'false';
  const eventServiceName = event.eventTitle; 
  const userID = event.customer;

  try {
    const response = await axios.post(apiUrl, {
      phoneNo: formattedPhone,
      body: message,
      company_ID: fixedCompanyId,
      integration: noonaIntegration,
      userID: userID,
      isRecurring: isRecurringEvent,
      serviceName: eventServiceName
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return { status: 'success', data: response.data }; // Return successful response data
  } catch (error) {
    console.error('Failed to send SMS via API:', error.message); // Log only the error message
    return { status: 'failure', error: error.message, details: error.response ? error.response.data : 'No details available' };
  }
};

export const sendSms = async (phone, message) => {
  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) {
    console.error('Invalid phone number:', phone); // Log only if the phone number is invalid
    return { status: 'failure', error: 'Invalid phone number' };
  }

  try {
    const messageResponse = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    return { status: 'success', sid: messageResponse.sid }; // Return the success status and message SID
  } catch (error) {
    console.error('Error sending SMS:', error.message); // Log only the error message
    return { status: 'failure', error: error.message };
  }
};
