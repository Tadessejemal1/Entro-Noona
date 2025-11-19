import axios from 'axios';

export const sendWebhook = async (url, data) => {
  try {
    console.log('Sending webhook data:', JSON.stringify(data, null, 2)); // Pretty print data
    const response = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Webhook sent successfully THIS TIME . Status:', response.status);
    console.log('Response data:', response.data);
    return { status: 'success', response: response.data };
  } catch (error) {
    console.error('Error sending webhook:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    }
    return { 
      status: 'failure', 
      error: error.message, 
      response: error.response ? error.response.data : null 
    };
  }
};
