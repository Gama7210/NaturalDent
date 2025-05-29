// Variables globales
let currentStep = 1;
const totalSteps = 3;

// Elementos del DOM
const acceptTerms = document.getElementById("acceptTerms");
const orderForm = document.getElementById("orderForm");
const pagoEfectivo = document.getElementById("pagoEfectivo");
const pagoTransferencia = document.getElementById("pagoTransferencia");
const campoEfectivo = document.getElementById("campoEfectivo");
const campoTransferencia = document.getElementById("campoTransferencia");
const requiereFactura = document.getElementById("requiereFactura");
const ordenNumero = document.getElementById("ordenNumero");

// Inicialización
document.addEventListener("DOMContentLoaded", function() {
    initializeForm();
    new WOW().init();
});

function initializeForm() {
    // Mostrar formulario cuando se acepten términos
    acceptTerms.addEventListener("change", () => {
        if (acceptTerms.checked) {
            orderForm.style.display = "block";
            orderForm.classList.add("animate__animated", "animate__fadeInUp");
        } else {
            orderForm.style.display = "none";
        }
    });

    // Manejar opciones de pago
    pagoEfectivo.addEventListener("change", handlePaymentChange);
    pagoTransferencia.addEventListener("change", handlePaymentChange);

    // Validación en tiempo real
    setupRealTimeValidation();

    // Manejar envío del formulario
    orderForm.addEventListener("submit", handleFormSubmit);
}

function handlePaymentChange() {
    if (pagoEfectivo.checked) {
        showElement(campoEfectivo);
        hideElement(campoTransferencia);
    } else if (pagoTransferencia.checked) {
        showElement(campoTransferencia);
        hideElement(campoEfectivo);
    } else {
        hideElement(campoEfectivo);
        hideElement(campoTransferencia);
    }
}

function showElement(element) {
    element.style.display = "block";
    element.classList.add("show");
    element.classList.add("animate__animated", "animate__slideInDown");
}

function hideElement(element) {
    element.style.display = "none";
    element.classList.remove("show");
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            // Ocultar paso actual
            document.getElementById(`step${currentStep}`).classList.remove("active");
            
            // Mostrar siguiente paso
            currentStep++;
            document.getElementById(`step${currentStep}`).classList.add("active");
            
            // Actualizar indicador de progreso
            updateProgressIndicator();
            
            // Actualizar resumen si estamos en el último paso
            if (currentStep === 3) {
                updateOrderSummary();
            }
            
            // Animación
            document.getElementById(`step${currentStep}`).classList.add("animate__animated", "animate__fadeInRight");
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
        
        // Actualizar indicador de progreso
        updateProgressIndicator();
        
        // Animación
        document.getElementById(`step${currentStep}`).classList.add("animate__animated", "animate__fadeInLeft");
    }
}

function updateProgressIndicator() {
    // Remover clase active de todos los indicadores
    document.querySelectorAll('.step-indicator').forEach(indicator => {
        indicator.classList.remove('active');
    });
    
    // Agregar clase active al indicador actual
    document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
}

function validateCurrentStep() {
    let isValid = true;
    
    if (currentStep === 1) {
        // Validar campos requeridos del paso 1
        const ordenNumero = document.getElementById("ordenNumero");
        if (!ordenNumero.value.trim()) {
            showFieldError(ordenNumero, "El número de orden es obligatorio");
            isValid = false;
        } else {
            clearFieldError(ordenNumero);
        }
    } else if (currentStep === 2) {
        // Validar método de pago
        const metodoPago = document.querySelector('input[name="metodoPago"]:checked');
        if (!metodoPago) {
            showNotification("Por favor seleccione un método de pago", "warning");
            isValid = false;
        }
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.style.borderColor = "#dc3545";
    const feedback = field.parentNode.querySelector('.form-feedback');
    if (feedback) {
        feedback.textContent = message;
        feedback.style.color = "#dc3545";
    }
}

function clearFieldError(field) {
    field.style.borderColor = "#28a745";
    const feedback = field.parentNode.querySelector('.form-feedback');
    if (feedback) {
        feedback.textContent = "";
    }
}

function setupRealTimeValidation() {
    // Validación del número de orden
    ordenNumero.addEventListener("input", function() {
        if (this.value.trim()) {
            clearFieldError(this);
        }
    });
    
    // Validación de otros campos
    document.querySelectorAll('.form-control').forEach(field => {
        field.addEventListener("blur", function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                showFieldError(this, "Este campo es obligatorio");
            } else {
                clearFieldError(this);
            }
        });
    });
}

function updateOrderSummary() {
    const summaryContent = document.getElementById("orderSummary");
    const formData = getFormData();
    
    let summaryHTML = "";
    
    if (formData.ordenNumero) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Número de Orden:</span>
            <span class="summary-value">${formData.ordenNumero}</span>
        </div>`;
    }
    
    if (formData.nombreDoctor) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Doctor:</span>
            <span class="summary-value">${formData.nombreDoctor}</span>
        </div>`;
    }
    
    if (formData.nombrePaciente) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Paciente:</span>
            <span class="summary-value">${formData.nombrePaciente}</span>
        </div>`;
    }
    
    if (formData.trabajoRealizar) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Trabajo:</span>
            <span class="summary-value">${formData.trabajoRealizar}</span>
        </div>`;
    }
    
    if (formData.metodoPago) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Método de Pago:</span>
            <span class="summary-value">${formData.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}</span>
        </div>`;
    }
    
    summaryContent.innerHTML = summaryHTML;
}

function getFormData() {
    return {
        ordenNumero: document.getElementById("ordenNumero").value,
        nombreDoctor: document.getElementById("nombreDoctor").value,
        nombrePaciente: document.getElementById("nombrePaciente").value,
        trabajoRealizar: document.getElementById("trabajoRealizar").value,
        color: document.getElementById("color").value,
        metodoPago: document.querySelector('input[name="metodoPago"]:checked')?.value,
        montoEfectivo: document.getElementById("montoEfectivo").value,
        requiereFactura: document.getElementById("requiereFactura").checked
    };
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    const formData = getFormData();
    
    if (!formData.ordenNumero) {
        showNotification("⚠️ El número de orden es obligatorio.", "error");
        return;
    }
    
    // Mostrar loading
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="lni lni-spinner-arrow"></i> Enviando...';
    submitBtn.disabled = true;
    
    // Simular envío
    setTimeout(() => {
        if (formData.requiereFactura) {
            window.location.href = `facturacion-electronica.html?orden=${formData.ordenNumero}`;
        } else {
            showNotification("✅ Orden enviada correctamente", "success");
            resetForm();
        }
        
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function resetForm() {
    orderForm.reset();
    currentStep = 1;
    
    // Ocultar formulario
    orderForm.style.display = "none";
    acceptTerms.checked = false;
    
    // Mostrar solo el primer paso
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById('step1').classList.add('active');
    
    // Resetear indicador de progreso
    updateProgressIndicator();
    
    // Ocultar campos extra
    hideElement(campoEfectivo);
    hideElement(campoTransferencia);
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
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#00ADB5'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Botón de cerrar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
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