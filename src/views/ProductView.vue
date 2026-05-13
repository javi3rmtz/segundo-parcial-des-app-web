<template>
  <div>
    <!-- Encabezado de la vista -->
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div>
       <h2 class="fw-bold mb-0 text-white">
       <i class="bi bi-box-seam-fill me-2" style="color: var(--ts-gold);"></i>
         Gestión de Productos
          </h2>
       <p class="text-white small mt-1">CRUD simulado con datos en LocalStorage</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="resetToDefault" title="Restaurar datos iniciales">
          <i class="bi bi-arrow-counterclockwise me-1"></i> Restaurar
        </button>
        <button class="btn btn-gold" @click="openCreateModal">
          <i class="bi bi-plus-lg me-1"></i> Nuevo Producto
        </button>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="row g-2 mb-3">
      <div class="col-12 col-md-5">
        <div class="input-group">
          <span class="input-group-text ts-input-addon"><i class="bi bi-search"></i></span>
          <input
            v-model="searchTerm"
            type="text"
            class="form-control ts-input"
            placeholder="Buscar por nombre o categoría..."
          />
        </div>
      </div>
      <div class="col-12 col-md-3">
        <select v-model="filterCategory" class="form-select ts-input">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <div class="col-12 col-md-4 text-md-end">
  <span class="text-white small">
    Mostrando <strong style="color: var(--ts-gold);">{{ filteredProducts.length }}</strong>
    de {{ products.length }} productos
  </span>
</div>
    </div>

    <!-- Alerta de éxito -->
    <div v-if="successMsg" class="alert alert-success d-flex align-items-center gap-2 py-2" role="alert">
      <i class="bi bi-check-circle-fill"></i> {{ successMsg }}
    </div>

    <!-- Tabla de productos -->
    <div class="table-responsive rounded-4 overflow-hidden" style="border: 1px solid rgba(255,215,0,0.2);">
      <table class="table ts-table mb-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th class="d-none d-md-table-cell">Categoría</th>
            <th>Precio</th>
            <th class="d-none d-sm-table-cell">Stock</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredProducts.length === 0">
            <td colspan="6" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              No se encontraron productos.
            </td>
          </tr>
          <tr
            v-for="product in filteredProducts"
            :key="product.id"
            class="ts-table-row"
          >
            <td class="text-muted small">{{ product.id }}</td>
            <td>
              <div class="d-flex align-items-center gap-2">
                <img
                  :src="product.imagen"
                  :alt="product.nombre"
                  class="product-thumb rounded-2"
                  @error="e => e.target.src='https://placehold.co/40x40/111/FFD700?text=TS'"
                />
                <div>
                  <div class="fw-semibold small" style="color: #000;">{{ product.nombre }}</div>
                  <div class="text-muted" style="font-size: 0.72rem;">{{ truncate(product.descripcion, 50) }}</div>
                </div>
              </div>
            </td>
            <td class="d-none d-md-table-cell">
              <span class="badge ts-badge-cat">{{ product.categoria }}</span>
            </td>
            <td style="color: var(--ts-gold);" class="fw-semibold">{{ formatPrice(product.precio) }}</td>
            <td class="d-none d-sm-table-cell">
              <span
                class="badge"
                :class="product.stock < 5 ? 'bg-danger' : product.stock < 10 ? 'bg-warning text-dark' : 'bg-success'"
              >
                {{ product.stock }}
              </span>
            </td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <!-- Ver detalles -->
                <button
                  class="btn btn-sm ts-btn-icon"
                  @click="openDetailModal(product)"
                  title="Ver detalles"
                >
                  <i class="bi bi-eye"></i>
                </button>
                <!-- Editar -->
                <button
                  class="btn btn-sm ts-btn-edit"
                  @click="openEditModal(product)"
                  title="Editar"
                >
                  <i class="bi bi-pencil-square"></i>
                </button>
                <!-- Eliminar -->
                <button
                  class="btn btn-sm ts-btn-del"
                  @click="confirmDelete(product)"
                  title="Eliminar"
                >
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ======================= MODAL CREAR / EDITAR ======================= -->
    <div class="modal fade" id="productModal" tabindex="-1" ref="productModalEl">
      <div class="modal-dialog modal-lg">
        <div class="modal-content ts-modal">
          <div class="modal-header border-bottom" style="border-color: rgba(255,215,0,0.2) !important;">
            <h5 class="modal-title">
              <i :class="isEditing ? 'bi-pencil-square' : 'bi-plus-circle'" class="bi me-2" style="color:var(--ts-gold);"></i>
              {{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <!-- Validación -->
            <div v-if="formError" class="alert alert-danger py-2 small">
              <i class="bi bi-exclamation-triangle me-1"></i> {{ formError }}
            </div>

            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label text-light">Nombre *</label>
                <input v-model="form.nombre" type="text" class="form-control ts-input" placeholder="Nombre del producto" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label text-light">Categoría *</label>
                <input v-model="form.categoria" type="text" class="form-control ts-input" placeholder="Ej: Computadores" list="cat-list" />
                <datalist id="cat-list">
                  <option v-for="cat in categories" :key="cat" :value="cat" />
                </datalist>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label text-light">Precio (COP) *</label>
                <input v-model.number="form.precio" type="number" min="0" class="form-control ts-input" placeholder="Ej: 1500000" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label text-light">Stock *</label>
                <input v-model.number="form.stock" type="number" min="0" class="form-control ts-input" placeholder="Unidades disponibles" />
              </div>
              <div class="col-12">
                <label class="form-label text-light">Descripción *</label>
                <textarea v-model="form.descripcion" class="form-control ts-input" rows="2" placeholder="Descripción del producto"></textarea>
              </div>
              <div class="col-12">
                <label class="form-label text-light">URL de imagen</label>
                <input v-model="form.imagen" type="url" class="form-control ts-input" placeholder="https://..." />
              </div>
            </div>
          </div>

          <div class="modal-footer border-top" style="border-color: rgba(255,215,0,0.2) !important;">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-gold" @click="saveProduct">
              <i :class="isEditing ? 'bi-save' : 'bi-plus-lg'" class="bi me-1"></i>
              {{ isEditing ? 'Guardar cambios' : 'Crear producto' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================= MODAL DETALLE ======================= -->
    <div class="modal fade" id="detailModal" tabindex="-1" ref="detailModalEl">
      <div class="modal-dialog">
        <div class="modal-content ts-modal" v-if="selectedProduct">
          <div class="modal-header border-bottom" style="border-color: rgba(255,215,0,0.2) !important;">
            <h5 class="modal-title" style="color:var(--ts-gold);">
              <i class="bi bi-info-circle-fill me-2"></i>Detalle del Producto
            </h5>
            <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center">
            <img
              :src="selectedProduct.imagen"
              :alt="selectedProduct.nombre"
              class="img-fluid rounded-3 mb-3"
              style="max-height: 200px; object-fit: cover; border: 1px solid rgba(255,215,0,0.3);"
              @error="e => e.target.src='https://placehold.co/300x200/111/FFD700?text=TechStore'"
            />
            <h5 class="text-white fw-bold">{{ selectedProduct.nombre }}</h5>
            <span class="badge ts-badge-cat mb-2">{{ selectedProduct.categoria }}</span>
            <p class="text-light small">{{ selectedProduct.descripcion }}</p>
            <div class="d-flex justify-content-around mt-3">
              <div>
                <div class="fw-bold fs-5" style="color:var(--ts-gold);">{{ formatPrice(selectedProduct.precio) }}</div>
                <div class="text-light small">Precio</div>  
              </div>
              <div>
                <div class="fw-bold fs-5 text-white">{{ selectedProduct.stock }}</div>
                <div class="text-light small">En stock</div>
              </div>
              <div>
                <div class="fw-bold fs-5 text-white">#{{ selectedProduct.id }}</div>
                <div class="text-light small">ID</div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-top" style="border-color: rgba(255,215,0,0.2) !important;">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button class="btn btn-gold" @click="editFromDetail">
              <i class="bi bi-pencil-square me-1"></i> Editar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================= MODAL ELIMINAR ======================= -->
    <div class="modal fade" id="deleteModal" tabindex="-1" ref="deleteModalEl">
      <div class="modal-dialog">
        <div class="modal-content ts-modal" v-if="productToDelete">
          <div class="modal-header border-bottom" style="border-color: rgba(255,215,0,0.2) !important;">
            <h5 class="modal-title text-danger">
              <i class="bi bi-trash3-fill me-2"></i>Eliminar Producto
            </h5>
            <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center py-4">
            <i class="bi bi-exclamation-triangle-fill text-warning fs-1 mb-3 d-block"></i>
            <p class="text-white mb-1">¿Estás seguro de eliminar el producto?</p>
            <p class="fw-bold" style="color:var(--ts-gold);">{{ productToDelete.nombre }}</p>
            <p class="text-muted small">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer border-top" style="border-color: rgba(255,215,0,0.2) !important;">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-danger" @click="doDelete">
              <i class="bi bi-trash3 me-1"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista de tarjetas (opcional) usando ProductCardComponent -->
    <<div class="mt-4">
  <h5 class="fw-bold mb-3 text-white">
    <i class="bi bi-grid-3x3-gap me-2" style="color:var(--ts-gold);"></i>Vista en Tarjetas
  </h5>
  <div class="row g-3">
    <div
      v-for="product in filteredProducts.slice(0, 4)"
      :key="'card-' + product.id"
      class="col-12 col-sm-6 col-lg-3"
    >
          <!-- Uso del componente reutilizable ProductCardComponent con prop y evento -->
          <ProductCardComponent
            :product="product"
            @view-details="openDetailModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import {
  getProducts, createProduct, updateProduct,
  deleteProduct, resetProducts
} from '../services/ProductService'
import ProductCardComponent from '../components/ProductCardComponent.vue'

// ─── Estado reactivo ───────────────────────────────────────────────
const products = ref([])
const searchTerm = ref('')
const filterCategory = ref('')
const successMsg = ref('')
const formError = ref('')
const isEditing = ref(false)
const selectedProduct = ref(null)
const productToDelete = ref(null)

// Referencia a los elementos del DOM para los modales de Bootstrap
const productModalEl = ref(null)
const detailModalEl = ref(null)
const deleteModalEl = ref(null)

let productModalInstance = null
let detailModalInstance = null
let deleteModalInstance = null

// Formulario para crear/editar
const form = ref(emptyForm())

function emptyForm() {
  return { nombre: '', categoria: '', precio: 0, stock: 0, descripcion: '', imagen: '' }
}

// ─── Inicialización ────────────────────────────────────────────────
onMounted(() => {
  loadProducts()
  productModalInstance = new Modal(productModalEl.value)
  detailModalInstance  = new Modal(detailModalEl.value)
  deleteModalInstance  = new Modal(deleteModalEl.value)
})

// ─── Computed ──────────────────────────────────────────────────────

/** Lista de categorías únicas extraídas de los productos */
const categories = computed(() =>
  [...new Set(products.value.map(p => p.categoria))].sort()
)

/** Filtra productos por búsqueda y categoría */
const filteredProducts = computed(() => {
  let result = products.value
  if (searchTerm.value) {
    const q = searchTerm.value.toLowerCase()
    result = result.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q)
    )
  }
  if (filterCategory.value) {
    result = result.filter(p => p.categoria === filterCategory.value)
  }
  return result
})

// ─── Helpers ───────────────────────────────────────────────────────
function loadProducts() {
  products.value = getProducts()
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(price)
}

function truncate(str, n) {
  return str?.length > n ? str.substring(0, n) + '...' : str
}

function showSuccess(msg) {
  successMsg.value = msg
  setTimeout(() => successMsg.value = '', 3000)
}

// ─── CRUD Handlers ─────────────────────────────────────────────────

/** Abre el modal en modo creación */
function openCreateModal() {
  isEditing.value = false
  form.value = emptyForm()
  formError.value = ''
  productModalInstance.show()
}

/** Abre el modal en modo edición con datos precargados */
function openEditModal(product) {
  isEditing.value = true
  form.value = { ...product }
  formError.value = ''
  productModalInstance.show()
}

/** Abre el modal de detalle */
function openDetailModal(product) {
  selectedProduct.value = product
  detailModalInstance.show()
}

/** Desde el detalle, abre el editor */
function editFromDetail() {
  detailModalInstance.hide()
  setTimeout(() => openEditModal(selectedProduct.value), 300)
}

/** Muestra el modal de confirmación de eliminación */
function confirmDelete(product) {
  productToDelete.value = product
  deleteModalInstance.show()
}

/** Guarda el producto (crear o actualizar) */
function saveProduct() {
  formError.value = ''

  // Validación
  if (!form.value.nombre || !form.value.categoria || !form.value.descripcion) {
    formError.value = 'Por favor completa todos los campos obligatorios (*).'
    return
  }
  if (form.value.precio <= 0) {
    formError.value = 'El precio debe ser mayor a 0.'
    return
  }
  if (form.value.stock < 0) {
    formError.value = 'El stock no puede ser negativo.'
    return
  }

  if (isEditing.value) {
    updateProduct(form.value.id, form.value)
    showSuccess(`✅ Producto "${form.value.nombre}" actualizado correctamente.`)
  } else {
    createProduct(form.value)
    showSuccess(`✅ Producto "${form.value.nombre}" creado correctamente.`)
  }

  loadProducts()
  productModalInstance.hide()
}

/** Ejecuta la eliminación confirmada */
function doDelete() {
  deleteProduct(productToDelete.value.id)
  showSuccess(`🗑️ Producto "${productToDelete.value.nombre}" eliminado.`)
  loadProducts()
  deleteModalInstance.hide()
}

/** Restaura los productos al JSON inicial */
function resetToDefault() {
  if (confirm('¿Restaurar los productos al estado inicial? Se perderán los cambios.')) {
    resetProducts()
    loadProducts()
    showSuccess('♻️ Productos restaurados al estado inicial.')
  }
}
</script>

<style scoped>
/* Tabla estilizada */
.ts-table {
  background: #1a1a1a;
  color: #fff;
  border-color: transparent;
}

.ts-table thead {
  background: #111;
  color: #ffd700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ts-table th, .ts-table td {
  border-color: rgba(255,215,0,0.1) !important;
  vertical-align: middle;
  padding: 0.75rem 1rem;
}

.ts-table-row:hover {
  background: rgba(255,215,0,0.05) !important;
}

.product-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border: 1px solid rgba(255,215,0,0.2);
}

.ts-badge-cat {
  background: rgba(255,215,0,0.15);
  color: #ffd700;
  border: 1px solid rgba(255,215,0,0.3);
  font-size: 0.72rem;
}

/* Botones de acción en tabla */
.ts-btn-icon {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #aaa;
}
.ts-btn-icon:hover { color: #ffd700; border-color: #ffd700; }

.ts-btn-edit {
  background: rgba(59,130,246,0.1);
  border: 1px solid rgba(59,130,246,0.3);
  color: #3b82f6;
}
.ts-btn-edit:hover { background: rgba(59,130,246,0.2); }

.ts-btn-del {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  color: #ef4444;
}
.ts-btn-del:hover { background: rgba(239,68,68,0.2); }

/* Modal */
.ts-modal {
  background: #1a1a1a;
  color: #fff;
  border: 1px solid rgba(255,215,0,0.2);
}

/* Inputs */
.ts-input {
  background-color: #111 !important;
  border-color: rgba(255,215,0,0.2) !important;
  color: #fff !important;
}
.ts-input:focus {
  border-color: #ffd700 !important;
  box-shadow: 0 0 0 0.2rem rgba(255,215,0,0.15) !important;
}
.ts-input::placeholder { color: #555 !important; }
.ts-input-addon {
  background: #111 !important;
  border-color: rgba(255,215,0,0.2) !important;
  color: #ffd700 !important;
}

/* Botón dorado */
.btn-gold {
  background-color: #ffd700;
  border-color: #ffd700;
  color: #000;
  font-weight: 600;
}
.btn-gold:hover {
  background-color: #ccac00;
  border-color: #ccac00;
}
</style>
