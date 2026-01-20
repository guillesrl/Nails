#!/bin/bash

echo "🚀 Starting Nail Studio with Docker..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker stop nails_app n8n_postgres 2>/dev/null || true
docker rm nails_app n8n_postgres 2>/dev/null || true

# Create network if it doesn't exist
echo "🌐 Creating Docker network..."
docker network create nails_network 2>/dev/null || true

# Start PostgreSQL container
echo "🐘 Starting PostgreSQL container..."
docker run -d \
  --name n8n_postgres \
  --network nails_network \
  -e POSTGRES_DB=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=River036 \
  -p 5432:5432 \
  postgres:15

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to start..."
sleep 10

# Test PostgreSQL connection
echo "🔍 Testing PostgreSQL connection..."
docker exec n8n_postgres psql -U postgres -d postgres -c "SELECT version();" || {
    echo "❌ PostgreSQL connection failed"
    exit 1
}

# Create the reservas table
echo "📋 Creating reservas table..."
docker exec n8n_postgres psql -U postgres -d postgres -c "
CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  nombre TEXT,
  email TEXT,
  fecha TIMESTAMP WITH TIME ZONE,
  evento TEXT,
  creado TIMESTAMP DEFAULT now()
);
"

# Start the application
echo "🎨 Starting Nail Studio application..."
docker run -d \
  --name nails_app \
  --network nails_network \
  -e DB_HOST=n8n_postgres \
  -e DB_PORT=5432 \
  -e DB_NAME=postgres \
  -e DB_USER=postgres \
  -e DB_PASSWORD=River036 \
  -e DB_SSLMODE=disable \
  -e PORT=3000 \
  -p 3000:3000 \
  -v "$(pwd)/public:/app/public" \
  node:18-alpine sh -c "
    cd /app && 
    npm install -g express pg cors dotenv &&
    echo 'const express = require(\"express\");
const cors = require(\"cors\");
const { Pool } = require(\"pg\");

require(\"dotenv\").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(\"public\"));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSLMODE === \"disable\" ? false : { rejectUnauthorized: false }
});

app.get(\"/\", (req, res) => {
  res.sendFile(__dirname + \"/public/index.html\");
});

app.get(\"/api/reservas\", async (req, res) => {
  try {
    const result = await pool.query(\"SELECT * FROM reservas ORDER BY creado DESC\");
    res.json(result.rows);
  } catch (error) {
    console.error(\"Error fetching reservations:\", error);
    res.status(500).json({ error: \"Error fetching reservations\" });
  }
});

app.post(\"/api/reservas\", async (req, res) => {
  try {
    const { nombre, email, fecha, evento } = req.body;
    const query = \"INSERT INTO reservas (nombre, email, fecha, evento) VALUES ($1, $2, $3, $4) RETURNING *\";
    const values = [nombre, email, fecha, evento];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(\"Error creating reservation:\", error);
    res.status(500).json({ error: \"Error creating reservation\" });
  }
});

app.listen(port, () => {
  console.log(\"Server running on port \" + port);
});' > server.js &&
    node server.js
  "

echo "✅ Application started!"
echo "🌐 Nail Studio is available at: http://localhost:3000"
echo "🐘 PostgreSQL is available at: postgres://postgres:River036@localhost:5432/postgres"
echo ""
echo "📝 To view logs:"
echo "  docker logs nails_app"
echo "  docker logs n8n_postgres"
echo ""
echo "🛑 To stop:"
echo "  docker stop nails_app n8n_postgres"
