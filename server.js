const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Debug: Print environment variables
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSLMODE === 'disable' ? false : { rejectUnauthorized: false }
});

// Test database connection with mock data fallback
let useMockData = false;

async function initializeDatabase() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Create table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS reservas (
        id SERIAL PRIMARY KEY,
        nombre TEXT,
        email TEXT,
        fecha TIMESTAMP WITH TIME ZONE,
        evento TEXT,
        creado TIMESTAMP DEFAULT now()
      )
    `);
    console.log('✅ Table reservas is ready');
    
    client.release();
    useMockData = false;
  } catch (error) {
    console.log('❌ Database connection failed, using mock data:', error.message);
    useMockData = true;
  }
}

// Initialize database on startup
initializeDatabase();

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Create a new reservation
app.post('/api/reservas', async (req, res) => {
  try {
    const { nombre, email, fecha, evento } = req.body;
    
    if (useMockData) {
      // Mock response for testing
      const mockReservation = {
        id: Math.floor(Math.random() * 1000) + 100,
        nombre,
        email,
        fecha,
        evento,
        creado: new Date().toISOString()
      };
      console.log('✅ Mock reservation created:', mockReservation);
      return res.status(201).json(mockReservation);
    }
    
    const query = `
      INSERT INTO reservas (nombre, email, fecha, evento)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [nombre, email, fecha, evento];
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Error creating reservation' });
  }
});

// Get all reservations
app.get('/api/reservas', async (req, res) => {
  try {
    console.log('Attempting to fetch reservations...');
    
    if (useMockData) {
      // Return mock data
      const mockData = require('./mock_data');
      console.log(`✅ Returning ${mockData.length} mock reservations`);
      return res.json(mockData);
    }
    
    // Try database
    const result = await pool.query('SELECT * FROM reservas ORDER BY creado DESC');
    console.log(`✅ Found ${result.rows.length} reservations from database`);
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching reservations:', error);
    
    // Fallback to mock data on error
    try {
      const mockData = require('./mock_data');
      console.log(`❌ Database error, returning ${mockData.length} mock reservations`);
      res.json(mockData);
    } catch (fallbackError) {
      console.error('Mock data fallback failed:', fallbackError);
      res.status(500).json({ error: 'Error fetching reservations' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
