console.log("🚀 APP.JS CARGADO");
const accountButton = document.getElementById("accountButton");
const accountModal = document.getElementById("accountModal");
const closeAccount = document.getElementById("closeAccount");
const accountTabs = document.querySelectorAll(".account-tab");
const accountInfoTab = document.getElementById("accountInfoTab");
const accountOrdersTab = document.getElementById("accountOrdersTab");
const accountAddressesTab = document.getElementById("accountAddressesTab");
const accountServicesTab = document.getElementById("accountServicesTab");
const ordersList = document.getElementById("ordersList");
const addressesList = document.getElementById("addressesList");
const addAddressBtn = document.getElementById("addAddressBtn");

// Hamburger Menu Logic
const hamburgerMenu = document.getElementById('hamburgerMenu');
const mainNav = document.getElementById('mainNav');

if (hamburgerMenu && mainNav) {
  // Toggle menu
  hamburgerMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburgerMenu.classList.toggle('active');
    mainNav.classList.toggle('active');
    // Prevent body scroll when menu is open
    document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when clicking a link
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburgerMenu.classList.remove('active');
      mainNav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside (on the nav overlay itself)
  mainNav.addEventListener('click', (e) => {
    if (e.target === mainNav) {
      hamburgerMenu.classList.remove('active');
      mainNav.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('active')) {
      hamburgerMenu.classList.remove('active');
      mainNav.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

function openAccountModal(initialTab = "info") {
  // Activar pestaña correcta
  accountTabs.forEach(t => t.classList.remove("active"));
  const targetTabBtn = document.querySelector(`.account-tab[data-tab="${initialTab}"]`);
  if (targetTabBtn) targetTabBtn.classList.add("active");

  // Mostrar contenido correcto
  if (accountInfoTab) accountInfoTab.style.display = initialTab === "info" ? "block" : "none";
  if (accountOrdersTab) accountOrdersTab.style.display = initialTab === "orders" ? "block" : "none";
  if (accountAddressesTab) accountAddressesTab.style.display = initialTab === "addresses" ? "block" : "none";
  if (accountServicesTab) accountServicesTab.style.display = initialTab === "services" ? "block" : "none";

  // Renderizar contenido
  if (initialTab === "info") renderAccountInfo();
  if (initialTab === "orders") renderOrders();
  if (initialTab === "addresses") renderAddresses();
  if (initialTab === "services") renderUserServices();

  accountModal.classList.add("cart-modal--open");
  // Reiniciar posición de desplazamiento con retraso para asegurar renderizado
  setTimeout(() => {
    const content = accountModal.querySelector('.cart-modal__content');
    if (content) content.scrollTop = 0;
  }, 50);
}

function closeAccountModal() {
  accountModal.classList.remove("cart-modal--open");
}

if (closeAccount) {
  closeAccount.addEventListener("click", closeAccountModal);
}
if (accountModal) {
  accountModal.addEventListener("click", e => {
    if (e.target === accountModal) closeAccountModal();
  });
}

accountTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const tabName = tab.dataset.tab;

    // Actualizaciones de UI
    accountTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    if (accountInfoTab) accountInfoTab.style.display = tabName === "info" ? "block" : "none";
    if (accountOrdersTab) accountOrdersTab.style.display = tabName === "orders" ? "block" : "none";
    if (accountAddressesTab) accountAddressesTab.style.display = tabName === "addresses" ? "block" : "none";
    if (accountServicesTab) accountServicesTab.style.display = tabName === "services" ? "block" : "none";

    // Obtención de datos
    if (tabName === "info") renderAccountInfo();
    if (tabName === "orders") renderOrders();
    if (tabName === "addresses") renderAddresses();
    if (tabName === "services") renderUserServices();

    // Reiniciar desplazamiento al cambiar pestañas
    const content = accountModal.querySelector('.cart-modal__content');
    if (content) content.scrollTop = 0;
  });
});

function renderAccountInfo() {
  if (!currentUser) {
    accountInfoTab.innerHTML = '<div class="account-empty">No has iniciado sesión.</div>';
    return;
  }

  // Analizar teléfono existente
  let currentPhone = currentUser.phone || "";
  let currentCode = "+57";
  const commonCodes = ["+57", "+1", "+52", "+34", "+54", "+56", "+51"];

  for (let code of commonCodes) {
    if (currentPhone.startsWith(code)) {
      currentCode = code;
      currentPhone = currentPhone.substring(code.length);
      break;
    }
  }

  // Diseño de formulario premium con teléfono y bandera
  accountInfoTab.innerHTML = `
    <form id="accountInfoForm" class="account-form">
      <label>
        <span>👤 Nombre de usuario</span>
        <input type="text" name="username" value="${currentUser.username}" disabled />
      </label>
      <label>
        <span>✉️ Correo electrónico</span>
        <input type="email" name="email" value="${currentUser.email || ''}" required placeholder="ejemplo@email.com" />
      </label>
      <label>
        <span>📱 Teléfono móvil</span>
        <div style="display: flex; gap: 0.5rem;">
          <select id="countryCodeSelect" style="width: 110px; padding: 0.8rem 0.5rem; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; font-size: 1rem;">
             <option value="+57" ${currentCode === '+57' ? 'selected' : ''}>🇨🇴 +57</option>
             <option value="+1" ${currentCode === '+1' ? 'selected' : ''}>🇺🇸 +1</option>
             <option value="+52" ${currentCode === '+52' ? 'selected' : ''}>🇲🇽 +52</option>
             <option value="+34" ${currentCode === '+34' ? 'selected' : ''}>🇪🇸 +34</option>
             <option value="+54" ${currentCode === '+54' ? 'selected' : ''}>🇦🇷 +54</option>
             <option value="+56" ${currentCode === '+56' ? 'selected' : ''}>🇨🇱 +56</option>
             <option value="+51" ${currentCode === '+51' ? 'selected' : ''}>🇵🇪 +51</option>
          </select>
          <input type="tel" name="phoneBody" value="${currentPhone}" placeholder="300 123 4567" style="flex:1; margin-bottom: 0;" />
        </div>
      </label>
      <label>
        <span>🔑 Rol de usuario</span>
        <input type="text" value="${currentUser.isAdmin ? 'Administrador' : 'Cliente Registrado'}" disabled />
      </label>
      <div style="margin-top: 1rem;">
        <button type="submit" class="btn-primary" style="width: 100%;">💾 Guardar Cambios</button>
      </div>
      <div style="margin-top: 0.5rem;">
        <button type="button" class="btn-secondary" onclick="closeAccountModal()" style="width: 100%;">✖ Cerrar Ventana</button>
      </div>
    </form>
  `;

  const form = document.getElementById('accountInfoForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const phoneBody = form.phoneBody.value.trim();
    const code = document.getElementById('countryCodeSelect').value;

    // Validar longitud mínima del teléfono si está presente
    let fullPhone = "";
    if (phoneBody) {
      if (phoneBody.length < 7) {
        alert("El número de teléfono es inválido.");
        return;
      }
      fullPhone = code + phoneBody;
    }

    if (!email) {
      alert('El email no puede estar vacío.');
      return;
    }

    const res = await updateUserInfo({ email, phone: fullPhone });
    if (res && res.success) {
      currentUser.email = email;
      currentUser.phone = fullPhone;
      alert('✅ Datos actualizados correctamente.');
    } else {
      alert(res && res.message ? res.message : 'Error al actualizar.');
    }
  });
}

// Lógica para actualizar información de usuario
async function updateUserInfo(data) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/update_user.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (err) {
    return { success: false, message: 'Error de conexión.' };
  }
}

async function renderOrders() {
  const list = document.getElementById("ordersList");
  list.innerHTML = '<div style="text-align:center; padding: 2rem;">Cargando pedidos...</div>';

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      list.innerHTML = '<div class="account-empty">Inicia sesión para ver tus pedidos.</div>';
      return;
    }

    const response = await fetch(`${API_BASE}/orders.php`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (data.success && data.orders && data.orders.length > 0) {
      list.innerHTML = '<div class="orders-list"></div>';
      const container = list.querySelector(".orders-list");

      data.orders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString() + ' ' + new Date(order.created_at).toLocaleTimeString();

        let itemsHtml = '';
        order.items.forEach(item => {
          itemsHtml += `
            <div class="order-item-row">
              <span>${item.product_name} (x${item.quantity})</span>
              <span>${currencyFormat(item.price * item.quantity)}</span>
            </div>
          `;
        });

        const card = document.createElement("div");
        card.className = "order-card";
        card.innerHTML = `
          <div class="order-header">
            <div>
              <div class="order-id">Pedido #${order.id}</div>
              <div class="order-date">${date}</div>
            </div>
            <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
          </div>
          <div class="order-items">
            ${itemsHtml}
          </div>
          <div class="order-total">
            <span>Total</span>
            <span>${currencyFormat(order.total)}</span>
          </div>
        `;
        container.appendChild(card);
      });

    } else {

      // Estado vacío
      list.innerHTML = `
        <div class="account-empty">
          <span class="icon">📦</span>
          <p>No tienes pedidos realizados aún.</p>
          <button class="btn-secondary" onclick="closeAccountModal(); window.location.href='#productos'">Ir a comprar</button>
        </div>
      `;
    }
  } catch (err) {
    console.error(err);
    list.innerHTML = '<p style="color:red; text-align:center;">Error al cargar pedidos.</p>';
  }
}



if (addAddressBtn) {
  addAddressBtn.addEventListener("click", () => {
    alert("Funcionalidad de agregar dirección próximamente.");
  });
}
// Importar visor 3D (Dinámico más adelante)
// import { initBikeViewer } from './viewer/bikeViewer.js';

// Usuarios y productos desde API
const API_BASE = 'api'; // Path relativo para producción y desarrollo
let products = [];
let currentUser = null;

// Restaurar sesión y validar estado fresco
async function checkSession() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // Enviar token tanto en Header como en URL para redundancia máxima
      const res = await fetch(`${API_BASE}/me.php?token=${encodeURIComponent(token)}&_t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        currentUser = data.user;
        // Guardar datos frescos
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateLoginButton();

        // Viewer init moved to main flow
      } else {
        console.warn("Sesión inválida:", data);
        // Token inválido o expirado real
        logout();
      }
    } catch (err) {
      console.error("Error validando sesión:", err);
      // Fallback a localStorage si no hay conexión, pero intentar actualizar UI
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateLoginButton();
      } else {
        updateLoginButton(); // Estado inicial (sin sesión)
      }
    }
  } else {
    updateLoginButton(); // No hay token, inicializar botón
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  updateLoginButton();
  window.location.reload();
}

// Función para obtener productos
async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE}/products.php`);
    const data = await response.json();
    if (Array.isArray(data)) {
      products = data;
    } else {
      console.warn("API de productos no devolvió un array:", data);
      products = [];
    }
  } catch (err) {
    console.error('Error fetching products:', err);
    products = [];
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  checkSession();
  fetchProducts().then(() => {
    renderProducts();
    // Restaurar carrito si existiera (opcional, por ahora solo memoria)
  });

});


// Función para register
async function registerUser(username, email, phone, password, addressData = {}) {
  try {
    const payload = { username, email, phone, password, ...addressData };

    const response = await fetch(`${API_BASE}/register.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (response.ok && data.success) {
      showRegisterSuccess();
      return true;
    } else {
      alert(data.message || 'Error en el registro');
      return false;
    }
  } catch (err) {
    console.error('Error registering:', err);
    alert('Error al conectar con el servidor de registro');
    return false;
  }
}

// Función para login
async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_BASE}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.success && data.token && data.user) {
      localStorage.setItem('token', data.token);
      currentUser = data.user;
      updateLoginButton();
      closeLoginModal();
      // Sesión iniciada exitosamente - sin alert
    } else {
      alert(data.message || 'Usuario o contraseña incorrectos.');
    }
  } catch (err) {
    console.error('Error logging in:', err);
    alert('Error de conexión con el servidor. Por favor intenta de nuevo.');
  }
}


function showRegisterSuccess() {
  closeRegisterModal();
  setTimeout(() => {
    alert('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
  }, 300);
}



const currencyFormat = value =>
  value.toLocaleString("es-CO", { style: "currency", currency: "COP" });

const productList = document.getElementById("productList");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");

// Iniciar Sesión/Registro
const loginButton = document.getElementById("loginButton");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const loginForm = document.getElementById("loginForm");
const showRegister = document.getElementById("showRegister");

const registerModal = document.getElementById("registerModal");
const closeRegister = document.getElementById("closeRegister");
const registerForm = document.getElementById("registerForm");
const showLogin = document.getElementById("showLogin");

// Add Product (solo para admins)
const addProductModal = document.getElementById("addProductModal");
const closeAddProduct = document.getElementById("closeAddProduct");
const addProductForm = document.getElementById("addProductForm");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");

let filteredCategory = "all";
let searchTerm = "";

// Render productos
function renderProducts() {
  productList.innerHTML = "";

  const filtered = products.filter(p => {
    const matchCategory =
      filteredCategory === "all" || p.category === filteredCategory;
    const matchSearch =
      searchTerm.trim() === "" ||
      p.name.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm) ||
      (p.use ? p.use.toLowerCase() : '').includes(searchTerm);

    // Filtro Stock: Mostrar solo si > 0
    const matchStock = p.stock > 0;

    return matchCategory && matchSearch && matchStock;
  });

  if (filtered.length === 0) {
    productList.innerHTML =
      '<p style="color:#9ca3af;font-size:0.9rem;">No se encontraron productos.</p>';
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement("article");
    card.className = "card product-card";
    card.innerHTML = `
      <div class="product-card__image">
        ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-card__img">` : `<div class="product-card__image-placeholder">Imagen ${product.category.toUpperCase()}</div>`}
      </div>
      <div class="product-card__brand">${product.brand}</div>
      <h3 class="product-card__title">${product.name}</h3>
      <div class="product-card__meta">
        <span class="product-card__price">${currencyFormat(product.price)}</span>
        <span class="product-card__tag">${product.tag}</span>
      </div>
      <div class="product-card__info">
        <span>${product.use}</span>
        <span>Stock: ${product.stock}</span>
      </div>
      <div class="product-card__actions">
        <button class="btn-secondary" data-id="${product.id}">Ver detalle</button>
        <button class="btn-primary" data-add="${product.id}">Agregar</button>
      </div>
    `;
    productList.appendChild(card);
  });
}

// Filtro por select
categoryFilter.addEventListener("change", e => {
  filteredCategory = e.target.value;
  renderProducts();
});

// Filtro por categoría clickeando cards de categorías
document.querySelectorAll(".categoria").forEach(card => {
  card.addEventListener("click", () => {
    const cat = card.dataset.category;
    filteredCategory = cat;
    categoryFilter.value = cat;
    renderProducts();
    window.scrollTo({ top: document.getElementById("productos").offsetTop - 80, behavior: "smooth" });
  });
});

// Búsqueda
if (searchInput) {
  searchInput.addEventListener("input", e => {
    searchTerm = e.target.value.toLowerCase();
    renderProducts();
  });
}

// Lógica del desplegable
const userDropdown = document.getElementById("userDropdown");
const menuProfile = document.getElementById("menuProfile");
const menuOrders = document.getElementById("menuOrders");
const menuLogout = document.getElementById("menuLogout");

// Cerrar desplegable al hacer clic fuera
document.addEventListener("click", (e) => {
  if (!loginButton.contains(e.target) && !userDropdown.contains(e.target)) {
    userDropdown.classList.remove("active");
  }
});

// Acciones del menú
menuProfile.addEventListener("click", () => {
  userDropdown.classList.remove("active");
  openAccountModal("info");
});

menuOrders.addEventListener("click", () => {
  userDropdown.classList.remove("active");
  openAccountModal("orders");
});

menuLogout.addEventListener("click", () => {
  localStorage.removeItem('token');
  currentUser = null;
  userDropdown.classList.remove("active");
  updateLoginButton();
  window.location.reload();
});

// Actualizar botón de login
function updateLoginButton() {
  const token = localStorage.getItem('token');
  if (token && currentUser) {
    // Estado de sesión iniciada
    loginButton.textContent = '👤';
    loginButton.title = `Hola, ${currentUser.username}`;

    // Limpiar si es necesario
    // accountButton.style.display = "none"; // Removed ref

    // Cambiar comportamiento de clic para alternar desplegable
    loginButton.onclick = (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("active");
    };

    // Check for admin privileges (handling int, string "1", or boolean true)
    if (currentUser.isAdmin == 1 || currentUser.isAdmin === true || currentUser.isAdmin === '1') {
      if (!document.getElementById("menuAdmin")) {
        const btn = document.createElement("button");
        btn.id = "menuAdmin";
        btn.innerHTML = '<span class="icon">🚀</span> Panel Admin';
        btn.className = "account-btn-admin"; // Use new class in style.css

        btn.onclick = () => window.location.href = "admin.html";

        // Insert as first item in dropdown for visibility
        if (userDropdown) {
          userDropdown.insertBefore(btn, userDropdown.firstChild);
        }
      }
    }
  } else {
    // Estado de sesión cerrada
    currentUser = null;
    loginButton.textContent = '👤';
    loginButton.title = 'Iniciar Sesión';
    // accountButton.style.display = "none"; 
    userDropdown.classList.remove("active");

    // Restaurar comportamiento de login
    loginButton.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLogin();
    };

    const adminBtn = document.getElementById("menuAdmin");
    if (adminBtn) adminBtn.remove();
  }
}

// Funciones de Modales (Sin retardos)
function openLogin() {
  loginModal.classList.add("active");
  loginModal.classList.add("cart-modal--open");
}

function closeLoginModal() {
  loginModal.classList.remove("active");
  loginModal.classList.remove("cart-modal--open");
}

function openRegister() {
  registerModal.classList.add("active");
  registerModal.classList.add("cart-modal--open");
}

function closeRegisterModal() {
  registerModal.classList.remove("active");
  registerModal.classList.remove("cart-modal--open");
}

function openAddProduct() {
  addProductModal.classList.add("active");
  addProductModal.classList.add("cart-modal--open");
}

function closeAddProductModal() {
  addProductModal.classList.remove("active");
  addProductModal.classList.remove("cart-modal--open");
}

// Listeners de cierre
closeLogin.addEventListener("click", closeLoginModal);
closeRegister.addEventListener("click", closeRegisterModal);
closeAddProduct.addEventListener("click", closeAddProductModal);

// Reactivar cierre por clic fuera
if (loginModal) {
  loginModal.addEventListener("click", e => {
    if (e.target === loginModal) closeLoginModal();
  });
}

if (registerModal) {
  registerModal.addEventListener("click", e => {
    if (e.target === registerModal) closeRegisterModal();
  });
}

if (addProductModal) {
  addProductModal.addEventListener("click", e => {
    if (e.target === addProductModal) closeAddProductModal();
  });
}

showRegister.addEventListener("click", e => {
  e.preventDefault();
  closeLoginModal();
  openRegister();
});

showLogin.addEventListener("click", e => {
  e.preventDefault();
  closeRegisterModal();
  openLogin();
});

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const username = formData.get("username");
  const password = formData.get("password");
  await loginUser(username, password);
  if (currentUser) {
    closeLoginModal();
  }
});

registerForm.addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(registerForm);
  const username = registerForm.username.value;
  const email = registerForm.email.value;
  const phone = registerForm.phone.value;
  const password = registerForm.password.value;
  const confirmPassword = registerForm.confirmPassword.value;


  const trimmedUsername = username?.trim();
  const trimmedEmail = email?.trim();
  const trimmedPhone = phone?.trim();
  const trimmedPassword = password?.trim();
  const trimmedConfirmPassword = confirmPassword?.trim();

  if (!trimmedUsername || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
    alert("Todos los campos obligatorios deben llenarse.");
    return;
  }
  if (trimmedPassword !== trimmedConfirmPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
    alert("El email no es válido.");
    return;
  }

  // Capturar dirección
  const dep = document.getElementById("registerDepartment").value;
  const city = document.getElementById("registerCity").value;
  const address = document.getElementById("registerAddress").value;

  if (!dep || !city || !address) {
    alert("Por favor completa los datos de ubicación.");
    return;
  }

  const result = await registerUser(trimmedUsername, trimmedEmail, trimmedPhone, trimmedPassword, { department: dep, city: city, address: address });
  if (result === true) {
    closeRegisterModal();
  }
});







// Alternar visibilidad de contraseña
const toggleLoginPassword = document.getElementById("toggleLoginPassword");
const toggleRegisterPassword = document.getElementById("toggleRegisterPassword");

toggleLoginPassword.addEventListener("click", () => {
  const input = document.getElementById("loginPassword");
  const type = input.getAttribute("type") === "password" ? "text" : "password";
  input.setAttribute("type", type);
  toggleLoginPassword.querySelector(".eye-icon").textContent = type === "password" ? "👁️" : "🙈";
});

toggleRegisterPassword.addEventListener("click", () => {
  const input = document.getElementById("registerPassword");
  const type = input.getAttribute("type") === "password" ? "text" : "password";
  input.setAttribute("type", type);
  toggleRegisterPassword.querySelector(".eye-icon").textContent = type === "password" ? "👁️" : "🙈";
});

// Funcionalidad de carga de imágenes (Cuadrícula multi-imagen)
const imageUploadGrid = document.getElementById("imageUploadGrid");
let productImages = [null, null, null, null]; // Almacenar cadenas Base64

if (imageUploadGrid) {
  const slots = imageUploadGrid.querySelectorAll(".image-slot");

  slots.forEach((slot, index) => {
    const input = slot.querySelector("input[type='file']");

    // Clic en ranura para activar input
    slot.addEventListener("click", (e) => {
      if (e.target.closest(".remove-img-btn")) return; // Ignorar clic en botón eliminar
      if (!productImages[index]) {
        input.click();
      }
    });

    // Manejar selección de archivo
    input.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es demasiado grande. Máximo 5MB.");
        return;
      }

      try {
        const base64 = await readImageAsBase64(file);
        productImages[index] = base64;

        // Actualizar UI
        slot.classList.add("has-image");
        const img = document.createElement("img");
        img.src = base64;

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-img-btn";
        removeBtn.innerHTML = "×";
        removeBtn.onclick = (ev) => {
          ev.stopPropagation(); // Detener propagación al clic de ranura
          clearSlot(index);
        };

        // Limpiar contenido anterior (marcador) pero mantener input
        const placeholder = slot.querySelector(".slot-placeholder");
        if (placeholder) placeholder.style.display = 'none';

        // Eliminar img/btn existente si se reemplaza
        const existingImg = slot.querySelector("img");
        const existingBtn = slot.querySelector(".remove-img-btn");
        if (existingImg) existingImg.remove();
        if (existingBtn) existingBtn.remove();

        slot.appendChild(img);
        slot.appendChild(removeBtn);

      } catch (err) {
        console.error("Error reading file:", err);
      }
    });
  });
}

function clearSlot(index) {
  const slot = imageUploadGrid.querySelector(`.image-slot[data-index="${index}"]`);
  if (!slot) return;

  productImages[index] = null;
  slot.classList.remove("has-image");

  const img = slot.querySelector("img");
  const btn = slot.querySelector(".remove-img-btn");
  if (img) img.remove();
  if (btn) btn.remove();

  const placeholder = slot.querySelector(".slot-placeholder");
  if (placeholder) placeholder.style.display = 'block';

  const input = slot.querySelector("input[type='file']");
  if (input) input.value = ''; // Reiniciar input
}

function resetImageGrid() {
  productImages = [null, null, null, null];
  const slots = imageUploadGrid.querySelectorAll(".image-slot");
  slots.forEach((slot, index) => {
    clearSlot(index);
  });
}

function readImageAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Lógica del Carrito
const cartTotalElement = document.getElementById("cartTotal");
const cartCountElement = document.getElementById("cartCount");
const checkoutButton = document.getElementById("checkoutButton");
const cartItemsContainer = document.getElementById("cartItems"); // Definición añadida

let cart = [];

function openCart() {
  cartModal.classList.add("cart-modal--open");
}

function closeCartModal() {
  cartModal.classList.remove("cart-modal--open");
}

cartButton.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartModal);

cartModal.addEventListener("click", e => {
  if (e.target === cartModal) closeCartModal();
});

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || product.stock <= 0) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  product.stock -= 1;
  saveProducts();
  updateCartUI();
  renderProducts(); // Para actualizar el stock mostrado
}

function removeFromCart(productId) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    const product = products.find(p => p.id === productId);
    if (product) product.stock += item.qty;
  }
  cart = cart.filter(item => item.id !== productId);
  saveProducts();
  updateCartUI();
  renderProducts();
}

function updateCartUI() {
  cartItemsContainer.innerHTML = "";
  let total = 0;
  let count = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    count += item.qty;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div>
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__meta">
          ${item.qty} x ${currencyFormat(item.price)}
        </div>
      </div>
      <button data-remove="${item.id}">Eliminar</button>
    `;
    cartItemsContainer.appendChild(row);
  });

  cartTotalElement.textContent = currencyFormat(total);
  cartCountElement.textContent = count.toString();

  // eventos eliminar
  cartItemsContainer.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.remove);
      removeFromCart(id);
    });
  });
}

// Delegación de eventos para botones de producto
productList.addEventListener("click", e => {
  const addId = e.target.dataset.add;
  if (addId) {
    addToCart(Number(addId));
  }
});

// Proceso de pago (demo)
checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }
  // Confirmar compra
  const confirmPurchase = confirm("¿Confirmar la compra? El stock se reducirá permanentemente.");
  if (confirmPurchase) {
    // Vaciar carrito sin restaurar stock
    cart = [];
    saveProducts();
    updateCartUI();
    renderProducts(); // Para mostrar el stock actualizado
    alert("¡Compra realizada con éxito! Gracias por tu pedido.");
  }
});

// Lógica de agregar producto
addProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(addProductForm);
  const productData = {
    name: formData.get("name"),
    brand: formData.get("brand"),
    category: formData.get("category"),
    price: Number(formData.get("price")),
    tag: formData.get("tag"),
    use: formData.get("use"),
    stock: Number(formData.get("stock")),
    barcode: formData.get("barcode"), // Nuevo campo
    images: productImages.filter(img => img !== null) // Enviar imágenes no nulas
  };

  if (productData.images.length === 0) {
    alert("Debes subir al menos una imagen principal.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/products.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${localStorage.getItem('token')}` // Descomentar si la lógica de token es estricta
      },
      body: JSON.stringify(productData)
    });

    const result = await response.json();

    if (result.success) {
      alert("Producto agregado correctamente ✅");
      closeAddProductModal();
      addProductForm.reset();
      resetImageGrid();
      await fetchProducts(); // Recargar desde el servidor
      renderProducts();
    } else {
      alert("Error al guardar: " + (result.message || "Desconocido"));
    }
  } catch (err) {
    console.error("Error saving product:", err);
    alert("Error de conexión al guardar producto.");
  }
});

const cancelAddProduct = document.getElementById("cancelAddProduct");
if (cancelAddProduct) {
  cancelAddProduct.addEventListener("click", () => {
    addProductForm.reset();
    resetImageGrid();
    closeAddProductModal();
  });
}

// Restaurar Sesión
async function initSession() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    // Decodificar carga útil básica para UI (parte base64 de JWT falso)
    const payload = JSON.parse(atob(token.split('.')[0]));
    if (payload && payload.username) {
      currentUser = {
        username: payload.username,
        email: payload.email || '', // Podría faltar en tokens antiguos
        isAdmin: payload.isAdmin,
        phone: payload.phone || ''
      };

      // Opcional: Verificar validez del token con backend si es necesario
      // const res = await fetch(`${API_BASE}/me.php`, { headers: { 'Authorization': token } });
    }
  } catch (e) {
    console.error("Invalid token:", e);
    localStorage.removeItem('token');
  }
}

// Inicializar
(async () => {
  await initSession();
  await fetchProducts();
  renderProducts();
  updateLoginButton();
})();

/* --- PANEL DE ADMIN Y LÓGICA DE PEDIDOS --- */

// Renderizar Panel de Admin
const adminModal = document.getElementById("adminDashboardModal");
const closeAdminDashboard = document.getElementById("closeAdminDashboard");
const adminTabBtns = document.querySelectorAll(".admin-tab-btn");

function openAdmin() {
  if (adminModal) {
    adminModal.classList.add("active");
    loadDashboardData();
  }
}

if (closeAdminDashboard) {
  closeAdminDashboard.addEventListener("click", () => {
    adminModal.classList.remove("active");
  });
}

// Cambio de pestañas con animaciones
adminTabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // Reiniciar estados activos
    adminTabBtns.forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view-section").forEach(s => s.classList.remove("active"));

    // Establecer nuevo activo
    btn.classList.add("active");
    const targetId = btn.getAttribute("data-tab");
    document.getElementById(targetId).classList.add("active");
  });
});

async function loadDashboardData() {
  try {
    const res = await fetch(`${API_BASE}/orders.php`, {
      headers: { 'Authorization': localStorage.getItem('token') } // Simular token
    });
    const data = await res.json();

    if (data.success) {
      renderOrdersTable(data.orders);
      renderOverview(data.orders);
      renderInventoryTable();
    }
  } catch (e) { console.error("Error loading dashboard", e); }
}

function renderOverview(orders) {
  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total), 0);

  const today = new Date().toISOString().split('T')[0];
  const ordersToday = orders.filter(o => o.created_at.startsWith(today)).length;

  document.getElementById("statTotalSales").textContent = currencyFormat(totalSales);
  document.getElementById("statOrdersToday").textContent = ordersToday;
  document.getElementById("statTotalProducts").textContent = products.length;
  // Estadística de usuarios necesita fetch, omitiendo por ahora

  // Pedidos recientes (Top 5)
  const recentTable = document.getElementById("recentOrdersTable");
  recentTable.innerHTML = orders.slice(0, 5).map(o => `
    <tr>
      <td>${o.reference || o.id}</td>
      <td>${o.user_name || 'Desconocido'}</td>
      <td>${currencyFormat(o.total)}</td>
      <td><span class="status-badge status-${o.status}">${o.status}</span></td>
      <td>${new Date(o.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

function renderOrdersTable(orders) {
  const table = document.getElementById("allOrdersTable");
  table.innerHTML = orders.map(o => `
    <tr>
      <td>#${o.id}</td>
      <td>${o.reference || '-'}</td>
      <td>${o.user_name}<br><small>${o.user_email || ''}</small></td>
      <td>${o.items.length} items</td>
      <td>${currencyFormat(o.total)}</td>
      <td>
        <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding:4px; border-radius:4px;">
           <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
           <option value="approved" ${o.status === 'approved' ? 'selected' : ''}>Approved</option>
           <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
           <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td><button class="btn-secondary" style="padding:4px 8px; font-size:12px;">Ver</button></td>
    </tr>
  `).join('');
}

async function updateOrderStatus(id, status) {
  try {
    await fetch(`${API_BASE}/orders.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
    alert("Estado actualizado");
    loadDashboardData(); // Refrescar
  } catch (e) { alert("Error"); }
}

function renderInventoryTable() {
  const table = document.getElementById("inventoryTable");
  table.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image || p.images[0]}" style="width:40px; height:40px; object-fit:contain;"></td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.stock}</td>
      <td>${currencyFormat(p.price)}</td>
      <td>
         <button onclick="editProduct(${p.id})" style="border:none; background:none; cursor:pointer;">✏️</button>
      </td>
    </tr>
  `).join('');
}

// PROCESO DE PAGO REAL (Reemplaza confirmar)
async function processCheckout() {
  if (cart.length === 0) return;

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.username) { alert("Inicia sesión primero"); return; }

    // Crear carga útil
    const payload = {
      items: cart
    };

    const res = await fetch(`${API_BASE}/orders.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token')
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      alert(`Pedido Creado! Ref: ${data.reference}. Total: ${currencyFormat(data.total)}`);
      cart = [];
      updateCartUI();
      closeCartModal();
      // Aquí redirigiríamos a Wompi
      // window.location.href = "https://checkout.wompi.co/...?ref=" + data.reference;
    } else {
      alert("Error: " + data.message);
    }
  } catch (e) {
    console.error(e);
    alert("Error procesando pedido");
  }
}

/* --- LÓGICA DE DIRECCIÓN Y DEPARTAMENTOS DE COLOMBIA --- */
const colombiaDeps = {
  "Amazonas": ["Leticia", "Puerto Nariño"],
  "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Rionegro", "Turbo", "Caucasia"],
  "Arauca": ["Arauca", "Arauquita", "Saravena", "Tame"],
  "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Sabanalarga"],
  "Bolívar": ["Cartagena", "Magangué", "Turbaco", "Arjona"],
  "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá"],
  "Caldas": ["Manizales", "La Dorada", "Chinchiná", "Villamaría"],
  "Caquetá": ["Florencia", "San Vicente del Caguán"],
  "Casanare": ["Yopal", "Aguazul", "Villanueva"],
  "Cauca": ["Popayán", "Santander de Quilichao", "Puerto Tejada"],
  "Cesar": ["Valledupar", "Aguachica", "Codazzi"],
  "Chocó": ["Quibdó", "Istmina"],
  "Córdoba": ["Montería", "Lorica", "Sahagún", "Cereté"],
  "Cundinamarca": ["Bogotá", "Soacha", "Zipaquirá", "Fusagasugá", "Facatativá", "Chía", "Mosquera"],
  "Guainía": ["Inírida"],
  "Guaviare": ["San José del Guaviare"],
  "Huila": ["Neiva", "Pitalito", "Garzón"],
  "La Guajira": ["Riohacha", "Maicao", "Uribia"],
  "Magdalena": ["Santa Marta", "Ciénaga", "Zona Bananera"],
  "Meta": ["Villavicencio", "Acacías", "Granada"],
  "Nariño": ["Pasto", "Tumaco", "Ipiales"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Villa del Rosario", "Los Patios"],
  "Putumayo": ["Mocoa", "Puerto Asís"],
  "Quindío": ["Armenia", "Calarcá", "La Tebaida"],
  "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
  "San Andrés y Providencia": ["San Andrés"],
  "Santander": ["Bucaramanga", "Floridablanca", "Barrancabermeja", "Girón", "Piedecuesta"],
  "Sucre": ["Sincelejo", "Corozal"],
  "Tolima": ["Ibagué", "Espinal", "Melgar"],
  "Valle del Cauca": ["Cali", "Buenaventura", "Palmira", "Tuluá", "Yumbo", "Cartago", "Jamundí", "Buga"],
  "Vaupés": ["Mitú"],
  "Vichada": ["Puerto Carreño"]
};

const depSelect = document.getElementById("registerDepartment");
const citySelect = document.getElementById("registerCity");

if (depSelect && citySelect) {
  // Poblar Departamentos
  Object.keys(colombiaDeps).sort().forEach(dep => {
    const opt = document.createElement("option");
    opt.value = dep;
    opt.textContent = dep;
    depSelect.appendChild(opt);
  });

  // Manejar Cambio
  depSelect.addEventListener("change", () => {
    const selected = depSelect.value;
    citySelect.innerHTML = '<option value="">Selecciona una ciudad</option>';

    if (selected && colombiaDeps[selected]) {
      citySelect.disabled = false;
      citySelect.style.background = "#fff";
      colombiaDeps[selected].sort().forEach(city => {
        const opt = document.createElement("option");
        opt.value = city;
        opt.textContent = city;
        citySelect.appendChild(opt);
      });
    } else {
      citySelect.disabled = true;
      citySelect.style.background = "#f1f5f9";
      citySelect.innerHTML = '<option value="">Selecciona primero un departamento</option>';
    }
  });
}

// --- GESTIÓN DE DIRECCIONES (PERFIL) ---

function populateCities(depSelect, citySelect, selectedCity = null) {
  const dep = depSelect.value;
  citySelect.innerHTML = '<option value="">Selecciona una ciudad</option>';

  if (dep && colombiaDeps[dep]) {
    citySelect.disabled = false;
    citySelect.style.background = "#fff";
    colombiaDeps[dep].sort().forEach(city => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      if (selectedCity && city === selectedCity) opt.selected = true;
      citySelect.appendChild(opt);
    });
  } else {
    citySelect.disabled = true;
    citySelect.style.background = "#f1f5f9";
    citySelect.innerHTML = '<option value="">Selecciona primero un departamento</option>';
  }
}

function renderAddresses() {
  const accountAddressesTab = document.getElementById("accountAddressesTab");
  if (!currentUser) {
    if (accountAddressesTab) accountAddressesTab.innerHTML = '<div class="account-empty">No has iniciado sesión.</div>';
    return;
  }

  if (!accountAddressesTab) return;

  // Determine current values
  const currentDep = currentUser.department || "";
  const currentCity = currentUser.city || "";
  const currentAddr = currentUser.address || "";

  accountAddressesTab.innerHTML = `
    <div class="address-card">
      <h3>📍 Dirección Principal</h3>
      <p style="color:#64748b; font-size:0.9rem; margin-bottom:1rem;">Esta es la dirección que usaremos para tus envíos.</p>
      
      <form id="addressForm" class="account-form">
        <label>
          <span>🗺️ Departamento</span>
          <select id="profileDep" name="department" style="width:100%; padding:0.8rem; border-radius:12px; border:1px solid #cbd5e1;">
             <option value="">Selecciona...</option>
             <!-- JS Populated -->
          </select>
        </label>
        
        <label>
          <span>🏙️ Ciudad</span>
          <select id="profileCity" name="city" style="width:100%; padding:0.8rem; border-radius:12px; border:1px solid #cbd5e1;" disabled>
             <option value="">Selecciona departamento...</option>
          </select>
        </label>

        <label>
          <span>🏠 Dirección y Nomenclatura</span>
          <input type="text" name="address" value="${currentAddr}" placeholder="Ej: Cra 45 # 20-10, Apto 501" required />
        </label>

        <div style="margin-top: 1rem;">
          <button type="submit" class="btn-primary" style="width: 100%;">Actualizar Dirección</button>
        </div>
      </form>
    </div>
  `;

  // Lógica de población
  const depSelect = document.getElementById("profileDep");
  const citySelect = document.getElementById("profileCity");

  if (typeof colombiaDeps !== 'undefined') {
    Object.keys(colombiaDeps).sort().forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      if (currentDep === d) opt.selected = true;
      depSelect.appendChild(opt);
    });

    // Iniciar ciudades
    if (currentDep) {
      populateCities(depSelect, citySelect, currentCity);
    }

    // Listener de cambios
    depSelect.addEventListener("change", () => {
      populateCities(depSelect, citySelect);
    });
  }

  // Manejar envío
  document.getElementById("addressForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newDep = depSelect.value;
    const newCity = citySelect.value;
    const newAddr = e.target.address.value.trim();

    if (!newDep || !newCity || !newAddr) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/update_user.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({
          department: newDep,
          city: newCity,
          address: newAddr
        })
      });

      const data = await res.json();
      if (data.success) {
        // Update local currentUser
        currentUser.department = newDep;
        currentUser.city = newCity;
        currentUser.address = newAddr;
        localStorage.setItem('user', JSON.stringify(currentUser));

        alert("✅ Dirección actualizada correctamente");
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  });
}

/* --- LÓGICA DE TALLER (Cliente) --- */
async function renderUserServices() {
  const container = document.getElementById('servicesList');
  if (!currentUser) {
    container.innerHTML = '<div class="account-empty">Inicia sesión para ver tu historial de taller.</div>';
    return;
  }

  container.innerHTML = '<div style="text-align:center; padding:2rem;">Cargando historial...</div>';

  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const res = await fetch(`${API_BASE}/services.php`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (!data.success || !data.services || data.services.length === 0) {
      container.innerHTML = `
                <div class="account-empty">
                    <span style="font-size:2rem; display:block; margin-bottom:0.5rem;">🚲</span>
                    Aún no has traído tu bici a nuestro taller.
                    <br><small>¡Agenda tu cita ahora!</small>
                </div>`;
      return;
    }

    container.innerHTML = data.services.map(svc => `
            <div class="order-card" onclick="toggleServiceDetail(${svc.id})" style="cursor:pointer;">
                <div class="order-header">
                    <div>
                        <h4 style="margin:0; font-size:1rem;">${svc.service_type}</h4>
                        <span style="font-size:0.85rem; color:#64748b;">${svc.bike_model}</span>
                    </div>
                    <div style="text-align:right;">
                        <span class="status-badge status-${svc.status}">${svc.status.replace('_', ' ').toUpperCase()}</span>
                        <div style="font-size:0.75rem; color:#94a3b8; margin-top:0.2rem;">${new Date(svc.entry_date).toLocaleDateString()}</div>
                    </div>
                </div>
                
                <div id="svc-detail-${svc.id}" style="display:none; margin-top:1rem; padding-top:1rem; border-top:1px solid #f1f5f9; animation: fadeIn 0.3s ease;">
                    <p style="color:#475569; font-size:0.9rem; margin-bottom:0.5rem;">
                        <strong>🛠️ Trabajo realizado:</strong><br>
                        ${svc.description || 'Mantenimiento estándar según protocolo.'}
                    </p>
                    
                    ${svc.cost > 0 ? `<p style="font-size:0.9rem;"><strong>💰 Costo:</strong> ${currencyFormat(svc.cost)}</p>` : ''}
                    
                    ${svc.images && svc.images.length > 0 ? `
                        <div style="margin-top:1rem;">
                            <strong style="display:block; margin-bottom:0.5rem; font-size:0.85rem;">📸 Registro Fotográfico:</strong>
                            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap:8px;">
                                ${svc.images.map(img => `
                                    <img src="${img}" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:8px; cursor:zoom-in; border:1px solid #eee;" 
                                         onclick="event.stopPropagation(); window.open(this.src)">
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

  } catch (e) {
    console.error(e);
    container.innerHTML = '<div class="account-empty">Error cargando conexión.</div>';
  }
}

function toggleServiceDetail(id) {
  const el = document.getElementById(`svc-detail-${id}`);
  if (el) {
    const isHidden = el.style.display === 'none';
    el.style.display = isHidden ? 'block' : 'none';
  }
}

// Lógica de alternar búsqueda
document.addEventListener('DOMContentLoaded', () => {
  const searchToggle = document.getElementById('searchToggle');
  const searchWrapper = document.querySelector('.search-wrapper');
  const searchInput = document.getElementById('searchInput');

  if (searchToggle && searchWrapper) {
    searchToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      searchWrapper.classList.toggle('active');
      if (searchWrapper.classList.contains('active')) {
        searchInput.focus();
      }
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!searchWrapper.contains(e.target) && searchWrapper.classList.contains('active')) {
        searchWrapper.classList.remove('active');
      }
    });

    // Cerrar con tecla 'Enter' dentro del input
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          searchWrapper.classList.remove('active');
          // Opcional: Desplazar a productos
          const prodSection = document.getElementById('productos');
          if (prodSection) prodSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }
});
