// Toggle de Navegación Móvil
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Scroll Suave
function scrollToBooking() {
    const bookingSection = document.getElementById('contact');
    bookingSection.scrollIntoView({ behavior: 'smooth' });
}

function scrollToServices() {
    const servicesSection = document.getElementById('services');
    servicesSection.scrollIntoView({ behavior: 'smooth' });
}

// Estado de paginación
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

// Cargar y mostrar reservas
async function loadReservations(page = 1) {
    const reservationsList = document.getElementById('reservationsList');
    const noReservations = document.getElementById('noReservations');

    if (!reservationsList || !noReservations) {
        return;
    }

    currentPage = page;

    try {
        const response = await fetch(`/api/reservas?page=${page}&limit=${ITEMS_PER_PAGE}`);
        if (response.ok) {
            const data = await response.json();
            displayReservationsList(data.reservations);
            renderPagination(data.pagination);
        } else {
            console.error('Error obteniendo reservas');
            reservationsList.innerHTML = '';
            noReservations.style.display = 'block';
        }
    } catch (error) {
        console.error('Error de red:', error);
        reservationsList.innerHTML = '';
        noReservations.style.display = 'block';
    }
}

// Mostrar lista de reservas
function displayReservationsList(reservations) {
    const reservationsList = document.getElementById('reservationsList');
    const noReservations = document.getElementById('noReservations');

    if (reservations.length === 0) {
        reservationsList.innerHTML = '';
        noReservations.style.display = 'block';
        noReservations.innerHTML = '<p>No hay reservas para mostrar en esta página.</p>'; // Ya está en español
        return;
    }

    noReservations.style.display = 'none';

    reservationsList.innerHTML = reservations.map(reservation => {
        const appointmentDate = new Date(reservation.fecha);
        const createdDate = new Date(reservation.creado);

        return `
            <div class="reservation-card">
                <div>#${reservation.id}</div>
                <div class="reservation-details">
                    <h3>${reservation.nombre}</h3>
                    <p> 📧 ${reservation.email}</p>
                    <span class="service-type">${reservation.evento}</span>
                </div>
                <div class="reservation-date">
                    <div class="date">${appointmentDate.toLocaleDateString()} <span class="time">${appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                    <div class="created">Reservada: ${createdDate.toLocaleDateString()}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Renderizar controles de paginación
function renderPagination(pagination) {
    const reservationsList = document.getElementById('reservationsList');
    if (!reservationsList) return;

    // Remover paginación existente
    const existingPagination = document.getElementById('paginationControls');
    if (existingPagination) {
        existingPagination.remove();
    }

    // Ocultar si solo hay una página
    if (pagination.totalPages <= 1) return;

    const paginationDiv = document.createElement('div');
    paginationDiv.id = 'paginationControls';
    paginationDiv.className = 'pagination-controls';
    paginationDiv.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin-top: 1.5rem;
        flex-wrap: wrap;
    `;

    // Botón Anterior
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Anterior';
    prevBtn.disabled = !pagination.hasPrev;
    prevBtn.className = 'pagination-button';
    prevBtn.style.cssText = `
        padding: 0.5rem 1rem;
        border: 2px solid #d4a574;
        background: ${pagination.hasPrev ? '#d4a574' : '#f0f0f0'};
        color: ${pagination.hasPrev ? 'white' : '#999'};
        border-radius: 8px;
        cursor: ${pagination.hasPrev ? 'pointer' : 'not-allowed'};
        font-weight: 500;
        transition: all 0.3s ease;
        font-size: 0.9rem;
    `;
    prevBtn.onclick = () => loadReservations(pagination.page - 1);
    paginationDiv.appendChild(prevBtn);

    // Información de página
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Página ${pagination.page} de ${pagination.totalPages}`;
    pageInfo.style.cssText = `
        font-weight: 500;
        color: #666;
        margin: 0 1rem;
    `;
    paginationDiv.appendChild(pageInfo);

    // Botón Siguiente
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Siguiente →';
    nextBtn.disabled = !pagination.hasNext;
    nextBtn.className = 'pagination-button';
    nextBtn.style.cssText = `
        padding: 0.5rem 1rem;
        border: 2px solid #d4a574;
        background: ${pagination.hasNext ? '#d4a574' : '#f0f0f0'};
        color: ${pagination.hasNext ? 'white' : '#999'};
        border-radius: 8px;
        cursor: ${pagination.hasNext ? 'pointer' : 'not-allowed'};
        font-weight: 500;
        transition: all 0.3s ease;
        font-size: 0.9rem;
    `;
    nextBtn.onclick = () => loadReservations(pagination.page + 1);
    paginationDiv.appendChild(nextBtn);

    // Insertar después de la lista de reservas
    reservationsList.parentNode.insertBefore(paginationDiv, reservationsList.nextSibling);
}

// Form Submission
const bookingForm = document.getElementById('bookingForm');
const successMessage = document.getElementById('successMessage');

if (bookingForm && successMessage) {
    bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(bookingForm);
    const data = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        fecha: formData.get('fecha'),
        evento: formData.get('evento')
    };
    
    try {
        const response = await fetch('/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Reservation created:', result);
            
            // Show success message and reset form
            successMessage.style.display = 'block';
            bookingForm.reset();
            
            // Load reservations to show the new one
            loadReservations();
            
            // Hide success message and show form after 3 seconds
            setTimeout(() => {
                bookingForm.style.display = 'flex';
                successMessage.style.display = 'none';
            }, 3000);
            
        } else {
            const error = await response.json();
            console.error('Error creating reservation:', error);
            alert('Error creando reserva. Por favor intente de nuevo.');
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('Error de red. Por favor verifique su conexión e intente de nuevo.');
    }
});
}

// Establecer fecha mínima para reservas a hoy
const fechaInput = document.getElementById('fecha');
if (fechaInput) {
    const today = new Date().toISOString().slice(0, 16);
    fechaInput.min = today;
}

// Añadir animación al hacer scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos para animación
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .about-content, .hero-content');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Cargar reservas cuando la página carga (página 1)
    loadReservations(1);
});

// Validación de formulario
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateForm() {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const fecha = document.getElementById('fecha').value;
    const evento = document.getElementById('evento').value;
    
    let isValid = true;
    
    // Resetear estilos de error
    document.querySelectorAll('.form-group input, .form-group select').forEach(field => {
        field.style.borderColor = '#e0e0e0';
    });
    
    // Validar nombre
    if (nombre.length < 2) {
        document.getElementById('nombre').style.borderColor = '#ff6b6b';
        isValid = false;
    }
    
    // Validar email
    if (!validateEmail(email)) {
        document.getElementById('email').style.borderColor = '#ff6b6b';
        isValid = false;
    }
    
    // Validar fecha
    if (!fecha) {
        document.getElementById('fecha').style.borderColor = '#ff6b6b';
        isValid = false;
    }
    
    // Validar servicio
    if (!evento) {
        document.getElementById('evento').style.borderColor = '#ff6b6b';
        isValid = false;
    }
    
    return isValid;
}

// Añadir validación en tiempo real
const nombreInput = document.getElementById('nombre');
if (nombreInput) {
    nombreInput.addEventListener('blur', function() {
        if (this.value.trim().length < 2) {
            this.style.borderColor = '#ff6b6b'; // Rojo error
        } else {
            this.style.borderColor = '#4caf50'; // Verde OK
        }
    });
}

const emailInput = document.getElementById('email');
if (emailInput) {
    emailInput.addEventListener('blur', function() {
        if (!validateEmail(this.value.trim())) {
            this.style.borderColor = '#ff6b6b'; // Rojo error
        } else {
            this.style.borderColor = '#4caf50'; // Verde OK
        }
    });
}

const fechaInput2 = document.getElementById('fecha');
if (fechaInput2) {
    fechaInput2.addEventListener('change', function() {
        if (this.value) {
            this.style.borderColor = '#4caf50';
        }
    });
}

const eventoInput = document.getElementById('evento');
if (eventoInput) {
    eventoInput.addEventListener('change', function() {
        if (this.value) {
            this.style.borderColor = '#4caf50';
        }
    });
}
