// ===============================
// سوقي - المتجر الإلكتروني
// ===============================

const STORE = {
  name: "سوقي",
  whatsapp: "9647839343073",
  phone: "07839343073",
  email: "11akibs@gmail.com"
};

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
    category: "أحذية",
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
    category: "إكسسوارات",
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
    category: "ملابس",
    price: 55000,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80",
    description: "قميص أنيق ومريح مناسب للإطلالات اليومية."
  }
];

let cart = JSON.parse(localStorage.getItem("shoppingCart") || "[]");

const $ = (selector) => document.querySelector(selector);

const formatPrice = (price) =>
  new Intl.NumberFormat("ar-IQ").format(price) + " د.ع";


// ===============================
// عرض المنتجات
// ===============================

function displayProducts(list = products) {
  const grid = $("#productsGrid");

  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-products">
        <div>🔎</div>
        <h3>لم يتم العثور على منتجات</h3>
        <p>جرب البحث بكلمة أخرى أو اختر تصنيفاً مختلفاً.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(product => `
    <article class="product-card">

      <div class="product-image">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.style.display='none'; this.parentElement.classList.add('image-error');"
        >
      </div>

      <div class="product-info">

        <span class="product-category">
          ${product.category}
        </span>

        <h3 class="product-name">
          ${product.name}
        </h3>

        <p class="product-description">
          ${product.description}
        </p>

        <div class="product-bottom">

          <strong class="product-price">
            ${formatPrice(product.price)}
          </strong>

          <div class="product-actions">

            <button
              class="details-button"
              onclick="showProductDetails(${product.id})"
            >
              تفاصيل
            </button>

            <button
              class="add-button"
              onclick="addToCart(${product.id})"
            >
              🛒 أضف
            </button>

          </div>

        </div>

      </div>

    </article>
  `).join("");
}


// ===============================
// إضافة للسلة
// ===============================

function addToCart(id) {
  const product = products.find(p => p.id === id);

  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
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
  const count = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if ($("#cartCount")) {
    $("#cartCount").textContent = count;
  }

  if ($("#cartTotal")) {
    $("#cartTotal").textContent = formatPrice(total);
  }

  renderCart();
}


// ===============================
// عرض السلة
// ===============================

function renderCart() {
  const box = $("#cartItems");

  if (!box) return;

  if (!cart.length) {
    box.innerHTML = `
      <div class="empty-cart">
        <div>🛒</div>
        <h3>السلة فارغة</h3>
        <p>أضف المنتجات التي تريد شراءها.</p>
      </div>
    `;
    return;
  }

  box.innerHTML = cart.map(item => `
    <div class="cart-item">

      <img
        src="${item.image}"
        alt="${item.name}"
      >

      <div class="cart-item-info">

        <div class="cart-item-name">
          ${item.name}
        </div>

        <div class="cart-item-price">
          ${formatPrice(item.price * item.quantity)}
        </div>

        <div class="quantity-controls">

          <button
            onclick="changeQuantity(${item.id}, 1)"
          >
            +
          </button>

          <span>
            ${item.quantity}
          </span>

          <button
            onclick="changeQuantity(${item.id}, -1)"
          >
            −
          </button>

          <button
            class="remove-item"
            onclick="removeFromCart(${item.id})"
          >
            حذف
          </button>

        </div>

      </div>

    </div>
  `).join("");
}


// ===============================
// تغيير الكمية
// ===============================

function changeQuantity(id, change) {
  const item = cart.find(i => i.id === id);

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
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
  const query = (
    $("#searchInput")?.value || ""
  ).trim().toLowerCase();

  if (!query) {
    displayProducts(products);
    return;
  }

  const results = products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query)
  );

  displayProducts(results);
}


// ===============================
// التصنيفات
// ===============================

function filterCategory(category, button) {

  document
    .querySelectorAll(".category")
    .forEach(el => el.classList.remove("active"));

  if (button) {
    button.classList.add("active");
  }

  const filtered =
    category === "الكل"
      ? products
      : products.filter(
          product => product.category === category
        );

  displayProducts(filtered);
}


// ===============================
// تفاصيل المنتج
// ===============================

function showProductDetails(id) {

  const product = products.find(
    p => p.id === id
  );

  const modal = $("#productModal");

  const details = $("#productDetails");

  if (!product || !modal || !details) {
    return;
  }

  details.innerHTML = `
    <div class="product-detail">

      <img
        src="${product.image}"
        alt="${product.name}"
      >

      <div>

        <span class="product-category">
          ${product.category}
        </span>

        <h2>
          ${product.name}
        </h2>

        <p>
          ${product.description}
        </p>

        <div class="price">
          ${formatPrice(product.price)}
        </div>

        <button
          class="add-button"
          onclick="addToCart(${product.id}); closeProductModal();"
        >
          🛒 أضف للسلة
        </button>

      </div>

    </div>
  `;

  modal.classList.add("show");
}


// ===============================
// إغلاق تفاصيل المنتج
// ===============================

function closeProductModal() {
  $("#productModal")?.classList.remove("show");
}


// ===============================
// فتح السلة
// ===============================

function openCart() {

  $("#cartDrawer")?.classList.add("open");

  $("#overlay")?.classList.add("show");
}


// ===============================
// إغلاق السلة
// ===============================

function closeCart() {

  $("#cartDrawer")?.classList.remove("open");

  $("#overlay")?.classList.remove("show");
}


// ===============================
// فتح الدفع
// ===============================

function openCheckout() {

  if (!cart.length) {
    showToast("السلة فارغة");
    return;
  }

  $("#checkoutModal")?.classList.add("show");
}


// ===============================
// إغلاق الدفع
// ===============================

function closeCheckout() {
  $("#checkoutModal")?.classList.remove("show");
}


// ===============================
// فتح الدعم
// ===============================

function openSupport() {
  $("#supportModal")?.classList.add("show");
}


// ===============================
// إغلاق الدعم
// ===============================

function closeSupport() {
  $("#supportModal")?.classList.remove("show");
}


// ===============================
// إغلاق كل النوافذ
// ===============================

function closeAll() {
  closeCart();
  closeCheckout();
  closeProductModal();
  closeSupport();
}


// ===============================
// إرسال الطلب
// ===============================

function submitOrder(event) {

  event.preventDefault();

  if (!cart.length) {
    showToast("السلة فارغة");
    return;
  }

  const name = (
    $("#customerName")?.value || ""
  ).trim();

  const phone = (
    $("#customerPhone")?.value || ""
  ).trim();

  const city = (
    $("#customerCity")?.value || ""
  ).trim();

  const address = (
    $("#customerAddress")?.value || ""
  ).trim();

  if (!name || !phone || !city || !address) {
    showToast("يرجى إكمال معلومات التوصيل");
    return;
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const orderNumber =
    "ORD-" +
    Date.now().toString().slice(-8);

  const itemsText = cart.map(item =>
    `• ${item.name} × ${item.quantity} = ${formatPrice(
      item.price * item.quantity
    )}`
  ).join("\n");

  const message =
    `طلب جديد من متجر ${STORE.name}\n\n` +
    `رقم الطلب: ${orderNumber}\n` +
    `الاسم: ${name}\n` +
    `الهاتف: ${phone}\n` +
    `المحافظة: ${city}\n` +
    `العنوان: ${address}\n\n` +
    `المنتجات:\n${itemsText}\n\n` +
    `المجموع: ${formatPrice(total)}`;

  localStorage.setItem(
    "lastOrder",
    JSON.stringify({
      orderNumber,
      name,
      phone,
      city,
      address,
      items: cart,
      total,
      createdAt: new Date().toISOString()
    })
  );

  const whatsappUrl =
    "https://wa.me/" +
    STORE.whatsapp +
    "?text=" +
    encodeURIComponent(message);

  cart = [];

  saveCart();

  closeCheckout();
  closeCart();

  showToast(
    "تم تجهيز الطلب، سيتم فتح واتساب لإرساله ✅"
  );

  setTimeout(() => {
    window.open(
      whatsappUrl,
      "_blank"
    );
  }, 700);
}


// ===============================
// رسالة
// ===============================

function showToast(message) {

  const toast = $("#toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(
    window.__toastTimer
  );

  window.__toastTimer =
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
}


// ===============================
// تشغيل المتجر
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    displayProducts(products);

    updateCart();

    $("#searchInput")?.addEventListener(
      "input",
      searchProducts
    );

    $("#checkoutForm")?.addEventListener(
      "submit",
      submitOrder
    );

    document.addEventListener(
      "keydown",
      event => {

        if (event.key === "Escape") {
          closeAll();
        }

      }
    );

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
window.closeProductModal = closeProductModal;
window.openCart = openCart;
window.closeCart = closeCart;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.openSupport = openSupport;
window.closeSupport = closeSupport;
window.closeAll = closeAll;
window.submitOrder = submitOrder;