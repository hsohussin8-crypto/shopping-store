const SUPABASE_URL = "https://jfazoorxmucevyeysdlg.supabase.co";
const SUPABASE_KEY = "sb_publishable_POh-CGx30SGsdELDBUTbHg_0QZrPUHU";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let products = [];
let categories = [];
let orders = [];


/* =========================
   عند فتح الصفحة
========================= */

document.addEventListener("DOMContentLoaded", async () => {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) {
    await showAdmin(session);
  } else {
    showLogin();
  }
});


/* =========================
   تسجيل الدخول
========================= */

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const message = document.getElementById("loginMessage");

  if (!email || !password) {
    message.textContent = "اكتب البريد الإلكتروني وكلمة المرور";
    return;
  }

  message.textContent = "جاري تسجيل الدخول...";

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    message.textContent = "خطأ: " + error.message;
    return;
  }

  await showAdmin(data.session);
}


/* =========================
   عرض لوحة الإدارة
========================= */

async function showAdmin(session) {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("adminSection").classList.remove("hidden");

  document.getElementById("adminEmail").textContent =
    session.user.email;

  await loadAll();
}


/* =========================
   تسجيل الخروج
========================= */

async function logout() {
  await supabaseClient.auth.signOut();

  showLogin();
}


/* =========================
   إظهار تسجيل الدخول
========================= */

function showLogin() {
  document.getElementById("adminSection").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
}


/* =========================
   تحميل كل البيانات
========================= */

async function loadAll() {
  await loadCategories();
  await loadProducts();
  await loadOrders();

  updateStats();
}


/* =========================
   الأقسام
========================= */

async function loadCategories() {
  const { data, error } = await supabaseClient
    .from("categories")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  categories = data || [];

  renderCategories();
  fillCategorySelect();
}


function renderCategories() {
  const container =
    document.getElementById("categoriesList");

  if (!categories.length) {
    container.innerHTML = "لا توجد أقسام";
    return;
  }

  container.innerHTML = categories.map(category => `
    <div class="item">

      <div class="item-info">
        <strong>${escapeHtml(category.name)}</strong>
        <small>
          ${category.active ? "🟢 فعال" : "🔴 مخفي"}
        </small>
      </div>

      <div class="item-actions">

        <button
          class="edit-btn"
          onclick="renameCategory(${category.id})">
          ✏️ تعديل
        </button>

        <button
          class="delete-btn"
          onclick="deleteCategory(${category.id})">
          🗑️ حذف
        </button>

      </div>

    </div>
  `).join("");
}


async function addCategory() {
  const name = prompt("اكتب اسم القسم الجديد:");

  if (!name || !name.trim()) {
    return;
  }

  const { error } = await supabaseClient
    .from("categories")
    .insert({
      name: name.trim()
    });

  if (error) {
    alert("حدث خطأ: " + error.message);
    return;
  }

  await loadCategories();
  updateStats();
}


async function renameCategory(id) {
  const category = categories.find(c => c.id === id);

  if (!category) return;

  const name = prompt(
    "اسم القسم الجديد:",
    category.name
  );

  if (!name || !name.trim()) {
    return;
  }

  const { error } = await supabaseClient
    .from("categories")
    .update({
      name: name.trim()
    })
    .eq("id", id);

  if (error) {
    alert("حدث خطأ: " + error.message);
    return;
  }

  await loadCategories();
  await loadProducts();
}


async function deleteCategory(id) {
  const category = categories.find(c => c.id === id);

  if (!category) return;

  const confirmed = confirm(
    `هل تريد حذف قسم "${category.name}"؟`
  );

  if (!confirmed) return;

  const { error } = await supabaseClient
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    alert("حدث خطأ: " + error.message);
    return;
  }

  await loadCategories();
  await loadProducts();
  updateStats();
}


function fillCategorySelect() {
  const select =
    document.getElementById("productCategory");

  select.innerHTML = `
    <option value="">اختر القسم</option>
    ${categories
      .filter(c => c.active)
      .map(c => `
        <option value="${c.id}">
          ${escapeHtml(c.name)}
        </option>
      `)
      .join("")}
  `;
}


/* =========================
   المنتجات
========================= */

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  products = data || [];

  renderProducts();
}


function renderProducts() {
  const container =
    document.getElementById("productsList");

  if (!products.length) {
    container.innerHTML = `
      <div class="item">
        لا توجد منتجات حاليًا.
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(product => {

    const categoryName =
      product.categories?.name || "بدون قسم";

    return `
      <div class="item">

        <div class="item-info">

          <strong>
            ${escapeHtml(product.name)}
          </strong>

          <small>
            💰 ${Number(product.price).toLocaleString("ar-IQ")} د.ع
            |
            📦 المخزون: ${product.stock}
            |
            🗂️ ${escapeHtml(categoryName)}
          </small>

        </div>

        <div class="item-actions">

          <button
            class="edit-btn"
            onclick="editProduct(${product.id})">
            ✏️ تعديل
          </button>

          <button
            class="stock-btn"
            onclick="changeStock(${product.id})">
            📦 مخزون
          </button>

          <button
            class="delete-btn"
            onclick="deleteProduct(${product.id})">
            🗑️ حذف
          </button>

        </div>

      </div>
    `;
  }).join("");
}


/* =========================
   نموذج المنتج
========================= */

function openProductForm() {
  document.getElementById("productForm").classList.remove("hidden");

  document.getElementById("productFormTitle").textContent =
    "إضافة منتج";

  document.getElementById("productId").value = "";
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productStock").value = "";
  document.getElementById("productImage").value = "";
  document.getElementById("productDescription").value = "";

  document.getElementById("productCategory").value = "";
}


function closeProductForm() {
  document.getElementById("productForm").classList.add("hidden");
}


function editProduct(id) {
  const product = products.find(p => p.id === id);

  if (!product) return;

  document.getElementById("productForm").classList.remove("hidden");

  document.getElementById("productFormTitle").textContent =
    "تعديل المنتج";

  document.getElementById("productId").value =
    product.id;

  document.getElementById("productName").value =
    product.name || "";

  document.getElementById("productPrice").value =
    product.price || 0;

  document.getElementById("productStock").value =
    product.stock || 0;

  document.getElementById("productImage").value =
    product.image_url || "";

  document.getElementById("productDescription").value =
    product.description || "";

  document.getElementById("productCategory").value =
    product.category_id || "";
}


async function saveProduct() {
  const id =
    document.getElementById("productId").value;

  const name =
    document.getElementById("productName").value.trim();

  const price =
    Number(document.getElementById("productPrice").value);

  const stock =
    Number(document.getElementById("productStock").value);

  const categoryId =
    document.getElementById("productCategory").value;

  const imageUrl =
    document.getElementById("productImage").value.trim();

  const description =
    document.getElementById("productDescription").value.trim();


  if (!name) {
    alert("اكتب اسم المنتج");
    return;
  }

  if (price < 0 || stock < 0) {
    alert("السعر والمخزون لا يمكن أن يكونا بالسالب");
    return;
  }


  const productData = {
    name,
    price,
    stock,
    category_id: categoryId
      ? Number(categoryId)
      : null,
    image_url: imageUrl || null,
    description: description || null,
    active: true
  };


  let result;

  if (id) {

    result = await supabaseClient
      .from("products")
      .update(productData)
      .eq("id", Number(id));

  } else {

    result = await supabaseClient
      .from("products")
      .insert(productData);

  }


  if (result.error) {
    alert("حدث خطأ: " + result.error.message);
    return;
  }


  alert(
    id
      ? "تم تعديل المنتج بنجاح ✅"
      : "تمت إضافة المنتج بنجاح ✅"
  );

  closeProductForm();

  await loadProducts();
  updateStats();
}


/* =========================
   تعديل المخزون بسرعة
========================= */

async function changeStock(id) {
  const product = products.find(p => p.id === id);

  if (!product) return;

  const value = prompt(
    `المخزون الحالي: ${product.stock}\nاكتب العدد الجديد:`,
    product.stock
  );

  if (value === null) return;

  const stock = Number(value);

  if (!Number.isInteger(stock) || stock < 0) {
    alert("اكتب رقم صحيح");
    return;
  }

  const { error } = await supabaseClient
    .from("products")
    .update({
      stock
    })
    .eq("id", id);

  if (error) {
    alert("حدث خطأ: " + error.message);
    return;
  }

  await loadProducts();
}


async function deleteProduct(id) {
  const product = products.find(p => p.id === id);

  if (!product) return;

  const confirmed = confirm(
    `هل تريد حذف "${product.name}"؟`
  );

  if (!confirmed) return;

  const { error } = await supabaseClient
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    alert("حدث خطأ: " + error.message);
    return;
  }

  await loadProducts();
  updateStats();
}


/* =========================
   الطلبات
========================= */

async function loadOrders() {
  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  orders = data || [];

  renderOrders();
}


function renderOrders() {
  const container =
    document.getElementById("ordersList");

  if (!orders.length) {
    container.innerHTML = `
      <div class="item">
        لا توجد طلبات حاليًا.
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="item">

      <div class="item-info">

        <strong>
          🧾 ${escapeHtml(order.order_number)}
        </strong>

        <small>
          👤 ${escapeHtml(order.customer_name)}
          |
          📞 ${escapeHtml(order.phone)}
          |
          📍 ${escapeHtml(order.city)}
          |
          💰 ${Number(order.total).toLocaleString("ar-IQ")} د.ع
          |
          الحالة: ${escapeHtml(order.status)}
        </small>

      </div>

      <div class="item-actions">

        <button
          class="edit-btn"
          onclick="changeOrderStatus(${order.id})">
          ✏️ الحالة
        </button>

      </div>

    </div>
  `).join("");
}


async function changeOrderStatus(id) {
  const order = orders.find(o => o.id === id);

  if (!order) return;

  const status = prompt(
    "اكتب حالة الطلب:\nجديد\nقيد التجهيز\nتم الشحن\nمكتمل\nملغي",
    order.status
  );

  if (!status || !status.trim()) return;

  const { error } = await supabaseClient
    .from("orders")
    .update({
      status: status.trim()
    })
    .eq("id", id);

  if (error) {
    alert("حدث خطأ: " + error.message);
    return;
  }

  await loadOrders();
}


/* =========================
   الإحصائيات
========================= */

function updateStats() {
  document.getElementById("productsCount").textContent =
    products.length;

  document.getElementById("categoriesCount").textContent =
    categories.length;

  document.getElementById("ordersCount").textContent =
    orders.length;
}


/* =========================
   حماية النصوص
========================= */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}