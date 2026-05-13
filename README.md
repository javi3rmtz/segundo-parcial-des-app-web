# TechStore — Segundo Parcial Desarrollo de Aplicaciones Web

Aplicación web modularizada construida con **Vue 3**, **Vue Router** y **Bootstrap 5**.

> ⚠️ **Nota de seguridad:** La validación de login en esta aplicación es **solo educativa** y utiliza un archivo JSON local. No representa un sistema de autenticación real. En producción se deben usar tokens JWT, sesiones seguras del lado del servidor y HTTPS.

---

## 👥 Integrantes

| Nombre | Código |
|---|---|
| Frank José Miranda Beleño | 192526 |
| Javier Andrés Martínez Martínez | 192528 |

---

## 🏪 Descripción del negocio

**TechStore** es una tienda de tecnología que ofrece productos como laptops, celulares, periféricos, monitores, cámaras y consolas. La aplicación web permite administrar el inventario mediante un panel con login, dashboard, gestión de productos (CRUD) y gestión de clientes.

**Paleta de colores:** Negro (`#000000`) y Dorado (`#FFD700`) — misma identidad visual del primer parcial.

---

## 📁 Estructura del proyecto

```
segundo-parcial-des-app-web/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.js                    # Punto de entrada, importa Vue + Router + Bootstrap
    ├── App.vue                    # Componente raíz con <router-view />
    ├── assets/
    │   └── data/
    │       ├── productos.json     # Datos iniciales de productos (12 productos)
    │       └── usuarios.json      # Usuarios para validación de login
    ├── services/
    │   ├── AuthService.js         # Lógica de autenticación con sessionStorage
    │   └── ProductService.js      # CRUD simulado con LocalStorage
    ├── router/
    │   └── index.js               # Configuración de rutas y guardia de navegación
    ├── components/
    │   ├── NavbarComponent.vue    # Barra de navegación superior (logo, usuario, logout)
    │   ├── SidebarComponent.vue   # Menú lateral con rutas (ícono + etiqueta)
    │   ├── FooterComponent.vue    # Pie de página con derechos reservados
    │   └── ProductCardComponent.vue # Tarjeta de producto reutilizable
    └── views/
        ├── LoginView.vue          # Vista de login con validación JSON
        ├── DashboardView.vue      # Layout principal con Navbar + Sidebar + <router-view>
        ├── HomeView.vue           # Pantalla de inicio con estadísticas
        ├── ProductView.vue        # CRUD completo de productos
        └── ClienteView.vue        # Gestión de clientes (opcional)
```

---

## 🚀 Cómo ejecutar el proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
# http://localhost:5173

# 4. Credenciales de prueba
# usuario: user    contraseña: admin
# usuario: frank   contraseña: admin123
# usuario: javier  contraseña: admin123
```

---

## 🧩 Modularización implementada

### Componentes reutilizables
Cada componente tiene una responsabilidad única (principio de responsabilidad única):

- **NavbarComponent:** Muestra el logo de TechStore, nombre del usuario activo y botón de logout. Emite el evento `toggle-sidebar` hacia el padre (`DashboardView`).
- **SidebarComponent:** Recibe la prop `isOpen` para controlar visibilidad en móvil. Emite `close` al padre. Usa `vue-router` para resaltar el ítem activo.
- **FooterComponent:** Muestra año dinámico con `new Date()`.
- **ProductCardComponent:** Recibe la prop `product` y emite `view-details` al padre cuando el usuario hace clic en "Ver detalles".

### Vistas (Views)
Las vistas son los contenedores de página. `DashboardView` actúa como layout contenedor y las demás vistas (`HomeView`, `ProductView`, `ClienteView`) se cargan como rutas hijas dentro de su `<router-view>`.

---

## 💾 Consumo de datos (API simulada — LocalStorage)

El `ProductService.js` simula las operaciones de una API REST:

```javascript
// Obtener todos los productos (equivalente a GET /api/productos)
import { getProducts } from '../services/ProductService'
const products = getProducts() // Lee desde LocalStorage; si está vacío, precarga products.json

// Crear producto (equivalente a POST /api/productos)
import { createProduct } from '../services/ProductService'
const nuevo = createProduct({ nombre: 'Mouse Gamer', precio: 200000, ... })

// Actualizar (equivalente a PUT /api/productos/:id)
import { updateProduct } from '../services/ProductService'
updateProduct(1, { precio: 220000 })

// Eliminar (equivalente a DELETE /api/productos/:id)
import { deleteProduct } from '../services/ProductService'
deleteProduct(1)
```

Los datos se precargan desde `products.json` en el primer uso, luego persisten en `localStorage` bajo la clave `techstore_products`.

---

## 📡 Comunicación entre componentes

### Props (padre → hijo)

```vue
<!-- DashboardView.vue pasa datos al NavbarComponent -->
<NavbarComponent
  :user-name="session?.nombre"
  :user-role="session?.rol"
/>

<!-- ProductView.vue pasa el objeto product a la tarjeta -->
<ProductCardComponent :product="product" @view-details="openDetailModal" />
```

### Eventos (hijo → padre)

```javascript
// ProductCardComponent.vue — el hijo emite el evento
defineEmits(['view-details'])
// Al hacer clic en "Ver detalles":
emit('view-details', product)

// ProductView.vue — el padre escucha y maneja el evento
function openDetailModal(product) {
  selectedProduct.value = product
  detailModalInstance.show()
}
```

```javascript
// SidebarComponent.vue — emite 'close' al padre
defineEmits(['close'])

// DashboardView.vue — cierra el sidebar en móvil
<SidebarComponent :is-open="sidebarOpen" @close="sidebarOpen = false" />
```

---

## 🛣️ Rutas configuradas

| Ruta | Vista | Descripción |
|---|---|---|
| `/` | — | Redirige a `/login` |
| `/login` | `LoginView` | Formulario de inicio de sesión |
| `/dashboard` | `DashboardView` + `HomeView` | Panel principal con estadísticas |
| `/dashboard/productos` | `ProductView` | CRUD completo de productos |
| `/dashboard/clientes` | `ClienteView` | Gestión de clientes |

La ruta raíz y cualquier ruta desconocida redirigen a `/login`. El guardia de navegación (`router.beforeEach`) verifica la sesión en `sessionStorage` antes de permitir acceso al dashboard.

---

## 🎨 Bootstrap aplicado

- **Grid system** (`col-12 col-md-6 col-xl-3`) para layouts responsivos
- **Navbar**, **modal**, **table**, **badge**, **alert**, **button**, **input-group** de Bootstrap
- **Bootstrap Icons** para íconos del menú lateral y botones de acción
- Variables CSS personalizadas (`--ts-gold`, `--ts-surface`) para mantener la identidad de TechStore
- Diseño 100% responsivo: sidebar colapsable en móvil con overlay

---

## 🤝 Trabajo colaborativo

- 🔗 Repositorio: `https://github.com/javi3rmtz/segundo-parcial-des-app-web.git`
- 🌿 Ramas: `main`, `parcial`

## 📊 Contribuciones

![Contribuciones](assets/Contribuciones.jpg)

## 🌿 Branches

![Branches](assets/Branches.jpg)