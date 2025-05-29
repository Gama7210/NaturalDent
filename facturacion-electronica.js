// Variables globales
let formProgress = 0;
const totalFields = 6; // Total de campos requeridos

// Elementos del DOM
const facturaForm = document.getElementById("facturaForm");
const progressBar = document.getElementById("progressBar");
const ordenField = document.getElementById("orden");
const doctorField = document.getElementById("doctor");
const rfcField = document.getElementById("rfc");
const descripcionField = document.getElementById("descripcion");
const direccionField = document.getElementById("direccion");
const situacionFiscalField = document.getElementById("situacionFiscal");
const emailField = document.getElementById("email");

// Inicialización
document.addEventListener("DOMContentLoaded", function() {
    initializeForm();
    new WOW().init();
});

function initializeForm() {
    // Obtener número de orden de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const ordenValue = urlParams.get('orden');
    ordenField.value = ordenValue || "";

    // Configurar validación en tiempo real
    setupRealTimeValidation();

    // Configurar upload de archivos
    setupFileUpload();

    // Manejar envío del formulario
    facturaForm.addEventListener("submit", handleFormSubmit);

    // Inicializar barra de progreso
    updateProgress();
}

function setupRealTimeValidation() {
    // Validación del doctor/razón social
    doctorField.addEventListener("input", function() {
        validateField(this, "doctor");
    });

    doctorField.addEventListener("blur", function() {
        validateField(this, "doctor", true);
    });

    // Validación del RFC
    rfcField.addEventListener("input", function() {
        // Convertir a mayúsculas y limitar caracteres
        this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        validateField(this, "rfc");
    });

    rfcField.addEventListener("blur", function() {
        validateField(this, "rfc", true);
    });

    // Validación de descripción
    descripcionField.addEventListener("input", function() {
        validateField(this, "descripcion");
    });

    descripcionField.addEventListener("blur", function() {
        validateField(this, "descripcion", true);
    });

    // Validación de dirección
    direccionField.addEventListener("input", function() {
        validateField(this, "direccion");
    });

    direccionField.addEventListener("blur", function() {
        validateField(this, "direccion", true);
    });

    // Validación del email
    emailField.addEventListener("input", function() {
        validateField(this, "email");
    });

    emailField.addEventListener("blur", function() {
        validateField(this, "email", true);
    });
}

function validateField(field, type, showError = false) {
    const value = field.value.trim();
    const formGroup = field.closest('.form-group');
    const feedback = formGroup.querySelector('.form-feedback');
    
    let isValid = true;
    let message = "";

    switch(type) {
        case "doctor":
            if (!value) {
                isValid = false;
                message = "El nombre del doctor o razón social es obligatorio";
            } else if (value.length < 3) {
                isValid = false;
                message = "Debe tener al menos 3 caracteres";
            }
            break;

        case "rfc":
            const rfcPattern = /^[A-Z]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
            if (!value) {
                isValid = false;
                message = "El RFC es obligatorio";
            } else if (!rfcPattern.test(value)) {
                isValid = false;
                message = "Formato de RFC inválido (ej: ABCD123456EF7)";
            }
            break;

        case "descripcion":
            if (!value) {
                isValid = false;
                message = "La descripción del servicio es obligatoria";
            } else if (value.length < 10) {
                isValid = false;
                message = "La descripción debe ser más detallada";
            }
            break;

        case "direccion":
            if (!value) {
                isValid = false;
                message = "La dirección fiscal es obligatoria";
            } else if (value.length < 20) {
                isValid = false;
                message = "Proporcione una dirección completa";
            }
            break;

        case "email":
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                isValid = false;
                message = "El correo electrónico es obligatorio";
            } else if (!emailPattern.test(value)) {
                isValid = false;
                message = "Formato de correo electrónico inválido";
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

    updateProgress();
    return isValid;
}

function setupFileUpload() {
    const fileLabel = situacionFiscalField.nextElementSibling;
    const fileInfo = fileLabel.nextElementSibling;
    const fileText = fileLabel.querySelector('.file-text');

    situacionFiscalField.addEventListener("change", function() {
        const file = this.files[0];
        
        if (file) {
            // Validar tipo de archivo
            if (file.type !== 'application/pdf') {
                showNotification("Por favor seleccione un archivo PDF", "error");
                this.value = "";
                return;
            }

            // Validar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                showNotification("El archivo no debe superar los 5MB", "error");
                this.value = "";
                return;
            }

            // Actualizar UI
            fileText.textContent = file.name;
            fileLabel.classList.add('active');
            fileInfo.textContent = `Archivo seleccionado: ${file.name} (${formatFileSize(file.size)})`;
            fileInfo.classList.add('show');

            // Marcar como válido
            const formGroup = this.closest('.form-group');
            formGroup.classList.add('success');
            formGroup.classList.remove('error');
        } else {
            // Resetear UI
            fileText.textContent = "Seleccionar archivo PDF";
            fileLabel.classList.remove('active');
            fileInfo.classList.remove('show');
            
            const formGroup = this.closest('.form-group');
            formGroup.classList.remove('success');
        }

        updateProgress();
    });
}

function updateProgress() {
    let completedFields = 0;

    // Verificar campos completados
    if (doctorField.value.trim()) completedFields++;
    if (rfcField.value.trim() && /^[A-Z]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(rfcField.value)) completedFields++;
    if (descripcionField.value.trim() && descripcionField.value.length >= 10) completedFields++;
    if (direccionField.value.trim() && direccionField.value.length >= 20) completedFields++;
    if (situacionFiscalField.files.length > 0) completedFields++;
    if (emailField.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) completedFields++;

    // Actualizar barra de progreso
    const progress = (completedFields / totalFields) * 100;
    progressBar.style.width = `${progress}%`;

    // Cambiar color según progreso
    if (progress === 100) {
        progressBar.style.background = "linear-gradient(90deg, #28a745, #20c997)";
    } else if (progress >= 50) {
        progressBar.style.background = "linear-gradient(90deg, #ffc107, #fd7e14)";
    } else {
        progressBar.style.background = "linear-gradient(90deg, #00ADB5, #2C5AA0)";
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    // Validar todos los campos
    const isValidDoctor = validateField(doctorField, "doctor", true);
    const isValidRFC = validateField(rfcField, "rfc", true);
    const isValidDescripcion = validateField(descripcionField, "descripcion", true);
    const isValidDireccion = validateField(direccionField, "direccion", true);
    const isValidEmail = validateField(emailField, "email", true);
    const isValidFile = situacionFiscalField.files.length > 0;

    if (!isValidFile) {
        showNotification("Por favor seleccione la carta de situación fiscal", "error");
        const formGroup = situacionFiscalField.closest('.form-group');
        formGroup.classList.add('error');
    }

    // Verificar si todos los campos son válidos
    if (isValidDoctor && isValidRFC && isValidDescripcion && isValidDireccion && isValidEmail && isValidFile) {
        submitForm();
    } else {
        showNotification("Por favor complete todos los campos correctamente", "error");
        
        // Hacer scroll al primer campo con error
        const firstError = document.querySelector('.form-group.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function submitForm() {
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    
    // Mostrar estado de carga
    submitBtn.innerHTML = '<i class="lni lni-spinner-arrow"></i> Enviando...';
    submitBtn.disabled = true;

    // Simular envío
    setTimeout(() => {
        // Mostrar notificación de éxito
        showNotification("✅ Solicitud de factura enviada exitosamente", "success");
        
        // Mostrar información adicional
        setTimeout(() => {
            showNotification("📧 Recibirá su factura en las próximas 24-48 horas", "info");
        }, 2000);

        // Redirigir después de un momento
        setTimeout(() => {
            window.location.href = "orden-servicio.html";
        }, 4000);

    }, 3000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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