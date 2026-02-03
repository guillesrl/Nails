// Mobile Navigation Toggle
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

// Smooth Scrolling
function scrollToBooking() {
    const bookingSection = document.getElementById('contact');
    bookingSection.scrollIntoView({ behavior: 'smooth' });
}

function scrollToServices() {
    const servicesSection = document.getElementById('services');
    servicesSection.scrollIntoView({ behavior: 'smooth' });
}

// Load and display reservations
async function loadReservations() {
    // Check if we're on the reservations page
    const reservationsList = document.getElementById('reservationsList');
    const noReservations = document.getElementById('noReservations');
    
    if (!reservationsList || !noReservations) {
        return; // Exit if not on reservations page
    }
    
    try {
        const response = await fetch('/api/reservas');
        if (response.ok) {
            const reservations = await response.json();
            displayReservations(reservations);
        } else {
            console.error('Error fetching reservations');
            reservationsList.innerHTML = '';
            noReservations.style.display = 'none';
        }
    } catch (error) {
        console.error('Network error:', error);
        reservationsList.innerHTML = '';
        noReservations.style.display = 'none';
    }
}

// Display reservations in the UI
function displayReservations(reservations) {
    const reservationsList = document.getElementById('reservationsList');
    const noReservations = document.getElementById('noReservations');
    
    // Check if we're on the reservations page
    if (!reservationsList || !noReservations) {
        return; // Exit if not on reservations page
    }
    
    // Get today's date without time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter reservations to show only today and future dates
    const futureReservations = reservations.filter(reservation => {
        const appointmentDate = new Date(reservation.fecha);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate >= today;
    });
    
    if (futureReservations.length === 0) {
        reservationsList.innerHTML = '';
        noReservations.style.display = 'block';
        return;
    }
    
    noReservations.style.display = 'none';
    
    // Sort reservations by appointment date (closest first)
    const sortedReservations = futureReservations.sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateA - dateB; // Ascending order (closest first)
    });
    
    reservationsList.innerHTML = sortedReservations.map(reservation => {
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
                    <div class="created">Booked: ${createdDate.toLocaleDateString()}</div>
                </div>
            </div>
        `;
    }).join('');
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
            alert('Error creating reservation. Please try again.');
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error. Please check your connection and try again.');
    }
});
}

// Set minimum date for booking to today
const fechaInput = document.getElementById('fecha');
if (fechaInput) {
    const today = new Date().toISOString().slice(0, 16);
    fechaInput.min = today;
}

// Add animation on scroll
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

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .about-content, .hero-content');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Load reservations when page loads
    loadReservations();
});

// Form validation
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
    
    // Reset error styles
    document.querySelectorAll('.form-group input, .form-group select').forEach(field => {
        field.style.borderColor = '#e0e0e0';
    });
    
    // Validate name
    if (nombre.length < 2) {
        document.getElementById('nombre').style.borderColor = '#ff6b6b';
        isValid = false;
    }
    
    // Validate email
    if (!validateEmail(email)) {
        document.getElementById('email').style.borderColor = '#ff6b6b';
        isValid = false;
    }
    
    // Validate date
    if (!fecha) {
        document.getElementById('fecha').style.borderColor = '#ff6b6b';
        isValid = false;
    }
    
    // Validate service
    if (!evento) {
        document.getElementById('evento').style.borderColor = '#ff6b6b';
        isValid = false;
    }
    
    return isValid;
}

// Add real-time validation
const nombreInput = document.getElementById('nombre');
if (nombreInput) {
    nombreInput.addEventListener('blur', function() {
        if (this.value.trim().length < 2) {
            this.style.borderColor = '#ff6b6b';
        } else {
            this.style.borderColor = '#4caf50';
        }
    });
}

const emailInput = document.getElementById('email');
if (emailInput) {
    emailInput.addEventListener('blur', function() {
        if (!validateEmail(this.value.trim())) {
            this.style.borderColor = '#ff6b6b';
        } else {
            this.style.borderColor = '#4caf50';
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
