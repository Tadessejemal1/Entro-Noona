import { pool } from '~/database.server'; // Adjust the path as per your project structure

// Utility function to format dates for MySQL
const formatDateForMySQL = (date: Date) => {
  const d = new Date(date);
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const getScheduledTasks = async (currentDateTime) => {
  const sql = 'SELECT * FROM schedule WHERE dt <= ?';
  const [rows] = await pool.query(sql, [currentDateTime]);
  return rows.map(row => {
    // Parse the wf and event columns if they are stored as JSON strings
    row.wf = typeof row.wf === 'string' ? JSON.parse(row.wf) : row.wf;
    row.event = typeof row.event === 'string' ? JSON.parse(row.event) : row.event;
    return row;
  });
};

// Function to delete a scheduled task by ID
export const deleteScheduledTask = async (taskId) => {
  const sql = 'DELETE FROM schedule WHERE id = ?';
  await pool.query(sql, [taskId]);
};

// Function to get scheduled tasks by companyId
export const getScheduledTasksByCompanyId = async (companyId: string) => {
  const sql = 'SELECT * FROM schedule WHERE companyId = ?';
  const [rows] = await pool.query(sql, [companyId]);
  return rows;
};

// Function to get sent items by companyId
export const getSentByCompanyId = async (companyId: string) => {
  const sql = `
    SELECT s.id, s.wf, s.event, s.timestamp, s.dt, s.companyId 
    FROM sent s
    WHERE s.companyId = ?
  `;
  const [rows] = await pool.query(sql, [companyId]);

  // Assuming wf is stored as a JSON string, we need to parse it
  return rows.map(row => ({
    ...row,
    wf: JSON.parse(row.wf)
  }));
};

// Function to get workflows by companyId and triggers
export const getWorkflowsByCompanyIdAndTriggers = async (companyId: string, triggers: string[]) => {
  const sql = 'SELECT * FROM workflows WHERE companyId = ? AND `trigger` IN (?)';
  const [rows] = await pool.query(sql, [companyId, triggers]);
  return rows;
};

// Function to add a task to scheduled tasks
export const addToScheduledTasks = async (workflow: any, event: any, timestamp: Date) => {
  const sql = 'INSERT INTO schedule (wf, event, timestamp, dt, companyId) VALUES (?, ?, ?, ?, ?)';
  const values = [
    JSON.stringify(workflow),
    JSON.stringify(event),
    formatDateForMySQL(timestamp), // Apply formatting here
    formatDateForMySQL(timestamp),
    event.companyId
  ];
  const [result] = await pool.query(sql, values);
  return result;
};

// Function to add a workflow
export const addWorkflow = async (trigger: string, action: string, settings: any, name: string, companyId: string) => {
  const now = new Date();
  const sql = `
    INSERT INTO workflows (\`trigger\`, action, settings, name, companyId, dt, \`timestamp\`)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    trigger,
    action,
    JSON.stringify(settings),
    name,
    companyId,
    formatDateForMySQL(now),
    formatDateForMySQL(now) // Apply formatting here
  ];
  const [result] = await pool.query(sql, values);
  return result;
};

// Function to get workflows by companyId
export const getWorkflowsByCompanyId = async (companyId: string) => {
  const sql = 'SELECT * FROM workflows WHERE companyId = ?';
  const [rows] = await pool.query(sql, [companyId]);
  return rows;
};

// Function to store OAuth token
export const storeOAuthToken = async (companyId: string, token: any) => {
  const sql = `
    INSERT INTO oauth_tokens (companyId, token)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE token = VALUES(token)
  `;
  const values = [companyId, JSON.stringify(token)];
  await pool.query(sql, values);
};

// Function to add a task to sent
export const addToSent = async (wf: any, event: any, timestamp: Date) => {
  const sql = 'INSERT INTO sent (wf, event, timestamp, dt, companyId) VALUES (?, ?, ?, ?, ?)';
  const values = [
    JSON.stringify(wf),
    JSON.stringify(event),
    formatDateForMySQL(timestamp), // Apply formatting here
    formatDateForMySQL(timestamp),
    event.companyId
  ];
  const [result] = await pool.query(sql, values);
  return result;
};

// Function to create a session
export const createSession = async (data: any, expires?: Date) => {
  const sql = 'INSERT INTO sessions (data, expires) VALUES (?, ?)';
  const [result] = await pool.query(sql, [JSON.stringify(data), expires ? formatDateForMySQL(expires) : null]);
  return result.insertId;
};

// Function to read a session by ID
export const readSession = async (id: number) => {
  const sql = 'SELECT data FROM sessions WHERE id = ?';
  const [rows] = await pool.query(sql, [id]);
  return rows.length ? JSON.parse(rows[0].data) : null;
};

// Function to update a session by ID
export const updateSession = async (id: number, data: any, expires?: Date) => {
  const sql = 'UPDATE sessions SET data = ?, expires = ? WHERE id = ?';
  await pool.query(sql, [JSON.stringify(data), expires ? formatDateForMySQL(expires) : null, id]);
};

// Function to delete a session by ID
export const deleteSession = async (id: number) => {
  const sql = 'DELETE FROM sessions WHERE id = ?';
  await pool.query(sql, [id]);
};

// Function to add an app token
export const addAppToken = async (companyId: string, appToken: any) => {
  const sql = `
    INSERT INTO apptokens (companyId, token)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE token = VALUES(token)
  `;
  const values = [companyId, JSON.stringify(appToken)];
  await pool.query(sql, values);
};

// Function to get OAuth token by companyId
export const getOAuthTokenByCompanyId = async (companyId: string) => {
  const sql = 'SELECT token FROM oauth_tokens WHERE companyId = ?';
  const [rows] = await pool.query(sql, [companyId]);
  return rows.length ? JSON.parse(rows[0].token) : null;
};

// Function to check if an event has already been processed
export const checkIfProcessed = async (eventId: string, workflowId: string) => {
  const sql = 'SELECT COUNT(*) AS count FROM processed_events WHERE event_id = ? AND workflow_id = ?';
  const [rows] = await pool.query(sql, [eventId, workflowId]);
  return rows[0].count > 0;
};

// Function to mark an event as processed
export const markAsProcessed = async (eventId: string, workflowId: string) => {
  const sql = 'INSERT INTO processed_events (event_id, workflow_id, processed_at) VALUES (?, ?, NOW())';
  await pool.query(sql, [eventId, workflowId]);
};

// Function to fetch a workflow by its ID and company ID
export async function getWorkflowById(workflowId: number, companyId: string) {
  const sql = `SELECT * FROM workflows WHERE id = ? AND companyId = ?`;
  const [rows] = await pool.query(sql, [workflowId, companyId]);
  return rows[0];
}

// Function to update a workflow's settings
export async function updateWorkflowById(workflowId: number, companyId: string, updates: any) {
  const { settings } = updates;
  const sql = `
    UPDATE workflows
    SET settings = ?
    WHERE id = ? AND companyId = ?
  `;
  await pool.query(sql, [JSON.stringify(settings), workflowId, companyId]);
}

// Function to delete a workflow by ID
export const deleteWorkflowById = async (workflowId: number, companyId: string) => {
  const sql = 'DELETE FROM workflows WHERE id = ? AND companyId = ?';
  await pool.query(sql, [workflowId, companyId]);
};

// Function to log an action
export const logAction = async (eventId: string, workflowId: number, companyId: string, actionType: string, status: string, details: any) => {
  const sql = `
    INSERT INTO action_logs (event_id, workflow_id, company_id, action_type, status, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [eventId, workflowId, companyId, actionType, status, JSON.stringify(details)];
  try {
    await pool.query(sql, values);
    console.log(`Action logged successfully for event ${eventId}`);
  } catch (error) {
    console.error('Error logging action:', error);
  }
};   

export const getActionLogsByCompanyId = async (companyId) => {
  const sql = 'SELECT * FROM action_logs WHERE company_id = ? ORDER BY created_at DESC';
  const [rows] = await pool.query(sql, [companyId]);

  return rows.map(row => {
    let details;
    try {
      // Attempt to parse details as JSON
      details = JSON.parse(row.details);
    } catch (error) {
      console.error("Error parsing details JSON:", error, "Details content:", row.details);
      // Fall back to raw details if parsing fails
      details = row.details;
    }

    return {
      id: row.id,
      event_id: row.event_id,
      workflow_id: row.workflow_id,
      company_id: row.company_id,
      action_type: row.action_type,
      status: row.status,
      details: details,  // Parsed JSON or raw string
      created_at: row.created_at
    };
  });
};


// Function to delete a sent item by ID
export const deleteSentById = async (sentId: number) => {
  const sql = 'DELETE FROM sent WHERE id = ?';
  try {
    const [result] = await pool.query(sql, [sentId]);
    console.log(`Deleted sent item ${sentId}. Affected rows: ${result.affectedRows}`);
    return result;
  } catch (error) {
    console.error(`Failed to delete sent item ${sentId}: ${error.message}`);
    throw error;
  }
};


// Function to delete a log by ID
export const deleteLogById = async (logId) => {
  const sql = 'DELETE FROM action_logs WHERE id = ?';
  const [result] = await pool.query(sql, [logId]);
  console.log('Delete result:', result); // Debugging line
  return result;
};



// Function to retrieve an event by recurring_event and customer
export const getEventByRecurringIdAndCustomer = async (recurring_event, customer) => {
  const query = `
    SELECT * 
    FROM store_recurring_event 
    WHERE recurring_event = ? AND customer = ?  
  `;

  try {
    // Execute the query with the provided recurring_event and customer
    const [rows] = await pool.query(query, [recurring_event, customer]);

    // Return the first matching event, if any
    if (rows.length > 0) {
      return rows[0];
    } else {
      return null; // No matching event found
    }
  } catch (error) {
    console.error('Error fetching event by recurring_event and customer:', error);
    throw error;
  }
};



export const getPreviousRecurringEvent = async (recurringEventId: string, customerId: string,formattedDate  ) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM recurring_events WHERE recurring_event = ? AND customer = ? AND event_created_at  ORDER BY created_at DESC LIMIT 1',
            [recurringEventId, customerId,formattedDate ]
        );

        if (rows.length > 0) {
            return rows[0]; // Return the previous event
        } else {
            return null; // No previous event found
        }
    } catch (error) {
        console.error('Error fetching previous recurring event:', error);
        throw new Error('Database error');
    }
};
export const storeRecurringEvent = async (
    recurringEventId: string,
    customerId: string,
    title: string,
    description: string,
    bookingSuccessMessage: string,
    formattedDate: string
) => {
    try {
        // Check if the event already exists in the database
        const [existingEvents] = await pool.query(
            'SELECT * FROM recurring_events WHERE recurring_event = ? AND customer = ? AND event_created_at = ?',
            [recurringEventId, customerId, formattedDate]
        );

        if (existingEvents.length > 0) {
            console.log('Recurring event already exists. Skipping insertion.');
            return existingEvents[0]; // Exit if the event already exists, return the existing event if needed
        }

        // Validate inputs before proceeding
        if (typeof title !== 'string' || typeof description !== 'string' || typeof bookingSuccessMessage !== 'string') {
            throw new Error('Expected string inputs but received incorrect type(s)');
        }

        // Insert the new recurring event
        await pool.query(
            'INSERT INTO recurring_events (recurring_event, customer, title, description, booking_success_message, event_created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [recurringEventId, customerId, title, description, bookingSuccessMessage, formattedDate]
        );

        console.log('Recurring event stored successfully');
    } catch (error) {
        console.error('Error storing recurring event:', error);
        throw new Error('Database error');
    }
};




export const updateRecurringEventExecutionStatus = async (eventId, hasExecuted) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'UPDATE store_recurring_event SET hasExecuted = ? WHERE id = ?',
      [hasExecuted, eventId]
    );
    return result.affectedRows > 0; // Return true if the update was successful
  } catch (error) {
    console.error('Error updating recurring event execution status:', error);
    throw error; // Re-throw the error for further handling
  } finally {
    connection.release(); // Ensure the connection is released back to the pool
  }
};

// Function to retrieve the first event in a recurring series by recurring_event and customer
export const getFirstRecurringEvent = async (recurringEventId: string, customerId: string) => {
  const sql = `
    SELECT * 
    FROM recurring_events 
    WHERE recurring_event = ? AND customer = ?
    ORDER BY created_at ASC 
    LIMIT 1
  `;

  try {
    const [rows] = await pool.query(sql, [recurringEventId, customerId]);
    if (rows.length > 0) {
      return rows[0]; // Return the first event
    } else {
      return null; // No event found
    }
  } catch (error) {
    console.error('Error fetching first recurring event:', error);
    throw error;
  }
};



// Function to store the customer code for a recurring event
export const storeRecurringEventCode = async (recurringEventId: string, customerCode: string) => {
  const sql = `
    INSERT INTO recurring_event_codes (recurring_event_id, customer_code)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE customer_code = VALUES(customer_code), updated_at = NOW();
  `;

  try {
    const [result] = await pool.query(sql, [recurringEventId, customerCode]);
    console.log(`Customer code ${customerCode} stored/updated for recurring event ${recurringEventId}`);
    return result;
  } catch (error) {
    console.error('Error storing recurring event code:', error);
    throw error;
  }
};


// Function to retrieve the customer code for a recurring event
export const getRecurringEventCode = async (recurringEventId: string): Promise<string | null> => {
  const sql = `
    SELECT customer_code FROM recurring_event_codes
    WHERE recurring_event_id = ?
  `;

  try {
    const [rows] = await pool.query(sql, [recurringEventId]);

    if (rows.length > 0) {
      const { customer_code } = rows[0];
      console.log(`Customer code retrieved for recurring event ${recurringEventId}: ${customer_code}`);
      return customer_code;
    } else {
      console.log(`No customer code found for recurring event ${recurringEventId}`);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving recurring event code:', error);
    throw error;
  }
};
// Store a failed operation (in the failed_webhooks table)
export const storeFailedWebhook = async (url: string, data: any, error: string) => {
  const sql = `
    INSERT INTO failed_webhooks (url, data, error, status, created_at)
    VALUES (?, ?, ?, 'pending', NOW())
  `;
  await pool.query(sql, [url, JSON.stringify(data), error]);
  console.log(`Failed webhook stored in failed_webhooks table with URL=${url}`);
};
// Retrieve all failed webhooks from the failed_webhooks table
export const getFailedWebhooks = async () => {
  const sql = 'SELECT * FROM failed_webhooks WHERE status = "pending"';
  try {
    const [rows] = await pool.query(sql);
    console.log("Retrieved failed webhooks from database:", rows);
    return rows;
  } catch (error) {
    console.error("Error retrieving failed webhooks:", error.message);
    throw error;
  }
};
// Delete a failed webhook after successfully processing it
export const deleteFailedOperation = async (id: number) => {
  const sql = 'DELETE FROM failed_webhooks WHERE id = ?';
  await pool.query(sql, [id]);
  console.log(`Deleted failed webhook with ID: ${id}`);
};



/**
 * Stores booking data in the database.
 * @param eventId - The unique event ID.
 * @param bookingData - The booking data to store in JSON format.
 */
export const storeBookingInDatabase = async (eventId: string, bookingData: any) => {
  const connection = await pool.getConnection();
  try {
    const sql = `
      INSERT INTO noonaUpdatedbooking (eventId, bookingData)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        bookingData = VALUES(bookingData),
        updated_at = CURRENT_TIMESTAMP;
    `;

    await connection.query(sql, [eventId, JSON.stringify(bookingData)]);
    console.log("Booking stored/updated successfully in the database.");
  } catch (error) {
    console.error("Error storing booking in database:", error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Retrieves all bookings from the database.
 * @returns An array of all booking records.
 */
export const getAllBookingsFromDatabase = async () => {
  const connection = await pool.getConnection();
  try {
    const sql = `SELECT eventId, bookingData FROM noonaUpdatedbooking;`;
    const [rows] = await connection.query(sql);

    console.log("All bookings retrieved successfully:", rows);
    return rows; // Return all rows containing booking data
  } catch (error) {
    console.error("Error retrieving all bookings from database:", error);
    throw error;
  } finally {
    connection.release();
  }
};
