// Panel Administrativo
const currentData = {
  ordenes: [],
  recolecciones: [],
  devoluciones: [],
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  cargarDashboard()
  cargarOrdenes()
  cargarRecolecciones()
  cargarDevoluciones()
})

// Navegación entre secciones
function showSection(sectionId) {
  // Ocultar todas las secciones
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active")
  })

  // Remover clase active de todos los links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active")
  })

  // Mostrar sección seleccionada
  document.getElementById(sectionId).classList.add("active")

  // Activar link correspondiente
  document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add("active")
}

//Simulacion de la base de datos
const db = {
  obtenerOrdenes: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              id: 1,
              numero_orden: "ORD-001",
              doctor_nombre: "Dr. Smith",
              paciente_nombre: "John Doe",
              tipo_trabajo: "Corona",
              estado: "En Proceso",
              fecha_creacion: new Date(),
              fecha_entrega: new Date(),
              precio_estimado: 120,
              notas: "urgente",
              doctor_telefono: "555-1234",
              doctor_email: "dr.smith@example.com",
              paciente_edad: 30,
              material: "Zirconio",
              color: "A2",
            },
            {
              id: 2,
              numero_orden: "ORD-002",
              doctor_nombre: "Dr. Jones",
              paciente_nombre: "Jane Doe",
              tipo_trabajo: "Puente",
              estado: "Completada",
              fecha_creacion: new Date(),
              fecha_entrega: new Date(),
              precio_estimado: 250,
              notas: "",
              doctor_telefono: "555-5678",
              doctor_email: "dr.jones@example.com",
              paciente_edad: 45,
              material: "Porcelana",
              color: "B1",
            },
          ],
        })
      }, 500)
    })
  },
  obtenerRecolecciones: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              id: 1,
              doctor_nombre: "Dr. Smith",
              clinica_nombre: "Clínica A",
              telefono: "555-1111",
              direccion_manual: "Calle Falsa 123",
              fecha_recoleccion: new Date(),
              hora_recoleccion: "10:00",
              estado: "Pendiente",
              ubicacion_lat: 40.7128,
              ubicacion_lng: -74.006,
            },
            {
              id: 2,
              doctor_nombre: "Dr. Brown",
              clinica_nombre: "Clínica B",
              telefono: "555-2222",
              direccion_manual: "Avenida Siempreviva 742",
              fecha_recoleccion: new Date(),
              hora_recoleccion: "14:00",
              estado: "En Curso",
              ubicacion_lat: 34.0522,
              ubicacion_lng: -118.2437,
            },
          ],
        })
      }, 500)
    })
  },
  obtenerDevoluciones: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              id: 1,
              numero_orden: "ORD-001",
              doctor_nombre: "Dr. Smith",
              tipo_problema: "Color incorrecto",
              urgencia: "Alta",
              estado: "En Revisión",
              fecha_solicitud: new Date(),
              motivo_devolucion: "El color no coincide con la muestra",
              imagenes_urls: ["url1.jpg", "url2.jpg"],
            },
            {
              id: 2,
              numero_orden: "ORD-003",
              doctor_nombre: "Dr. Jones",
              tipo_problema: "Ajuste incorrecto",
              urgencia: "Media",
              estado: "Aprobada",
              fecha_solicitud: new Date(),
              motivo_devolucion: "La pieza no se ajusta correctamente",
              imagenes_urls: ["url3.jpg", "url4.jpg"],
            },
          ],
        })
      }, 500)
    })
  },
}

// Cargar dashboard
async function cargarDashboard() {
  try {
    const [ordenes, recolecciones, devoluciones] = await Promise.all([
      db.obtenerOrdenes(),
      db.obtenerRecolecciones(),
      db.obtenerDevoluciones(),
    ])

    // Actualizar estadísticas
    document.getElementById("totalOrdenes").textContent = ordenes.data?.length || 0
    document.getElementById("totalRecolecciones").textContent = recolecciones.data?.length || 0
    document.getElementById("totalDevoluciones").textContent = devoluciones.data?.length || 0

    // Calcular ingresos del mes
    const ingresosMes = calcularIngresosMes(ordenes.data || [])
    document.getElementById("ingresosMes").textContent = `$${ingresosMes.toLocaleString()}`
  } catch (error) {
    console.error("Error al cargar dashboard:", error)
  }
}

// Cargar órdenes
async function cargarOrdenes() {
  const tbody = document.getElementById("ordenesTableBody")
  tbody.innerHTML = '<tr><td colspan="7" class="loading"><i class="lni lni-spinner-arrow"></i> Cargando...</td></tr>'

  try {
    const resultado = await db.obtenerOrdenes()

    if (resultado.success) {
      currentData.ordenes = resultado.data
      mostrarOrdenes(resultado.data)
    } else {
      tbody.innerHTML = '<tr><td colspan="7">Error al cargar órdenes</td></tr>'
    }
  } catch (error) {
    console.error("Error:", error)
    tbody.innerHTML = '<tr><td colspan="7">Error al cargar órdenes</td></tr>'
  }
}

// Mostrar órdenes en tabla
function mostrarOrdenes(ordenes) {
  const tbody = document.getElementById("ordenesTableBody")

  if (ordenes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay órdenes registradas</td></tr>'
    return
  }

  tbody.innerHTML = ordenes
    .map(
      (orden) => `
        <tr>
            <td><strong>${orden.numero_orden}</strong></td>
            <td>${orden.doctor_nombre}</td>
            <td>${orden.paciente_nombre}</td>
            <td>${orden.tipo_trabajo}</td>
            <td><span class="status-badge status-${orden.estado.toLowerCase().replace(" ", "")}">${orden.estado}</span></td>
            <td>${new Date(orden.fecha_creacion).toLocaleDateString()}</td>
            <td>
                <button class="btn-action btn-view" onclick="verDetallesOrden(${orden.id})">
                    <i class="lni lni-eye"></i>
                </button>
                <button class="btn-action btn-edit" onclick="editarEstado(${orden.id}, 'orden')">
                    <i class="lni lni-pencil"></i>
                </button>
            </td>
        </tr>
    `,
    )
    .join("")
}

// Cargar recolecciones
async function cargarRecolecciones() {
  const tbody = document.getElementById("recoleccionesTableBody")
  tbody.innerHTML = '<tr><td colspan="6" class="loading"><i class="lni lni-spinner-arrow"></i> Cargando...</td></tr>'

  try {
    const resultado = await db.obtenerRecolecciones()

    if (resultado.success) {
      currentData.recolecciones = resultado.data
      mostrarRecolecciones(resultado.data)
    } else {
      tbody.innerHTML = '<tr><td colspan="6">Error al cargar recolecciones</td></tr>'
    }
  } catch (error) {
    console.error("Error:", error)
    tbody.innerHTML = '<tr><td colspan="6">Error al cargar recolecciones</td></tr>'
  }
}

// Mostrar recolecciones en tabla
function mostrarRecolecciones(recolecciones) {
  const tbody = document.getElementById("recoleccionesTableBody")

  if (recolecciones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay recolecciones programadas</td></tr>'
    return
  }

  tbody.innerHTML = recolecciones
    .map(
      (recoleccion) => `
        <tr>
            <td><strong>${recoleccion.doctor_nombre}</strong><br><small>${recoleccion.clinica_nombre || ""}</small></td>
            <td>${recoleccion.telefono}</td>
            <td>${recoleccion.direccion_manual || "Ubicación GPS"}</td>
            <td>${new Date(recoleccion.fecha_recoleccion).toLocaleDateString()}<br><small>${recoleccion.hora_recoleccion}</small></td>
            <td><span class="status-badge status-${recoleccion.estado.toLowerCase().replace(" ", "")}">${recoleccion.estado}</span></td>
            <td>
                <button class="btn-action btn-view" onclick="verDetallesRecoleccion(${recoleccion.id})">
                    <i class="lni lni-eye"></i>
                </button>
                ${recoleccion.ubicacion_lat ? `<button class="btn-action btn-edit" onclick="verEnMapa(${recoleccion.ubicacion_lat}, ${recoleccion.ubicacion_lng})"><i class="lni lni-map"></i></button>` : ""}
            </td>
        </tr>
    `,
    )
    .join("")
}

// Cargar devoluciones
async function cargarDevoluciones() {
  const tbody = document.getElementById("devolucionesTableBody")
  tbody.innerHTML = '<tr><td colspan="7" class="loading"><i class="lni lni-spinner-arrow"></i> Cargando...</td></tr>'

  try {
    const resultado = await db.obtenerDevoluciones()

    if (resultado.success) {
      currentData.devoluciones = resultado.data
      mostrarDevoluciones(resultado.data)
    } else {
      tbody.innerHTML = '<tr><td colspan="7">Error al cargar devoluciones</td></tr>'
    }
  } catch (error) {
    console.error("Error:", error)
    tbody.innerHTML = '<tr><td colspan="7">Error al cargar devoluciones</td></tr>'
  }
}

// Mostrar devoluciones en tabla
function mostrarDevoluciones(devoluciones) {
  const tbody = document.getElementById("devolucionesTableBody")

  if (devoluciones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay devoluciones registradas</td></tr>'
    return
  }

  tbody.innerHTML = devoluciones
    .map(
      (devolucion) => `
        <tr>
            <td><strong>${devolucion.numero_orden}</strong></td>
            <td>${devolucion.doctor_nombre}</td>
            <td>${devolucion.tipo_problema}</td>
            <td><span class="status-badge status-${devolucion.urgencia.toLowerCase()}">${devolucion.urgencia}</span></td>
            <td><span class="status-badge status-${devolucion.estado.toLowerCase().replace(" ", "")}">${devolucion.estado}</span></td>
            <td>${new Date(devolucion.fecha_solicitud).toLocaleDateString()}</td>
            <td>
                <button class="btn-action btn-view" onclick="verDetallesDevolucion(${devolucion.id})">
                    <i class="lni lni-eye"></i>
                </button>
                <button class="btn-action btn-edit" onclick="verImagenes(${devolucion.id})">
                    <i class="lni lni-image"></i>
                </button>
            </td>
        </tr>
    `,
    )
    .join("")
}

// Ver detalles de orden
function verDetallesOrden(id) {
  const orden = currentData.ordenes.find((o) => o.id === id)
  if (!orden) return

  const modalBody = document.getElementById("modalBody")
  modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <strong>Número de Orden:</strong>
                <span>${orden.numero_orden}</span>
            </div>
            <div class="detail-item">
                <strong>Doctor:</strong>
                <span>${orden.doctor_nombre}</span>
            </div>
            <div class="detail-item">
                <strong>Teléfono:</strong>
                <span>${orden.doctor_telefono}</span>
            </div>
            <div class="detail-item">
                <strong>Email:</strong>
                <span>${orden.doctor_email}</span>
            </div>
            <div class="detail-item">
                <strong>Paciente:</strong>
                <span>${orden.paciente_nombre} (${orden.paciente_edad} años)</span>
            </div>
            <div class="detail-item">
                <strong>Tipo de Trabajo:</strong>
                <span>${orden.tipo_trabajo}</span>
            </div>
            <div class="detail-item">
                <strong>Material:</strong>
                <span>${orden.material}</span>
            </div>
            <div class="detail-item">
                <strong>Color:</strong>
                <span>${orden.color}</span>
            </div>
            <div class="detail-item">
                <strong>Fecha de Entrega:</strong>
                <span>${new Date(orden.fecha_entrega).toLocaleDateString()}</span>
            </div>
            <div class="detail-item">
                <strong>Precio Estimado:</strong>
                <span>$${orden.precio_estimado?.toLocaleString()}</span>
            </div>
            <div class="detail-item full-width">
                <strong>Notas:</strong>
                <span>${orden.notas || "Sin notas adicionales"}</span>
            </div>
        </div>
    `

  document.getElementById("modalTitle").textContent = `Detalles de Orden - ${orden.numero_orden}`
  document.getElementById("detailModal").style.display = "block"
}

// Ver imágenes de devolución
function verImagenes(id) {
  const devolucion = currentData.devoluciones.find((d) => d.id === id)
  if (!devolucion || !devolucion.imagenes_urls) return

  const modalBody = document.getElementById("modalBody")
  modalBody.innerHTML = `
        <div class="image-gallery">
            ${devolucion.imagenes_urls
              .map(
                (url) => `
                <img src="${url}" alt="Imagen de devolución" class="gallery-image" onclick="window.open('${url}', '_blank')">
            `,
              )
              .join("")}
        </div>
        <div style="margin-top: 20px;">
            <strong>Motivo:</strong>
            <p>${devolucion.motivo_devolucion}</p>
        </div>
    `

  document.getElementById("modalTitle").textContent = `Imágenes - Orden ${devolucion.numero_orden}`
  document.getElementById("detailModal").style.display = "block"
}

// Ver en mapa
function verEnMapa(lat, lng) {
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank")
}

// Cerrar modal
function closeModal() {
  document.getElementById("detailModal").style.display = "none"
}

// Calcular ingresos del mes
function calcularIngresosMes(ordenes) {
  const fechaActual = new Date()
  const mesActual = fechaActual.getMonth()
  const añoActual = fechaActual.getFullYear()

  return ordenes
    .filter((orden) => {
      const fechaOrden = new Date(orden.fecha_creacion)
      return fechaOrden.getMonth() === mesActual && fechaOrden.getFullYear() === añoActual
    })
    .reduce((total, orden) => total + (orden.precio_estimado || 0), 0)
}

// Cerrar modal al hacer clic fuera
window.onclick = (event) => {
  const modal = document.getElementById("detailModal")
  if (event.target === modal) {
    modal.style.display = "none"
  }
}
