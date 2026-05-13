/**
 * Servicio de autenticación educativo.
 * NOTA: Esta validación es solo educativa y NO representa un sistema
 * de autenticación real. En producción se deben usar tokens JWT,
 * HTTPS y validación del lado del servidor.
 */
import usuarios from '../assets/data/usuarios.json'

const SESSION_KEY = 'techstore_session'

/**
 * Valida credenciales contra el archivo JSON local.
 * @param {string} usuario
 * @param {string} password
 * @returns {Object} { success: boolean, user?: Object, error?: string }
 */
export function login(usuario, password) {
  const found = usuarios.find(
    u => u.usuario === usuario.trim() && u.password === password
  )
  if (found) {
    const session = { id: found.id, nombre: found.nombre, rol: found.rol, usuario: found.usuario }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return { success: true, user: session }
  }
  return { success: false, error: 'Usuario o contraseña incorrectos.' }
}

/**
 * Cierra la sesión del usuario actual.
 */
export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}

/**
 * Obtiene el usuario de sesión actual.
 * @returns {Object|null}
 */
export function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}

/**
 * Verifica si hay una sesión activa.
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getSession()
}
