// Variables globales
let currentStep = 1;
const totalSteps = 3;
let userLocation = null;
let locationMethod = null; // 'current' o 'manual'

// Elementos del DOM
const collectionForm = document.getElementById("collectionForm");
const progressBar = document.getElementById("progressBar");
const useCurrentLocationBtn = document.getElementById("useCurrentLocation");
const useManualLocationBtn = document.getElementById("useManualLocation");
const manualLocationGroup = document.getElementById("manualLocationGroup");
const locationInfo = document.getElementById("locationInfo");
const locationText = document.getElementById("locationText");
const mapsLink = document.getElementById("mapsLink");

// Campos del formulario
const doctorNameField = document.getElementById("doctorName");
const clinicNameField = document.getElementById("clinicName");
const phoneField = document.getElementById("phone");
const manualAddressField = document.getElementById("manualAddress");
const collectionDateField = document.getElementById("collectionDate");
const collectionTimeField = document.getElementById("collectionTime");
const notesField = document.getElementById("notes");

// Inicialización
document.addEventListener("DOMContentLoaded", function() {
    initializeForm();
    new WOW().init();
});

function initializeForm() {
    // Configurar fecha mínima (mañana)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    collectionDateField.min = tomorrow.toISOString().split('T')[0];

    // Configurar validación en tiempo real
    setupRealTimeValidation();

    // Configurar botones de ubicación
    setupLocationButtons();

    // Manejar envío del formulario
    collectionForm.addEventListener("submit", handleFormSubmit);

    // Actualizar barra de progreso
    updateProgressBar();
}

function setupRealTimeValidation() {
    // Validación del nombre del doctor
    doctorNameField.addEventListener("input", function() {
        validateField(this, "doctorName");
    });

    doctorNameField.addEventListener("blur", function() {
        validateField(this, "doctorName", true);
    });

    // Validación del teléfono
    phoneField.addEventListener("input", function() {
        // Formatear número telefónico
        let value = this.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
        }
        this.value = value;
        validateField(this, "phone");
    });

    phoneField.addEventListener("blur", function() {
        validateField(this, "phone", true);
    });

    // Validación de dirección manual
    manualAddressField.addEventListener("input", function() {
        if (locationMethod === 'manual') {
            validateField(this, "manualAddress");
        }
    });

    manualAddressField.addEventListener("blur", function() {
        if (locationMethod === 'manual') {
            validateField(this, "manualAddress", true);
        }
    });

    // Validación de fecha
    collectionDateField.addEventListener("change", function() {
        validateField(this, "collectionDate", true);
    });

    // Validación de hora
    collectionTimeField.addEventListener("change", function() {
        validateField(this, "collectionTime", true);
    });
}

function setupLocationButtons() {
    useCurrentLocationBtn.addEventListener("click", function() {
        this.classList.add("active");
        useManualLocationBtn.classList.remove("active");
        manualLocationGroup.style.display = "none";
        locationMethod = 'current';
        getCurrentLocation();
    });

    useManualLocationBtn.addEventListener("click", function() {
        this.classList.add("active");
        useCurrentLocationBtn.classList.remove("active");
        manualLocationGroup.style.display = "block";
        locationInfo.style.display = "none";
        locationMethod = 'manual';
        userLocation = null;
    });
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification("La geolocalización no está soportada en este navegador", "error");
        return;
    }

    // Mostrar estado de carga
    locationInfo.style.display = "block";
    locationText.textContent = "Obteniendo ubicación...";
    useCurrentLocationBtn.classList.add("loading");

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            userLocation = { lat, lng };
            
            // Obtener dirección usando geocodificación inversa
            reverseGeocode(lat, lng);
            
            // Crear enlace de Google Maps
            mapsLink.href = `https://www.google.com/maps?q=${lat},${lng}`;
            
            useCurrentLocationBtn.classList.remove("loading");
            showNotification("Ubicación obtenida correctamente", "success");
        },
        function(error) {
            useCurrentLocationBtn.classList.remove("loading");
            locationInfo.style.display = "none";
            
            let errorMessage = "Error al obtener la ubicación";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Permiso de ubicación denegado. Use la opción manual.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Ubicación no disponible. Use la opción manual.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "Tiempo de espera agotado. Use la opción manual.";
                    break;
            }
            
            showNotification(errorMessage, "error");
            
            // Cambiar automáticamente a ubicación manual
            useManualLocationBtn.click();
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

function reverseGeocode(lat, lng) {
    // Simulación de geocodificación inversa
    // En un proyecto real, usarías la API de Google Maps o similar
    locationText.textContent = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    
    // Aquí podrías hacer una llamada real a la API de geocodificación
    // fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_API_KEY`)
}

function validateField(field, type, showError = false) {
    const value = field.value.trim();
    const formGroup = field.closest('.form-group');
    const feedback = formGroup.querySelector('.form-feedback');
    
    let isValid = true;
    let message = "";

    switch(type) {
        case "doctorName":
            if (!value) {
                isValid = false;
                message = "El nombre del doctor es obligatorio";
            } else if (value.length < 3) {
                isValid = false;
                message = "Debe tener al menos 3 caracteres";
            }
            break;

        case "phone":
            const phonePattern = /^\d{2}\s\d{4}\s\d{4}$/;
            if (!value) {
                isValid = false;
                message = "El teléfono es obligatorio";
            } else if (!phonePattern.test(value)) {
                isValid = false;
                message = "Formato: 55 1234 5678";
            }
            break;

        case "manualAddress":
            if (!value) {
                isValid = false;
                message = "La dirección es obligatoria";
            } else if (value.length < 20) {
                isValid = false;
                message = "Proporcione una dirección completa";
            }
            break;

        case "collectionDate":
            const selectedDate = new Date(value);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            if (!value) {
                isValid = false;
                message = "La fecha es obligatoria";
            } else if (selectedDate < tomorrow) {
                isValid = false;
                message = "La fecha debe ser mínimo mañana";
            }
            break;

        case "collectionTime":
            if (!value) {
                isValid = false;
                message = "La hora es obligatoria";
            }
            break;
    }

    // Actualizar UI
    if (isValid) {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        field.classList.remove('error');
        feedback.textContent = "";
        feedback.classList.remove('show');
    } else if (showError || value.length > 0) {
        formGroup.classList.remove('success');
        formGroup.classList.add('error');
        field.classList.add('error');
        feedback.textContent = message;
        feedback.classList.add('show');
    }

    return isValid;
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            // Ocultar paso actual
            document.getElementById(`step${currentStep}`).classList.remove("active");
            
            // Mostrar siguiente paso
            currentStep++;
            document.getElementById(`step${currentStep}`).classList.add("active");
            
            // Actualizar barra de progreso
            updateProgressBar();
            
            // Actualizar resumen si estamos en el último paso
            if (currentStep === 3) {
                updateSummary();
            }
            
            // Scroll al inicio del formulario
            document.querySelector('.form-header').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        // Ocultar paso actual
        document.getElementById(`step${currentStep}`).classList.remove("active");
        
        // Mostrar paso anterior
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add("active");
        
        // Actualizar barra de progreso
        updateProgressBar();
        
        // Scroll al inicio del formulario
        document.querySelector('.form-header').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

function validateCurrentStep() {
    let isValid = true;

    if (currentStep === 1) {
        // Validar paso 1: Información del doctor
        const isValidDoctor = validateField(doctorNameField, "doctorName", true);
        const isValidPhone = validateField(phoneField, "phone", true);
        
        isValid = isValidDoctor && isValidPhone;
        
    } else if (currentStep === 2) {
        // Validar paso 2: Ubicación
        if (!locationMethod) {
            showNotification("Por favor seleccione un método de ubicación", "warning");
            isValid = false;
        } else if (locationMethod === 'current' && !userLocation) {
            showNotification("Por favor obtenga su ubicación actual o use la opción manual", "warning");
            isValid = false;
        } else if (locationMethod === 'manual') {
            const isValidAddress = validateField(manualAddressField, "manualAddress", true);
            isValid = isValidAddress;
        }
        
    } else if (currentStep === 3) {
        // Validar paso 3: Fecha y hora
        const isValidDate = validateField(collectionDateField, "collectionDate", true);
        const isValidTime = validateField(collectionTimeField, "collectionTime", true);
        
        isValid = isValidDate && isValidTime;
    }

    return isValid;
}

function updateProgressBar() {
    const progress = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
}

function updateSummary() {
    const summaryContent = document.getElementById("summaryContent");
    
    let summaryHTML = "";
    
    // Información del doctor
    if (doctorNameField.value.trim()) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Doctor:</span>
            <span class="summary-value">${doctorNameField.value}</span>
        </div>`;
    }
    
    if (clinicNameField.value.trim()) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Clínica:</span>
            <span class="summary-value">${clinicNameField.value}</span>
        </div>`;
    }
    
    if (phoneField.value.trim()) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Teléfono:</span>
            <span class="summary-value">${phoneField.value}</span>
        </div>`;
    }
    
    // Ubicación
    let locationDisplay = "";
    if (locationMethod === 'current' && userLocation) {
        locationDisplay = "Ubicación actual (GPS)";
    } else if (locationMethod === 'manual' && manualAddressField.value.trim()) {
        locationDisplay = manualAddressField.value.substring(0, 50) + "...";
    }
    
    if (locationDisplay) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Ubicación:</span>
            <span class="summary-value">${locationDisplay}</span>
        </div>`;
    }
    
    // Fecha y hora
    if (collectionDateField.value) {
        const date = new Date(collectionDateField.value);
        const formattedDate = date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Fecha:</span>
            <span class="summary-value">${formattedDate}</span>
        </div>`;
    }
    
    if (collectionTimeField.value) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Hora:</span>
            <span class="summary-value">${collectionTimeField.value}</span>
        </div>`;
    }
    
    summaryContent.innerHTML = summaryHTML;
}

function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateCurrentStep()) {
        return;
    }

    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    
    // Mostrar estado de carga
    submitBtn.innerHTML = '<i class="lni lni-spinner-arrow"></i> Enviando solicitud...';
    submitBtn.disabled = true;

    // Simular envío
    setTimeout(() => {
        showNotification("✅ Solicitud de recolección enviada exitosamente", "success");
        
        setTimeout(() => {
            showNotification("📱 Recibirá confirmación por WhatsApp en las próximas horas", "info");
        }, 2000);

        // Resetear formulario después de un momento
        setTimeout(() => {
            resetForm();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 4000);

    }, 3000);
}

function resetForm() {
    // Resetear formulario
    collectionForm.reset();
    currentStep = 1;
    locationMethod = null;
    userLocation = null;

    // Mostrar solo el primer paso
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById('step1').classList.add('active');

    // Resetear botones de ubicación
    useCurrentLocationBtn.classList.remove('active');
    useManualLocationBtn.classList.remove('active');
    manualLocationGroup.style.display = 'none';
    locationInfo.style.display = 'none';

    // Resetear validaciones
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('success', 'error');
    });

    document.querySelectorAll('.form-feedback').forEach(feedback => {
        feedback.classList.remove('show');
    });

    // Actualizar barra de progreso
    updateProgressBar();
}

function showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Estilos de la notificación
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#00ADB5'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
    
    // Botón de cerrar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// Agregar estilos de animación para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(style);