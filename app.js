// --- MI CUENTA ---
const accountButton = document.getElementById("accountButton");
const accountModal = document.getElementById("accountModal");
const closeAccount = document.getElementById("closeAccount");
const accountTabs = document.querySelectorAll(".account-tab");
const accountInfoTab = document.getElementById("accountInfoTab");
const accountOrdersTab = document.getElementById("accountOrdersTab");
const accountAddressesTab = document.getElementById("accountAddressesTab");
const ordersList = document.getElementById("ordersList");
const addressesList = document.getElementById("addressesList");
const addAddressBtn = document.getElementById("addAddressBtn");

function openAccountModal(initialTab = "info") {
  // Activate correct tab
  accountTabs.forEach(t => t.classList.remove("active"));
  const targetTabBtn = document.querySelector(`.account-tab[data-tab="${initialTab}"]`);
  if (targetTabBtn) targetTabBtn.classList.add("active");

  // Show correct content
  accountInfoTab.style.display = initialTab === "info" ? "block" : "none";
  accountOrdersTab.style.display = initialTab === "orders" ? "block" : "none";
  accountAddressesTab.style.display = initialTab === "addresses" ? "block" : "none";

  // Render content
  if (initialTab === "info") renderAccountInfo();
  if (initialTab === "orders") renderOrders();
  if (initialTab === "addresses") renderAddresses();

  accountModal.classList.add("cart-modal--open");
  // Reset scroll position to top with delay to ensure layout paint
  setTimeout(() => {
    const content = accountModal.querySelector('.cart-modal__content');
    if (content) content.scrollTop = 0;
  }, 50);
}

function closeAccountModal() {
  accountModal.classList.remove("cart-modal--open");
}

// NOTE: event listener for accountButton removed here as it is hidden/deprecated in favor of dropdown
// accountButton.addEventListener("click", () => openAccountModal("info")); 

closeAccount.addEventListener("click", closeAccountModal);
accountModal.addEventListener("click", e => {
  if (e.target === accountModal) closeAccountModal();
});

accountTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const tabName = tab.dataset.tab;

    // UI Updates
    accountTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    accountInfoTab.style.display = tabName === "info" ? "block" : "none";
    accountOrdersTab.style.display = tabName === "orders" ? "block" : "none";
    accountAddressesTab.style.display = tabName === "addresses" ? "block" : "none";

    // Data Fetching
    if (tabName === "info") renderAccountInfo();
    if (tabName === "orders") renderOrders();
    if (tabName === "addresses") renderAddresses();

    // Reset scroll when switching tabs too
    const content = accountModal.querySelector('.cart-modal__content');
    if (content) content.scrollTop = 0;
  });
});

function renderAccountInfo() {
  if (!currentUser) {
    accountInfoTab.innerHTML = '<div class="account-empty">No has iniciado sesión.</div>';
    return;
  }

  // Premium Form Design
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
    if (!email) {
      alert('El email no puede estar vacío.');
      return;
    }
    const res = await updateUserInfo({ email });
    if (res && res.success) {
      currentUser.email = email;
      alert('✅ Datos actualizados correctamente.');
      // Update local storage if needed or just memory
    } else {
      alert(res && res.message ? res.message : 'Error al actualizar.');
    }
  });
}

// Logic to update user info
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
      // Empty State
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

function renderAddresses() {
  // Placeholder
  addressesList.innerHTML = `
    <div class="account-empty">
      <span class="icon">📍</span>
      <p>No tienes direcciones guardadas.</p>
    </div>
  `;
}

if (addAddressBtn) {
  addAddressBtn.addEventListener("click", () => {
    alert("Funcionalidad de agregar dirección próximamente.");
  });
}
// Usuarios y productos desde API
let products = [];
let currentUser = null;
const API_BASE = 'api'; // Path relativo para producción y desarrollo

// Función para obtener productos
async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE}/products.php`);
    products = await response.json();
  } catch (err) {
    console.error('Error fetching products:', err);
    products = [];
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
      alert('¡Bienvenido, ' + currentUser.username + '!');
    } else {
      alert(data.message || 'Usuario o contraseña incorrectos.');
    }
  } catch (err) {
    console.error('Error logging in:', err);
    alert('Error de conexión con el servidor. Por favor intenta de nuevo.');
  }
}

// Función para register
async function registerUser(username, email, phone, password) {
  try {
    const response = await fetch(`${API_BASE}/register.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, phone, password })
    });
    const data = await response.json();
    if (response.ok && data.success) {
      showRegisterSuccess();
    } else {
      alert(data.message || 'No se pudo crear la cuenta.');
    }
  } catch (err) {
    console.error('Error registering:', err);
    alert('Error de conexión. Intenta nuevamente.');
  }
}

// Mostrar confirmación visual de registro exitoso
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

// Login/Register
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
      p.use.toLowerCase().includes(searchTerm);
    return matchCategory && matchSearch;
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

// Dropdown logic
const userDropdown = document.getElementById("userDropdown");
const menuProfile = document.getElementById("menuProfile");
const menuOrders = document.getElementById("menuOrders");
const menuLogout = document.getElementById("menuLogout");

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!loginButton.contains(e.target) && !userDropdown.contains(e.target)) {
    userDropdown.classList.remove("active");
  }
});

// Menu Actions
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
    // Logged In State
    loginButton.textContent = `Hola, ${currentUser.username} ▾`;
    loginButton.style.display = "inline-block";

    // Hide old explicit account button if visible
    accountButton.style.display = "none";

    // Change click behavior to toggle dropdown
    loginButton.onclick = (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("active");
    };

    if (currentUser.isAdmin) {
      if (!document.getElementById("addProductButton")) {
        const addBtn = document.createElement("button");
        addBtn.id = "addProductButton";
        addBtn.className = "btn-secondary";
        addBtn.textContent = "Admin: Agregar +";
        addBtn.style.backgroundColor = "#fffbeb";
        addBtn.style.color = "#b45309";
        addBtn.style.borderColor = "#fcd34d";
        loginButton.parentNode.insertBefore(addBtn, loginButton);
        addBtn.addEventListener("click", openAddProduct);
      }
    }
  } else {
    // Logged Out State
    currentUser = null;
    loginButton.textContent = "Iniciar Sesión";
    loginButton.style.display = "inline-block";
    accountButton.style.display = "none";
    userDropdown.classList.remove("active");

    // Restore default login behavior
    loginButton.onclick = (e) => {
      e.preventDefault();
      openLogin();
    };

    const addBtn = document.getElementById("addProductButton");
    if (addBtn) addBtn.remove();
  }
}

// Login/Register
// Login/Register
function openLogin() {
  loginModal.classList.add("cart-modal--open");
}

function closeLoginModal() {
  loginModal.classList.remove("cart-modal--open");
}

function openRegister() {
  registerModal.classList.add("cart-modal--open");
}

function closeRegisterModal() {
  registerModal.classList.remove("cart-modal--open");
}

function openAddProduct() {
  addProductModal.classList.add("cart-modal--open");
}

function closeAddProductModal() {
  addProductModal.classList.remove("cart-modal--open");
}

// loginButton listener is now handled in updateLoginButton
closeLogin.addEventListener("click", closeLoginModal);
closeRegister.addEventListener("click", closeRegisterModal);
closeAddProduct.addEventListener("click", closeAddProductModal);

loginModal.addEventListener("click", e => {
  if (e.target === loginModal) closeLoginModal();
});

registerModal.addEventListener("click", e => {
  if (e.target === registerModal) closeRegisterModal();
});

addProductModal.addEventListener("click", e => {
  if (e.target === addProductModal) closeAddProductModal();
});

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
  const result = await registerUser(trimmedUsername, trimmedEmail, trimmedPhone, trimmedPassword);
  if (result === true) {
    closeRegisterModal();
  }
});







// Toggle password visibility
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

// Image upload functionality
imageInput.addEventListener("change", handleImageSelect);

imageUploadArea.addEventListener("click", () => {
  imageInput.click();
});

imageUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  imageUploadArea.classList.add("dragover");
});

imageUploadArea.addEventListener("dragleave", () => {
  imageUploadArea.classList.remove("dragover");
});

imageUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  imageUploadArea.classList.remove("dragover");
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    imageInput.files = files;
    handleImageSelect();
  }
});

function handleImageSelect() {
  const file = imageInput.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("La imagen es demasiado grande. Máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  }
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
const cartItemsContainer = document.getElementById("cartItems"); // Definition added

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

// Checkout (demo)
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



cancelAddProduct.addEventListener("click", () => {
  addProductForm.reset();
  imagePreview.innerHTML = '<div class="preview-placeholder"><span class="icon">🖼️</span><p>Previsualización de imagen</p></div>';
  closeAddProductModal();
});

// Restore Session
async function initSession() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    // Decode basic payload for UI (base64 part of fake JWT)
    const payload = JSON.parse(atob(token.split('.')[0]));
    if (payload && payload.username) {
      currentUser = {
        username: payload.username,
        email: payload.email || '', // Might be missing in old tokens
        isAdmin: payload.isAdmin,
        phone: payload.phone || ''
      };

      // Optional: Verify token validity with backend if needed
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
