# Nail Studio Landing Page

Una hermosa landing page para un servicio de belleza de uñas con integración de base de datos PostgreSQL para reservas de citas.

## 🚀 Características

- **Diseño Responsivo**: Diseño amigable para móviles que funciona en todos los dispositivos
- **Interfaz Moderna**: Diseño limpio y profesional con animaciones suaves
- **Integración de Base de Datos**: Conexión PostgreSQL para almacenar reservas
- **Sistema de Reservas**: Formulario de reserva de citas en línea con validación
- **Exhibición de Servicios**: Muestra de servicios de uñas con precios
- **Actualizaciones en Tiempo Real**: Vista en vivo de reservas con auto-refresh
- **Soporte Docker**: Listo para despliegue en contenedores

## 📁 Estructura del Proyecto

```
nail-studio-landing/
├── server_with_db.js      # Servidor Express con conexión a base de datos
├── package.json           # Dependencias de Node.js
├── .env.example           # Plantilla de variables de entorno
├── Dockerfile             # Configuración de imagen Docker
├── docker-compose.yml     # Configuración Docker Compose
├── .dockerignore         # Archivos ignorados por Docker
├── public/
│   ├── index.html         # Página principal de landing
│   ├── styles.css         # Estilos
│   └── script.js          # JavaScript frontend
└── README.md              # Este archivo
```

## 🗄️ Esquema de Base de Datos

La aplicación usa una tabla de PostgreSQL llamada `reservas`:

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

## 🛠️ Instrucciones de Configuración

### Opción 1: Despliegue con Docker (Recomendado)

1. **Clonar el repositorio**:
   ```bash
   git clone <repository-url>
   cd nail-studio-landing
   ```

2. **Configurar entorno**:
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales de base de datos
   ```

3. **Ejecutar con Docker**:
   ```bash
   ./start_with_docker.sh
   ```

### Opción 2: Configuración Manual

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar base de datos**:
   ```bash
   # Crear la tabla reservas en tu base de datos PostgreSQL
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

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Editar .env con los detalles de tu conexión a la base de datos
   ```

4. **Iniciar la aplicación**:
   ```bash
   npm start
   # o
   node server_with_db.js
   ```

## 🔧 Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
# Configuración de Base de Datos
DB_HOST=tu_host_de_base_de_datos
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_SSLMODE=disable

# Configuración del Servidor
PORT=3000

# Configuración CORS (Producción)
ALLOWED_ORIGINS=https://estetica.guillers.es
```

## 🌐 Endpoints de la API

### GET `/api/reservas`
Recupera todas las reservas ordenadas por fecha de creación (más recientes primero)

**Respuesta**:
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
Crear una nueva reserva

**Cuerpo de la Petición**:
```json
{
  "nombre": "John Doe",
  "email": "john@example.com",
  "fecha": "2024-01-20T14:30:00Z",
  "evento": "Classic Manicure"
}
```

**Respuesta**:
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
Endpoint de verificación de estado

**Respuesta**:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## 🎨 Implementación de Características

### Características Frontend
- **Navegación Responsiva**: Menú hamburguesa en móviles
- **Sección Hero**: Landing atractivo con llamada a la acción
- **Cuadrícula de Servicios**: Muestra de servicios de uñas disponibles
- **Formulario de Reserva**: Formulario interactivo con validación en tiempo real
- **Visualización de Reservas**: Vista en vivo de todas las reservas
- **Scroll Suave**: Navegación entre secciones
- **Retroalimentación de Éxito**: Mensajes de confirmación

### Características Backend
- **Servidor Express**: Arquitectura RESTful API
- **Integración PostgreSQL**: Conexión segura a base de datos con lógica de reintento
- **Soporte CORS**: Manejo de peticiones cross-origin
- **Rate Limiting**: 50 req/15min general, 5 reservas/hora por IP
- **Manejo de Errores**: Gestión comprehensiva de errores
- **Modo Fallback**: Datos de ejemplo cuando la base de datos no está disponible
- **Monitoreo de Salud**: Seguimiento del estado de conexión a la base de datos

## 🐳 Despliegue con Docker

La aplicación incluye soporte completo para Docker:

### Servicios
- **postgres**: Base de datos PostgreSQL 15
- **nails_app**: Servidor de aplicación Node.js

### Redes
- **nails_network**: Red Docker aislada para comunicación entre servicios

### Volúmenes
- **postgres_data**: Almacenamiento persistente de base de datos
- **public/**: Archivos estáticos compartidos

## 📱 Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Base de Datos**: PostgreSQL
- **Estilos**: CSS Grid, Flexbox, CSS Animations
- **Fuentes**: Google Fonts (Poppins)
- **Contenedores**: Docker, Docker Compose

## 🔧 Personalización

### Agregar Nuevos Servicios
1. Actualizar `public/index.html` - Añadir tarjetas de servicios a la cuadrícula
2. Actualizar `public/index.html` - Añadir opciones al select del formulario de reserva

### Cambios de Estilos
- Modificar `public/styles.css` para personalizaciones visuales
- Actualizar variables CSS para tematización consistente

### Modificaciones de Base de Datos
- Ejecutar scripts SQL directamente en tu base de datos PostgreSQL
- Actualizar el archivo del servidor si modificas la estructura de tablas

## 🚀 Despliegue

### Easy Panel / Despliegue en Contenedor
1. **Push a GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Importar en Easy Panel**:
   - Añadir nuevo contenedor
   - Usar URL del repositorio Git
   - Configurar variables de entorno
   - Configurar mapeo de puertos (3000)

3. **Variables de Entorno en Easy Panel**:
   ```
   DB_HOST=tu_host_de_base_de_datos_interno
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña
   DB_SSLMODE=disable
   PORT=3000
   ALLOWED_ORIGINS=https://estetica.guillers.es
   ```

### Consideraciones de Producción
- Configurar `NODE_ENV=production`
- Usar gestor de procesos (PM2)
- Configurar proxy inverso (Nginx)
- Configurar certificados SSL
- Habilitar respaldos de base de datos

## 🚀 Recomendaciones de Mejora

### Seguridad
- **CORS**: Actualizar configuración CORS para permitir solo dominios específicos en producción
- **Validación de Entrada**: Añadir sanitización de entradas en el backend para prevenir SQL injection

### Base de Datos
- **Restricciones Únicas**: Añadir restricción UNIQUE en combinación email/fecha para evitar reservas duplicadas
- **Índices**: Crear índices en campos frecuentemente consultados (fecha, creado)

### Rendimiento Frontend
- **Optimización de Imágenes**: Comprimir imágenes y usar formato WebP
- **Lazy Loading**: Implementar carga diferida para imágenes debajo del fold
- **CDN**: Usar CDN para recursos estáticos

### Integración Cal.com
- **Event Listeners**: Simplificar manejadores de eventos para usar solo "bookingCompleted"
- **Extracción de Datos**: Mejorar extracción de datos desde objeto de evento
- **Validación**: Añadir validación redundante para captura de reservas

## 🔍 Solución de Problemas

### Problemas de Conexión a Base de Datos
- Verificar que la base de datos esté funcionando y accesible
- Revisar cadena de conexión y credenciales
- Asegurar conectividad de red entre servicios
- Revisar logs de la base de datos para errores de conexión

### Problemas de Envío de Formulario
- Revisar consola del navegador para errores JavaScript
- Verificar que los endpoints API estén respondiendo
- Revisar peticiones de red en herramientas de desarrollo
- Revisar logs del servidor para mensajes de error

### Problemas de Contenedor
- Revisar logs de contenedor: `docker logs <nombre-contenedor>`
- Verificar que las variables de entorno estén configuradas correctamente
- Asegurar conectividad de red entre contenedores
- Revisar mapeos de puertos y configuración de firewall

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 🤝 Contribuir

1. Hacer fork del repositorio
2. Crear una rama de feature
3. Realizar cambios
4. Probar exhaustivamente
5. Enviar un pull request
