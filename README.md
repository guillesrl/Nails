# Nail Studio Landing Page

A beautiful landing page for a nail beauty service with PostgreSQL database integration for appointment reservations.

## 🚀 Features

- **Responsive Design**: Mobile-friendly layout that works on all devices
- **Modern UI**: Clean, professional design with smooth animations
- **Database Integration**: PostgreSQL connection for storing reservations
- **Booking System**: Online appointment reservation form with validation
- **Service Showcase**: Display of nail services with pricing
- **Real-time Updates**: Live reservation display with auto-refresh
- **Docker Support**: Ready for containerized deployment

## 📁 Project Structure

```
nail-studio-landing/
├── server_with_db.js      # Express server with database connection
├── package.json           # Node.js dependencies
├── .env.example           # Environment variables template
├── Dockerfile             # Docker image configuration
├── docker-compose.yml     # Docker Compose setup
├── .dockerignore         # Docker ignore file
├── public/
│   ├── index.html         # Main landing page
│   ├── styles.css         # Styling
│   └── script.js          # Frontend JavaScript
└── README.md              # This file
```

## 🗄️ Database Schema

The application uses a PostgreSQL table called `reservas`:

```sql
CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  nombre TEXT,
  email TEXT,
  fecha TIMESTAMP WITH TIME ZONE,
  evento TEXT,
  creado TIMESTAMP DEFAULT now()
);
```

## 🛠️ Setup Instructions

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd nail-studio-landing
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run with Docker**:
   ```bash
   ./start_with_docker.sh
   ```

### Option 2: Manual Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up database**:
   ```bash
   # Create the reservas table in your PostgreSQL database
   psql -U postgres -d postgres -c "
   CREATE TABLE IF NOT EXISTS reservas (
     id SERIAL PRIMARY KEY,
     nombre TEXT,
     email TEXT,
     fecha TIMESTAMP WITH TIME ZONE,
     evento TEXT,
     creado TIMESTAMP DEFAULT now()
   );
   "
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database connection details
   ```

4. **Start the application**:
   ```bash
   npm start
   # or
   node server_with_db.js
   ```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSLMODE=disable

# Server Configuration
PORT=3000
```

## 🌐 API Endpoints

### GET `/api/reservas`
Retrieve all reservations ordered by creation date (newest first)

**Response**:
```json
[
  {
    "id": 1,
    "nombre": "John Doe",
    "email": "john@example.com",
    "fecha": "2024-01-20T14:30:00Z",
    "evento": "Classic Manicure",
    "creado": "Panel: 2024-01-20T10:00:00Z"
  }
]
```

### POST `/api/reservas`
Create a new reservation

**Request Body**:
```json
{
  "nombre": "John Doe",
  "email": "john@example.com",
  "fecha": "2024-01-20T14:30:00Z",
  "evento": "Classic Manicure"
}
```

**Response**:
```json
{
  "id": 1,
  "nombre": "John Doe",
  "email": "john@example.com",
  "fecha": "2024-01-20T14:30:00Z",
  "evento": "Classic Manicure",
  "creado": "2024-01-20T10:00:00Z"
}
```

### GET `/api/health`
Health check endpoint

**Response**:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## 🎨 Features Implementation

### Frontend Features
- **Responsive Navigation**: Mobile hamburger menu
- **Hero Section**: Eye-catching landing with call-to-action
- **Services Grid**: Display of available nail services
- **Booking Form**: Interactive form with real-time validation
- **Reservations Display**: Live view of all bookings
- **Smooth Scrolling**: Navigation between sections
- **Success Feedback**: Confirmation messages

### Backend Features
- **Express Server**: RESTful API architecture
- **PostgreSQL Integration**: Secure database connection with retry logic
- **CORS Support**: Cross-origin request handling
- **Error Handling**: Comprehensive error management
- **Fallback Mode**: Mock data when database is unavailable
- **Health Monitoring**: Database connection status tracking

## 🐳 Docker Deployment

The application includes full Docker support:

### Services
- **postgres**: PostgreSQL 15 database
- **nails_app**: Node.js application server

### Networks
- **nails_network**: Isolated Docker network for inter-service communication

### Volumes
- **postgres_data**: Persistent database storage
- **public/**: Shared static files

## 📱 Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Styling**: CSS Grid, Flexbox, CSS Animations
- **Fonts**: Google Fonts (Poppins)
- **Containerization**: Docker, Docker Compose

## 🔧 Customization

### Adding New Services
1. Update `public/index.html` - Add service cards to the services grid
2. Update `public/index.html` - Add options to the booking form select

### Styling Changes
- Modify `public/styles.css` for visual customizations
- Update CSS variables for consistent theming

### Database Modifications
- Run SQL scripts directly against your PostgreSQL database
- Update the server file if you modify the table structure

## 🚀 Deployment

### Easy Panel / Container Deployment
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import in Easy Panel**:
   - Add new container
   - Use Git repository URL
   - Set environment variables
   - Configure port mapping (3000)

3. **Environment Variables in Easy Panel**:
   ```
   DB_HOST=your_internal_database_host
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_SSLMODE=disable
   PORT=3000
   ```

### Production Considerations
- Set `NODE_ENV=production`
- Use process manager (PM2)
- Configure reverse proxy (Nginx)
- Set up SSL certificates
- Enable database backups

## 🔍 Troubleshooting

### Database Connection Issues
- Verify database is running and accessible
- Check connection string and credentials
- Ensure network connectivity between services
- Review database logs for connection errors

### Form Submission Issues
- Check browser console for JavaScript errors
- Verify API endpoints are responding
- Check network requests in browser dev tools
- Review server logs for error messages

### Container Issues
- Check container logs: `docker logs <container-name>`
- Verify environment variables are set correctly
- Ensure network connectivity between containers
- Check port mappings and firewall settings

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
