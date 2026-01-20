const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock data
const mockReservations = [
  {
    id: 1,
    nombre: "Maria Garcia",
    email: "maria@example.com",
    fecha: "2024-01-25T14:30:00Z",
    evento: "Classic Manicure",
    creado: "2024-01-20T10:00:00Z"
  },
  {
    id: 2,
    nombre: "Ana Lopez",
    email: "ana@example.com",
    fecha: "2024-01-26T16:00:00Z",
    evento: "Gel Manicure",
    creado: "2024-01-20T11:30:00Z"
  },
  {
    id: 3,
    nombre: "Carmen Rodriguez",
    email: "carmen@example.com",
    fecha: "2024-01-27T10:00:00Z",
    evento: "Nail Art Design",
    creado: "2024-01-20T14:15:00Z"
  }
];

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Get all reservations
app.get('/api/reservas', (req, res) => {
  console.log('Returning mock reservations:', mockReservations.length);
  res.json(mockReservations);
});

// Create a new reservation
app.post('/api/reservas', (req, res) => {
  const { nombre, email, fecha, evento } = req.body;
  const newReservation = {
    id: mockReservations.length + 1,
    nombre,
    email,
    fecha,
    evento,
    creado: new Date().toISOString()
  };
  mockReservations.push(newReservation);
  console.log('New reservation created:', newReservation);
  res.status(201).json(newReservation);
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`✅ Mock data ready with ${mockReservations.length} reservations`);
});
