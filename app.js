// ============================================================
// متجري - التطبيق الرئيسي
// نسخة كاملة + إعدادات لوحة الإدارة
// ============================================================

(function () {

"use strict";

// ============================================================
// معلومات المتجر
// ============================================================

const STORE = {
  name: "متجري",
  whatsapp: "9647839343073",
  phone: "07839343073",
  email: "11akibs@gmail.com"
};

// ============================================================
// Supabase
// ============================================================

const SUPABASE_URL =
  "https://jfazoorxmucevyeysdlg.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_POh-CGx30SGsdELDBUTbHg_0QZrPUHU";

let supabaseClient = null;

try {

  if (window.supabase) {

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

  }

} catch (error) {

  console.error(
    "Supabase initialization error:",
    error
  );

}

// ============================================================
// المنتجات الاحتياطية
// ============================================================

const fallbackProducts = [

  {
    id: 1,
    name: "ساعة كلاسيكية",
    category: "إكسسوارات",
    price: 85000,
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    description:
      "ساعة أنيقة بتصميم كلاسيكي مناسبة للاستخدام اليومي والمناسبات.",
    stock: null,
    active: true,
    sort_order: 0,
    featured: false
  },

  {
    id: 2,
    name: "حذاء رياضي",
    category: "أحذية",
    price: 65000,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    description:
      "حذاء رياضي مريح وخفيف مناسب للمشي والرياضة.",
    stock: null,
    active: true,
    sort_order: 1,
    featured: false
  },

  {
    id: 3,
    name: "سماعات لاسلكية",
    category: "إلكترونيات",
    price: 79000,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    description:
      "سماعات لاسلكية بصوت واضح وتصميم عصري.",
    stock: null,
    active: true,
    sort_order: 2,
    featured: false
  },

  {
    id: 4,
    name: "حقيبة جلد",
    category: "إكسسوارات",
    price: 110000,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    description:
      "حقيبة جلد أنيقة وعملية للاستخدام اليومي.",
    stock: null,
    active: true,
    sort_order: 3,
    featured: false
  },

  {
    id: 5,
    name: "نظارة شمسية",
    category: "إكسسوارات",
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    description:
      "نظارة شمسية بتصميم عصري وأنيق.",
    stock: null,
    active: true,
    sort_order: 4,
    featured: false
  },

  {
    id: 6,
    name: "كاميرا صغيرة",
    category: "إلكترونيات",
    price: 320000,
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    description:
      "كاميرا صغيرة للتصوير اليومي وصناعة المحتوى.",
    stock: null,
    active: true,
    sort_order: 5,
    featured: false
  },

  {
    id: 7,
    name: "عطر فاخر",
    category: "عطور",
    price: 95000,
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
    description:
      "عطر فاخر برائحة مميزة وثابتة.",
    stock: null,
    active: true,
    sort_order: 6,
    featured: false
  },

  {
    id: 8,
    name: "قميص أنيق",
    category: "ملابس",
    price: 55000,
    image:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80",
    description:
      "قميص أنيق ومريح مناسب للإطلالات اليومية.",
    stock: null,
    active: true,
    sort_order: 7,
    featured: false
  }

];

let products = [...fallbackProducts];

let categories = [];

// ============================================================
// إعدادات المتجر
// ============================================================

let storeSettings = {

  product_layout: "grid",

  products_layout: "grid",

  products_per_row: 2,

  products_per_row_mobile: 2,

  products_per_row_desktop: 4,

  category_layout: "horizontal",

  show_categories: true,

  show_featured: true

};

// ============================================================
// حالة التطبيق
// ============================================================

let cart = readCart();

let currentCustomer = null;

let currentCategory = "الكل";

let currentSearch = "";

let isSubmittingOrder = false;

// ============================================================
// أدوات
// ============================================================

function $(selector) {
  return document.querySelector(selector);
}

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

function formatPrice(price) {

  const number =
    Number(price) || 0;

  return (
    new Intl.NumberFormat("ar-IQ")
      .format(number) +
    " د.ع"
  );

}

function formatDate(date) {

  try {

    return new Intl.DateTimeFormat(
      "ar-IQ",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    ).format(new Date(date));

  } catch {

    return "";

  }

}

// ============================================================
// اسم المتجر
// ============================================================

function applyStoreName() {

  document.title =
    `${STORE.name} | متجر إلكتروني`;

  document
    .querySelectorAll("*")
    .forEach(element => {

      if (
        element.children.length === 0 &&
        typeof element.textContent === "string" &&
        element.textContent.includes("سوقي")
      ) {

        element.textContent =
          element.textContent.replaceAll(
            "سوقي",
            STORE.name
          );

      }

    });

}

// ============================================================
// إعدادات المتجر
// ============================================================

async function loadStoreSettings() {

  if (!supabaseClient) {
    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("store_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

    if (error) {

      console.error(
        "Store settings error:",
        error
      );

      return;

    }

    if (data) {

      storeSettings = {
        ...storeSettings,
        ...data
      };

    }

    applyStoreSettings();

  } catch (error) {

    console.error(
      "Store settings exception:",
      error
    );

  }

}

function applyStoreSettings() {

  const grid =
    $("#productsGrid");

  if (!grid) {
    return;
  }

  const layout =
    storeSettings.products_layout ||
    storeSettings.product_layout ||
    "grid";

  const mobileColumns =
    Number(
      storeSettings.products_per_row_mobile
    ) ||
    2;

  const desktopColumns =
    Number(
      storeSettings.products_per_row_desktop
    ) ||
    Number(
      storeSettings.products_per_row
    ) ||
    4;

  grid.dataset.layout =
    layout;

  grid.style.setProperty(
    "--products-mobile-columns",
    mobileColumns
  );

  grid.style.setProperty(
    "--products-desktop-columns",
    desktopColumns
  );

  if (layout === "list") {

    grid.classList.add(
      "products-list-view"
    );

  } else {

    grid.classList.remove(
      "products-list-view"
    );

  }

  applyCategoryVisibility();

}

function applyCategoryVisibility() {

  const categoriesSection =
    document.querySelector(
      "#categoriesSection"
    );

  if (!categoriesSection) {
    return;
  }

  if (
    storeSettings.show_categories === false
  ) {

    categoriesSection.style.display =
      "none";

  } else {

    categoriesSection.style.display =
      "";

  }

}

// ============================================================
// السلة
// ============================================================

function readCart() {

  try {

    const saved =
      localStorage.getItem(
        "shoppingCart"
      );

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch {

    return [];

  }

}

function saveCart() {

  localStorage.setItem(
    "shoppingCart",
    JSON.stringify(cart)
  );

  updateCart();

}

function getCartTotal() {

  return cart.reduce(
    (total, item) => {

      return (
        total +
        Number(item.price || 0) *
        Number(item.quantity || 0)
      );

    },
    0
  );

}

function updateCart() {

  const countElement =
    $("#cartCount");

  const totalElement =
    $("#cartTotal");

  const count =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );

  if (countElement) {

    countElement.textContent =
      count;

  }

  if (totalElement) {

    totalElement.textContent =
      formatPrice(
        getCartTotal()
      );

  }

  renderCartItems();

}

function addToCart(id) {

  const product =
    products.find(
      p =>
        Number(p.id) ===
        Number(id)
    );

  if (!product) {

    showToast(
      "المنتج غير موجود"
    );

    return;

  }

  const stock =
    Number.isFinite(
      Number(product.stock)
    )
      ? Number(product.stock)
      : null;

  if (
    stock !== null &&
    stock <= 0
  ) {

    showToast(
      "هذا المنتج غير متوفر"
    );

    return;

  }

  const existing =
    cart.find(
      item =>
        Number(item.id) ===
        Number(id)
    );

  if (existing) {

    const newQuantity =
      Number(existing.quantity) + 1;

    if (
      stock !== null &&
      newQuantity > stock
    ) {

      showToast(
        `المتوفر فقط ${stock} قطعة`
      );

      return;

    }

    existing.quantity =
      newQuantity;

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price:
        Number(product.price) || 0,

      image: product.image,

      quantity: 1

    });

  }

  saveCart();

  showToast(
    `تمت إضافة ${product.name} إلى السلة ✅`
  );

}

function changeQuantity(id, change) {

  const item =
    cart.find(
      i =>
        Number(i.id) ===
        Number(id)
    );

  if (!item) {
    return;
  }

  const product =
    products.find(
      p =>
        Number(p.id) ===
        Number(id)
    );

  const stock =
    product &&
    Number.isFinite(
      Number(product.stock)
    )
      ? Number(product.stock)
      : null;

  const newQuantity =
    Number(item.quantity) +
    Number(change);

  if (
    stock !== null &&
    newQuantity > stock
  ) {

    showToast(
      `المتوفر فقط ${stock} قطعة`
    );

    return;

  }

  if (newQuantity <= 0) {

    cart =
      cart.filter(
        i =>
          Number(i.id) !==
          Number(id)
      );

  } else {

    item.quantity =
      newQuantity;

  }

  saveCart();

}

function removeFromCart(id) {

  cart =
    cart.filter(
      item =>
        Number(item.id) !==
        Number(id)
    );

  saveCart();

  showToast(
    "تم حذف المنتج من السلة"
  );

}

function cleanInvalidCartItems() {

  const validIds =
    new Set(
      products.map(
        product =>
          Number(product.id)
      )
    );

  cart =
    cart.filter(
      item =>
        validIds.has(
          Number(item.id)
        )
    );

  localStorage.setItem(
    "shoppingCart",
    JSON.stringify(cart)
  );

}

function renderCartItems() {

  const box =
    $("#cartItems");

  if (!box) {
    return;
  }

  if (!cart.length) {

    box.innerHTML = `
      <div style="text-align:center;padding:35px 10px;color:#777;">
        <div style="font-size:45px;margin-bottom:10px;">🛒</div>
        <h3>السلة فارغة</h3>
        <p>أضف بعض المنتجات حتى تظهر هنا.</p>
      </div>
    `;

    return;

  }

  box.innerHTML =
    cart
      .map(item => {

        const product =
          products.find(
            p =>
              Number(p.id) ===
              Number(item.id)
          );

        const stock =
          product &&
          Number.isFinite(
            Number(product.stock)
          )
            ? Number(product.stock)
            : null;

        return `
          <div class="cart-item">

            <img
              src="${escapeHtml(item.image)}"
              alt="${escapeHtml(item.name)}"
              onerror="this.style.display='none'"
            >

            <div class="cart-item-info">

              <div class="cart-item-name">
                ${escapeHtml(item.name)}
              </div>

              <div class="cart-item-price">
                ${formatPrice(
                  Number(item.price) *
                  Number(item.quantity)
                )}
              </div>

              <div class="quantity-controls">

                <button
                  type="button"
                  onclick="changeQuantity(${Number(item.id)}, 1)"
                >
                  +
                </button>

                <span>
                  ${Number(item.quantity)}
                </span>

                <button
                  type="button"
                  onclick="changeQuantity(${Number(item.id)}, -1)"
                >
                  −
                </button>

                <button
                  type="button"
                  class="remove-item"
                  onclick="removeFromCart(${Number(item.id)})"
                >
                  حذف
                </button>

              </div>

              ${
                stock !== null
                  ? `<small>المتوفر: ${stock}</small>`
                  : ""
              }

            </div>

          </div>
        `;

      })
      .join("");

}

// ============================================================
// الأقسام
// ============================================================

async function loadCategoriesFromSupabase() {

  if (!supabaseClient) {
    return false;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("categories")
        .select(
          "id,name,image_url,active,sort_order,display_style"
        )
        .eq(
          "active",
          true
        )
        .order(
          "sort_order",
          {
            ascending: true
          }
        )
        .order(
          "id",
          {
            ascending: true
          }
        );

    if (error) {

      console.error(
        "Categories loading error:",
        error
      );

      return false;

    }

    categories =
      Array.isArray(data)
        ? data
        : [];

    renderCategories();

    return true;

  } catch (error) {

    console.error(
      "Categories exception:",
      error
    );

    return false;

  }

}

function renderCategories() {

  const container =
    document.querySelector(
      "#categoriesGrid"
    );

  if (!container) {
    return;
  }

  const layout =
    storeSettings.category_layout ||
    "horizontal";

  container.dataset.layout =
    layout;

  const buttons = [

    `
      <button
        class="category active"
        type="button"
        onclick="filterCategory('الكل', this)"
      >
        <span>🛍️</span>
        <span>الكل</span>
      </button>
    `

  ];

  categories.forEach(category => {

    buttons.push(`
      <button
        class="category"
        type="button"
        onclick="filterCategory('${escapeHtml(category.name)}', this)"
      >

        ${
          category.image_url
            ? `
              <img
                src="${escapeHtml(category.image_url)}"
                alt="${escapeHtml(category.name)}"
                onerror="this.style.display='none'"
              >
            `
            : `
              <span>📦</span>
            `
        }

        <span>
          ${escapeHtml(category.name)}
        </span>

      </button>
    `);

  });

  container.innerHTML =
    buttons.join("");

  applyCategoryVisibility();

}

// ============================================================
// البحث والتصنيف
// ============================================================

function getVisibleProducts() {

  let result =
    [...products];

  if (
    currentCategory !==
    "الكل"
  ) {

    result =
      result.filter(
        product =>
          product.category ===
          currentCategory
      );

  }

  if (
    currentSearch.trim()
  ) {

    const query =
      currentSearch
        .trim()
        .toLowerCase();

    result =
      result.filter(
        product => {

          const text =
            [
              product.name,
              product.category,
              product.description
            ]
              .join(" ")
              .toLowerCase();

          return text.includes(
            query
          );

        }
      );

  }

  return result;

}

function refreshProducts() {

  displayProducts(
    getVisibleProducts()
  );

}

function searchProducts() {

  currentSearch =
    $("#searchInput")?.value ||
    "";

  refreshProducts();

}

function filterCategory(
  category,
  button
) {

  currentCategory =
    category || "الكل";

  document
    .querySelectorAll(
      ".category"
    )
    .forEach(item =>
      item.classList.remove(
        "active"
      )
    );

  if (button) {

    button.classList.add(
      "active"
    );

  }

  refreshProducts();

}

function resetProductFilters() {

  currentCategory =
    "الكل";

  currentSearch =
    "";

  if ($("#searchInput")) {

    $("#searchInput").value =
      "";

  }

  document
    .querySelectorAll(
      ".category"
    )
    .forEach(
      (item, index) => {

        item.classList.toggle(
          "active",
          index === 0
        );

      }
    );

  refreshProducts();

}

// ============================================================
// المنتجات المميزة
// ============================================================

function getFeaturedProducts() {

  if (
    storeSettings.show_featured === false
  ) {

    return [];

  }

  return products.filter(
    product =>
      product.featured === true
  );

}

// ============================================================
// عرض المنتجات
// ============================================================

function displayProducts(
  list = products
) {

  const grid =
    $("#productsGrid");

  if (!grid) {
    return;
  }

  applyStoreSettings();

  if (!list.length) {

    grid.innerHTML = `
      <div class="empty-products">
        <div>🔎</div>
        <h3>لم يتم العثور على منتجات</h3>
        <p>جرّب البحث بكلمة أخرى.</p>

        <button
          class="details-button"
          type="button"
          onclick="resetProductFilters()"
        >
          عرض كل المنتجات
        </button>
      </div>
    `;

    return;

  }

  grid.innerHTML =
    list
      .map(product => {

        const stock =
          Number.isFinite(
            Number(product.stock)
          )
            ? Number(product.stock)
            : null;

        const outOfStock =
          stock !== null &&
          stock <= 0;

        const lowStock =
          stock !== null &&
          stock > 0 &&
          stock <= 3;

        return `
          <article class="product-card">

            ${
              product.featured
                ? `
                  <div class="featured-badge">
                    ⭐ مميز
                  </div>
                `
                : ""
            }

            <div
              class="product-image"
              onclick="showProductDetails(${Number(product.id)})"
            >

              <img
                src="${escapeHtml(product.image)}"
                alt="${escapeHtml(product.name)}"
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/800x800?text=Product'"
              >

            </div>

            <div class="product-info">

              <span class="product-category">
                ${escapeHtml(product.category)}
              </span>

              <h3>
                ${escapeHtml(product.name)}
              </h3>

              <p class="price">
                ${formatPrice(product.price)}
              </p>

              ${
                stock !== null
                  ? `
                    <div class="product-stock">
                      ${
                        outOfStock
                          ? "❌ نفد المخزون"
                          : lowStock
                          ? `⚠️ متبقي ${stock} فقط`
                          : `📦 متوفر: ${stock}`
                      }
                    </div>
                  `
                  : ""
              }

              <div class="product-actions">

                <button
                  class="details-button"
                  type="button"
                  onclick="showProductDetails(${Number(product.id)})"
                >
                  التفاصيل
                </button>

                <button
                  class="add-button"
                  type="button"
                  ${
                    outOfStock
                      ? "disabled"
                      : ""
                  }
                  onclick="addToCart(${Number(product.id)})"
                >
                  ${
                    outOfStock
                      ? "نفد المخزون"
                      : "🛒 أضف للسلة"
                  }
                </button>

              </div>

            </div>

          </article>
        `;

      })
      .join("");

}

// ============================================================
// تفاصيل المنتج
// ============================================================

function showProductDetails(id) {

  const product =
    products.find(
      p =>
        Number(p.id) ===
        Number(id)
    );

  if (!product) {
    return;
  }

  const modal =
    $("#productModal");

  const details =
    $("#productDetails");

  if (!modal || !details) {
    return;
  }

  const stock =
    Number.isFinite(
      Number(product.stock)
    )
      ? Number(product.stock)
      : null;

  const outOfStock =
    stock !== null &&
    stock <= 0;

  details.innerHTML = `
    <div class="product-detail">

      <img
        src="${escapeHtml(product.image)}"
        alt="${escapeHtml(product.name)}"
      >

      <div>

        <span class="product-category">
          ${escapeHtml(product.category)}
        </span>

        <h2>
          ${escapeHtml(product.name)}
        </h2>

        <p>
          ${escapeHtml(product.description)}
        </p>

        ${
          stock !== null
            ? `
              <p>
                ${
                  outOfStock
                    ? "❌ المنتج غير متوفر"
                    : `📦 المخزون: ${stock}`
                }
              </p>
            `
            : ""
        }

        <div class="price">
          ${formatPrice(product.price)}
        </div>

        <button
          class="add-button"
          type="button"
          ${
            outOfStock
              ? "disabled"
              : ""
          }
          onclick="
            addToCart(${Number(product.id)});
            closeProductModal();
          "
        >
          ${
            outOfStock
              ? "نفد المخزون"
              : "🛒 أضف للسلة"
          }
        </button>

      </div>

    </div>
  `;

  modal.classList.add(
    "show"
  );

}

function closeProductModal() {

  $("#productModal")
    ?.classList.remove(
      "show"
    );

}

// ============================================================
// النوافذ
// ============================================================

function openCart() {

  updateCart();

  $("#cartDrawer")
    ?.classList.add(
      "open"
    );

  $("#overlay")
    ?.classList.add(
      "show"
    );

}

function closeCart() {

  $("#cartDrawer")
    ?.classList.remove(
      "open"
    );

  $("#overlay")
    ?.classList.remove(
      "show"
    );

}

function openCheckout() {

  if (!cart.length) {

    showToast(
      "السلة فارغة"
    );

    return;

  }

  fillCheckoutFromProfile();

  $("#checkoutModal")
    ?.classList.add(
      "show"
    );

}

function closeCheckout() {

  $("#checkoutModal")
    ?.classList.remove(
      "show"
    );

}

function openSupport() {

  $("#supportModal")
    ?.classList.add(
      "show"
    );

}

function closeSupport() {

  $("#supportModal")
    ?.classList.remove(
      "show"
    );

}

function closeAll() {

  closeCart();

  closeCheckout();

  closeProductModal();

  closeSupport();

  closeAccount();

}

// ============================================================
// حساب الزبون
// ============================================================

function openAccount() {

  const modal =
    $("#accountModal");

  if (!modal) {

    showToast(
      "نافذة الحساب غير موجودة"
    );

    return;

  }

  modal.classList.add(
    "show"
  );

  if (currentCustomer) {

    showCustomerAccount();

  } else {

    showLogin();

  }

}

function closeAccount() {

  $("#accountModal")
    ?.classList.remove(
      "show"
    );

}

function showLogin() {

  $("#customerLogin")
    ?.style.setProperty(
      "display",
      "block"
    );

  $("#customerRegister")
    ?.style.setProperty(
      "display",
      "none"
    );

  $("#customerProfile")
    ?.style.setProperty(
      "display",
      "none"
    );

  setCustomerMessage(
    "customerLoginMessage",
    ""
  );

}

function showRegister() {

  $("#customerLogin")
    ?.style.setProperty(
      "display",
      "none"
    );

  $("#customerRegister")
    ?.style.setProperty(
      "display",
      "block"
    );

  $("#customerProfile")
    ?.style.setProperty(
      "display",
      "none"
    );

  setCustomerMessage(
    "customerRegisterMessage",
    ""
  );

}

function showCustomerAccount() {

  $("#customerLogin")
    ?.style.setProperty(
      "display",
      "none"
    );

  $("#customerRegister")
    ?.style.setProperty(
      "display",
      "none"
    );

  $("#customerProfile")
    ?.style.setProperty(
      "display",
      "block"
    );

  const profile =
    currentCustomer?.profile ||
    {};

  const name =
    profile.full_name ||
    currentCustomer?.email ||
    "الزبون";

  const profileName =
    $("#customerProfileName");

  if (profileName) {

    profileName.textContent =
      `مرحباً ${name} 👋`;

  }

  renderAccountHome();

}

function updateAccountButton() {

  const button =
    $(".account-btn");

  if (!button) {
    return;
  }

  if (currentCustomer) {

    const profile =
      currentCustomer.profile;

    const name =
      profile?.full_name;

    button.textContent =
      name
        ? `👤 ${name}`
        : "👤 حسابي";

  } else {

    button.textContent =
      "👤 حسابي";

  }

}

// ============================================================
// الصفحة الداخلية للحساب
// ============================================================

function renderAccountHome() {

  const box =
    $("#customerAccountDetails");

  if (!box) {
    return;
  }

  const profile =
    currentCustomer?.profile ||
    {};

  const name =
    profile.full_name ||
    currentCustomer?.email ||
    "الزبون";

  box.innerHTML = `
    <div style="margin-top:15px;">

      <div style="
        background:#f7f5ff;
        padding:14px;
        border-radius:12px;
        margin-bottom:12px;
      ">

        <strong>
          👋 ${escapeHtml(name)}
        </strong>

        <div style="color:#777;margin-top:5px;">
          ${escapeHtml(
            currentCustomer?.email ||
            ""
          )}
        </div>

      </div>

      <p style="margin-bottom:12px;">
        من هنا تقدر تدير بياناتك وتشوف طلباتك.
      </p>

    </div>
  `;

}

// ============================================================
// بيانات الحساب
// ============================================================

function showCustomerData() {

  if (!currentCustomer) {

    showLogin();

    return;

  }

  const box =
    $("#customerAccountDetails");

  if (!box) {
    return;
  }

  const profile =
    currentCustomer.profile ||
    {};

  box.innerHTML = `
    <div style="margin-top:15px;">

      <h3 style="margin-bottom:12px;">
        👤 بياناتي
      </h3>

      <label>
        الاسم الكامل
      </label>

      <input
        type="text"
        id="customerFullName"
        value="${escapeHtml(
          profile.full_name || ""
        )}"
        placeholder="الاسم الكامل"
      >

      <label>
        رقم الهاتف
      </label>

      <input
        type="tel"
        id="customerProfilePhone"
        value="${escapeHtml(
          profile.phone || ""
        )}"
        placeholder="07XXXXXXXXX"
      >

      <label>
        المحافظة / المدينة
      </label>

      <input
        type="text"
        id="customerProfileCity"
        value="${escapeHtml(
          profile.city || ""
        )}"
        placeholder="المحافظة / المدينة"
      >

      <label>
        العنوان
      </label>

      <textarea
        id="customerProfileAddress"
        placeholder="العنوان بالتفصيل"
      >${escapeHtml(
        profile.address || ""
      )}</textarea>

      <button
        class="checkout-button"
        type="button"
        onclick="saveCustomerProfile()"
      >
        💾 حفظ البيانات
      </button>

      <button
        class="secondary-account-btn"
        type="button"
        onclick="renderAccountHome()"
      >
        رجوع
      </button>

    </div>
  `;

}

function fillCheckoutFromProfile() {

  const profile =
    currentCustomer?.profile;

  if (!profile) {
    return;
  }

  if (
    $("#customerName") &&
    profile.full_name
  ) {

    $("#customerName").value =
      profile.full_name;

  }

  if (
    $("#customerPhone") &&
    profile.phone
  ) {

    $("#customerPhone").value =
      profile.phone;

  }

  if (
    $("#customerCity") &&
    profile.city
  ) {

    $("#customerCity").value =
      profile.city;

  }

  if (
    $("#customerAddress") &&
    profile.address
  ) {

    $("#customerAddress").value =
      profile.address;

  }

}

// ============================================================
// رسائل الحساب
// ============================================================

function setCustomerMessage(
  id,
  message,
  type = ""
) {

  const element =
    $("#" + id);

  if (!element) {
    return;
  }

  element.textContent =
    message || "";

  element.className =
    type || "";

}

// ============================================================
// تحميل بيانات الزبون
// ============================================================

async function loadCustomer(user) {

  if (!user) {

    currentCustomer =
      null;

    updateAccountButton();

    return;

  }

  currentCustomer = {

    id:
      user.id,

    email:
      user.email,

    profile:
      null

  };

  if (!supabaseClient) {

    updateAccountButton();

    return;

  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "customer_profiles"
        )
        .select("*")
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();

    if (error) {

      console.error(
        "Profile loading error:",
        error
      );

    }

    currentCustomer.profile =
      data || null;

    const pendingRaw =
      localStorage.getItem(
        "pendingCustomerProfile"
      );

    if (
      pendingRaw &&
      !currentCustomer.profile
    ) {

      try {

        const pending =
          JSON.parse(
            pendingRaw
          );

        await saveCustomerProfileByValues(
          pending
        );

        localStorage.removeItem(
          "pendingCustomerProfile"
        );

      } catch (error) {

        console.error(
          "Pending profile error:",
          error
        );

      }

    }

    updateAccountButton();

  } catch (error) {

    console.error(
      "Customer loading exception:",
      error
    );

    updateAccountButton();

  }

}

// ============================================================
// تسجيل الدخول
// ============================================================

async function customerLogin() {

  if (!supabaseClient) {

    setCustomerMessage(
      "customerLoginMessage",
      "تعذر الاتصال بالنظام.",
      "error"
    );

    return;

  }

  const email =
    (
      $("#customerEmail")
        ?.value || ""
    ).trim();

  const password =
    $("#customerPassword")
      ?.value || "";

  if (
    !email ||
    !password
  ) {

    setCustomerMessage(
      "customerLoginMessage",
      "اكتب البريد الإلكتروني وكلمة المرور.",
      "error"
    );

    return;

  }

  setCustomerMessage(
    "customerLoginMessage",
    "جاري تسجيل الدخول..."
  );

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .signInWithPassword({

          email,

          password

        });

    if (error) {

      console.error(
        "Login error:",
        error
      );

      setCustomerMessage(
        "customerLoginMessage",
        "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        "error"
      );

      return;

    }

    await loadCustomer(
      data.user
    );

    showCustomerAccount();

    showToast(
      "تم تسجيل الدخول بنجاح ✅"
    );

  } catch (error) {

    console.error(error);

    setCustomerMessage(
      "customerLoginMessage",
      "حدث خطأ أثناء تسجيل الدخول.",
      "error"
    );

  }

}

// ============================================================
// إنشاء الحساب
// ============================================================

async function customerRegister() {

  if (!supabaseClient) {

    setCustomerMessage(
      "customerRegisterMessage",
      "تعذر الاتصال بالنظام.",
      "error"
    );

    return;

  }

  const name =
    (
      $("#registerName")
        ?.value || ""
    ).trim();

  const email =
    (
      $("#registerEmail")
        ?.value || ""
    ).trim();

  const password =
    $("#registerPassword")
      ?.value || "";

  const phone =
    (
      $("#registerPhone")
        ?.value || ""
    ).trim();

  const city =
    (
      $("#registerCity")
        ?.value || ""
    ).trim();

  const address =
    (
      $("#registerAddress")
        ?.value || ""
    ).trim();

  if (
    !name ||
    !email ||
    !password
  ) {

    setCustomerMessage(
      "customerRegisterMessage",
      "يرجى إكمال الاسم والبريد وكلمة المرور.",
      "error"
    );

    return;

  }

  if (
    password.length < 6
  ) {

    setCustomerMessage(
      "customerRegisterMessage",
      "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
      "error"
    );

    return;

  }

  setCustomerMessage(
    "customerRegisterMessage",
    "جاري إنشاء الحساب..."
  );

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .signUp({

          email,

          password

        });

    if (error) {

      console.error(
        "Register error:",
        error
      );

      setCustomerMessage(
        "customerRegisterMessage",
        error.message ||
          "تعذر إنشاء الحساب.",
        "error"
      );

      return;

    }

    if (!data.user) {

      setCustomerMessage(
        "customerRegisterMessage",
        "تعذر إنشاء الحساب.",
        "error"
      );

      return;

    }

    const pendingProfile = {

      full_name:
        name,

      phone:
        phone,

      city:
        city,

      address:
        address

    };

    localStorage.setItem(
      "pendingCustomerProfile",
      JSON.stringify(
        pendingProfile
      )
    );

    if (data.session) {

      await loadCustomer(
        data.user
      );

      await saveCustomerProfileByValues(
        pendingProfile
      );

      localStorage.removeItem(
        "pendingCustomerProfile"
      );

      showCustomerAccount();

      showToast(
        "تم إنشاء الحساب بنجاح ✅"
      );

    } else {

      setCustomerMessage(
        "customerRegisterMessage",
        "تم إنشاء الحساب. افتح بريدك الإلكتروني لتأكيد الحساب ثم سجل الدخول.",
        "success"
      );

    }

  } catch (error) {

    console.error(error);

    setCustomerMessage(
      "customerRegisterMessage",
      "حدث خطأ أثناء إنشاء الحساب.",
      "error"
    );

  }

}

// ============================================================
// حفظ الملف الشخصي
// ============================================================

async function saveCustomerProfileByValues(
  values
) {

  if (
    !currentCustomer ||
    !supabaseClient
  ) {

    return false;

  }

  const profile = {

    user_id:
      currentCustomer.id,

    full_name:
      values.full_name || "",

    phone:
      values.phone || "",

    city:
      values.city || "",

    address:
      values.address || ""

  };

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "customer_profiles"
        )
        .upsert(
          profile
        )
        .select()
        .single();

    if (error) {

      console.error(
        "Profile save error:",
        error
      );

      return false;

    }

    currentCustomer.profile =
      data;

    updateAccountButton();

    return true;

  } catch (error) {

    console.error(error);

    return false;

  }

}

async function saveCustomerProfile() {

  if (!currentCustomer) {

    showLogin();

    return;

  }

  const values = {

    full_name:
      (
        $("#customerFullName")
          ?.value || ""
      ).trim(),

    phone:
      (
        $("#customerProfilePhone")
          ?.value || ""
      ).trim(),

    city:
      (
        $("#customerProfileCity")
          ?.value || ""
      ).trim(),

    address:
      (
        $("#customerProfileAddress")
          ?.value || ""
      ).trim()

  };

  if (!values.full_name) {

    showToast(
      "اكتب اسمك أولاً"
    );

    return;

  }

  const saved =
    await saveCustomerProfileByValues(
      values
    );

  if (!saved) {

    showToast(
      "تعذر حفظ البيانات"
    );

    return;

  }

  showCustomerAccount();

  showToast(
    "تم حفظ بياناتك ✅"
  );

}

// ============================================================
// تسجيل الخروج
// ============================================================

async function customerLogout() {

  try {

    if (supabaseClient) {

      await supabaseClient.auth.signOut();

    }

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  }

  currentCustomer = null;

  localStorage.removeItem(
    "pendingCustomerProfile"
  );

  window.location.replace(
    "./login.html"
  );

}

// ============================================================
// استعادة الجلسة
// ============================================================

async function restoreCustomerSession() {

  if (!supabaseClient) {

    updateAccountButton();

    return;

  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .getSession();

    if (error) {

      console.error(
        "Session error:",
        error
      );

    }

    if (
      data?.session?.user
    ) {

      await loadCustomer(
        data.session.user
      );

    }

    supabaseClient.auth
      .onAuthStateChange(
        async (
          event,
          session
        ) => {

          if (
            session?.user
          ) {

            await loadCustomer(
              session.user
            );

          } else {

            currentCustomer =
              null;

            updateAccountButton();

          }

        }
      );

  } catch (error) {

    console.error(
      "Session restore exception:",
      error
    );

  }

}

// ============================================================
// الطلبات المحلية
// ============================================================

function getLocalCustomerOrders() {

  if (!currentCustomer) {

    return [];

  }

  try {

    const key =
      `customerOrders_${currentCustomer.id}`;

    const saved =
      localStorage.getItem(
        key
      );

    if (!saved) {

      return [];

    }

    const parsed =
      JSON.parse(
        saved
      );

    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch {

    return [];

  }

}

function saveLocalCustomerOrder(
  order
) {

  if (!currentCustomer) {

    return;

  }

  const key =
    `customerOrders_${currentCustomer.id}`;

  const current =
    getLocalCustomerOrders();

  current.unshift(
    order
  );

  localStorage.setItem(
    key,
    JSON.stringify(
      current.slice(
        0,
        50
      )
    )
  );

}

// ============================================================
// طلباتي
// ============================================================

async function showCustomerOrders() {

  if (!currentCustomer) {

    showLogin();

    return;

  }

  const box =
    $("#customerAccountDetails");

  if (!box) {

    return;

  }

  box.innerHTML = `
    <div style="margin-top:15px;">
      <h3>📦 طلباتي</h3>
      <p>جاري تحميل الطلبات...</p>
    </div>
  `;

  let orders = [];

  if (supabaseClient) {

    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .from("orders")
          .select("*")
          .eq(
            "user_id",
            currentCustomer.id
          )
          .order(
            "created_at",
            {
              ascending:
                false
            }
          );

      if (
        !error &&
        Array.isArray(data)
      ) {

        orders =
          data;

      }

    } catch (error) {

      console.error(
        "Remote orders error:",
        error
      );

    }

  }

  if (!orders.length) {

    orders =
      getLocalCustomerOrders();

  }

  if (!orders.length) {

    box.innerHTML = `
      <div style="margin-top:15px;text-align:center;padding:20px;">

        <div style="font-size:45px;">
          📦
        </div>

        <h3>
          لا توجد طلبات
        </h3>

        <p style="color:#777;">
          عندما تشتري منتجًا ستظهر طلباتك هنا.
        </p>

        <button
          class="secondary-account-btn"
          type="button"
          onclick="renderAccountHome()"
        >
          رجوع
        </button>

      </div>
    `;

    return;

  }

  box.innerHTML = `
    <div style="margin-top:15px;">

      <h3 style="margin-bottom:12px;">
        📦 طلباتي
      </h3>

      ${orders
        .map(order => {

          return `
            <div style="
              background:#f7f7fa;
              border-radius:12px;
              padding:14px;
              margin-bottom:10px;
              line-height:1.9;
            ">

              <div>
                <strong>
                  ${escapeHtml(
                    order.order_number ||
                    "طلب"
                  )}
                </strong>
              </div>

              <div>
                الحالة:
                <strong>
                  ${escapeHtml(
                    order.status ||
                    "جديد"
                  )}
                </strong>
              </div>

              <div>
                المجموع:
                <strong>
                  ${formatPrice(
                    order.total
                  )}
                </strong>
              </div>

              ${
                order.created_at
                  ? `
                    <small style="color:#777;">
                      ${escapeHtml(
                        formatDate(
                          order.created_at
                        )
                      )}
                    </small>
                  `
                  : ""
              }

            </div>
          `;

        })
        .join("")}

      <button
        class="secondary-account-btn"
        type="button"
        onclick="renderAccountHome()"
      >
        رجوع
      </button>

    </div>
  `;

}

// ============================================================
// حفظ الطلب في Supabase
// ============================================================

async function saveOrderToSupabase({

  orderNumber,

  name,

  phone,

  city,

  address,

  total

}) {

  if (!supabaseClient) {

    return {

      success:
        false,

      orderId:
        null

    };

  }

  let orderPayload = {

    order_number:
      orderNumber,

    customer_name:
      name,

    phone:
      phone,

    city:
      city,

    address:
      address,

    total:
      total,

    status:
      "جديد"

  };

  if (currentCustomer) {

    orderPayload.user_id =
      currentCustomer.id;

  }

  try {

    let result =
      await supabaseClient
        .from("orders")
        .insert(
          orderPayload
        )
        .select()
        .single();

    if (
      result.error &&
      currentCustomer &&
      Object.prototype.hasOwnProperty.call(
        orderPayload,
        "user_id"
      )
    ) {

      const retryPayload =
        {
          ...orderPayload
        };

      delete retryPayload.user_id;

      result =
        await supabaseClient
          .from("orders")
          .insert(
            retryPayload
          )
          .select()
          .single();

    }

    if (result.error) {

      console.error(
        "Order save error:",
        result.error
      );

      return {

        success:
          false,

        orderId:
          null

      };

    }

    return {

      success:
        true,

      orderId:
        result.data?.id ||
        null

    };

  } catch (error) {

    console.error(error);

    return {

      success:
        false,

      orderId:
        null

    };

  }

}

// ============================================================
// إرسال الطلب
// ============================================================

async function submitOrder(event) {

  event.preventDefault();

  if (isSubmittingOrder) {

    return;

  }

  if (!cart.length) {

    showToast(
      "السلة فارغة"
    );

    return;

  }

  const name =
    (
      $("#customerName")
        ?.value || ""
    ).trim();

  const phone =
    (
      $("#customerPhone")
        ?.value || ""
    ).trim();

  const city =
    (
      $("#customerCity")
        ?.value || ""
    ).trim();

  const address =
    (
      $("#customerAddress")
        ?.value || ""
    ).trim();

  if (
    !name ||
    !phone ||
    !city ||
    !address
  ) {

    showToast(
      "يرجى إكمال جميع معلومات التوصيل"
    );

    return;

  }

  for (const item of cart) {

    const product =
      products.find(
        p =>
          Number(p.id) ===
          Number(item.id)
      );

    if (!product) {
      continue;
    }

    const stock =
      Number.isFinite(
        Number(product.stock)
      )
        ? Number(product.stock)
        : null;

    if (
      stock !== null &&
      Number(item.quantity) >
        stock
    ) {

      showToast(
        `${product.name}: المتوفر فقط ${stock}`
      );

      return;

    }

    if (
      stock !== null &&
      stock <= 0
    ) {

      showToast(
        `${product.name} نفد من المخزون`
      );

      return;

    }

  }

  isSubmittingOrder =
    true;

  const submitButton =
    $("#checkoutForm")
      ?.querySelector(
        'button[type="submit"]'
      );

  const originalText =
    submitButton?.textContent;

  if (submitButton) {

    submitButton.disabled =
      true;

    submitButton.textContent =
      "جاري تسجيل الطلب...";

  }

  try {

    const total =
      getCartTotal();

    const orderNumber =
      "ORD-" +
      Date.now()
        .toString()
        .slice(-8);

    const itemsText =
      cart
        .map(item => {

          return (
            `• ${item.name} × ${item.quantity}` +
            ` = ${formatPrice(
              Number(item.price) *
              Number(item.quantity)
            )}`
          );

        })
        .join("\n");

    const message =
      `طلب جديد من ${STORE.name}\n\n` +
      `رقم الطلب: ${orderNumber}\n` +
      `الاسم: ${name}\n` +
      `الهاتف: ${phone}\n` +
      `المحافظة: ${city}\n` +
      `العنوان: ${address}\n\n` +
      `المنتجات:\n${itemsText}\n\n` +
      `المجموع: ${formatPrice(
        total
      )}`;

    const saved =
      await saveOrderToSupabase({

        orderNumber,

        name,

        phone,

        city,

        address,

        total

      });

    saveLocalCustomerOrder({

      order_number:
        orderNumber,

      status:
        "جديد",

      total:
        total,

      created_at:
        new Date().toISOString()

    });

    localStorage.setItem(
      "lastOrder",
      JSON.stringify({

        orderNumber,

        name,

        phone,

        city,

        address,

        items:
          cart,

        total,

        createdAt:
          new Date().toISOString()

      })
    );

    cart = [];

    saveCart();

    closeCheckout();

    closeCart();

    showToast(
      saved.success
        ? "تم تسجيل الطلب بنجاح ✅"
        : "تم تجهيز الطلب وإرساله ✅"
    );

    const whatsappUrl =
      "https://wa.me/" +
      STORE.whatsapp +
      "?text=" +
      encodeURIComponent(
        message
      );

    setTimeout(() => {

      window.location.href =
        whatsappUrl;

    }, 800);

  } catch (error) {

    console.error(
      "Submit order error:",
      error
    );

    showToast(
      "حدث خطأ أثناء تجهيز الطلب."
    );

  } finally {

    isSubmittingOrder =
      false;

    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.textContent =
        originalText ||
        "تأكيد الطلب";

    }

  }

}

// ============================================================
// تحميل المنتجات من Supabase
// ============================================================

async function loadProductsFromSupabase() {

  if (!supabaseClient) {

    return false;

  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("products")
        .select(
          "id,name,description,price,image_url,stock,active,sort_order,featured,categories(name)"
        )
        .eq(
          "active",
          true
        )
        .order(
          "sort_order",
          {
            ascending:
              true
          }
        )
        .order(
          "id",
          {
            ascending:
              true
          }
        );

    if (error) {

      console.error(
        "Products loading error:",
        error
      );

      return false;

    }

    if (
      !data ||
      !data.length
    ) {

      return false;

    }

    const liveProducts =
      data.map(
        item => ({

          id:
            Number(item.id),

          name:
            String(
              item.name ||
              "منتج"
            ),

          category:
            item.categories?.name ||
            "عام",

          price:
            Number(item.price) ||
            0,

          image:
            item.image_url ||
            "https://via.placeholder.com/800x800?text=Product",

          description:
            String(
              item.description ||
              "لا يوجد وصف للمنتج."
            ),

          stock:
            Number.isFinite(
              Number(item.stock)
            )
              ? Number(item.stock)
              : null,

          active:
            item.active !== false,

          sort_order:
            Number(item.sort_order) || 0,

          featured:
            item.featured === true

        })
      );

    liveProducts.sort(
      (a, b) => {

        if (
          a.sort_order !==
          b.sort_order
        ) {

          return (
            a.sort_order -
            b.sort_order
          );

        }

        return (
          a.id -
          b.id
        );

      }
    );

    if (
      liveProducts.length
    ) {

      products =
        liveProducts;

      cleanInvalidCartItems();

      refreshProducts();

      updateCart();

      return true;

    }

  } catch (error) {

    console.error(
      "Products exception:",
      error
    );

  }

  return false;

}

// ============================================================
// Toast
// ============================================================

function showToast(message) {

  const toast =
    $("#toast");

  if (!toast) {
    return;
  }

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    window.__toastTimer
  );

  window.__toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 3200);

}

// ============================================================
// تشغيل التطبيق
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    applyStoreName();

    displayProducts(
      products
    );

    updateCart();

    updateAccountButton();

    $("#searchInput")
      ?.addEventListener(
        "input",
        searchProducts
      );

    $("#checkoutForm")
      ?.addEventListener(
        "submit",
        submitOrder
      );

    await restoreCustomerSession();

    await loadStoreSettings();

    await loadCategoriesFromSupabase();

    await loadProductsFromSupabase();

    applyStoreSettings();

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Escape"
        ) {

          closeAll();

        }

      }
    );

  }
);

// ============================================================
// إتاحة الدوال للـ HTML
// ============================================================

window.addToCart =
  addToCart;

window.changeQuantity =
  changeQuantity;

window.removeFromCart =
  removeFromCart;

window.searchProducts =
  searchProducts;

window.filterCategory =
  filterCategory;

window.resetProductFilters =
  resetProductFilters;

window.showProductDetails =
  showProductDetails;

window.closeProductModal =
  closeProductModal;

window.openCart =
  openCart;

window.closeCart =
  closeCart;

window.openCheckout =
  openCheckout;

window.closeCheckout =
  closeCheckout;

window.openSupport =
  openSupport;

window.closeSupport =
  closeSupport;

window.closeAll =
  closeAll;

window.openAccount =
  openAccount;

window.closeAccount =
  closeAccount;

window.showLogin =
  showLogin;

window.showRegister =
  showRegister;

window.showCustomerAccount =
  showCustomerAccount;

window.showCustomerData =
  showCustomerData;

window.customerLogin =
  customerLogin;

window.customerRegister =
  customerRegister;

window.customerLogout =
  customerLogout;

window.saveCustomerProfile =
  saveCustomerProfile;

window.showCustomerOrders =
  showCustomerOrders;

window.submitOrder =
  submitOrder;

})();