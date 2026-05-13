/**
 * Servicio de productos - Simula operaciones CRUD usando LocalStorage.
 * Los datos iniciales provienen de products.json y se precargan en LocalStorage.
 */
import initialProducts from '../assets/data/products.json'

const STORAGE_KEY = 'techstore_products'
const DATA_VERSION = '1.1' // Cambia esto cada vez que edites el JSON

/**
 * Inicializa el LocalStorage con los productos del JSON.
 * Si la versión cambió, reinicia los datos automáticamente.
 */
function init() {
  const savedVersion = localStorage.getItem(STORAGE_KEY + '_version')
  if (!localStorage.getItem(STORAGE_KEY) || savedVersion !== DATA_VERSION) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts))
    localStorage.setItem(STORAGE_KEY + '_version', DATA_VERSION)
  }
}

/**
 * Obtiene todos los productos desde LocalStorage.
 * @returns {Array} Lista de productos
 */
export function getProducts() {
  init()
  return JSON.parse(localStorage.getItem(STORAGE_KEY))
}

/**
 * Obtiene un producto por su ID.
 * @param {number} id
 * @returns {Object|undefined}
 */
export function getProductById(id) {
  return getProducts().find(p => p.id === id)
}

/**
 * Crea un nuevo producto y lo guarda en LocalStorage.
 * @param {Object} product - Datos del producto sin ID
 * @returns {Object} Producto creado con ID asignado
 */
export function createProduct(product) {
  const products = getProducts()
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1
  const newProduct = { ...product, id: newId }
  products.push(newProduct)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  return newProduct
}

/**
 * Actualiza un producto existente en LocalStorage.
 * @param {number} id - ID del producto a actualizar
 * @param {Object} updatedData - Nuevos datos del producto
 * @returns {Object|null} Producto actualizado o null si no existe
 */
export function updateProduct(id, updatedData) {
  const products = getProducts()
  const index = products.findIndex(p => p.id === id)
  if (index === -1) return null
  products[index] = { ...products[index], ...updatedData, id }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  return products[index]
}

/**
 * Elimina un producto del LocalStorage por su ID.
 * @param {number} id
 * @returns {boolean} true si se eliminó, false si no existe
 */
export function deleteProduct(id) {
  const products = getProducts()
  const filtered = products.filter(p => p.id !== id)
  if (filtered.length === products.length) return false
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

/**
 * Reinicia los productos al estado inicial del JSON.
 */
export function resetProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts))
  localStorage.setItem(STORAGE_KEY + '_version', DATA_VERSION)
}