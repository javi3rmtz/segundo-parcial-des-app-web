<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div>
        <h2 class="fw-bold mb-0 text-white">
          <i class="bi bi-people-fill me-2" style="color: #3b82f6;"></i>
          Gestión de Clientes
        </h2>
        <p class="text-white small mt-1">Administración de clientes registrados</p>
      </div>
      <button class="btn btn-primary" @click="openModal">
        <i class="bi bi-person-plus-fill me-1"></i> Nuevo Cliente
      </button>
    </div>

    <div class="input-group mb-3" style="max-width: 400px;">
      <span class="input-group-text ts-input-addon"><i class="bi bi-search"></i></span>
      <input
        v-model="searchTerm"
        type="text"
        class="form-control ts-input"
        placeholder="Buscar cliente..."
      />
    </div>

    <div v-if="successMsg" class="alert alert-success py-2 small mb-3">
      <i class="bi bi-check-circle-fill me-1"></i> {{ successMsg }}
    </div>

    <div class="table-responsive rounded-4 overflow-hidden" style="border: 1px solid rgba(59,130,246,0.25);">
      <table class="table ts-table mb-0">
        <thead style="background:#111; color:#3b82f6;">
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th class="d-none d-md-table-cell">Email</th>
            <th class="d-none d-sm-table-cell">Teléfono</th>
            <th>Ciudad</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="text-center py-5 text-muted">
              <i class="bi bi-person-x fs-1 d-block mb-2"></i>No hay clientes.
            </td>
          </tr>
          <tr v-for="c in filtered" :key="c.id" class="ts-table-row">
            <td class="text-muted small">{{ c.id }}</td>
            <td>
              <div class="d-flex align-items-center gap-2">
                <div class="client-avatar">{{ c.nombre.charAt(0) }}</div>
                <div>
                  <div class="fw-semibold small text-dark">{{ c.nombre }}</div>
                  <div class="text-muted" style="font-size:0.7rem;">Cliente desde {{ c.fechaRegistro }}</div>
                </div>
              </div>
            </td>
            <td class="d-none d-md-table-cell text-muted small">{{ c.email }}</td>
            <td class="d-none d-sm-table-cell text-muted small">{{ c.telefono }}</td>
            <td><span class="badge bg-secondary">{{ c.ciudad }}</span></td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm ts-btn-edit" @click="editCliente(c)" title="Editar">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm ts-btn-del" @click="deleteCliente(c.id)" title="Eliminar">
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal fade" id="clienteModal" tabindex="-1" ref="modalEl">
      <div class="modal-dialog">
        <div class="modal-content ts-modal">
          <div class="modal-header border-bottom" style="border-color: rgba(59,130,246,0.3)!important;">
            <h5 class="modal-title" style="color:#3b82f6;">
              <i :class="isEditing ? 'bi-pencil-square' : 'bi-person-plus-fill'" class="bi me-2"></i>
              {{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}
            </h5>
            <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger py-2 small">{{ formError }}</div>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label text-light">Nombre completo *</label>
                <input v-model="form.nombre" type="text" class="form-control ts-input" placeholder="Nombre y apellido" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label text-light">Email *</label>
                <input v-model="form.email" type="email" class="form-control ts-input" placeholder="correo@ejemplo.com" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label text-light">Teléfono</label>
                <input v-model="form.telefono" type="tel" class="form-control ts-input" placeholder="300 000 0000" />
              </div>
              <div class="col-12">
                <label class="form-label text-light">Ciudad</label>
                <input v-model="form.ciudad" type="text" class="form-control ts-input" placeholder="Ej: Bucaramanga" />
              </div>
            </div>
          </div>
          <div class="modal-footer border-top" style="border-color: rgba(59,130,246,0.3)!important;">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary" @click="save">
              <i :class="isEditing ? 'bi-save' : 'bi-plus-lg'" class="bi me-1"></i>
              {{ isEditing ? 'Guardar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Modal } from 'bootstrap'

const CLAVE = 'techstore_clientes'

// Clientes iniciales de ejemplo
const initialClientes = [
  { id:1, nombre:'Carlos Pérez', email:'carlos@email.com', telefono:'300 111 2222', ciudad:'Bucaramanga', fechaRegistro:'2024-01-15' },
  { id:2, nombre:'María González', email:'maria@email.com', telefono:'315 222 3333', ciudad:'Bogotá', fechaRegistro:'2024-02-20' },
  { id:3, nombre:'Andrés Ruiz', email:'andres@email.com', telefono:'320 333 4444', ciudad:'Medellín', fechaRegistro:'2024-03-10' },
  { id:4, nombre:'Laura Jiménez', email:'laura@email.com', telefono:'310 444 5555', ciudad:'Cali', fechaRegistro:'2024-04-05' },
  { id:5, nombre:'Diego Torres', email:'diego@email.com', telefono:'318 555 6666', ciudad:'Barranquilla', fechaRegistro:'2024-05-18' },
]

function initClientes() {
  if (!localStorage.getItem(CLAVE)) {
    localStorage.setItem(CLAVE, JSON.stringify(initialClientes))
  }
}

function loadClientes() {
  initClientes()
  return JSON.parse(localStorage.getItem(CLAVE))
}

function saveClientes(list) {
  localStorage.setItem(CLAVE, JSON.stringify(list))
}

// ─── Estado ────────────────────────────────────────────────────────
const clientes = ref([])
const searchTerm = ref('')
const isEditing = ref(false)
const form = ref(emptyForm())
const formError = ref('')
const successMsg = ref('')
const modalEl = ref(null)
let modalInstance = null

function emptyForm() {
  return { nombre: '', email: '', telefono: '', ciudad: '' }
}

onMounted(() => {
  clientes.value = loadClientes()
  modalInstance = new Modal(modalEl.value)
})

const filtered = computed(() => {
  if (!searchTerm.value) return clientes.value
  const q = searchTerm.value.toLowerCase()
  return clientes.value.filter(c =>
    c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.ciudad.toLowerCase().includes(q)
  )
})

function openModal() {
  isEditing.value = false
  form.value = emptyForm()
  formError.value = ''
  modalInstance.show()
}

function editCliente(c) {
  isEditing.value = true
  form.value = { ...c }
  formError.value = ''
  modalInstance.show()
}

function deleteCliente(id) {
  if (confirm('¿Eliminar este cliente?')) {
    const list = clientes.value.filter(c => c.id !== id)
    saveClientes(list)
    clientes.value = list
    flash('Cliente eliminado.')
  }
}

function save() {
  formError.value = ''
  if (!form.value.nombre || !form.value.email) {
    formError.value = 'Nombre y email son obligatorios.'
    return
  }
  const list = [...clientes.value]
  if (isEditing.value) {
    const i = list.findIndex(c => c.id === form.value.id)
    list[i] = { ...form.value }
    flash('Cliente actualizado.')
  } else {
    const newId = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 1
    list.push({ ...form.value, id: newId, fechaRegistro: new Date().toISOString().slice(0,10) })
    flash('Cliente creado.')
  }
  saveClientes(list)
  clientes.value = list
  modalInstance.hide()
}

function flash(msg) {
  successMsg.value = msg
  setTimeout(() => successMsg.value = '', 3000)
}
</script>

<style scoped>
.ts-table { background: #1a1a1a; color: #fff; }
.ts-table th, .ts-table td { border-color: rgba(59,130,246,0.1) !important; vertical-align: middle; }
.ts-table-row:hover { background: rgba(59,130,246,0.05) !important; }
.client-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(59,130,246,0.2); border: 1px solid rgba(59,130,246,0.4);
  color: #3b82f6; font-weight: bold; display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem;
}
.ts-modal { background: #1a1a1a; color: #fff; border: 1px solid rgba(59,130,246,0.25); }
.ts-input { background: #111 !important; border-color: rgba(59,130,246,0.2) !important; color: #fff !important; }
.ts-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 0.2rem rgba(59,130,246,0.15) !important; }
.ts-input::placeholder { color: #555 !important; }
.ts-input-addon { background: #111 !important; border-color: rgba(59,130,246,0.2) !important; color: #3b82f6 !important; }
.ts-btn-edit { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); color: #3b82f6; }
.ts-btn-edit:hover { background: rgba(59,130,246,0.2); }
.ts-btn-del { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; }
.ts-btn-del:hover { background: rgba(239,68,68,0.2); }
</style>