const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || 'https://estetica.guillers.es',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json());
app.use(express.static('public'));

// Debug: Print environment variables
console.log('🔧 Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ SET' : '❌ NOT SET');

// PostgreSQL connection with retry logic
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
});

// Test database connection with retry
async function testConnection(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔍 Attempting database connection (${i + 1}/${retries})...`);
      const client = await pool.connect();
      console.log('✅ Connected to PostgreSQL database');
      
      // Test basic query
      const result = await client.query('SELECT version()');
      console.log('✅ PostgreSQL version:', result.rows[0].version.split(' ')[1]);
      
      // Check if table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'reservas'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log('📋 Creating reservas table...');
        await client.query(`
          CREATE TABLE reservas (
            id SERIAL PRIMARY KEY,
            nombre TEXT,
            email TEXT,
            fecha TIMESTAMP WITH TIME ZONE,
            evento TEXT,
            creado TIMESTAMP DEFAULT now()
          )
        `);
        console.log('✅ Table reservas created successfully');
      } else {
        const countResult = await client.query('SELECT COUNT(*) FROM reservas');
        console.log(`✅ Found ${countResult.rows[0].count} existing reservations`);
      }
      
      client.release();
      return true;
    } catch (error) {
      console.error(`❌ Connection attempt ${i + 1} failed:`, error.message);
      if (i < retries - 1) {
        console.log(`⏳ Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  return false;
}

// Initialize database
async function initializeDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('✅ PostgreSQL version:', result.rows[0].version.split(' ')[1]);
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reservas'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('📋 Creating reservas table...');
      await client.query(`
        CREATE TABLE reservas (
          id SERIAL PRIMARY KEY,
          nombre TEXT,
          email TEXT,
          fecha TIMESTAMP WITH TIME ZONE,
          evento TEXT,
          creado TIMESTAMP DEFAULT now()
        )
      `);
      console.log('✅ Table reservas created successfully');
    } else {
      const countResult = await client.query('SELECT COUNT(*) FROM reservas');
      console.log(`✅ Found ${countResult.rows[0].count} existing reservations`);
    }
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Initialize database on startup
initializeDatabase().then(connected => {
  if (!connected) {
    console.log('⚠️ Database connection failed, please check your configuration');
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Get all reservations with pagination
app.get('/api/reservas', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count (only today and future)
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM reservas WHERE DATE(fecha) >= CURRENT_DATE"
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated reservations (today and future appointments)
    // Using DATE(fecha) to compare only the date part, ignoring time
    const result = await pool.query(
      `SELECT * FROM reservas
       WHERE DATE(fecha) >= CURRENT_DATE
       ORDER BY fecha ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const totalPages = Math.ceil(total / limit);

    console.log(`📋 Page ${page}/${totalPages}: ${result.rows.length} reservations (total: ${total})`);

    res.json({
      reservations: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching reservations:', error.message);
    res.status(500).json({ error: 'Error fetching reservations' });
  }
});

// Create a new reservation
app.post('/api/reservas', async (req, res) => {
  try {
    const { nombre, email, fecha, evento } = req.body;
    
    const query = `
      INSERT INTO reservas (nombre, email, fecha, evento)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [nombre, email, fecha, evento];
    const result = await pool.query(query, values);
    
    console.log('📝 New reservation created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating reservation:', error.message);
    res.status(500).json({ error: 'Error creating reservation' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      status: 'ok',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Nail Studio server running on port ${port}`);
  console.log(`🌐 http://localhost:${port}`);
  console.log(`🔍 Health check: http://localhost:${port}/api/health`);
});
