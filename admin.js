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

    const { data: admin } = await supabaseClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (!admin) {
      alert("هذا الحساب ليس مديراً.");
      await supabaseClient.auth.signOut();
      showLogin();
      return;
    }

    await showAdmin(session);

  } else {

    showLogin();

  }

});


/* =========================
   تسجيل الدخول
========================= */

async function login() {

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  const message =
    document.getElementById("loginMessage");

  if (!email || !password) {

    message.textContent =
      "اكتب البريد الإلكتروني وكلمة المرور";

    return;
  }

  message.textContent =
    "جاري تسجيل الدخول...";

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {

    message.textContent =
      "خطأ: " + error.message;

    return;
  }

  /* التحقق الحقيقي من الأدمن */

  const { data: admin, error: adminError } =
    await supabaseClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

  if (adminError || !admin) {

    await supabaseClient.auth.signOut();

    message.textContent =
      "هذا الحساب ليس لديه صلاحيات الإدارة.";

    return;
  }

  await showAdmin(data.session);

}


/* =========================
   عرض لوحة الإدارة
========================= */

async function showAdmin(session) {

  document
    .getElementById("loginSection")
    .classList.add("hidden");

  document
    .getElementById("adminSection")
    .classList.remove("hidden");

  document
    .getElementById("adminEmail")
    .textContent = session.user.email;

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

  document
    .getElementById("adminSection")
    .classList.add("hidden");

  document
    .getElementById("loginSection")
    .classList.remove("hidden");

}


/* =========================
   تحميل كل البيانات
========================= */

async function loadAll() {

  await loadCategories();

  await loadProducts();

  await loadOrders();

  await loadStoreSettings();

  updateStats();

}


/* ==================================================
   الأقسام
================================================== */

async function loadCategories() {

  const { data, error } =
    await supabaseClient
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
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

    container.innerHTML =
      "لا توجد أقسام";

    return;
  }

  container.innerHTML =
    categories.map((category, index) => `

      <div class="item">

        <div class="item-info">

          <strong>
            ${escapeHtml(category.name)}
          </strong>

          <small>

            🔢 الترتيب:
            ${category.sort_order ?? 0}

            |

            ${category.active
              ? "🟢 فعال"
              : "🔴 مخفي"}

          </small>

          ${
            category.image_url
              ? `
                <small>
                  🖼️ الصورة موجودة
                </small>
              `
              : `
                <small>
                  🖼️ لا توجد صورة
                </small>
              `
          }

        </div>


        <div class="item-actions">

          <button
            class="edit-btn"
            onclick="moveCategoryUp(${category.id})"
          >
            ⬆️
          </button>

          <button
            class="edit-btn"
            onclick="moveCategoryDown(${category.id})"
          >
            ⬇️
          </button>

          <button
            class="edit-btn"
            onclick="editCategory(${category.id})"
          >
            ✏️ تعديل
          </button>

          <button
            class="delete-btn"
            onclick="deleteCategory(${category.id})"
          >
            🗑️ حذف
          </button>

        </div>

      </div>

    `).join("");

}


/* =========================
   إضافة قسم
========================= */

async function addCategory() {

  const name =
    prompt("اكتب اسم القسم الجديد:");

  if (!name || !name.trim()) {
    return;
  }

  const imageUrl =
    prompt(
      "رابط صورة القسم (اختياري):",
      ""
    );

  const maxOrder =
    categories.length
      ? Math.max(
          ...categories.map(
            c => Number(c.sort_order) || 0
          )
        )
      : 0;

  const { error } =
    await supabaseClient
      .from("categories")
      .insert({
        name: name.trim(),
        image_url:
          imageUrl?.trim() || null,
        sort_order:
          maxOrder + 1,
        active: true
      });

  if (error) {

    alert(
      "حدث خطأ: " +
      error.message
    );

    return;
  }

  await loadCategories();

  updateStats();

}


/* =========================
   تعديل القسم
========================= */

async function editCategory(id) {

  const category =
    categories.find(
      c => c.id === id
    );

  if (!category) return;


  const name =
    prompt(
      "اسم القسم:",
      category.name
    );

  if (!name || !name.trim()) {
    return;
  }


  const imageUrl =
    prompt(
      "رابط صورة القسم:",
      category.image_url || ""
    );


  const order =
    prompt(
      "ترتيب القسم:",
      category.sort_order ?? 0
    );


  const activeAnswer =
    confirm(
      "هل تريد إظهار القسم للزبائن؟\n\nموافق = إظهار\nإلغاء = إخفاء"
    );


  const { error } =
    await supabaseClient
      .from("categories")
      .update({

        name:
          name.trim(),

        image_url:
          imageUrl?.trim() || null,

        sort_order:
          Number(order) || 0,

        active:
          activeAnswer

      })
      .eq("id", id);


  if (error) {

    alert(
      "حدث خطأ: " +
      error.message
    );

    return;
  }


  await loadCategories();

  await loadProducts();

}


/* =========================
   تحريك القسم للأعلى
========================= */

async function moveCategoryUp(id) {

  const index =
    categories.findIndex(
      c => c.id === id
    );

  if (index <= 0) return;

  const current =
    categories[index];

  const previous =
    categories[index - 1];

  await swapCategoryOrder(
    current,
    previous
  );

}


/* =========================
   تحريك القسم للأسفل
========================= */

async function moveCategoryDown(id) {

  const index =
    categories.findIndex(
      c => c.id === id
    );

  if (
    index === -1 ||
    index >= categories.length - 1
  ) {
    return;
  }

  const current =
    categories[index];

  const next =
    categories[index + 1];

  await swapCategoryOrder(
    current,
    next
  );

}


/* =========================
   تبديل ترتيب قسمين
========================= */

async function swapCategoryOrder(a, b) {

  const orderA =
    Number(a.sort_order) || 0;

  const orderB =
    Number(b.sort_order) || 0;


  const { error } =
    await supabaseClient
      .from("categories")
      .upsert([
        {
          id: a.id,
          name: a.name,
          image_url: a.image_url,
          active: a.active,
          sort_order: orderB
        },
        {
          id: b.id,
          name: b.name,
          image_url: b.image_url,
          active: b.active,
          sort_order: orderA
        }
      ]);


  if (error) {

    alert(
      "حدث خطأ في الترتيب: " +
      error.message
    );

    return;
  }


  await loadCategories();

}


/* =========================
   حذف قسم
========================= */

async function deleteCategory(id) {

  const category =
    categories.find(
      c => c.id === id
    );

  if (!category) return;


  const confirmed =
    confirm(
      `هل تريد حذف قسم "${category.name}"؟`
    );

  if (!confirmed) return;


  const { error } =
    await supabaseClient
      .from("categories")
      .delete()
      .eq("id", id);


  if (error) {

    alert(
      "حدث خطأ: " +
      error.message
    );

    return;
  }


  await loadCategories();

  await loadProducts();

  updateStats();

}


/* =========================
   قائمة الأقسام داخل المنتج
========================= */

function fillCategorySelect() {

  const select =
    document.getElementById(
      "productCategory"
    );

  select.innerHTML = `

    <option value="">
      اختر القسم
    </option>

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


/* ==================================================
   المنتجات
================================================== */

async function loadProducts() {

  const { data, error } =
    await supabaseClient
      .from("products")
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order("sort_order", {
        ascending: true
      })
      .order("id", {
        ascending: false
      });


  if (error) {

    console.error(error);

    return;
  }


  products = data || [];

  renderProducts();

}


function renderProducts() {

  const container =
    document.getElementById(
      "productsList"
    );


  if (!products.length) {

    container.innerHTML = `
      <div class="item">
        لا توجد منتجات حاليًا.
      </div>
    `;

    return;
  }


  container.innerHTML =
    products.map(product => {

      const categoryName =
        product.categories?.name ||
        "بدون قسم";


      return `

        <div class="item">

          <div class="item-info">

            <strong>
              ${escapeHtml(product.name)}
            </strong>

            <small>

              💰
              ${Number(product.price)
                .toLocaleString("ar-IQ")}
              د.ع

              |

              📦 المخزون:
              ${product.stock}

              |

              🗂️
              ${escapeHtml(categoryName)}

            </small>


            <small>

              🔢 الترتيب:
              ${product.sort_order ?? 0}

              |

              ${
                product.featured
                  ? "⭐ مميز"
                  : "⚪ عادي"
              }

              |

              ${
                product.active
                  ? "🟢 ظاهر"
                  : "🔴 مخفي"
              }

            </small>

          </div>


          <div class="item-actions">

            <button
              class="edit-btn"
              onclick="moveProductUp(${product.id})"
            >
              ⬆️
            </button>

            <button
              class="edit-btn"
              onclick="moveProductDown(${product.id})"
            >
              ⬇️
            </button>

            <button
              class="edit-btn"
              onclick="editProduct(${product.id})"
            >
              ✏️ تعديل
            </button>

            <button
              class="stock-btn"
              onclick="changeStock(${product.id})"
            >
              📦 مخزون
            </button>

            <button
              class="delete-btn"
              onclick="deleteProduct(${product.id})"
            >
              🗑️ حذف
            </button>

          </div>

        </div>

      `;

    }).join("");

}


/* ==================================================
   نموذج المنتج
================================================== */

function openProductForm() {

  document
    .getElementById("productForm")
    .classList.remove("hidden");


  document
    .getElementById("productFormTitle")
    .textContent =
      "إضافة منتج";


  document
    .getElementById("productId")
    .value = "";


  document
    .getElementById("productName")
    .value = "";


  document
    .getElementById("productPrice")
    .value = "";


  document
    .getElementById("productStock")
    .value = "";


  document
    .getElementById("productImage")
    .value = "";


  document
    .getElementById("productDescription")
    .value = "";


  document
    .getElementById("productSortOrder")
    .value = 0;


  document
    .getElementById("productFeatured")
    .checked = false;


  document
    .getElementById("productActive")
    .checked = true;


  document
    .getElementById("productCategory")
    .value = "";

}


function closeProductForm() {

  document
    .getElementById("productForm")
    .classList.add("hidden");

}


/* =========================
   تعديل منتج
========================= */

function editProduct(id) {

  const product =
    products.find(
      p => p.id === id
    );

  if (!product) return;


  document
    .getElementById("productForm")
    .classList.remove("hidden");


  document
    .getElementById("productFormTitle")
    .textContent =
      "تعديل المنتج";


  document
    .getElementById("productId")
    .value =
      product.id;


  document
    .getElementById("productName")
    .value =
      product.name || "";


  document
    .getElementById("productPrice")
    .value =
      product.price || 0;


  document
    .getElementById("productStock")
    .value =
      product.stock || 0;


  document
    .getElementById("productImage")
    .value =
      product.image_url || "";


  document
    .getElementById("productDescription")
    .value =
      product.description || "";


  document
    .getElementById("productSortOrder")
    .value =
      product.sort_order ?? 0;


  document
    .getElementById("productFeatured")
    .checked =
      !!product.featured;


  document
    .getElementById("productActive")
    .checked =
      product.active !== false;


  document
    .getElementById("productCategory")
    .value =
      product.category_id || "";

}


/* =========================
   حفظ المنتج
========================= */

async function saveProduct() {

  const id =
    document
      .getElementById("productId")
      .value;


  const name =
    document
      .getElementById("productName")
      .value
      .trim();


  const price =
    Number(
      document
        .getElementById("productPrice")
        .value
    );


  const stock =
    Number(
      document
        .getElementById("productStock")
        .value
    );


  const categoryId =
    document
      .getElementById("productCategory")
      .value;


  const imageUrl =
    document
      .getElementById("productImage")
      .value
      .trim();


  const description =
    document
      .getElementById("productDescription")
      .value
      .trim();


  const sortOrder =
    Number(
      document
        .getElementById("productSortOrder")
        .value
    ) || 0;


  const featured =
    document
      .getElementById("productFeatured")
      .checked;


  const active =
    document
      .getElementById("productActive")
      .checked;


  if (!name) {

    alert("اكتب اسم المنتج");

    return;
  }


  if (
    price < 0 ||
    stock < 0
  ) {

    alert(
      "السعر والمخزون لا يمكن أن يكونا بالسالب"
    );

    return;
  }


  const productData = {

    name,

    price,

    stock,

    category_id:
      categoryId
        ? Number(categoryId)
        : null,

    image_url:
      imageUrl || null,

    description:
      description || null,

    sort_order:
      sortOrder,

    featured,

    active

  };


  let result;


  if (id) {

    result =
      await supabaseClient
        .from("products")
        .update(productData)
        .eq(
          "id",
          Number(id)
        );

  } else {

    result =
      await supabaseClient
        .from("products")
        .insert(productData);

  }


  if (result.error) {

    alert(
      "حدث خطأ: " +
      result.error.message
    );

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
   ترتيب المنتجات للأعلى
========================= */

async function moveProductUp(id) {

  const index =
    products.findIndex(
      p => p.id === id
    );

  if (index <= 0) return;


  const current =
    products[index];

  const previous =
    products[index - 1];


  await swapProductOrder(
    current,
    previous
  );

}


/* =========================
   ترتيب المنتجات للأسفل
========================= */

async function moveProductDown(id) {

  const index =
    products.findIndex(
      p => p.id === id
    );


  if (
    index === -1 ||
    index >= products.length - 1
  ) {
    return;
  }


  const current =
    products[index];

  const next =
    products[index + 1];


  await swapProductOrder(
    current,
    next
  );

}


/* =========================
   تبديل ترتيب منتجين
========================= */

async function swapProductOrder(a, b) {

  const orderA =
    Number(a.sort_order) || 0;

  const orderB =
    Number(b.sort_order) || 0;


  const { error } =
    await supabaseClient
      .from("products")
      .upsert([

        {
          id: a.id,
          name: a.name,
          price: a.price,
          stock: a.stock,
          category_id: a.category_id,
          image_url: a.image_url,
          description: a.description,
          active: a.active,
          featured: a.featured,
          sort_order: orderB
        },

        {
          id: b.id,
          name: b.name,
          price: b.price,
          stock: b.stock,
          category_id: b.category_id,
          image_url: b.image_url,
          description: b.description,
          active: b.active,
          featured: b.featured,
          sort_order: orderA
        }

      ]);


  if (error) {

    alert(
      "حدث خطأ في ترتيب المنتجات: " +
      error.message
    );

    return;
  }


  await loadProducts();

}


/* =========================
   تعديل المخزون
========================= */

async function changeStock(id) {

  const product =
    products.find(
      p => p.id === id
    );

  if (!product) return;


  const value =
    prompt(
      `المخزون الحالي: ${product.stock}\nاكتب العدد الجديد:`,
      product.stock
    );


  if (value === null) return;


  const stock =
    Number(value);


  if (
    !Number.isInteger(stock) ||
    stock < 0
  ) {

    alert("اكتب رقم صحيح");

    return;
  }


  const { error } =
    await supabaseClient
      .from("products")
      .update({
        stock
      })
      .eq("id", id);


  if (error) {

    alert(
      "حدث خطأ: " +
      error.message
    );

    return;
  }


  await loadProducts();

}


/* =========================
   حذف المنتج
========================= */

async function deleteProduct(id) {

  const product =
    products.find(
      p => p.id === id
    );

  if (!product) return;


  const confirmed =
    confirm(
      `هل تريد حذف "${product.name}"؟`
    );


  if (!confirmed) return;


  const { error } =
    await supabaseClient
      .from("products")
      .delete()
      .eq("id", id);


  if (error) {

    alert(
      "حدث خطأ: " +
      error.message
    );

    return;
  }


  await loadProducts();

  updateStats();

}


/* ==================================================
   إعدادات شكل المتجر
================================================== */

async function loadStoreSettings() {

  const { data, error } =
    await supabaseClient
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();


  if (error) {

    console.error(error);

    return;
  }


  if (!data) return;


  document
    .getElementById("productLayout")
    .value =
      data.product_layout || "grid";


  document
    .getElementById("productsPerRow")
    .value =
      String(
        data.products_per_row || 2
      );


  document
    .getElementById("showCategories")
    .checked =
      data.show_categories !== false;


  document
    .getElementById("showFeatured")
    .checked =
      data.show_featured !== false;

}


/* =========================
   حفظ إعدادات المتجر
========================= */

async function saveStoreSettings() {

  const productLayout =
    document
      .getElementById("productLayout")
      .value;


  const productsPerRow =
    Number(
      document
        .getElementById("productsPerRow")
        .value
    );


  const showCategories =
    document
      .getElementById("showCategories")
      .checked;


  const showFeatured =
    document
      .getElementById("showFeatured")
      .checked;


  const { error } =
    await supabaseClient
      .from("store_settings")
      .update({

        product_layout:
          productLayout,

        products_per_row:
          productsPerRow,

        show_categories:
          showCategories,

        show_featured:
          showFeatured,

        updated_at:
          new Date().toISOString()

      })
      .eq("id", 1);


  const message =
    document
      .getElementById("settingsMessage");


  if (error) {

    message.textContent =
      "حدث خطأ: " +
      error.message;

    return;
  }


  message.textContent =
    "تم حفظ إعدادات المتجر بنجاح ✅";


  setTimeout(() => {

    message.textContent = "";

  }, 3000);

}


/* ==================================================
   الطلبات
================================================== */

async function loadOrders() {

  const { data, error } =
    await supabaseClient
      .from("orders")
      .select("*")
      .order("id", {
        ascending: false
      });


  if (error) {

    console.error(error);

    return;
  }


  orders = data || [];

  renderOrders();

}


function renderOrders() {

  const container =
    document.getElementById(
      "ordersList"
    );


  if (!orders.length) {

    container.innerHTML = `
      <div class="item">
        لا توجد طلبات حاليًا.
      </div>
    `;

    return;
  }


  container.innerHTML =
    orders.map(order => `

      <div class="item">

        <div class="item-info">

          <strong>
            🧾
            ${escapeHtml(
              order.order_number
            )}
          </strong>

          <small>

            👤
            ${escapeHtml(
              order.customer_name
            )}

            |

            📞
            ${escapeHtml(
              order.phone
            )}

            |

            📍
            ${escapeHtml(
              order.city
            )}

            |

            💰
            ${Number(order.total)
              .toLocaleString("ar-IQ")}
            د.ع

            |

            الحالة:
            ${escapeHtml(
              order.status
            )}

          </small>

        </div>


        <div class="item-actions">

          <button
            class="edit-btn"
            onclick="changeOrderStatus(${order.id})"
          >
            ✏️ الحالة
          </button>

        </div>

      </div>

    `).join("");

}


/* =========================
   تغيير حالة الطلب
========================= */

async function changeOrderStatus(id) {

  const order =
    orders.find(
      o => o.id === id
    );


  if (!order) return;


  const status =
    prompt(
      "اكتب حالة الطلب:\nجديد\nقيد التجهيز\nتم الشحن\nمكتمل\nملغي",
      order.status
    );


  if (
    !status ||
    !status.trim()
  ) {
    return;
  }


  const { error } =
    await supabaseClient
      .from("orders")
      .update({
        status:
          status.trim()
      })
      .eq("id", id);


  if (error) {

    alert(
      "حدث خطأ: " +
      error.message
    );

    return;
  }


  await loadOrders();

}


/* ==================================================
   الإحصائيات
================================================== */

function updateStats() {

  document
    .getElementById("productsCount")
    .textContent =
      products.length;


  document
    .getElementById("categoriesCount")
    .textContent =
      categories.length;


  document
    .getElementById("ordersCount")
    .textContent =
      orders.length;

}


/* ==================================================
   حماية النصوص
================================================== */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}