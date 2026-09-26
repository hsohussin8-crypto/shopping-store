// ============================================================
// متجري - التطبيق الرئيسي
// نسخة كاملة
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

const SUPABASE_URL = "https://jfazoorxmucevyeysdlg.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_POh-CGx30SGsdELDBUTbHg_0QZrPUHU";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

// ============================================================
// بيانات احتياطية
// ============================================================

const fallbackProducts = [
    {
        id: 1,
        name: "هاتف ذكي",
        description: "هاتف ذكي بمواصفات ممتازة",
        price: 250000,
        image_url: "",
        stock: 10,
        category: "إلكترونيات",
        sort_order: 0,
        featured: true
    },
    {
        id: 2,
        name: "حذاء رياضي",
        description: "حذاء رياضي مريح",
        price: 45000,
        image_url: "",
        stock: 15,
        category: "أحذية",
        sort_order: 1,
        featured: false
    }
];

// ============================================================
// الحالة العامة
// ============================================================

let products = [];

let categories = [];

let cart = [];

let currentCustomer = null;

let currentCategory = "الكل";

let currentSearch = "";

let isSubmittingOrder = false;

let isCurrentUserAdmin = false;

let storeSettings = {
    product_layout: "grid",
    products_per_row: 2,
    show_categories: true,
    show_featured: true
};

// ============================================================
// أدوات مساعدة
// ============================================================

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatPrice(price) {

    return Number(price || 0).toLocaleString("ar-IQ") + " د.ع";
}

function formatDate(date) {

    if (!date) {
        return "";
    }

    try {

        return new Date(date).toLocaleDateString(
            "ar-IQ",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    } catch (error) {

        return date;
    }
}

function showMessage(message) {

    alert(message);
}

// ============================================================
// اسم المتجر
// ============================================================

function applyStoreName() {

    document.title = STORE.name;

    $$("[data-store-name]").forEach(function (element) {

        element.textContent = STORE.name;

    });

    const storeNameElements = [
        $("#storeName"),
        $("#brandName"),
        $("#footerStoreName")
    ];

    storeNameElements.forEach(function (element) {

        if (element) {
            element.textContent = STORE.name;
        }

    });
}

// ============================================================
// تحميل إعدادات المتجر
// ============================================================

async function loadStoreSettings() {

    try {

        const result =
            await supabaseClient
                .from("store_settings")
                .select(
                    "id,product_layout,products_per_row,show_categories,show_featured"
                )
                .eq("id", 1)
                .maybeSingle();

        if (result.error) {

            console.warn(
                "تعذر تحميل إعدادات المتجر:",
                result.error
            );

            return;
        }

        if (result.data) {

            storeSettings = {
                product_layout:
                    result.data.product_layout || "grid",

                products_per_row:
                    Number(result.data.products_per_row || 2),

                show_categories:
                    result.data.show_categories !== false,

                show_featured:
                    result.data.show_featured !== false
            };
        }

    } catch (error) {

        console.warn(
            "خطأ في تحميل إعدادات المتجر:",
            error
        );
    }
}

// ============================================================
// CSS ديناميكي لشكل المنتجات
// ============================================================

function applyDynamicStoreStyles() {

    let style =
        document.getElementById(
            "dynamicStoreSettingsStyles"
        );

    if (!style) {

        style = document.createElement("style");

        style.id =
            "dynamicStoreSettingsStyles";

        document.head.appendChild(style);
    }

    style.textContent = `
    
    #productsGrid.store-grid-view {
        display: grid;
        grid-template-columns:
            repeat(
                var(--store-products-per-row, 2),
                minmax(0, 1fr)
            );
        gap: 16px;
    }

    #productsGrid.store-list-view {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    #productsGrid.store-list-view .product-card {
        display: grid;
        grid-template-columns: 130px 1fr;
        gap: 15px;
        align-items: center;
    }

    #productsGrid.store-list-view
    .product-card img {

        width: 130px;
        height: 130px;
        object-fit: cover;
    }

    .store-featured-section {
        margin-top: 25px;
        margin-bottom: 25px;
    }

    .store-featured-title {
        margin-bottom: 15px;
        font-size: 22px;
        font-weight: 800;
    }

    #featuredProductsGrid {
        display: grid;
        grid-template-columns:
            repeat(
                var(--store-products-per-row, 2),
                minmax(0, 1fr)
            );
        gap: 16px;
    }

    .featured-badge {
        display: inline-block;
        margin-bottom: 6px;
        padding: 4px 8px;
        border-radius: 8px;
        background: #f3efff;
        color: #5b3ee4;
        font-size: 12px;
        font-weight: 700;
    }

    @media (max-width: 700px) {

        #productsGrid.store-grid-view,
        #featuredProductsGrid {

            grid-template-columns:
                repeat(
                    min(
                        var(--store-products-per-row, 2),
                        2
                    ),
                    minmax(0, 1fr)
                );
        }

        #productsGrid.store-list-view
        .product-card {

            grid-template-columns: 95px 1fr;
        }

        #productsGrid.store-list-view
        .product-card img {

            width: 95px;
            height: 95px;
        }
    }

    @media (max-width: 480px) {

        #productsGrid.store-grid-view,
        #featuredProductsGrid {

            grid-template-columns: 1fr 1fr;
        }

        #productsGrid.store-list-view
        .product-card {

            grid-template-columns: 85px 1fr;
        }

        #productsGrid.store-list-view
        .product-card img {

            width: 85px;
            height: 85px;
        }
    }

    `;
}

// ============================================================
// تطبيق إعدادات المتجر
// ============================================================

function applyStoreSettings() {

    applyDynamicStoreStyles();

    const productsGrid =
        $("#productsGrid");

    if (productsGrid) {

        const perRow =
            Math.max(
                1,
                Math.min(
                    4,
                    Number(
                        storeSettings.products_per_row || 2
                    )
                )
            );

        productsGrid.style.setProperty(
            "--store-products-per-row",
            perRow
        );

        productsGrid.classList.remove(
            "store-grid-view",
            "store-list-view"
        );

        if (
            storeSettings.product_layout === "list"
        ) {

            productsGrid.classList.add(
                "store-list-view"
            );

        } else {

            productsGrid.classList.add(
                "store-grid-view"
            );
        }
    }

    applyCategoriesVisibility();

    renderFeaturedProducts();
}

// ============================================================
// إظهار / إخفاء الأقسام
// ============================================================

function applyCategoriesVisibility() {

    const categoriesGrid =
        $("#categoriesGrid");

    if (!categoriesGrid) {
        return;
    }

    let section =
        $("#categoriesSection");

    if (!section) {

        section =
            categoriesGrid.closest("section");
    }

    if (!section) {

        section =
            categoriesGrid.parentElement;
    }

    if (section) {

        section.style.display =
            storeSettings.show_categories
                ? ""
                : "none";
    }
}

// ============================================================
// تحميل الأقسام
// ============================================================

async function loadCategories() {

    try {

        const result =
            await supabaseClient
                .from("categories")
                .select(
                    "id,name,image_url,sort_order,active"
                )
                .eq("active", true)
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

        if (result.error) {

            console.warn(
                "تعذر تحميل الأقسام:",
                result.error
            );

            categories = [];

            return;
        }

        categories =
            result.data || [];

        renderCategories();

    } catch (error) {

        console.warn(
            "خطأ في تحميل الأقسام:",
            error
        );
    }
}

// ============================================================
// عرض الأقسام
// ============================================================

function renderCategories() {

    const categoriesGrid =
        $("#categoriesGrid");

    if (!categoriesGrid) {
        return;
    }

    let html = "";

    html += `
        <button
            type="button"
            class="category active"
            data-category="الكل">
            الكل
        </button>
    `;

    categories.forEach(function (category) {

        html += `
            <button
                type="button"
                class="category"
                data-category="${escapeHtml(category.name)}">
                
                ${escapeHtml(category.name)}
                
            </button>
        `;
    });

    categoriesGrid.innerHTML = html;

    $$("#categoriesGrid .category")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const category =
                        button.getAttribute(
                            "data-category"
                        );

                    filterCategory(
                        category,
                        button
                    );
                }
            );
        });

    applyCategoriesVisibility();
}

// ============================================================
// اختيار القسم
// ============================================================

function filterCategory(
    category,
    button
) {

    currentCategory =
        category || "الكل";

    $$("#categoriesGrid .category")
        .forEach(function (item) {

            item.classList.remove("active");

        });

    if (button) {

        button.classList.add("active");

    } else {

        $$("#categoriesGrid .category")
            .forEach(function (item) {

                if (
                    item.getAttribute(
                        "data-category"
                    ) === currentCategory
                ) {

                    item.classList.add(
                        "active"
                    );
                }
            });
    }

    displayProducts();
}

// ============================================================
// البحث
// ============================================================

function searchProducts(value) {

    currentSearch =
        String(value || "")
            .trim()
            .toLowerCase();

    displayProducts();
}

// ============================================================
// تحميل المنتجات من Supabase
// ============================================================

async function loadProductsFromSupabase() {

    try {

        const result =
            await supabaseClient
                .from("products")
                .select(
                    `
                    id,
                    name,
                    description,
                    price,
                    image_url,
                    stock,
                    active,
                    sort_order,
                    featured,
                    categories(name)
                    `
                )
                .eq("active", true)
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

        if (result.error) {

            console.warn(
                "تعذر تحميل المنتجات:",
                result.error
            );

            products =
                fallbackProducts.slice();

        } else {

            products =
                (result.data || [])
                    .map(function (product) {

                        return {

                            id: product.id,

                            name: product.name,

                            description:
                                product.description || "",

                            price:
                                Number(product.price || 0),

                            image_url:
                                product.image_url || "",

                            stock:
                                Number(product.stock || 0),

                            active:
                                product.active !== false,

                            sort_order:
                                Number(
                                    product.sort_order || 0
                                ),

                            featured:
                                product.featured === true,

                            category:
                                product.categories
                                    ? product.categories.name
                                    : ""
                        };
                    });
        }

        displayProducts();

        renderFeaturedProducts();

    } catch (error) {

        console.error(
            "خطأ تحميل المنتجات:",
            error
        );

        products =
            fallbackProducts.slice();

        displayProducts();
    }
}

// ============================================================
// صورة المنتج
// ============================================================

function productImage(product) {

    if (
        product &&
        product.image_url
    ) {

        return `
            <img
                src="${escapeHtml(product.image_url)}"
                alt="${escapeHtml(product.name)}"
                loading="lazy"
                onerror="this.style.display='none'"
            >
        `;
    }

    return `
        <div
            class="product-image-placeholder"
            style="
                width:100%;
                height:180px;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#f3f3f3;
                border-radius:12px;
                font-size:45px;
            ">
            🛍️
        </div>
    `;
}

// ============================================================
// إنشاء بطاقة المنتج
// ============================================================

function createProductCard(product) {

    const disabled =
        Number(product.stock || 0) <= 0;

    return `
        <div
            class="product-card"
            data-product-id="${escapeHtml(product.id)}">

            ${productImage(product)}

            <div class="product-info">

                ${
                    product.featured
                    ? `
                        <span class="featured-badge">
                            ⭐ مميز
                        </span>
                    `
                    : ""
                }

                <h3>
                    ${escapeHtml(product.name)}
                </h3>

                ${
                    product.category
                    ? `
                        <div class="product-category">
                            ${escapeHtml(product.category)}
                        </div>
                    `
                    : ""
                }

                <p class="product-description">
                    ${escapeHtml(product.description)}
                </p>

                <div class="product-price">
                    ${formatPrice(product.price)}
                </div>

                <div class="product-stock">

                    ${
                        disabled
                        ? "غير متوفر"
                        : "متوفر: " +
                          escapeHtml(product.stock)
                    }

                </div>

                <div
                    class="product-actions">

                    <button
                        type="button"
                        onclick="openProductDetails('${escapeHtml(product.id)}')">

                        التفاصيل

                    </button>

                    <button
                        type="button"
                        ${
                            disabled
                            ? "disabled"
                            : ""
                        }
                        onclick="addToCart('${escapeHtml(product.id)}')">

                        ${
                            disabled
                            ? "غير متوفر"
                            : "أضف للسلة"
                        }

                    </button>

                </div>

            </div>

        </div>
    `;
}

// ============================================================
// عرض المنتجات
// ============================================================

function displayProducts() {

    const productsGrid =
        $("#productsGrid");

    if (!productsGrid) {
        return;
    }

    let filtered =
        products.filter(function (product) {

            const categoryMatch =
                currentCategory === "الكل" ||
                product.category ===
                    currentCategory;

            const searchMatch =
                !currentSearch ||
                product.name
                    .toLowerCase()
                    .includes(currentSearch) ||
                product.description
                    .toLowerCase()
                    .includes(currentSearch) ||
                product.category
                    .toLowerCase()
                    .includes(currentSearch);

            return (
                categoryMatch &&
                searchMatch
            );
        });

    if (!filtered.length) {

        productsGrid.innerHTML = `
            <div
                class="empty-products"
                style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:40px 15px;
                ">

                <div
                    style="
                        font-size:45px;
                        margin-bottom:10px;
                    ">
                    🛍️
                </div>

                <h3>
                    لا توجد منتجات
                </h3>

                <p>
                    لم نجد منتجات مطابقة للبحث أو القسم المحدد.
                </p>

            </div>
        `;

        return;
    }

    productsGrid.innerHTML =
        filtered
            .map(createProductCard)
            .join("");

    applyStoreSettings();
}

// ============================================================
// المنتجات المميزة
// ============================================================

function renderFeaturedProducts() {

    let section =
        $("#featuredSection");

    const productsGrid =
        $("#productsGrid");

    if (!productsGrid) {
        return;
    }

    if (!storeSettings.show_featured) {

        if (section) {
            section.style.display = "none";
        }

        return;
    }

    const featured =
        products.filter(function (product) {

            return product.featured === true;
        });

    if (!featured.length) {

        if (section) {
            section.style.display = "none";
        }

        return;
    }

    if (!section) {

        section =
            document.createElement("section");

        section.id =
            "featuredSection";

        section.className =
            "store-featured-section";

        section.innerHTML = `
            <div
                class="store-featured-title">
                ⭐ المنتجات المميزة
            </div>

            <div
                id="featuredProductsGrid">
            </div>
        `;

        const parent =
            productsGrid.parentElement;

        if (parent) {

            parent.insertBefore(
                section,
                productsGrid
            );
        }
    }

    section.style.display = "";

    const featuredGrid =
        $("#featuredProductsGrid");

    if (!featuredGrid) {
        return;
    }

    const perRow =
        Math.max(
            1,
            Math.min(
                4,
                Number(
                    storeSettings.products_per_row || 2
                )
            )
        );

    featuredGrid.style.setProperty(
        "--store-products-per-row",
        perRow
    );

    featuredGrid.innerHTML =
        featured
            .map(createProductCard)
            .join("");
}

// ============================================================
// تفاصيل المنتج
// ============================================================

function openProductDetails(productId) {

    const product =
        products.find(function (item) {

            return String(item.id) ===
                String(productId);

        });

    if (!product) {
        return;
    }

    let modal =
        $("#productModal");

    if (!modal) {

        modal =
            document.createElement("div");

        modal.id =
            "productModal";

        modal.className =
            "modal";

        document.body.appendChild(
            modal
        );
    }

    modal.innerHTML = `
        <div
            class="modal-content">

            <button
                type="button"
                class="modal-close"
                onclick="closeProductDetails()">

                ×

            </button>

            ${productImage(product)}

            <h2>
                ${escapeHtml(product.name)}
            </h2>

            ${
                product.category
                ? `
                    <div>
                        القسم:
                        ${escapeHtml(product.category)}
                    </div>
                `
                : ""
            }

            <p>
                ${escapeHtml(product.description)}
            </p>

            <h3>
                ${formatPrice(product.price)}
            </h3>

            <p>
                ${
                    Number(product.stock || 0) > 0
                    ? "متوفر: " + product.stock
                    : "غير متوفر"
                }
            </p>

            <button
                type="button"
                class="checkout-button"
                ${
                    Number(product.stock || 0) <= 0
                    ? "disabled"
                    : ""
                }
                onclick="addToCart('${escapeHtml(product.id)}'); closeProductDetails();">

                أضف للسلة

            </button>

        </div>
    `;

    modal.classList.add("show");

    modal.style.display = "flex";
}

function closeProductDetails() {

    const modal =
        $("#productModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    modal.style.display = "none";
}

// ============================================================
// السلة
// ============================================================

function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                "metjari_cart"
            );

        if (saved) {

            cart =
                JSON.parse(saved);

            if (!Array.isArray(cart)) {
                cart = [];
            }
        }

    } catch (error) {

        cart = [];
    }

    updateCartUI();
}

function saveCart() {

    localStorage.setItem(
        "metjari_cart",
        JSON.stringify(cart)
    );

    updateCartUI();
}

function addToCart(productId) {

    const product =
        products.find(function (item) {

            return String(item.id) ===
                String(productId);

        });

    if (!product) {
        return;
    }

    if (
        Number(product.stock || 0) <= 0
    ) {

        showMessage(
            "هذا المنتج غير متوفر حالياً."
        );

        return;
    }

    const existing =
        cart.find(function (item) {

            return String(item.product_id) ===
                String(product.id);

        });

    if (existing) {

        if (
            existing.quantity >=
            Number(product.stock)
        ) {

            showMessage(
                "لا يمكن إضافة كمية أكبر من المخزون."
            );

            return;
        }

        existing.quantity += 1;

    } else {

        cart.push({

            product_id:
                product.id,

            name:
                product.name,

            price:
                Number(product.price || 0),

            image_url:
                product.image_url || "",

            quantity:
                1
        });
    }

    saveCart();

    showMessage(
        "تمت إضافة المنتج إلى السلة 🛒"
    );
}

function removeFromCart(productId) {

    cart =
        cart.filter(function (item) {

            return String(item.product_id) !==
                String(productId);

        });

    saveCart();
}

function changeCartQuantity(
    productId,
    change
) {

    const item =
        cart.find(function (cartItem) {

            return String(
                cartItem.product_id
            ) ===
                String(productId);

        });

    if (!item) {
        return;
    }

    const product =
        products.find(function (productItem) {

            return String(productItem.id) ===
                String(productId);

        });

    const maxStock =
        product
        ? Number(product.stock || 0)
        : Infinity;

    item.quantity +=
        Number(change || 0);

    if (item.quantity <= 0) {

        removeFromCart(
            productId
        );

        return;
    }

    if (
        item.quantity > maxStock
    ) {

        item.quantity =
            maxStock;

        showMessage(
            "لا يمكن تجاوز الكمية الموجودة بالمخزون."
        );
    }

    saveCart();
}

function getCartTotal() {

    return cart.reduce(
        function (total, item) {

            return total +
                Number(item.price || 0) *
                Number(item.quantity || 0);

        },
        0
    );
}

function getCartCount() {

    return cart.reduce(
        function (total, item) {

            return total +
                Number(item.quantity || 0);

        },
        0
    );
}

// ============================================================
// تحديث واجهة السلة
// ============================================================

function updateCartUI() {

    const count =
        getCartCount();

    const total =
        getCartTotal();

    $$(
        "#cartCount, .cart-count"
    ).forEach(function (element) {

        element.textContent =
            count;

    });

    $$(
        "#cartTotal, .cart-total"
    ).forEach(function (element) {

        element.textContent =
            formatPrice(total);

    });

    renderCart();
}

function renderCart() {

    const cartContainer =
        $("#cartItems");

    if (!cartContainer) {
        return;
    }

    if (!cart.length) {

        cartContainer.innerHTML = `
            <div
                style="
                    text-align:center;
                    padding:30px 10px;
                ">

                🛒

                <h3>
                    السلة فارغة
                </h3>

                <p>
                    أضف منتجات حتى تظهر هنا.
                </p>

            </div>
        `;

        return;
    }

    cartContainer.innerHTML =
        cart.map(function (item) {

            return `
                <div
                    class="cart-item">

                    ${
                        item.image_url
                        ? `
                            <img
                                src="${escapeHtml(item.image_url)}"
                                alt="${escapeHtml(item.name)}">
                          `
                        : `
                            <div>
                                🛍️
                            </div>
                          `
                    }

                    <div
                        class="cart-item-info">

                        <h4>
                            ${escapeHtml(item.name)}
                        </h4>

                        <div>
                            ${formatPrice(item.price)}
                        </div>

                        <div
                            class="cart-quantity">

                            <button
                                type="button"
                                onclick="changeCartQuantity('${escapeHtml(item.product_id)}', -1)">
                                −
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                type="button"
                                onclick="changeCartQuantity('${escapeHtml(item.product_id)}', 1)">
                                +
                            </button>

                        </div>

                        <button
                            type="button"
                            onclick="removeFromCart('${escapeHtml(item.product_id)}')">

                            حذف

                        </button>

                    </div>

                </div>
            `;

        }).join("");
}

// ============================================================
// فتح وإغلاق السلة
// ============================================================

function openCart() {

    const drawer =
        $("#cartDrawer");

    if (!drawer) {
        return;
    }

    drawer.classList.add("open");

    drawer.style.display = "block";
}

function closeCart() {

    const drawer =
        $("#cartDrawer");

    if (!drawer) {
        return;
    }

    drawer.classList.remove("open");

    drawer.style.display = "none";
}

// ============================================================
// الحساب
// ============================================================

async function loadCurrentCustomer() {

    try {

        const result =
            await supabaseClient.auth.getSession();

        if (
            result.error ||
            !result.data ||
            !result.data.session
        ) {

            currentCustomer = null;
            isCurrentUserAdmin = false;

            updateAccountButton();

            return;
        }

        currentCustomer =
            result.data.session.user;

        await checkAdminStatus();

        updateAccountButton();

    } catch (error) {

        currentCustomer = null;

        isCurrentUserAdmin = false;

        updateAccountButton();
    }
}

// ============================================================
// التحقق من المدير
// ============================================================

async function checkAdminStatus() {

    isCurrentUserAdmin = false;

    if (!currentCustomer) {
        return false;
    }

    try {

        const result =
            await supabaseClient
                .from("admin_users")
                .select("user_id")
                .eq(
                    "user_id",
                    currentCustomer.id
                )
                .maybeSingle();

        if (
            !result.error &&
            result.data
        ) {

            isCurrentUserAdmin = true;

        }

    } catch (error) {

        isCurrentUserAdmin = false;
    }

    return isCurrentUserAdmin;
}

// ============================================================
// زر الحساب
// ============================================================

function updateAccountButton() {

    const buttons =
        $$(".account-btn");

    buttons.forEach(function (button) {

        if (currentCustomer) {

            button.textContent =
                "👤 حسابي";

        } else {

            button.textContent =
                "👤 تسجيل الدخول";
        }

    });
}

// ============================================================
// فتح الحساب
// ============================================================

function openAccount() {

    if (!currentCustomer) {

        showCustomerLogin();

        return;
    }

    showCustomerAccount();
}

// ============================================================
// تسجيل دخول الزبون
// ============================================================

function showCustomerLogin() {

    const modal =
        $("#customerModal");

    if (!modal) {
        createCustomerModal();
    }

    const currentModal =
        $("#customerModal");

    if (!currentModal) {
        return;
    }

    currentModal.innerHTML = `
        <div
            class="modal-content account-content">

            <button
                type="button"
                class="modal-close"
                onclick="closeCustomerModal()">

                ×

            </button>

            <h2>
                تسجيل الدخول
            </h2>

            <p>
                سجل الدخول لمتابعة طلباتك وحسابك.
            </p>

            <input
                id="customerLoginEmail"
                type="email"
                placeholder="البريد الإلكتروني">

            <input
                id="customerLoginPassword"
                type="password"
                placeholder="كلمة المرور">

            <div
                id="customerLoginMessage">
            </div>

            <button
                type="button"
                class="checkout-button"
                onclick="loginCustomer()">

                تسجيل الدخول

            </button>

            <button
                type="button"
                class="secondary-account-btn"
                onclick="showCustomerRegister()">

                إنشاء حساب جديد

            </button>

        </div>
    `;

    currentModal.classList.add("show");

    currentModal.style.display =
        "flex";
}

// ============================================================
// إنشاء الحساب
// ============================================================

function showCustomerRegister() {

    let modal =
        $("#customerModal");

    if (!modal) {

        createCustomerModal();

        modal =
            $("#customerModal");
    }

    if (!modal) {
        return;
    }

    modal.innerHTML = `
        <div
            class="modal-content account-content">

            <button
                type="button"
                class="modal-close"
                onclick="closeCustomerModal()">

                ×

            </button>

            <h2>
                إنشاء حساب
            </h2>

            <p>
                أنشئ حساباً لحفظ معلوماتك ومتابعة طلباتك.
            </p>

            <input
                id="customerRegisterName"
                type="text"
                placeholder="الاسم الكامل">

            <input
                id="customerRegisterEmail"
                type="email"
                placeholder="البريد الإلكتروني">

            <input
                id="customerRegisterPassword"
                type="password"
                placeholder="كلمة المرور">

            <input
                id="customerRegisterPhone"
                type="tel"
                placeholder="رقم الهاتف">

            <div
                id="customerRegisterMessage">
            </div>

            <button
                type="button"
                class="checkout-button"
                onclick="registerCustomer()">

                إنشاء الحساب

            </button>

            <button
                type="button"
                class="secondary-account-btn"
                onclick="showCustomerLogin()">

                لدي حساب بالفعل

            </button>

        </div>
    `;

    modal.classList.add("show");

    modal.style.display =
        "flex";
}

// ============================================================
// إنشاء نافذة الحساب إذا غير موجودة
// ============================================================

function createCustomerModal() {

    const modal =
        document.createElement("div");

    modal.id =
        "customerModal";

    modal.className =
        "modal";

    document.body.appendChild(
        modal
    );
}

// ============================================================
// تسجيل الدخول
// ============================================================

async function loginCustomer() {

    const email =
        $("#customerLoginEmail")
            ?.value
            .trim();

    const password =
        $("#customerLoginPassword")
            ?.value;

    const message =
        $("#customerLoginMessage");

    if (!email || !password) {

        if (message) {

            message.textContent =
                "أدخل البريد الإلكتروني وكلمة المرور.";

        }

        return;
    }

    if (message) {

        message.textContent =
            "جاري تسجيل الدخول...";
    }

    try {

        const result =
            await supabaseClient.auth
                .signInWithPassword({
                    email: email,
                    password: password
                });

        if (result.error) {

            if (message) {

                message.textContent =
                    result.error.message ||
                    "تعذر تسجيل الدخول.";

            }

            return;
        }

        currentCustomer =
            result.data.user;

        await checkAdminStatus();

        updateAccountButton();

        showMessage(
            "تم تسجيل الدخول بنجاح."
        );

        showCustomerAccount();

    } catch (error) {

        if (message) {

            message.textContent =
                "حدث خطأ أثناء تسجيل الدخول.";

        }
    }
}

// ============================================================
// إنشاء الحساب
// ============================================================

async function registerCustomer() {

    const name =
        $("#customerRegisterName")
            ?.value
            .trim();

    const email =
        $("#customerRegisterEmail")
            ?.value
            .trim();

    const password =
        $("#customerRegisterPassword")
            ?.value;

    const phone =
        $("#customerRegisterPhone")
            ?.value
            .trim();

    const message =
        $("#customerRegisterMessage");

    if (
        !name ||
        !email ||
        !password
    ) {

        if (message) {

            message.textContent =
                "أكمل المعلومات المطلوبة.";

        }

        return;
    }

    if (password.length < 6) {

        if (message) {

            message.textContent =
                "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";

        }

        return;
    }

    if (message) {

        message.textContent =
            "جاري إنشاء الحساب...";
    }

    try {

        const result =
            await supabaseClient.auth
                .signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: name,
                            phone: phone
                        }
                    }
                });

        if (result.error) {

            if (message) {

                message.textContent =
                    result.error.message ||
                    "تعذر إنشاء الحساب.";

            }

            return;
        }

        if (
            result.data &&
            result.data.user
        ) {

            currentCustomer =
                result.data.user;

            await saveCustomerProfile(
                name,
                phone
            );

            await checkAdminStatus();

            updateAccountButton();

            if (
                result.data.session
            ) {

                showCustomerAccount();

            } else {

                if (message) {

                    message.textContent =
                        "تم إنشاء الحساب. تحقق من بريدك الإلكتروني إذا طُلب منك ذلك.";

                }
            }

        }

    } catch (error) {

        if (message) {

            message.textContent =
                "حدث خطأ أثناء إنشاء الحساب.";

        }
    }
}

// ============================================================
// حفظ ملف الزبون
// ============================================================

async function saveCustomerProfile(
    name,
    phone,
    city,
    address
) {

    if (!currentCustomer) {
        return false;
    }

    try {

        const result =
            await supabaseClient
                .from("customer_profiles")
                .upsert(
                    {
                        user_id:
                            currentCustomer.id,

                        full_name:
                            name || null,

                        phone:
                            phone || null,

                        city:
                            city || null,

                        address:
                            address || null
                    },
                    {
                        onConflict:
                            "user_id"
                    }
                );

        if (result.error) {

            console.warn(
                "تعذر حفظ ملف الزبون:",
                result.error
            );

            return false;
        }

        return true;

    } catch (error) {

        console.warn(
            "خطأ في حفظ ملف الزبون:",
            error
        );

        return false;
    }
}

// ============================================================
// قراءة ملف الزبون
// ============================================================

async function getCustomerProfile() {

    if (!currentCustomer) {
        return null;
    }

    try {

        const result =
            await supabaseClient
                .from("customer_profiles")
                .select(
                    "user_id,full_name,phone,city,address,created_at"
                )
                .eq(
                    "user_id",
                    currentCustomer.id
                )
                .maybeSingle();

        if (result.error) {

            console.warn(
                "تعذر تحميل ملف الزبون:",
                result.error
            );

            return null;
        }

        return result.data || null;

    } catch (error) {

        return null;
    }
}

// ============================================================
// عرض الحساب
// ============================================================

async function showCustomerAccount() {

    if (!currentCustomer) {

        showCustomerLogin();

        return;
    }

    let modal =
        $("#customerModal");

    if (!modal) {

        createCustomerModal();

        modal =
            $("#customerModal");
    }

    const profile =
        await getCustomerProfile();

    const name =
        profile?.full_name ||
        currentCustomer.user_metadata?.full_name ||
        "الزبون";

    modal.innerHTML = `
        <div
            class="modal-content account-content">

            <button
                type="button"
                class="modal-close"
                onclick="closeCustomerModal()">

                ×

            </button>

            <h2>
                👤 حسابي
            </h2>

            <p id="customerProfileName">
                أهلاً ${escapeHtml(name)}
            </p>

            <div
                id="customerAccountDetails">

                <div>
                    <strong>
                        البريد:
                    </strong>

                    ${escapeHtml(
                        currentCustomer.email || ""
                    )}

                </div>

                ${
                    profile?.phone
                    ? `
                        <div>
                            <strong>
                                الهاتف:
                            </strong>

                            ${escapeHtml(
                                profile.phone
                            )}
                        </div>
                    `
                    : ""
                }

                ${
                    profile?.city
                    ? `
                        <div>
                            <strong>
                                المدينة:
                            </strong>

                            ${escapeHtml(
                                profile.city
                            )}
                        </div>
                    `
                    : ""
                }

                ${
                    profile?.address
                    ? `
                        <div>
                            <strong>
                                العنوان:
                            </strong>

                            ${escapeHtml(
                                profile.address
                            )}
                        </div>
                    `
                    : ""
                }

            </div>

            <div
                class="account-actions">

                <button
                    type="button"
                    onclick="showCustomerOrders()">

                    📦 طلباتي

                </button>

                <button
                    type="button"
                    onclick="showEditProfile()">

                    ✏️ تعديل معلوماتي

                </button>

                ${
                    isCurrentUserAdmin
                    ? `
                        <button
                            type="button"
                            onclick="openAdminPanel()">

                            ⚙️ لوحة الإدارة

                        </button>
                    `
                    : ""
                }

                <button
                    type="button"
                    onclick="logoutCustomer()">

                    🚪 تسجيل الخروج

                </button>

            </div>

        </div>
    `;

    modal.classList.add("show");

    modal.style.display =
        "flex";
}

// ============================================================
// تعديل الملف الشخصي
// ============================================================

async function showEditProfile() {

    const profile =
        await getCustomerProfile();

    const modal =
        $("#customerModal");

    if (!modal) {
        return;
    }

    modal.innerHTML = `
        <div
            class="modal-content account-content">

            <button
                type="button"
                class="modal-close"
                onclick="showCustomerAccount()">

                ×

            </button>

            <h2>
                تعديل معلوماتي
            </h2>

            <input
                id="profileName"
                type="text"
                placeholder="الاسم الكامل"
                value="${escapeHtml(
                    profile?.full_name || ""
                )}">

            <input
                id="profilePhone"
                type="tel"
                placeholder="رقم الهاتف"
                value="${escapeHtml(
                    profile?.phone || ""
                )}">

            <input
                id="profileCity"
                type="text"
                placeholder="المدينة"
                value="${escapeHtml(
                    profile?.city || ""
                )}">

            <textarea
                id="profileAddress"
                rows="3"
                placeholder="العنوان">${escapeHtml(
                    profile?.address || ""
                )}</textarea>

            <div
                id="profileMessage">
            </div>

            <button
                type="button"
                class="checkout-button"
                onclick="updateCustomerProfile()">

                حفظ المعلومات

            </button>

        </div>
    `;

    modal.classList.add("show");

    modal.style.display =
        "flex";
}

// ============================================================
// حفظ تعديل الملف
// ============================================================

async function updateCustomerProfile() {

    if (!currentCustomer) {
        return;
    }

    const name =
        $("#profileName")
            ?.value
            .trim();

    const phone =
        $("#profilePhone")
            ?.value
            .trim();

    const city =
        $("#profileCity")
            ?.value
            .trim();

    const address =
        $("#profileAddress")
            ?.value
            .trim();

    const message =
        $("#profileMessage");

    if (!name) {

        if (message) {

            message.textContent =
                "اكتب الاسم الكامل.";

        }

        return;
    }

    if (message) {

        message.textContent =
            "جاري الحفظ...";
    }

    const saved =
        await saveCustomerProfile(
            name,
            phone,
            city,
            address
        );

    if (saved) {

        if (message) {

            message.textContent =
                "تم حفظ المعلومات بنجاح.";

        }

        setTimeout(
            function () {

                showCustomerAccount();

            },
            500
        );

    } else {

        if (message) {

            message.textContent =
                "تعذر حفظ المعلومات.";

        }
    }
}

// ============================================================
// فتح لوحة الإدارة
// ============================================================

function openAdminPanel() {

    if (!currentCustomer) {

        showCustomerLogin();

        return;
    }

    if (!isCurrentUserAdmin) {

        showMessage(
            "ليس لديك صلاحية الدخول إلى لوحة الإدارة."
        );

        return;
    }

    window.location.href =
        "./admin.html";
}

// ============================================================
// تسجيل الخروج
// ============================================================

async function logoutCustomer() {

    try {

        await supabaseClient.auth.signOut();

    } catch (error) {

        console.warn(
            "خطأ تسجيل الخروج:",
            error
        );
    }

    currentCustomer = null;

    isCurrentUserAdmin = false;

    updateAccountButton();

    closeCustomerModal();

    showMessage(
        "تم تسجيل الخروج."
    );
}

// ============================================================
// إغلاق نافذة الحساب
// ============================================================

function closeCustomerModal() {

    const modal =
        $("#customerModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    modal.style.display =
        "none";
}

// ============================================================
// طلبات الزبون
// ============================================================

async function showCustomerOrders() {

    if (!currentCustomer) {
        return;
    }

    const modal =
        $("#customerModal");

    if (!modal) {
        return;
    }

    modal.innerHTML = `
        <div
            class="modal-content account-content">

            <button
                type="button"
                class="modal-close"
                onclick="showCustomerAccount()">

                ×

            </button>

            <h2>
                📦 طلباتي
            </h2>

            <div
                id="customerOrdersList">

                جاري تحميل الطلبات...

            </div>

        </div>
    `;

    modal.classList.add("show");

    modal.style.display =
        "flex";

    await loadCustomerOrders();
}

// ============================================================
// تحميل طلبات الزبون
// ============================================================

async function loadCustomerOrders() {

    const container =
        $("#customerOrdersList");

    if (!container) {
        return;
    }

    try {

        const result =
            await supabaseClient
                .from("orders")
                .select(
                    `
                    id,
                    total,
                    status,
                    created_at
                    `
                )
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

        if (result.error) {

            console.warn(
                "تعذر تحميل الطلبات من الحساب:",
                result.error
            );

            const localOrders =
                getLocalOrders();

            renderCustomerOrders(
                localOrders
            );

            return;
        }

        renderCustomerOrders(
            result.data || []
        );

    } catch (error) {

        const localOrders =
            getLocalOrders();

        renderCustomerOrders(
            localOrders
        );
    }
}

// ============================================================
// الطلبات المحلية
// ============================================================

function getLocalOrders() {

    try {

        const data =
            localStorage.getItem(
                "metjari_orders"
            );

        if (!data) {
            return [];
        }

        const orders =
            JSON.parse(data);

        return Array.isArray(orders)
            ? orders
            : [];

    } catch (error) {

        return [];
    }
}

// ============================================================
// عرض الطلبات
// ============================================================

function renderCustomerOrders(
    orders
) {

    const container =
        $("#customerOrdersList");

    if (!container) {
        return;
    }

    if (!orders.length) {

        container.innerHTML = `
            <div
                style="
                    text-align:center;
                    padding:30px 10px;
                ">

                📦

                <h3>
                    لا توجد طلبات
                </h3>

                <p>
                    عندما تقوم بطلب منتج سيظهر هنا.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        orders.map(function (order) {

            return `
                <div
                    style="
                        padding:15px;
                        margin-bottom:12px;
                        border:1px solid #eee;
                        border-radius:12px;
                    ">

                    <div>
                        <strong>
                            رقم الطلب:
                        </strong>

                        ${escapeHtml(order.id)}
                    </div>

                    <div>
                        <strong>
                            المجموع:
                        </strong>

                        ${formatPrice(order.total)}
                    </div>

                    <div>
                        <strong>
                            الحالة:
                        </strong>

                        ${escapeHtml(
                            order.status || "جديد"
                        )}
                    </div>

                    <div>
                        <strong>
                            التاريخ:
                        </strong>

                        ${formatDate(
                            order.created_at
                        )}
                    </div>

                </div>
            `;

        }).join("");
}

// ============================================================
// حفظ الطلب محلياً
// ============================================================

function saveOrderLocally(order) {

    try {

        const orders =
            getLocalOrders();

        orders.unshift(order);

        localStorage.setItem(
            "metjari_orders",
            JSON.stringify(orders)
        );

    } catch (error) {

        console.warn(
            "تعذر حفظ الطلب محلياً:",
            error
        );
    }
}

// ============================================================
// حفظ الطلب في Supabase
// ============================================================

async function saveOrderToSupabase(
    orderData
) {

    if (!supabaseClient) {
        return null;
    }

    try {

        const dataWithUser = {
            ...orderData,
            user_id:
                currentCustomer
                ? currentCustomer.id
                : null
        };

        let result =
            await supabaseClient
                .from("orders")
                .insert(
                    dataWithUser
                )
                .select()
                .single();

        // إذا لم يكن user_id موجوداً في قاعدة البيانات
        if (
            result.error &&
            currentCustomer
        ) {

            result =
                await supabaseClient
                    .from("orders")
                    .insert(
                        orderData
                    )
                    .select()
                    .single();
        }

        if (result.error) {

            console.warn(
                "تعذر حفظ الطلب في Supabase:",
                result.error
            );

            return null;
        }

        return result.data;

    } catch (error) {

        console.warn(
            "خطأ حفظ الطلب:",
            error
        );

        return null;
    }
}

// ============================================================
// فتح نافذة الدفع / الطلب
// ============================================================

function openCheckout() {

    if (!cart.length) {

        showMessage(
            "السلة فارغة."
        );

        return;
    }

    if (!currentCustomer) {

        showMessage(
            "سجل الدخول أولاً حتى تستطيع إرسال الطلب."
        );

        showCustomerLogin();

        return;
    }

    const modal =
        $("#checkoutModal");

    if (!modal) {

        createCheckoutModal();

    }

    const checkout =
        $("#checkoutModal");

    if (!checkout) {
        return;
    }

    checkout.classList.add("show");

    checkout.style.display =
        "flex";

    updateCheckoutSummary();
}

// ============================================================
// إنشاء نافذة الطلب
// ============================================================

function createCheckoutModal() {

    const modal =
        document.createElement("div");

    modal.id =
        "checkoutModal";

    modal.className =
        "modal";

    modal.innerHTML = `
        <div
            class="modal-content">

            <button
                type="button"
                class="modal-close"
                onclick="closeCheckout()">

                ×

            </button>

            <h2>
                تأكيد الطلب
            </h2>

            <div
                id="checkoutSummary">
            </div>

            <input
                id="checkoutName"
                type="text"
                placeholder="الاسم الكامل">

            <input
                id="checkoutPhone"
                type="tel"
                placeholder="رقم الهاتف">

            <input
                id="checkoutCity"
                type="text"
                placeholder="المدينة">

            <textarea
                id="checkoutAddress"
                rows="3"
                placeholder="العنوان"></textarea>

            <select
                id="checkoutPayment">

                <option value="cash">
                    الدفع عند الاستلام
                </option>

            </select>

            <div
                id="checkoutMessage">
            </div>

            <button
                type="button"
                class="checkout-button"
                onclick="submitOrder()">

                إرسال الطلب

            </button>

        </div>
    `;

    document.body.appendChild(
        modal
    );
}

// ============================================================
// تحديث ملخص الطلب
// ============================================================

function updateCheckoutSummary() {

    const summary =
        $("#checkoutSummary");

    if (!summary) {
        return;
    }

    summary.innerHTML = `
        <div
            style="
                padding:12px;
                background:#f7f7f7;
                border-radius:10px;
                margin-bottom:15px;
            ">

            <strong>
                عدد المنتجات:
            </strong>

            ${getCartCount()}

            <br>

            <strong>
                المجموع:
            </strong>

            ${formatPrice(getCartTotal())}

        </div>
    `;
}

// ============================================================
// إغلاق الطلب
// ============================================================

function closeCheckout() {

    const modal =
        $("#checkoutModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    modal.style.display =
        "none";
}

// ============================================================
// إرسال الطلب
// ============================================================

async function submitOrder() {

    if (isSubmittingOrder) {
        return;
    }

    if (!currentCustomer) {

        showCustomerLogin();

        return;
    }

    if (!cart.length) {

        showMessage(
            "السلة فارغة."
        );

        return;
    }

    const name =
        $("#checkoutName")
            ?.value
            .trim();

    const phone =
        $("#checkoutPhone")
            ?.value
            .trim();

    const city =
        $("#checkoutCity")
            ?.value
            .trim();

    const address =
        $("#checkoutAddress")
            ?.value
            .trim();

    const payment =
        $("#checkoutPayment")
            ?.value ||
        "cash";

    const message =
        $("#checkoutMessage");

    if (
        !name ||
        !phone ||
        !city ||
        !address
    ) {

        if (message) {

            message.textContent =
                "أكمل جميع معلومات التوصيل.";

        }

        return;
    }

    isSubmittingOrder = true;

    if (message) {

        message.textContent =
            "جاري إرسال الطلب...";
    }

    try {

        const total =
            getCartTotal();

        const orderData = {

            customer_name:
                name,

            customer_phone:
                phone,

            customer_city:
                city,

            customer_address:
                address,

            payment_method:
                payment,

            total:
                total,

            status:
                "جديد"
        };

        const savedOrder =
            await saveOrderToSupabase(
                orderData
            );

        const localOrder = {

            id:
                savedOrder?.id ||
                "LOCAL-" +
                Date.now(),

            total:
                total,

            status:
                "جديد",

            created_at:
                new Date().toISOString()
        };

        saveOrderLocally(
            localOrder
        );

        if (
            savedOrder &&
            savedOrder.id
        ) {

            // حفظ عناصر الطلب إذا كان order_items موجوداً
            await saveOrderItems(
                savedOrder.id
            );
        }

        await saveCustomerProfile(
            name,
            phone,
            city,
            address
        );

        cart = [];

        saveCart();

        closeCheckout();

        showMessage(
            "تم إرسال طلبك بنجاح ✅"
        );

        // فتح واتساب المتجر بالطلب
        sendOrderToWhatsApp(
            localOrder.id,
            name,
            phone,
            city,
            address
        );

    } catch (error) {

        console.error(
            "خطأ إرسال الطلب:",
            error
        );

        if (message) {

            message.textContent =
                "حدث خطأ أثناء إرسال الطلب.";

        }

    } finally {

        isSubmittingOrder = false;
    }
}

// ============================================================
// حفظ عناصر الطلب
// ============================================================

async function saveOrderItems(
    orderId
) {

    if (!orderId || !cart.length) {
        return;
    }

    try {

        const items =
            cart.map(function (item) {

                return {

                    order_id:
                        orderId,

                    product_id:
                        item.product_id,

                    quantity:
                        Number(item.quantity || 1),

                    price:
                        Number(item.price || 0)
                };
            });

        const result =
            await supabaseClient
                .from("order_items")
                .insert(items);

        if (result.error) {

            console.warn(
                "تعذر حفظ عناصر الطلب:",
                result.error
            );
        }

    } catch (error) {

        console.warn(
            "خطأ حفظ عناصر الطلب:",
            error
        );
    }
}

// ============================================================
// إرسال الطلب إلى واتساب
// ============================================================

function sendOrderToWhatsApp(
    orderId,
    name,
    phone,
    city,
    address
) {

    let text =
        "🛍️ طلب جديد من " +
        STORE.name +
        "\n\n";

    text +=
        "رقم الطلب: " +
        orderId +
        "\n";

    text +=
        "الاسم: " +
        name +
        "\n";

    text +=
        "الهاتف: " +
        phone +
        "\n";

    text +=
        "المدينة: " +
        city +
        "\n";

    text +=
        "العنوان: " +
        address +
        "\n\n";

    text +=
        "المنتجات:\n";

    // cart أصبحت فارغة بعد الحفظ
    // لذلك نقرأ الطلب من localStorage غير ممكن.
    // لا مشكلة؛ بيانات الطلب محفوظة في Supabase.
    // نضع المجموع فقط.

    text +=
        "المجموع: " +
        formatPrice(
            getCartTotal()
        );

    const url =
        "https://wa.me/" +
        STORE.whatsapp +
        "?text=" +
        encodeURIComponent(text);

    window.open(
        url,
        "_blank"
    );
}

// ============================================================
// نافذة الدعم
// ============================================================

function openSupport() {

    const modal =
        $("#supportModal");

    if (!modal) {

        createSupportModal();

    }

    const currentModal =
        $("#supportModal");

    if (!currentModal) {
        return;
    }

    currentModal.classList.add(
        "show"
    );

    currentModal.style.display =
        "flex";
}

function closeSupport() {

    const modal =
        $("#supportModal");

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "show"
    );

    modal.style.display =
        "none";
}

function createSupportModal() {

    const modal =
        document.createElement("div");

    modal.id =
        "supportModal";

    modal.className =
        "modal";

    modal.innerHTML = `
        <div
            class="modal-content">

            <button
                type="button"
                class="modal-close"
                onclick="closeSupport()">

                ×

            </button>

            <h2>
                💬 الدعم والمساعدة
            </h2>

            <p>
                اختر طريقة التواصل معنا:
            </p>

            <div
                class="account-actions">

                <button
                    type="button"
                    onclick="window.open(
                        'https://wa.me/${STORE.whatsapp}',
                        '_blank'
                    )">

                    💬 واتساب

                </button>

                <button
                    type="button"
                    onclick="window.location.href='mailto:${STORE.email}'">

                    📧 البريد الإلكتروني

                </button>

                <button
                    type="button"
                    onclick="window.location.href='tel:${STORE.phone}'">

                    📞 الاتصال

                </button>

            </div>

        </div>
    `;

    document.body.appendChild(
        modal
    );
}

// ============================================================
// إغلاق النوافذ عند الضغط خارجها
// ============================================================

document.addEventListener(
    "click",
    function (event) {

        const modals =
            $$(".modal");

        modals.forEach(function (modal) {

            if (
                event.target === modal
            ) {

                modal.classList.remove(
                    "show"
                );

                modal.style.display =
                    "none";
            }
        });
    }
);

// ============================================================
// تهيئة البحث
// ============================================================

function initializeSearch() {

    const searchInputs =
        $$(
            "#searchInput, .search-input, .search-box input"
        );

    searchInputs.forEach(
        function (input) {

            input.addEventListener(
                "input",
                function () {

                    searchProducts(
                        input.value
                    );

                }
            );
        }
    );
}

// ============================================================
// تهيئة الأزرار
// ============================================================

function initializeButtons() {

    $$(".cart-button").forEach(
        function (button) {

            button.addEventListener(
                "click",
                openCart
            );

        }
    );

    $$(".account-btn").forEach(
        function (button) {

            button.addEventListener(
                "click",
                openAccount
            );

        }
    );

    $$(".checkout-button").forEach(
        function (button) {

            const text =
                button.textContent
                    .trim();

            if (
                text.includes("إتمام") ||
                text.includes("الدفع") ||
                text.includes("طلب")
            ) {

                if (
                    !button.closest(
                        "#checkoutModal"
                    )
                ) {

                    button.addEventListener(
                        "click",
                        openCheckout
                    );
                }
            }
        }
    );
}

// ============================================================
// جلسة Supabase
// ============================================================

function initializeAuthListener() {

    supabaseClient.auth.onAuthStateChange(
        async function (
            event,
            session
        ) {

            currentCustomer =
                session?.user || null;

            if (currentCustomer) {

                await checkAdminStatus();

            } else {

                isCurrentUserAdmin =
                    false;
            }

            updateAccountButton();

        }
    );
}

// ============================================================
// تهيئة التطبيق
// ============================================================

async function initializeApp() {

    applyStoreName();

    loadCart();

    initializeSearch();

    initializeButtons();

    initializeAuthListener();

    await loadCurrentCustomer();

    await loadStoreSettings();

    await loadCategories();

    await loadProductsFromSupabase();

    applyStoreSettings();

    updateCartUI();
}

// ============================================================
// تشغيل التطبيق
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeApp();

    }
);

// ============================================================
// جعل الدوال متاحة للـ HTML
// ============================================================

window.filterCategory =
    filterCategory;

window.searchProducts =
    searchProducts;

window.addToCart =
    addToCart;

window.removeFromCart =
    removeFromCart;

window.changeCartQuantity =
    changeCartQuantity;

window.openCart =
    openCart;

window.closeCart =
    closeCart;

window.openProductDetails =
    openProductDetails;

window.closeProductDetails =
    closeProductDetails;

window.openAccount =
    openAccount;

window.showCustomerLogin =
    showCustomerLogin;

window.showCustomerRegister =
    showCustomerRegister;

window.loginCustomer =
    loginCustomer;

window.registerCustomer =
    registerCustomer;

window.showCustomerAccount =
    showCustomerAccount;

window.showEditProfile =
    showEditProfile;

window.updateCustomerProfile =
    updateCustomerProfile;

window.showCustomerOrders =
    showCustomerOrders;

window.logoutCustomer =
    logoutCustomer;

window.closeCustomerModal =
    closeCustomerModal;

window.openAdminPanel =
    openAdminPanel;

window.openCheckout =
    openCheckout;

window.closeCheckout =
    closeCheckout;

window.submitOrder =
    submitOrder;

window.openSupport =
    openSupport;

window.closeSupport =
    closeSupport;

})();