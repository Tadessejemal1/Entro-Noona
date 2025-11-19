import axios from 'axios';
import mysql from 'mysql2/promise';
import 'dotenv/config';

// Your script logic here


// Your script logic here

//const axios = require('axios');

async function runTask() {
  const connection = await mysql.createConnection({
      host: 'localhost',       // MySQL server host
      user: 'root',            // MySQL username
      password: '',            // MySQL password (leave empty if no password)
      database: 'entronoona'   // Database name
    });

  try {
    // Perform your MySQL operations here
    const [rows, fields] = await connection.execute('SELECT * FROM workflows');

    // Log the retrieved rows
    console.log('Rows:', rows);

    // Construct the full endpoint URL
    const endpoint = 'https://entroplugin.onrender.com/webhooks/eventcreated';

    const response = await axios.post(
  'https://1d57-102-213-69-171.ngrok-free.app/webhooks/eventcreated',
  { companyId: 'qrLJncDM7Y9ZQQY2G' }, // Add valid data here
  {
    headers: {
      'Content-Type': 'application/json'
    }
  }
);

    console.log('HTTP Request successful:', response.data);
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await connection.end();
  }
}

runTask();
