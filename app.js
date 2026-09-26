// ===============================
// متجر تسوق - app.js
// ===============================

const products = [
  {
    id: 1,
    name: "ساعة كلاسيكية",
    category: "إكسسوارات",
    price: 85000,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    description: "ساعة أنيقة بتصميم كلاسيكي مناسبة للاستخدام اليومي والمناسبات."
  },
  {
    id: 2,
    name: "حذاء رياضي",
    category: "أزياء",
    price: 65000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    description: "حذاء رياضي مريح وخفيف مناسب للمشي والرياضة."
  },
  {
    id: 3,
    name: "سماعات لاسلكية",
    category: "إلكترونيات",
    price: 79000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    description: "سماعات لاسلكية بصوت واضح وتصميم عصري."
  },
  {
    id: 4,
    name: "حقيبة جلد",
    category: "أزياء",
    price: 110000,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    description: "حقيبة جلد أنيقة وعملية للاستخدام اليومي."
  },
  {
    id: 5,
    name: "نظارة شمسية",
    category: "إكسسوارات",
    price: 45000,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    description: "نظارة شمسية بتصميم عصري وأنيق."
  },
  {
    id: 6,
    name: "كاميرا صغيرة",
    category: "إلكترونيات",
    price: 320000,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    description: "كاميرا صغيرة للتصوير اليومي وصناعة المحتوى."
  },
  {
    id: 7,
    name: "عطر فاخر",
    category: "عطور",
    price: 95000,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
    description: "عطر فاخر برائحة مميزة وثابتة."
  },
  {
    id: 8,
    name: "قميص أنيق",
    category: "أزياء",
    price: 55000,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80",
    description: "قميص أنيق ومريح مناسب للإطلالات اليومية."
  }
];

let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

const productGrid = document.querySelector("#productGrid");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const searchInput = document.querySelector("#searchInput");


// ===============================
// تنسيق السعر
// ===============================

function formatPrice(price) {
  return new Intl.NumberFormat("ar-IQ").format(price) + " د.ع";
}


// ===============================
// عرض المنتجات
// ===============================

function displayProducts(list = products) {

  if (!productGrid) return;

  if (list.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-products">
        <h3>لم يتم العثور على منتجات</h3>
        <p>جرب البحث عن منتج آخر.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = list.map(product => {

    return `
      <article class="product-card">

        <div class="product-image">
          <img 
            src="${product.image}" 
            alt="${product.name}"
            loading="lazy"
          >
        </div>

        <div class="product-info">

          <span class="product-category">
            ${product.category}
          </span>

          <h3>${product.name}</h3>

          <p class="product-description">
            ${product.description}
          </p>

          <div class="product-bottom">

            <strong>
              ${formatPrice(product.price)}
            </strong>

            <button 
              class="add-to-cart"
              onclick="addToCart(${product.id})"
            >
              🛒 أضف للسلة
            </button>

          </div>

        </div>

      </article>
    `;

  }).join("");
}


// ===============================
// إضافة للسلة
// ===============================

function addToCart(id) {

  const product = products.find(p => p.id === id);

  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {

    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });

  }

  saveCart();

  showToast(`تمت إضافة ${product.name} للسلة 🛒`);
}


// ===============================
// حفظ السلة
// ===============================

function saveCart() {

  localStorage.setItem(
    "shoppingCart",
    JSON.stringify(cart)
  );

  updateCart();
}


// ===============================
// تحديث السلة
// ===============================

function updateCart() {

  const totalQuantity = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cartCount) {
    cartCount.textContent = totalQuantity;
  }

  if (cartTotal) {
    cartTotal.textContent = formatPrice(totalPrice);
  }

  renderCart();
}


// ===============================
// عرض السلة
// ===============================

function renderCart() {

  if (!cartItems) return;

  if (cart.length === 0) {

    cartItems.innerHTML = `
      <div class="empty-cart">
        <div>🛒</div>
        <h3>السلة فارغة</h3>
        <p>أضف بعض المنتجات للبدء.</p>
      </div>
    `;

    return;
  }

  cartItems.innerHTML = cart.map(item => {

    return `
      <div class="cart-item">

        <img 
          src="${item.image}"
          alt="${item.name}"
        >

        <div class="cart-item-info">

          <h4>${item.name}</h4>

          <strong>
            ${formatPrice(item.price)}
          </strong>

          <div class="quantity-controls">

            <button onclick="changeQuantity(${item.id}, 1)">
              +
            </button>

            <span>${item.quantity}</span>

            <button onclick="changeQuantity(${item.id}, -1)">
              −
            </button>

          </div>

          <button 
            class="remove-item"
            onclick="removeFromCart(${item.id})"
          >
            حذف
          </button>

        </div>

      </div>
    `;

  }).join("");
}


// ===============================
// تغيير الكمية
// ===============================

function changeQuantity(id, change) {

  const item = cart.find(item => item.id === id);

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {

    cart = cart.filter(
      item => item.id !== id
    );

  }

  saveCart();
}


// ===============================
// حذف من السلة
// ===============================

function removeFromCart(id) {

  cart = cart.filter(
    item => item.id !== id
  );

  saveCart();

  showToast("تم حذف المنتج من السلة");
}


// ===============================
// البحث
// ===============================

function searchProducts() {

  const query = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  if (!query) {

    displayProducts(products);
    return;

  }

  const results = products.filter(product => {

    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );

  });

  displayProducts(results);
}


// ===============================
// البحث أثناء الكتابة
// ===============================

if (searchInput) {

  searchInput.addEventListener(
    "input",
    searchProducts
  );

}


// ===============================
// التصنيفات
// ===============================

function filterCategory(category) {

  if (category === "الكل") {

    displayProducts(products);
    return;

  }

  const filtered = products.filter(
    product => product.category === category
  );

  displayProducts(filtered);
}


// ===============================
// تفاصيل المنتج
// ===============================

function showProductDetails(id) {

  const product = products.find(
    product => product.id === id
  );

  if (!product) return;

  const modal = document.querySelector("#productModal");

  if (!modal) return;

  modal.innerHTML = `

    <div class="modal-content">

      <button 
        class="close-modal"
        onclick="closeModal()"
      >
        ×
      </button>

      <img 
        src="${product.image}"
        alt="${product.name}"
      >

      <span>${product.category}</span>

      <h2>${product.name}</h2>

      <p>${product.description}</p>

      <h3>
        ${formatPrice(product.price)}
      </h3>

      <button 
        class="add-to-cart"
        onclick="addToCart(${product.id}); closeModal();"
      >
        🛒 أضف للسلة
      </button>

    </div>

  `;

  modal.classList.add("active");
}


// ===============================
// إغلاق النافذة
// ===============================

function closeModal() {

  const modal = document.querySelector("#productModal");

  if (modal) {
    modal.classList.remove("active");
  }

}


// ===============================
// فتح وإغلاق السلة
// ===============================

function openCart() {

  const cartDrawer =
    document.querySelector("#cartDrawer");

  if (cartDrawer) {
    cartDrawer.classList.add("active");
  }

}


function closeCart() {

  const cartDrawer =
    document.querySelector("#cartDrawer");

  if (cartDrawer) {
    cartDrawer.classList.remove("active");
  }

}


// ===============================
// صفحة الدفع
// ===============================

function openCheckout() {

  if (cart.length === 0) {

    showToast("السلة فارغة");
    return;

  }

  const checkout =
    document.querySelector("#checkoutModal");

  if (checkout) {
    checkout.classList.add("active");
  }

}


function closeCheckout() {

  const checkout =
    document.querySelector("#checkoutModal");

  if (checkout) {
    checkout.classList.remove("active");
  }

}


// ===============================
// إرسال الطلب
// ===============================

function submitOrder(event) {

  event.preventDefault();

  if (cart.length === 0) {

    showToast("السلة فارغة");
    return;

  }

  const name =
    document.querySelector("#customerName")?.value;

  const phone =
    document.querySelector("#customerPhone")?.value;

  const address =
    document.querySelector("#customerAddress")?.value;

  if (!name || !phone || !address) {

    showToast("يرجى ملء جميع المعلومات");
    return;

  }

  const orderNumber =
    "ORD-" +
    Date.now().toString().slice(-8);

  console.log("طلب جديد:", {
    orderNumber,
    name,
    phone,
    address,
    products: cart
  });

  cart = [];

  saveCart();

  closeCheckout();
  closeCart();

  showToast(
    `تم استلام طلبك بنجاح 🎉 رقم الطلب: ${orderNumber}`
  );

}


// ===============================
// رسالة صغيرة
// ===============================

function showToast(message) {

  let toast =
    document.querySelector("#toast");

  if (!toast) {

    toast = document.createElement("div");

    toast.id = "toast";

    document.body.appendChild(toast);

  }

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 3000);

}


// ===============================
// تشغيل المتجر
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    displayProducts(products);

    updateCart();

  }
);


// ===============================
// إتاحة الدوال للـ HTML
// ===============================

window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.searchProducts = searchProducts;
window.filterCategory = filterCategory;
window.showProductDetails = showProductDetails;
window.closeModal = closeModal;
window.openCart = openCart;
window.closeCart = closeCart;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.submitOrder = submitOrder;
