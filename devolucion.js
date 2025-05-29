// Variables globales
let selectedFiles = [];
let formProgress = 0;
const maxFiles = 5;
const maxFileSize = 5 * 1024 * 1024; // 5MB
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

// Elementos del DOM
const returnForm = document.getElementById("returnForm");
const progressBar = document.getElementById("progressBar");
const fileInput = document.getElementById("images");
const fileUploadArea = document.getElementById("fileUploadArea");
const imagePreview = document.getElementById("imagePreview");
const previewGrid = document.getElementById("previewGrid");

// Campos del formulario
const doctorNameField = document.getElementById("doctorName");
const patientNameField = document.getElementById("patientName");
const orderNumberField = document.getElementById("orderNumber");
const orderDateField = document.getElementById("orderDate");
const returnReasonField = document.getElementById("returnReason");
const returnTypeField = document.getElementById("returnType");
const urgencyField = document.getElementById("urgency");
const preferredSolutionField = document.getElementById("preferredSolution");
const additionalNotesField = document.getElementById("additionalNotes");

// Inicialización
document.addEventListener("DOMContentLoaded", function() {
    initializeForm();
    new WOW().init();
});

function initializeForm() {
    // Configurar validación en tiempo real
    setupRealTimeValidation();

    // Configurar drag & drop para archivos
    setupFileUpload();

    // Manejar envío del formulario
    returnForm.addEventListener("submit", handleFormSubmit);

    // Actualizar barra de progreso inicial
    updateProgress();
}

function setupRealTimeValidation() {
    // Validación del nombre del doctor
    doctorNameField.addEventListener("input", function() {
        validateField(this, "doctorName");
        updateProgress();
    });

    doctorNameField.addEventListener("blur", function() {
        validateField(this, "doctorName", true);
    });

    // Validación del nombre del paciente
    patientNameField.addEventListener("input", function() {
        validateField(this, "patientName");
        updateProgress();
    });

    patientNameField.addEventListener("blur", function() {
        validateField(this, "patientName", true);
    });

    // Validación del número de orden
    orderNumberField.addEventListener("input", function() {
        // Formatear número de orden
        let value = this.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        this.value = value;
        validateField(this, "orderNumber");
        updateProgress();
    });

    orderNumberField.addEventListener("blur", function() {
        validateField(this, "orderNumber", true);
    });

    // Validación del motivo
    returnReasonField.addEventListener("input", function() {
        validateField(this, "returnReason");
        updateProgress();
    });

    returnReasonField.addEventListener("blur", function() {
        validateField(this, "returnReason", true);
    });

    // Validación del tipo de problema
    returnTypeField.addEventListener("change", function() {
        validateField(this, "returnType", true);
        updateProgress();
    });
}

function setupFileUpload() {
    // Click en el área de upload
    fileUploadArea.addEventListener("click", function() {
        fileInput.click();
    });

    // Cambio en el input de archivos
    fileInput.addEventListener("change", function(e) {
        handleFileSelection(e.target.files);
    });

    // Drag & Drop
    fileUploadArea.addEventListener("dragover", function(e) {
        e.preventDefault();
        this.classList.add("dragover");
    });

    fileUploadArea.addEventListener("dragleave", function(e) {
        e.preventDefault();
        this.classList.remove("dragover");
    });

    fileUploadArea.addEventListener("drop", function(e) {
        e.preventDefault();
        this.classList.remove("dragover");
        handleFileSelection(e.dataTransfer.files);
    });
}

function handleFileSelection(files) {
    const fileArray = Array.from(files);
    
    // Validar número máximo de archivos
    if (selectedFiles.length + fileArray.length > maxFiles) {
        showNotification(`Máximo ${maxFiles} imágenes permitidas`, "warning");
        return;
    }

    // Procesar cada archivo
    fileArray.forEach(file => {
        if (validateFile(file)) {
            selectedFiles.push(file);
            addImagePreview(file);
        }
    });

    // Actualizar UI
    updateFileUploadArea();
    updateProgress();
    
    // Limpiar input para permitir seleccionar los mismos archivos
    fileInput.value = '';
}

function validateFile(file) {
    // Validar tipo de archivo
    if (!allowedTypes.includes(file.type)) {
        showNotification(`Formato no válido: ${file.name}. Use JPG, PNG o GIF`, "error");
        return false;
    }

    // Validar tamaño
    if (file.size > maxFileSize) {
        showNotification(`Archivo muy grande: ${file.name}. Máximo 5MB`, "error");
        return false;
    }

    // Validar si ya existe
    if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        showNotification(`Archivo ya seleccionado: ${file.name}`, "warning");
        return false;
    }

    return true;
}

function addImagePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
            <img src="${e.target.result}" alt="${file.name}" class="preview-image" />
            <button type="button" class="remove-image" onclick="removeImage('${file.name}', ${file.size})">
                <i class="lni lni-close"></i>
            </button>
            <div class="image-info">
                ${formatFileSize(file.size)}
            </div>
        `;
        
        previewGrid.appendChild(previewItem);
        
        // Mostrar el contenedor de preview
        imagePreview.style.display = 'block';
    };
    
    reader.readAsDataURL(file);
}

function removeImage(fileName, fileSize) {
    // Remover del array
    selectedFiles = selectedFiles.filter(file => 
        !(file.name === fileName && file.size === fileSize)
    );
    
    // Remover del DOM
    const previewItems = previewGrid.children;
    for (let i = 0; i < previewItems.length; i++) {
        const img = previewItems[i].querySelector('img');
        if (img && img.alt === fileName) {
            previewItems[i].remove();
            break;
        }
    }
    
    // Ocultar preview si no hay imágenes
    if (selectedFiles.length === 0) {
        imagePreview.style.display = 'none';
    }
    
    // Actualizar UI
    updateFileUploadArea();
    updateProgress();
}

function updateFileUploadArea() {
    if (selectedFiles.length > 0) {
        fileUploadArea.classList.add('has-files');
        const placeholder = fileUploadArea.querySelector('.upload-placeholder h6');
        placeholder.textContent = `${selectedFiles.length} imagen(es) seleccionada(s)`;
    } else {
        fileUploadArea.classList.remove('has-files');
        const placeholder = fileUploadArea.querySelector('.upload-placeholder h6');
        placeholder.textContent = 'Arrastra las imágenes aquí';
    }
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

        case "patientName":
            if (!value) {
                isValid = false;
                message = "El nombre del paciente es obligatorio";
            } else if (value.length < 3) {
                isValid = false;
                message = "Debe tener al menos 3 caracteres";
            }
            break;

        case "orderNumber":
            if (!value) {
                isValid = false;
                message = "El número de orden es obligatorio";
            } else if (value.length < 5) {
                isValid = false;
                message = "Número de orden muy corto";
            }
            break;

        case "returnReason":
            if (!value) {
                isValid = false;
                message = "El motivo de devolución es obligatorio";
            } else if (value.length < 20) {
                isValid = false;
                message = "Describa el problema con más detalle (mínimo 20 caracteres)";
            }
            break;

        case "returnType":
            if (!value) {
                isValid = false;
                message = "Seleccione el tipo de problema";
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

function updateProgress() {
    let completedFields = 0;
    const totalFields = 6; // Total de campos requeridos

    // Verificar campos completados
    if (doctorNameField.value.trim() && doctorNameField.value.length >= 3) completedFields++;
    if (patientNameField.value.trim() && patientNameField.value.length >= 3) completedFields++;
    if (orderNumberField.value.trim() && orderNumberField.value.length >= 5) completedFields++;
    if (returnReasonField.value.trim() && returnReasonField.value.length >= 20) completedFields++;
    if (returnTypeField.value) completedFields++;
    if (selectedFiles.length > 0) completedFields++;

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

    // Actualizar resumen
    updateSummary();
}

function updateSummary() {
    const summaryContent = document.getElementById("summaryContent");
    
    let summaryHTML = "";
    
    // Información básica
    if (doctorNameField.value.trim()) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Doctor:</span>
            <span class="summary-value">${doctorNameField.value}</span>
        </div>`;
    }
    
    if (patientNameField.value.trim()) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Paciente:</span>
            <span class="summary-value">${patientNameField.value}</span>
        </div>`;
    }
    
    if (orderNumberField.value.trim()) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Número de Orden:</span>
            <span class="summary-value">${orderNumberField.value}</span>
        </div>`;
    }
    
    // Tipo de problema
    if (returnTypeField.value) {
        const typeText = returnTypeField.options[returnTypeField.selectedIndex].text;
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Tipo de Problema:</span>
            <span class="summary-value">${typeText}</span>
        </div>`;
    }
    
    // Urgencia
    if (urgencyField.value) {
        const urgencyText = urgencyField.options[urgencyField.selectedIndex].text;
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Urgencia:</span>
            <span class="summary-value">${urgencyText}</span>
        </div>`;
    }
    
    // Imágenes
    if (selectedFiles.length > 0) {
        summaryHTML += `<div class="summary-item">
            <span class="summary-label">Imágenes:</span>
            <span class="summary-value">${selectedFiles.length} archivo(s)</span>
        </div>`;
    }
    
    summaryContent.innerHTML = summaryHTML;
}

function handleFormSubmit(e) {
    e.preventDefault();

    // Validar todos los campos
    const isValidDoctor = validateField(doctorNameField, "doctorName", true);
    const isValidPatient = validateField(patientNameField, "patientName", true);
    const isValidOrder = validateField(orderNumberField, "orderNumber", true);
    const isValidReason = validateField(returnReasonField, "returnReason", true);
    const isValidType = validateField(returnTypeField, "returnType", true);
    const isValidImages = selectedFiles.length > 0;

    if (!isValidImages) {
        showNotification("Debe adjuntar al menos una imagen", "error");
        fileUploadArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Verificar si todos los campos son válidos
    if (isValidDoctor && isValidPatient && isValidOrder && isValidReason && isValidType && isValidImages) {
        submitForm();
    } else {
        showNotification("Por favor complete todos los campos obligatorios", "error");
        
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
    submitBtn.innerHTML = '<i class="lni lni-spinner-arrow"></i> Enviando solicitud...';
    submitBtn.disabled = true;

    // Simular envío con FormData (en un proyecto real, aquí enviarías los archivos)
    const formData = new FormData();
    formData.append('doctorName', doctorNameField.value);
    formData.append('patientName', patientNameField.value);
    formData.append('orderNumber', orderNumberField.value);
    formData.append('orderDate', orderDateField.value);
    formData.append('returnReason', returnReasonField.value);
    formData.append('returnType', returnTypeField.value);
    formData.append('urgency', urgencyField.value);
    formData.append('preferredSolution', preferredSolutionField.value);
    formData.append('additionalNotes', additionalNotesField.value);
    
    // Agregar imágenes
    selectedFiles.forEach((file, index) => {
        formData.append(`image_${index}`, file);
    });

    // Simular envío
    setTimeout(() => {
        showNotification("✅ Solicitud de devolución enviada exitosamente", "success");
        
        setTimeout(() => {
            showNotification("📧 Recibirá una respuesta en las próximas 24-48 horas", "info");
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
    returnForm.reset();
    selectedFiles = [];

    // Limpiar preview de imágenes
    previewGrid.innerHTML = '';
    imagePreview.style.display = 'none';

    // Resetear área de upload
    fileUploadArea.classList.remove('has-files');
    const placeholder = fileUploadArea.querySelector('.upload-placeholder h6');
    placeholder.textContent = 'Arrastra las imágenes aquí';

    // Resetear validaciones
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('success', 'error');
    });

    document.querySelectorAll('.form-feedback').forEach(feedback => {
        feedback.classList.remove('show');
    });

    // Actualizar barra de progreso
    updateProgress();
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