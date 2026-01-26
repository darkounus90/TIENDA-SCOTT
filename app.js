// Usuarios y productos desde API
let products = [];
let currentUser = null;
const API_BASE = 'https://bikeclubpedalazo.online/api'; // URL real del backend en producción

// Función para obtener productos
async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    products = await response.json();
  } catch (err) {
    console.error('Error fetching products:', err);
  }
}

// Función para guardar producto (solo admin)
async function saveProduct(product) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(product)
    });
    if (response.ok) {
      await fetchProducts();
      renderProducts();
      return true;
    } else {
      alert('Error al guardar el producto');
      return false;
    }
  } catch (err) {
    console.error('Error saving product:', err);
    alert('Error de conexión');
    return false;
  }
}

// Función para login
async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      currentUser = data.user;
      updateLoginButton();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error('Error logging in:', err);
    alert('Error de conexión. Verifica que el servidor esté corriendo.');
  }
}

// Función para register
async function registerUser(username, email, password) {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await response.json();
    alert(data.message);
  } catch (err) {
    console.error('Error registering:', err);
  }
}

// Función para guardar usuario actual
function saveCurrentUser() {
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
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

// Actualizar botón de login
function updateLoginButton() {
  const token = localStorage.getItem('token');
  if (token) {
    // Decodificar token para obtener user (simple, en producción usa jwt.decode)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUser = { username: payload.username || 'User', isAdmin: payload.isAdmin };
      loginButton.textContent = `Hola, ${currentUser.username}`;
      if (currentUser.isAdmin) {
        if (!document.getElementById("addProductButton")) {
          const addBtn = document.createElement("button");
          addBtn.id = "addProductButton";
          addBtn.className = "btn-secondary";
          addBtn.textContent = "Agregar Producto";
          loginButton.parentNode.insertBefore(addBtn, loginButton.nextSibling);
          addBtn.addEventListener("click", openAddProduct);
        }
      }
    } catch (err) {
      localStorage.removeItem('token');
      currentUser = null;
      loginButton.textContent = "Login";
    }
  } else {
    currentUser = null;
    loginButton.textContent = "Login";
    const addBtn = document.getElementById("addProductButton");
    if (addBtn) addBtn.remove();
  }
}

// Login/Register
function openLogin() {
  if (localStorage.getItem('token')) {
    // Logout
    localStorage.removeItem('token');
    currentUser = null;
    updateLoginButton();
    alert("Sesión cerrada.");
  } else {
    loginModal.classList.add("cart-modal--open");
  }
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

loginButton.addEventListener("click", openLogin);
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
  const username = formData.get("username");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  await registerUser(username, password);
  closeRegisterModal();
});

// Add Product
addProductForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentUser || !currentUser.isAdmin) {
    alert("No tienes permisos para agregar productos.");
    return;
  }

  const formData = new FormData(addProductForm);
  const newProduct = {
    name: formData.get("name"),
    brand: formData.get("brand"),
    category: formData.get("category"),
    price: Number(formData.get("price")),
    tag: formData.get("tag"),
    use: formData.get("use"),
    stock: Number(formData.get("stock"))
  };

  const imageFile = formData.get("image");
  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function(event) {
      newProduct.image = event.target.result;
      saveProduct(newProduct);
      addProductForm.reset();
      imagePreview.innerHTML = "";
      closeAddProductModal();
      alert("Producto agregado con éxito.");
    };
    reader.readAsDataURL(imageFile);
  } else {
    await saveProduct(newProduct);
    addProductForm.reset();
    imagePreview.innerHTML = "";
    closeAddProductModal();
    alert("Producto agregado con éxito.");
  }
});

// Add Product
const imageUploadArea = document.getElementById("imageUploadArea");
const cancelAddProduct = document.getElementById("cancelAddProduct");

addProductForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentUser || !currentUser.isAdmin) {
    alert("No tienes permisos para agregar productos.");
    return;
  }

  const formData = new FormData(addProductForm);
  const newProduct = {
    name: formData.get("name"),
    brand: formData.get("brand"),
    category: formData.get("category"),
    price: Number(formData.get("price")),
    tag: formData.get("tag"),
    use: formData.get("use"),
    stock: Number(formData.get("stock"))
  };

  const imageFile = formData.get("image");
  if (imageFile) {
    try {
      newProduct.image = await readImageAsBase64(imageFile);
    } catch (err) {
      alert('Error al leer la imagen');
      return;
    }
  }

  if (await saveProduct(newProduct)) {
    addProductForm.reset();
    imagePreview.innerHTML = '<div class="preview-placeholder"><span class="icon">🖼️</span><p>Previsualización de imagen</p></div>';
    closeAddProductModal();
    alert("Producto agregado con éxito.");
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

// Carrito básico
const cartButton = document.getElementById("cartButton");
const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotalElement = document.getElementById("cartTotal");
const cartCountElement = document.getElementById("cartCount");
const checkoutButton = document.getElementById("checkoutButton");

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

// Formulario servicio
const serviceForm = document.getElementById("serviceForm");
const serviceStatus = document.getElementById("serviceStatus");

serviceForm.addEventListener("submit", e => {
  e.preventDefault();
  const formData = new FormData(serviceForm);
  const nombre = formData.get("nombre");

  serviceStatus.textContent = `Gracias ${nombre}, pronto nos pondremos en contacto para confirmar tu cita.`;
  serviceForm.reset();
});

cancelAddProduct.addEventListener("click", () => {
  addProductForm.reset();
  imagePreview.innerHTML = '<div class="preview-placeholder"><span class="icon">🖼️</span><p>Previsualización de imagen</p></div>';
  closeAddProductModal();
});

// Inicializar
(async () => {
  await fetchProducts();
  renderProducts();
  updateLoginButton();
})();
