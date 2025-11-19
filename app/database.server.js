import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to format date to MySQL DATETIME format
const formatDateForMySQL = (date) => {
  const d = new Date(date);
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Function to initialize database schema
const initializeDatabase = async () => {
  try {
    await dropTableIfExists();
    await createTables();
    console.log('Database initialization successful');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Function to drop 'store_recurring_event' table if it exists
const dropTableIfExists = async () => {
  const connection = await pool.getConnection();
  try {
    // Drop 'store_recurring_event' table
    await connection.query(`DROP TABLE IF EXISTS recurring_events`);
    await connection.query(`DROP TABLE IF EXISTS schedule`);
    await connection.query(`DROP TABLE IF EXISTS sent`);
    console.log('recurring_events table dropped successfully');
  } finally {
    connection.release();
  }
};

// Function to create necessary tables
const createTables = async () => {
  const connection = await pool.getConnection();
  try {
    // Create other tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schedule (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wf TEXT NOT NULL,
        event TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        dt DATETIME NOT NULL,
        companyId VARCHAR(255) NOT NULL
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS processed_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id VARCHAR(255) NOT NULL,
        workflow_id VARCHAR(255) NOT NULL,
        processed_at DATETIME NOT NULL,
        UNIQUE KEY (event_id, workflow_id)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sent (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wf TEXT NOT NULL,
        event TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        dt DATETIME NOT NULL,
        companyId VARCHAR(255) NOT NULL
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`trigger\` VARCHAR(255),
        action VARCHAR(255),
        settings TEXT,
        name VARCHAR(255),
        companyId VARCHAR(255),
        dt DATETIME,
        \`timestamp\` DATETIME
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        data TEXT,
        expires DATETIME NULL
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS oauth_tokens (
        companyId VARCHAR(255) PRIMARY KEY,
        token TEXT
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS apptokens (
        companyId VARCHAR(255) PRIMARY KEY,
        appToken TEXT
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS action_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id VARCHAR(255) NOT NULL,
        workflow_id INT NOT NULL,
        company_id VARCHAR(255) NOT NULL,
        action_type ENUM('email', 'sms', 'webhook') NOT NULL,
        status ENUM('success', 'failure') NOT NULL,
        details TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS store_recurring_event (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recurring_event VARCHAR(255) NOT NULL,
        customer VARCHAR(255) NOT NULL,
        customerCode VARCHAR(255) NOT NULL,
        rrule TEXT,
        duration INT,
        event_types TEXT,
        created_at DATETIME NOT NULL
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS recurring_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recurring_event VARCHAR(255) NOT NULL,
        customer VARCHAR(255) NOT NULL,
        title TEXT,
        description TEXT,
        booking_success_message TEXT,
        event_created_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        hasExceeded TINYINT(1) DEFAULT 0,
        UNIQUE KEY (recurring_event, customer, event_created_at)
      );
    `);

    // Create 'recurring_event_codes' table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recurring_event_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recurring_event_id VARCHAR(255) NOT NULL UNIQUE,
        customer_code VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // New table for handling failed webhook attempts
    await connection.query(`
      CREATE TABLE IF NOT EXISTS failed_webhooks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(255) NOT NULL,
        data JSON NOT NULL,
        error TEXT NOT NULL,
        status ENUM('pending', 'retrying', 'sent') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
  await connection.query(`
        CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eventId VARCHAR(255),
        bookingStartsAtTime VARCHAR(50),
        bookingEndsAtTime VARCHAR(50),
        bookingStartDate DATE,
        bookingEndDate DATE,
        bookingCode VARCHAR(50),
        bookingCustomerName VARCHAR(255),
        bookingCustomerPhone VARCHAR(50),
        bookingCompanyEmail VARCHAR(255),
        Connection VARCHAR(255),
        status VARCHAR(50),
        company VARCHAR(255),
        timestamp DATETIME,
        Integration VARCHAR(255),
        company_ID VARCHAR(50),
        eConformationText VARCHAR(50),
        bookingCustomerPhoneLocal VARCHAR(50),
        isRecurring VARCHAR(50),
        serviceName VARCHAR(255),
        rrule VARCHAR(255),
        RepeatsAppointment VARCHAR(50),
        bookingdescription TEXT
      );

  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS noonaUpdatedbooking (
      id INT AUTO_INCREMENT PRIMARY KEY,
      eventId VARCHAR(255) NOT NULL UNIQUE,
      bookingData JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  
  } finally {
    connection.release();
  }
};

// Function to add a workflow
const addWorkflow = async (workflowData) => {
  const { trigger, action, settings, name, companyId, dt } = workflowData;

  const formattedDt = formatDateForMySQL(dt);

  const sql = `
    INSERT INTO workflows (\`trigger\`, action, settings, name, companyId, dt, \`timestamp\`)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  try {
    await pool.query(sql, [trigger, action, settings, name, companyId, formattedDt]);
    console.log('Workflow added successfully');
  } catch (error) {
    console.error('Error adding workflow:', error);
    throw error;
  }
};

// Initialize database when this module is loaded
initializeDatabase();

export { pool, addWorkflow };
