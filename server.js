import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import express from "express";
import { config } from 'dotenv';
import twilio from 'twilio';
import cron from 'node-cron';
import axios from 'axios';
import cookieParser from 'cookie-parser';  // Import cookie-parser
import { signSha256 } from './app/utils/hash.js';  // Import the hashing function

// Load environment variables
config();  // This should be at the very top

const PORT = process.env.PORT || 8080;

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set");
}

const client = twilio(accountSid, authToken);

installGlobals();

const remixHandler = createRequestHandler({
  build: await import("./build/server/index.js")
});

const app = express();

// Serve static assets
app.use("/assets", express.static("./build/client/assets"));
app.use(cookieParser());  // Use cookie-parser middleware

// Set up the cron job to run every 15 minutes
cron.schedule('*/1 * * * *', async () => {
  console.log('Cron job started');
  try {
    // Generate the hashed value using the signSha256 function
    const hash = signSha256("entronoona"); // Use the same data that is verified in the action

    const response = await axios.post(
      process.env.ENTRONOONA_RUN_ENDPOINT,  // Endpoint where you send the request
      {}, // Empty data payload
      {
        headers: {
          'x-entronoona-hash': hash  // Use the hashed value as the header
        }
      }
    );
    console.log('HTTP Request successful:', response.data);
  } catch (error) {
    console.error('HTTP Request failed:', error);
  }
  console.log('Cron job finished');
});

// Catch all other routes for Remix
app.all("*", remixHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
