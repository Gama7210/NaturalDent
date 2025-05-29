// Modificar devolucion.js para usar Supabase

// Declarar las variables que faltan
const doctorNameField = document.getElementById("doctorName")
const patientNameField = document.getElementById("patientName")
const orderNumberField = document.getElementById("orderNumber")
const returnReasonField = document.getElementById("returnReason")
const returnTypeField = document.getElementById("returnType")
const urgencyField = document.getElementById("urgency")
const preferredSolutionField = document.getElementById("preferredSolution")
const additionalNotesField = document.getElementById("additionalNotes")
const orderDateField = document.getElementById("orderDate")
const fileUploadArea = document.getElementById("fileUploadArea")
const selectedFiles = [] // Asegúrate de que selectedFiles esté definido

// Función de validación (asumiendo que está definida en otro archivo o aquí mismo)
function validateField(field, fieldName, required) {
  if (required && !field.value.trim()) {
    return false
  }
  return true
}

// Mock functions to resolve errors.  These should be defined elsewhere.
function showNotification(message, type) {
  console.log(`${type}: ${message}`)
}

// Mock db object.  This should be defined elsewhere.
const db = {
  guardarDevolucion: async (datosDevolucion, selectedFiles) => {
    console.log("Mock db.guardarDevolucion called")
    return { success: true }
  },
}

function resetForm() {
  console.log("Mock resetForm called")
}

// Modificar la función handleFormSubmit
async function handleFormSubmit(e) {
  e.preventDefault()

  // Validar todos los campos
  const isValidDoctor = validateField(doctorNameField, "doctorName", true)
  const isValidPatient = validateField(patientNameField, "patientName", true)
  const isValidOrder = validateField(orderNumberField, "orderNumber", true)
  const isValidReason = validateField(returnReasonField, "returnReason", true)
  const isValidType = validateField(returnTypeField, "returnType", true)
  const isValidImages = selectedFiles.length > 0

  if (!isValidImages) {
    showNotification("Debe adjuntar al menos una imagen", "error")
    fileUploadArea.scrollIntoView({ behavior: "smooth", block: "center" })
    return
  }

  if (!(isValidDoctor && isValidPatient && isValidOrder && isValidReason && isValidType)) {
    showNotification("Por favor complete todos los campos obligatorios", "error")
    return
  }

  const submitBtn = document.querySelector(".btn-submit")
  const originalText = submitBtn.innerHTML

  // Mostrar estado de carga
  submitBtn.innerHTML = '<i class="lni lni-spinner-arrow"></i> Enviando solicitud...'
  submitBtn.disabled = true

  // Recopilar datos
  const datosDevolucion = {
    numeroOrden: orderNumberField.value,
    doctorNombre: doctorNameField.value,
    pacienteNombre: patientNameField.value,
    fechaOrden: orderDateField.value,
    motivoDevolucion: returnReasonField.value,
    tipoProblema: returnTypeField.value,
    urgencia: urgencyField.value,
    solucionPreferida: preferredSolutionField.value,
    notasAdicionales: additionalNotesField.value,
  }

  try {
    // Guardar en Supabase con imágenes
    const resultado = await db.guardarDevolucion(datosDevolucion, selectedFiles)

    if (resultado.success) {
      showNotification("✅ Solicitud de devolución enviada exitosamente", "success")
      showNotification("📧 Recibirá una respuesta en las próximas 24-48 horas", "info")

      // Resetear formulario después de 4 segundos
      setTimeout(() => {
        resetForm()
        submitBtn.innerHTML = originalText
        submitBtn.disabled = false
      }, 4000)
    } else {
      throw new Error(resultado.error)
    }
  } catch (error) {
    console.error("Error:", error)
    showNotification("❌ Error al enviar solicitud. Intente nuevamente.", "error")
    submitBtn.innerHTML = originalText
    submitBtn.disabled = false
  }
}
