// ============================================================
// متجري - المتجر الإلكتروني
// النسخة المحسنة
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
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
  }
} catch (error) {
  console.error("Supabase initialization error:", error);
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
    active: true
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
    active: true
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
    active: true
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
    active: true
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
    active: true
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
    active: true
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
    active: true
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
    active: true
  }
];


// المنتجات الحالية
let products = [...fallbackProducts];


// ============================================================
// حالة التطبيق
// ============================================================

let cart = readCart();

let currentCustomer = null;

let isSubmittingOrder = false;

let currentCategory = "الكل";

let currentSearch = "";


// ============================================================
// أدوات عامة
// ============================================================

const $ = selector =>
  document.querySelector(selector);


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatPrice(price) {

  const number = Number(price) || 0;

  return (
    new Intl.NumberFormat("ar-IQ").format(number) +
    " د.ع"
  );
}


function formatDate(date) {

  try {
    return new Date(date).toLocaleString("ar-IQ");
  } catch {
    return "";
  }
}


function readCart() {

  try {

    const saved =
      localStorage.getItem("shoppingCart");

    const parsed =
      saved ? JSON.parse(saved) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(item =>
        item &&
        Number.isFinite(Number(item.id)) &&
        Number(item.quantity) > 0
      )
      .map(item => ({
        id: Number(item.id),
        name: String(item.name || ""),
        price: Number(item.price) || 0,
        image: String(item.image || ""),
        quantity: Math.max(
          1,
          parseInt(item.quantity, 10) || 1
        )
      }));

  } catch (error) {

    console.error("Cart read error:", error);

    return [];
  }
}


// ============================================================
// اسم المتجر
// ============================================================

function applyStoreName() {

  document.title = STORE.name;

  const nodes =
    document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );

  const textNodes = [];

  while (nodes.nextNode()) {
    textNodes.push(nodes.currentNode);
  }

  textNodes.forEach(node => {

    if (
      node.nodeValue &&
      node.nodeValue.includes("سوقي")
    ) {

      node.nodeValue =
        node.nodeValue.replaceAll(
          "سوقي",
          STORE.name
        );
    }

  });
}


// ============================================================
// المنتجات من Supabase
// ============================================================

async function loadProductsFromSupabase() {

  if (!supabaseClient) {
    return false;
  }

  try {

    const { data, error } =
      await supabaseClient
        .from("products")
        .select(`
          id,
          name,
          price,
          stock,
          image_url,
          description,
          active,
          categories (
            name
          )
        `)
        .eq("active", true)
        .order("created_at", {
          ascending: false
        });

    if (error) {

      console.error(
        "Products loading error:",
        error
      );

      return false;
    }

    if (!Array.isArray(data) || !data.length) {
      return false;
    }

    const liveProducts = data.map(item => ({

      id: Number(item.id),

      name: String(item.name || "منتج"),

      category:
        item.categories?.name ||
        "عام",

      price:
        Number(item.price) || 0,

      image:
        item.image_url ||
        "https://via.placeholder.com/800x800?text=Product",

      description:
        String(
          item.description ||
          "لا يوجد وصف للمنتج."
        ),

      stock:
        Number.isFinite(Number(item.stock))
          ? Number(item.stock)
          : null,

      active: item.active !== false

    }));

    if (liveProducts.length) {

      products = liveProducts;

      refreshProducts();

      cleanInvalidCartItems();

      updateCart();

      return true;
    }

  } catch (error) {

    console.error(
      "Supabase products exception:",
      error
    );
  }

  return false;
}


// ============================================================
// تنظيف المنتجات غير الموجودة
// ============================================================

function cleanInvalidCartItems() {

  const validIds =
    new Set(
      products.map(product => Number(product.id))
    );

  const originalLength =
    cart.length;

  cart =
    cart.filter(item =>
      validIds.has(Number(item.id))
    );

  if (originalLength !== cart.length) {

    localStorage.setItem(
      "shoppingCart",
      JSON.stringify(cart)
    );
  }
}


// ============================================================
// البحث والتصفية
// ============================================================

function getVisibleProducts() {

  let result = [...products];

  if (currentCategory !== "الكل") {

    result =
      result.filter(product =>
        product.category === currentCategory
      );
  }

  const query =
    currentSearch.trim().toLowerCase();

  if (query) {

    result =
      result.filter(product => {

        const searchable = [
          product.name,
          product.category,
          product.description
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      });
  }

  return result;
}


function refreshProducts() {

  displayProducts(
    getVisibleProducts()
  );
}


// ============================================================
// عرض المنتجات
// ============================================================

function displayProducts(list = products) {

  const grid =
    $("#productsGrid");

  if (!grid) return;

  if (!list.length) {

    grid.innerHTML = `
      <div class="empty-products">

        <div>🔎</div>

        <h3>
          لم يتم العثور على منتجات
        </h3>

        <p>
          جرّب كلمة بحث أخرى أو غيّر التصنيف.
        </p>

        <button
          class="details-button"
          onclick="resetProductFilters()"
        >
          عرض كل المنتجات
        </button>

      </div>
    `;

    return;
  }

  grid.innerHTML =
    list.map(product => {

      const stock =
        Number.isFinite(Number(product.stock))
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

        <div class="product-image">

          <img
            src="${escapeHtml(product.image)}"
            alt="${escapeHtml(product.name)}"
            loading="lazy"
            onerror="
              this.style.display='none';
              this.parentElement.classList.add('image-error');
            "
          >

        </div>

        <div class="product-info">

          <span class="product-category">
            ${escapeHtml(product.category)}
          </span>

          <h3 class="product-name">
            ${escapeHtml(product.name)}
          </h3>

          <p class="product-description">
            ${escapeHtml(product.description)}
          </p>

          ${
            stock !== null
              ? `
                <div class="product-stock">

                  ${
                    outOfStock
                      ? "❌ نفد المخزون"
                      : lowStock
                        ? `⚠️ متبقي ${stock}`
                        : `✅ متوفر`
                  }

                </div>
              `
              : ""
          }

          <div class="product-bottom">

            <strong class="product-price">
              ${formatPrice(product.price)}
            </strong>

            <div class="product-actions">

              <button
                class="details-button"
                onclick="showProductDetails(${Number(product.id)})"
              >
                تفاصيل
              </button>

              <button
                class="add-button"
                ${
                  outOfStock
                    ? "disabled"
                    : ""
                }
                onclick="
                  addToCart(${Number(product.id)})
                "
              >
                ${
                  outOfStock
                    ? "نفد"
                    : "🛒 أضف"
                }
              </button>

            </div>

          </div>

        </div>

      </article>

      `;

    }).join("");
}


// ============================================================
// إعادة الفلاتر
// ============================================================

function resetProductFilters() {

  currentCategory = "الكل";

  currentSearch = "";

  if ($("#searchInput")) {
    $("#searchInput").value = "";
  }

  document
    .querySelectorAll(".category")
    .forEach(button =>
      button.classList.remove("active")
    );

  refreshProducts();
}


// ============================================================
// السلة
// ============================================================

function addToCart(id) {

  const product =
    products.find(
      item => Number(item.id) === Number(id)
    );

  if (!product) {

    showToast(
      "تعذر العثور على المنتج"
    );

    return;
  }

  const stock =
    Number.isFinite(Number(product.stock))
      ? Number(product.stock)
      : null;

  if (stock !== null && stock <= 0) {

    showToast(
      "هذا المنتج غير متوفر حاليًا"
    );

    return;
  }

  const existing =
    cart.find(
      item => Number(item.id) === Number(id)
    );

  if (existing) {

    if (
      stock !== null &&
      existing.quantity + 1 > stock
    ) {

      showToast(
        `المتوفر فقط ${stock} قطعة`
      );

      return;
    }

    existing.quantity += 1;

  } else {

    cart.push({

      id: Number(product.id),

      name: product.name,

      price:
        Number(product.price) || 0,

      image:
        product.image || "",

      quantity: 1

    });
  }

  saveCart();

  showToast(
    `تمت إضافة ${product.name} إلى السلة 🛒`
  );
}


function saveCart() {

  try {

    localStorage.setItem(
      "shoppingCart",
      JSON.stringify(cart)
    );

  } catch (error) {

    console.error(
      "Cart save error:",
      error
    );
  }

  updateCart();
}


function getCartCount() {

  return cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );
}


function getCartTotal() {

  return cart.reduce(
    (sum, item) =>
      sum +
      (
        Number(item.price) || 0
      ) *
      (
        Number(item.quantity) || 0
      ),
    0
  );
}


function updateCart() {

  const count =
    getCartCount();

  const total =
    getCartTotal();

  if ($("#cartCount")) {

    $("#cartCount").textContent =
      count;
  }

  if ($("#cartTotal")) {

    $("#cartTotal").textContent =
      formatPrice(total);
  }

  renderCart();
}


function renderCart() {

  const box =
    $("#cartItems");

  if (!box) return;

  if (!cart.length) {

    box.innerHTML = `
      <div class="empty-cart">

        <div>🛒</div>

        <h3>
          السلة فارغة
        </h3>

        <p>
          أضف المنتجات التي تريد شراءها.
        </p>

      </div>
    `;

    return;
  }

  box.innerHTML =
    cart.map(item => {

      const product =
        products.find(
          p =>
            Number(p.id) ===
            Number(item.id)
        );

      const stock =
        product &&
        Number.isFinite(Number(product.stock))
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
              onclick="
                changeQuantity(${Number(item.id)}, 1)
              "
            >
              +
            </button>

            <span>
              ${Number(item.quantity)}
            </span>

            <button
              onclick="
                changeQuantity(${Number(item.id)}, -1)
              "
            >
              −
            </button>

            <button
              class="remove-item"
              onclick="
                removeFromCart(${Number(item.id)})
              "
            >
              حذف
            </button>

          </div>

          ${
            stock !== null
              ? `
                <small>
                  المتوفر: ${stock}
                </small>
              `
              : ""
          }

        </div>

      </div>

      `;

    }).join("");
}


// ============================================================
// تغيير الكمية
// ============================================================

function changeQuantity(id, change) {

  const item =
    cart.find(
      i => Number(i.id) === Number(id)
    );

  if (!item) return;

  const product =
    products.find(
      p => Number(p.id) === Number(id)
    );

  const stock =
    product &&
    Number.isFinite(Number(product.stock))
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


// ============================================================
// حذف من السلة
// ============================================================

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


// ============================================================
// البحث
// ============================================================

function searchProducts() {

  currentSearch =
    (
      $("#searchInput")?.value ||
      ""
    ).trim();

  refreshProducts();
}


// ============================================================
// التصنيفات
// ============================================================

function filterCategory(
  category,
  button
) {

  currentCategory =
    category || "الكل";

  document
    .querySelectorAll(".category")
    .forEach(el =>
      el.classList.remove("active")
    );

  if (button) {
    button.classList.add("active");
  }

  refreshProducts();
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

  const modal =
    $("#productModal");

  const details =
    $("#productDetails");

  if (
    !product ||
    !modal ||
    !details
  ) {
    return;
  }

  const stock =
    Number.isFinite(Number(product.stock))
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

  modal.classList.add("show");
}


function closeProductModal() {

  $("#productModal")
    ?.classList.remove("show");
}


// ============================================================
// السلة والنوافذ
// ============================================================

function openCart() {

  updateCart();

  $("#cartDrawer")
    ?.classList.add("open");

  $("#overlay")
    ?.classList.add("show");
}


function closeCart() {

  $("#cartDrawer")
    ?.classList.remove("open");

  $("#overlay")
    ?.classList.remove("show");
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
    ?.classList.add("show");
}


function closeCheckout() {

  $("#checkoutModal")
    ?.classList.remove("show");
}


function openSupport() {

  $("#supportModal")
    ?.classList.add("show");
}


function closeSupport() {

  $("#supportModal")
    ?.classList.remove("show");
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

  $("#accountModal")
    ?.classList.add("show");

  if (currentCustomer) {

    showCustomerAccount();

  } else {

    showLogin();
  }
}


function closeAccount() {

  $("#accountModal")
    ?.classList.remove("show");
}


function showLogin() {

  $("#customerLoginSection")
    ?.classList.remove("hidden");

  $("#customerRegisterSection")
    ?.classList.add("hidden");

  $("#customerAccountSection")
    ?.classList.add("hidden");

  setCustomerMessage(
    "customerLoginMessage",
    ""
  );
}


function showRegister() {

  $("#customerLoginSection")
    ?.classList.add("hidden");

  $("#customerRegisterSection")
    ?.classList.remove("hidden");

  $("#customerAccountSection")
    ?.classList.add("hidden");

  setCustomerMessage(
    "customerRegisterMessage",
    ""
  );
}


function showCustomerAccount() {

  $("#customerLoginSection")
    ?.classList.add("hidden");

  $("#customerRegisterSection")
    ?.classList.add("hidden");

  $("#customerAccountSection")
    ?.classList.remove("hidden");

  const profile =
    currentCustomer?.profile || {};

  const name =
    profile.full_name ||
    currentCustomer?.email ||
    "الزبون";

  if ($("#customerProfileName")) {

    $("#customerProfileName").textContent =
      `مرحباً ${name} 👋`;
  }

  if ($("#customerFullName")) {

    $("#customerFullName").value =
      profile.full_name || "";
  }

  if ($("#customerProfilePhone")) {

    $("#customerProfilePhone").value =
      profile.phone || "";
  }

  if ($("#customerProfileCity")) {

    $("#customerProfileCity").value =
      profile.city || "";
  }

  if ($("#customerProfileAddress")) {

    $("#customerProfileAddress").value =
      profile.address || "";
  }

  if ($("#customerEmail")) {

    $("#customerEmail").textContent =
      currentCustomer?.email || "";
  }

  if ($("#customerAccountDetails")) {

    $("#customerAccountDetails").classList.remove(
      "hidden"
    );
  }
}


// ============================================================
// بيانات الحساب
// ============================================================

function showCustomerData() {

  if (!currentCustomer) {

    showLogin();

    return;
  }

  showCustomerAccount();

}


function fillCheckoutFromProfile() {

  const profile =
    currentCustomer?.profile;

  if (!profile) return;

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

  if (!element) return;

  element.textContent =
    message || "";

  element.className = "";

  if (type) {
    element.classList.add(type);
  }
}


// ============================================================
// تحميل بيانات الزبون
// ============================================================

async function loadCustomer(user) {

  if (!user) {

    currentCustomer = null;

    updateAccountButton();

    return;
  }

  if (!supabaseClient) {

    currentCustomer = {

      id: user.id,

      email: user.email,

      profile: null

    };

    updateAccountButton();

    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("customer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {

      console.error(
        "Profile loading error:",
        error
      );
    }

    currentCustomer = {

      id: user.id,

      email: user.email,

      profile: data || null

    };

    // اسم محفوظ مؤقتًا من التسجيل
    const pendingName =
      localStorage.getItem(
        "pendingCustomerName"
      );

    if (
      pendingName &&
      !currentCustomer.profile
    ) {

      const {
        data: savedProfile,
        error: saveError
      } =
        await supabaseClient
          .from("customer_profiles")
          .upsert({

            user_id: user.id,

            full_name:
              pendingName

          })
          .select()
          .single();

      if (!saveError && savedProfile) {

        currentCustomer.profile =
          savedProfile;

        localStorage.removeItem(
          "pendingCustomerName"
        );
      }
    }

    updateAccountButton();

  } catch (error) {

    console.error(
      "Customer loading exception:",
      error
    );

    currentCustomer = {

      id: user.id,

      email: user.email,

      profile: null
    };

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
      $("#customerLoginEmail")
        ?.value || ""
    ).trim();

  const password =
    $("#customerLoginPassword")
      ?.value || "";

  if (!email || !password) {

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
      await supabaseClient.auth.signInWithPassword({

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
      $("#customerRegisterName")
        ?.value || ""
    ).trim();

  const email =
    (
      $("#customerRegisterEmail")
        ?.value || ""
    ).trim();

  const password =
    $("#customerRegisterPassword")
      ?.value || "";

  if (!name || !email || !password) {

    setCustomerMessage(
      "customerRegisterMessage",
      "يرجى إكمال جميع البيانات.",
      "error"
    );

    return;
  }

  if (password.length < 6) {

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
      await supabaseClient.auth.signUp({

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
        "تعذر إنشاء الحساب. تأكد من البريد الإلكتروني.",
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

    localStorage.setItem(
      "pendingCustomerName",
      name
    );

    // إذا كان الحساب دخل مباشرة بدون تأكيد بريد
    if (data.session) {

      await loadCustomer(
        data.user
      );

      if (
        !currentCustomer.profile ||
        currentCustomer.profile.full_name !== name
      ) {

        await saveCustomerProfileByValues({
          full_name: name,
          phone: "",
          city: "",
          address: ""
        });
      }

      showCustomerAccount();

      showToast(
        "تم إنشاء الحساب بنجاح ✅"
      );

    } else {

      setCustomerMessage(
        "customerRegisterMessage",
        "تم إنشاء الحساب. افتح بريدك لتأكيد الحساب، ثم سجّل الدخول.",
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
// حفظ الملف الشخصي الداخلي
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

  const {
    data,
    error
  } =
    await supabaseClient
      .from("customer_profiles")
      .upsert(profile)
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
}


// ============================================================
// حفظ بيانات الحساب
// ============================================================

async function saveCustomerProfile() {

  if (!currentCustomer) {

    showToast(
      "سجل الدخول أولاً"
    );

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
// زر الحساب
// ============================================================

function updateAccountButton() {

  const button =
    $("#accountButton");

  if (!button) return;

  if (currentCustomer) {

    const name =
      currentCustomer
        .profile
        ?.full_name;

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

  updateAccountButton();

  showLogin();

  showToast(
    "تم تسجيل الخروج"
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
      await supabaseClient.auth.getSession();

    if (error) {

      console.error(
        "Session error:",
        error
      );

      return;
    }

    if (data?.session?.user) {

      await loadCustomer(
        data.session.user
      );

    } else {

      currentCustomer = null;

      updateAccountButton();
    }

    supabaseClient.auth.onAuthStateChange(
      async (event, session) => {

        if (
          session?.user
        ) {

          await loadCustomer(
            session.user
          );

        } else {

          currentCustomer = null;

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
// طلباتي
// ============================================================

async function showCustomerOrders() {

  if (!currentCustomer) {

    showToast(
      "سجل الدخول أولاً"
    );

    showLogin();

    return;
  }

  const box =
    $("#customerOrdersList");

  if (!box) {

    showToast(
      "قسم الطلبات غير موجود"
    );

    return;
  }

  box.innerHTML = `
    <p>
      جاري تحميل طلباتك...
    </p>
  `;

  if (!supabaseClient) {

    box.innerHTML = `
      <p>
        تعذر الاتصال بالطلبات.
      </p>
    `;

    return;
  }

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
            ascending: false
          }
        );

    if (error) {

      console.error(
        "Orders error:",
        error
      );

      box.innerHTML = `
        <p>
          تعذر تحميل الطلبات حاليًا.
        </p>
      `;

      return;
    }

    if (!data?.length) {

      box.innerHTML = `
        <div class="empty-orders">

          <div>📦</div>

          <h3>
            لا توجد طلبات
          </h3>

          <p>
            عندما تشتري منتجًا ستظهر طلباتك هنا.
          </p>

        </div>
      `;

      return;
    }

    box.innerHTML =
      data.map(order => `

        <div class="customer-order">

          <div>
            <strong>
              ${escapeHtml(
                order.order_number
              )}
            </strong>
          </div>

          <div>
            الحالة:
            <strong>
              ${escapeHtml(
                order.status || "جديد"
              )}
            </strong>
          </div>

          <div>
            المجموع:
            <strong>
              ${formatPrice(order.total)}
            </strong>
          </div>

          <small>
            ${escapeHtml(
              formatDate(
                order.created_at
              )
            )}
          </small>

        </div>

      `).join("");

  } catch (error) {

    console.error(error);

    box.innerHTML = `
      <p>
        حدث خطأ أثناء تحميل الطلبات.
      </p>
    `;
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
      "يرجى إكمال معلومات التوصيل"
    );

    return;
  }

  // فحص المخزون قبل الإرسال
  for (const item of cart) {

    const product =
      products.find(
        p =>
          Number(p.id) ===
          Number(item.id)
      );

    if (!product) continue;

    const stock =
      Number.isFinite(
        Number(product.stock)
      )
        ? Number(product.stock)
        : null;

    if (
      stock !== null &&
      Number(item.quantity) > stock
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

  isSubmittingOrder = true;

  const submitButton =
    $("#checkoutForm")
      ?.querySelector(
        'button[type="submit"]'
      );

  const originalText =
    submitButton?.textContent;

  if (submitButton) {

    submitButton.disabled = true;

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
      cart.map(item =>
        `• ${item.name} × ${item.quantity} = ${formatPrice(
          Number(item.price) *
          Number(item.quantity)
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

    let orderSaved =
      false;

    // --------------------------------------------------------
    // حفظ الطلب في Supabase
    // --------------------------------------------------------

    if (supabaseClient) {

      const {
        data: orderData,
        error: orderError
      } =
        await supabaseClient
          .from("orders")
          .insert({

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
              "جديد",

            user_id:
              currentCustomer?.id ||
              null

          })
          .select()
          .single();

      if (orderError) {

        console.error(
          "Order save error:",
          orderError
        );

        showToast(
          "تعذر حفظ الطلب بالنظام، لكنه سيُرسل عبر واتساب."
        );

      } else if (orderData) {

        orderSaved = true;

        // ----------------------------------------------------
        // حفظ تفاصيل المنتجات
        // ----------------------------------------------------

        const orderItems =
          cart.map(item => ({

            order_id:
              orderData.id,

            product_id:
              Number(item.id),

            product_name:
              item.name,

            price:
              Number(item.price),

            quantity:
              Number(item.quantity)

          }));

        const {
          error: itemsError
        } =
          await supabaseClient
            .from("order_items")
            .insert(
              orderItems
            );

        if (itemsError) {

          console.error(
            "Order items error:",
            itemsError
          );
        }
      }
    }

    // --------------------------------------------------------
    // حفظ آخر طلب محليًا
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // واتساب
    // --------------------------------------------------------

    const whatsappUrl =
      "https://wa.me/" +
      STORE.whatsapp +
      "?text=" +
      encodeURIComponent(
        message
      );

    // تفريغ السلة
    cart = [];

    saveCart();

    closeCheckout();
    closeCart();

    showToast(
      orderSaved
        ? "تم تسجيل الطلب بنجاح ✅"
        : "تم تجهيز الطلب لإرساله عبر واتساب ✅"
    );

    // على WebView عادةً location.href
    // أكثر موثوقية من window.open
    setTimeout(() => {

      window.location.href =
        whatsappUrl;

    }, 800);

  } catch (error) {

    console.error(
      "Submit order exception:",
      error
    );

    showToast(
      "حدث خطأ أثناء تجهيز الطلب."
    );

  } finally {

    isSubmittingOrder = false;

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
// Toast
// ============================================================

function showToast(message) {

  const toast =
    $("#toast");

  if (!toast) return;

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

    // اسم المتجر
    applyStoreName();

    // عرض البيانات الاحتياطية فورًا
    displayProducts(products);

    // تحديث السلة
    updateCart();

    // زر الحساب
    updateAccountButton();

    // البحث
    $("#searchInput")
      ?.addEventListener(
        "input",
        searchProducts
      );

    // نموذج الدفع
    $("#checkoutForm")
      ?.addEventListener(
        "submit",
        submitOrder
      );

    // استعادة تسجيل الدخول
    await restoreCustomerSession();

    // تحميل المنتجات الحقيقية
    await loadProductsFromSupabase();

    // إغلاق النوافذ بـ Escape
    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape"
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

// المنتجات والسلة
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;

window.searchProducts = searchProducts;
window.filterCategory = filterCategory;
window.resetProductFilters =
  resetProductFilters;

window.showProductDetails =
  showProductDetails;

window.closeProductModal =
  closeProductModal;

// النوافذ
window.openCart = openCart;
window.closeCart = closeCart;

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

// الحساب
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

// الطلب
window.submitOrder =
  submitOrder;