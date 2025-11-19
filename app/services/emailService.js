import axios from 'axios';

// Function to convert HTML to plain text
const convertHtmlToPlainText = (html) => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')     // Convert <br> tags to newline
    .replace(/<\/p>/gi, '\n')          // Convert </p> tags to newline
    .replace(/<[^>]*>?/gm, '')         // Remove all remaining HTML tags
    .trim();                           // Trim any leading/trailing whitespace
};

export const sendEmailViaApi = async (email, subject, body, event) => {
  const apiUrl = 'https://eunitstest.onrender.com/api/sendmail';
  const fixedCompanyId = "2";
  const noonaIntegration = "noona plugin";
  const isRecurringEvent = event.rrule ? 'true' : 'false';
  const eventServiceName = event.eventTitle; 
  const userID = event.customer; 
  const plainTextBody = convertHtmlToPlainText(body);

  const payload = {
    receiverEmail: email,
    Subject: subject,
    Body: plainTextBody,
    company_ID: fixedCompanyId,
    userID: userID,
    isRecurring: isRecurringEvent,
    serviceName: eventServiceName
  };

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Email sent successfully, Response:', response.status);
    return { status: 'success', data: response.data };
  } catch (error) {
    console.error('Failed to send email:', error.message);
    return {
      status: 'failure',
      error: error.message,
      details: error.response ? error.response.data : 'No details available'
    };
  }
};
