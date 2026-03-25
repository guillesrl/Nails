const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Cargar variables de entorno
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

// Debug: Imprimir variables de entorno
console.log('🔧 Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ SET' : '❌ NOT SET');

// Conexión PostgreSQL con lógica de reintento
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

// Probar conexión a base de datos con reintentos
async function testConnection(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔍 Attempting database connection (${i + 1}/${retries})...`);
      const client = await pool.connect();
      console.log('✅ Connected to PostgreSQL database');
      
      // Probar consulta básica
      const result = await client.query('SELECT version()');
      console.log('✅ PostgreSQL version:', result.rows[0].version.split(' ')[1]);
      
      // Verificar si la tabla existe
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'reservas'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log('📋 Creando tabla reservas...');
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
        console.log('✅ Tabla reservas creada exitosamente');
      } else {
        const countResult = await client.query('SELECT COUNT(*) FROM reservas');
        console.log(`✅ Encontradas ${countResult.rows[0].count} reservas existentes`);
      }
      
      client.release();
      return true;
    } catch (error) {
      console.error(`❌ Intento de conexión ${i + 1} falló:`, error.message);
      if (i < retries - 1) {
        console.log(`⏳ Reintentando en 3 segundos...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  return false;
}

// Inicializar base de datos
async function initializeDatabase() {
  try {
    console.log('🔍 Probando conexión a base de datos...');
    const client = await pool.connect();
    console.log('✅ Conectado a base de datos PostgreSQL');
    
    // Probar consulta básica
    const result = await client.query('SELECT version()');
    console.log('✅ PostgreSQL version:', result.rows[0].version.split(' ')[1]);
    
    // Verificar si la tabla existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reservas'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('📋 Creando tabla reservas...');
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
      console.log('✅ Tabla reservas creada exitosamente');
    } else {
      const countResult = await client.query('SELECT COUNT(*) FROM reservas');
      console.log(`✅ Encontradas ${countResult.rows[0].count} reservas existentes`);
    }
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Conexión a base de datos falló:', error.message);
    return false;
  }
}

// Inicializar base de datos al iniciar
initializeDatabase().then(connected => {
  if (!connected) {
    console.log('⚠️ Database connection failed, please check your configuration');
  }
});

// Rutas
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Obtener todas las reservas con paginación
app.get('/api/reservas', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Obtener conteo total (solo hoy y futuro)
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM reservas WHERE DATE(fecha) >= CURRENT_DATE"
    );
    const total = parseInt(countResult.rows[0].count);

    // Obtener reservas paginadas (citas de hoy y futuro)
    // Usando DATE(fecha) para comparar solo la parte de fecha, ignorando hora
    const result = await pool.query(
      `SELECT * FROM reservas
       WHERE DATE(fecha) >= CURRENT_DATE
       ORDER BY fecha ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const totalPages = Math.ceil(total / limit);

    console.log(`📋 Página ${page}/${totalPages}: ${result.rows.length} reservas (total: ${total})`);

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
    console.error('❌ Error obteniendo reservas:', error.message);
    res.status(500).json({ error: 'Error fetching reservations' });
  }
});

// Crear una nueva reserva
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
    
    console.log('📝 Nueva reserva creada:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando reserva:', error.message);
    res.status(500).json({ error: 'Error creating reservation' });
  }
});

// Endpoint de verificación de estado
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
  console.log(`🚀 Servidor Nail Studio ejecutándose en puerto ${port}`);
  console.log(`🌐 http://localhost:${port}`);
  console.log(`🔍 Verificación de salud: http://localhost:${port}/api/health`);
});
