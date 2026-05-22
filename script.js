let categories=[];
let products=[];
let cart =[];
let orders = [];
let currentOrderSteps = 1;
let recentlyViewed=[];
let filterProducts=[];
let currentUser={
    name: "",
    email: "",
    phone: "",
    address: ""
};

async function loadData(){

    try{

        const response = await fetch('data.json');

        if(!response.ok){
            throw new Error("Failed to load data");
        }

        const data = await response.json();

        categories = data.categories;
        products = data.products;

        renderCategories();
        renderProducts(products);

    }catch(error){

        console.error("Error loading data:", error);

        document.body.innerHTML += `
            <p>Error loading data. Please refresh the page.</p>
        `;
    }
}
function initializeApp(){
    loadUserData();
    loadCartData();
    loadOrdersData();
    loadRecentlyViewed();
    renderCategories();
    showPage("home");
}   

document.addEventListener("DOMContentLoaded", function(){
    loadData();
});

function showPage(pageId){

    const pages = document.querySelectorAll('.page');

    pages.forEach(page => {
        page.classList.add("hidden");
    });

    const targetPage = document.getElementById(pageId);

    if(targetPage){
        targetPage.classList.remove("hidden");
    }

    switch(pageId){

        case "home":
            renderCategories();
            break;

        case "cartPage":
            renderCart();
            break;

        case "orderPage":
            renderOrderSteps();
            break;

        case "ordersPage":
            renderOrders();
            break;

        case "accountPage":
            renderAccountPage();
            break;
    }
}
function toggleSidebar(){

    document.querySelector(".sidebar").classList.toggle("active");

    document.querySelector(".sidebar-overlay").classList.toggle("active");
}

function searchProducts(){

    const searchTerm =
    document.getElementById("searchInput")
    .value
    .toLowerCase();
    if(searchTerm.trim() === "") return;
    let filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    document.getElementById("categoryTitle").textContent =
    `Search results for "${searchTerm}"`;
    filterProducts = filteredProducts;
    populateFilters();
    renderProducts(filteredProducts);
    showPage("categoryPage");
}


function renderCategories(){
    const categoryGrid=document.getElementById("categoryGrid");
    categoryGrid.innerHTML="";

    categories.forEach(category=>{
        const categoryCard=document.createElement("div");
        categoryCard.className="category-card";
        categoryCard.onclick =()=> showCategories(category.id);

        let cardContent=`
        <img src="${category.image}" alt="${category.name}">
        <div class="category-card-content">
            <h3>${category.name}</h3>
            <p>${category.description}</p>
            `;

            if(category.isRecentlyViewed){
                if(recentlyViewed.length === 0){
                    cardContent += `<p>No recently viewed products</p>`
                } else {
                    cardContent += `<p> you have ${recentlyViewed.length} recently viewed items</p>`;
                }
            }
            cardContent +=`
            <a href="#" class="category-btn">View Products</a>
            </div>
            `;
            categoryCard.innerHTML=cardContent;
            categoryGrid.appendChild(categoryCard)
    });
}

function showCategories(categoryId){

    let filteredProducts = [];

    if(categoryId === "recently-viewed"){

        filteredProducts = products.filter(product =>
            recentlyViewed.includes(product.id)
        );

        document.getElementById("categoryTitle").textContent =
            "Recently Viewed Products";

    } else {

        filteredProducts = products.filter(
            product => product.category === categoryId
        );

        const category = categories.find(
            cat => cat.id === categoryId
        );

        if(category){
            document.getElementById("categoryTitle").textContent =
                category.name;
        }
    }

    // hide all pages
    const pages = document.querySelectorAll(".page");

    pages.forEach(page => page.classList.add("hidden"));

    // show category page
    document.getElementById("categoryPage")
        .classList.remove("hidden");

    // show products
    renderProducts(filteredProducts);
    filterProducts = filteredProducts;

    populateFilters();
}

function populateFilters(){
    const brandFilter = document.getElementById("brandFilter");
    const brands = [...new Set(products.map(product => product.brand))];
    brandFilter.innerHTML = '<option value="">All Brands</option>';
    brands.forEach(brand => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });
}

function applyFilters(){
    const sortBy = document.getElementById("sortBy").value;
    const maxPrice = parseInt(document.getElementById("priceRange").value);
    const selectedBrand = document.getElementById("brandFilter").value;

    document.getElementById("priceValue").textContent = "₹" + maxPrice;

    let filtered = filterProducts.filter(product => {
        if (product.price > maxPrice) return false;
        if (selectedBrand && product.brand !== selectedBrand) return false;
        return true;
    });

    switch (sortBy) {
        case "price-low":
            filtered.sort((a, b) => a.price - b.price);
            break;
        case "price-high":
            filtered.sort((a, b) => b.price - a.price);
            break;
        case "rating":
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        default:
            break;
    }

    renderProducts(filtered);
}

function renderProducts(productsList) {

    const productGrid = document.getElementById("productGrid");

    productGrid.innerHTML = "";

    if (productsList.length === 0) {

        productGrid.innerHTML =
        "<p>No products found matching your criteria.</p>";

        return;
    }

    productsList.forEach((product, index) => {

        const productCard = document.createElement("div");

        productCard.className =
        "product-card auto-hover";

        productCard.onclick =
        () => showproduct(product.id);

        setTimeout(() => {

            productCard.classList.add("active-hover");

            setTimeout(() => {

                productCard.classList.remove("active-hover");

            }, 2000);

        }, index * 500);

        productCard.innerHTML = `

            <img src="${product.image}" alt="${product.name}">

            <div class="product-card-content">

                <div class="product-brand">
                    ${product.brand}
                </div>

                <h3>${product.name}</h3>

                <div class="product-rating">
                    ⭐ ${product.rating}
                </div>

                <div class="product-price">

                    <span class="current-price">
                        ₹${product.price}
                    </span>

                    <span class="original-price">
                        ₹${product.originalPrice}
                    </span>

                    <span class="discount">
                        ${product.discount}% off
                    </span>

                </div>

            </div>
        `;

        productGrid.appendChild(productCard);
    });
}


 function showproduct(productId){

    const product = products.find(p => p.id === productId);

    if(!product) return;

    if(!recentlyViewed.includes(productId)){

        recentlyViewed.unshift(productId);

        if(recentlyViewed.length > 10){
            recentlyViewed.pop();
        }

        saveRecentlyViewed();
    }

    const productDetails = document.getElementById("productDetails");

    const days = Math.floor(Math.random() * 5) + 3;

const deliveryDates = new Date();
deliveryDates.setDate(deliveryDates.getDate() + days);
    productDetails.innerHTML = `

    <div class="product-detail-container">

        <div>
            <img src="${product.image}" 
            alt="${product.name}" 
            class="product-detail-image">
        </div>

        <div class="product-info">

            <h1>${product.name}</h1>

            <div class="brands">
                ${product.brand}
            </div>

            <div class="product-rating">
                ⭐ ${product.rating}/5
            </div>

            <div class="product-price">

                <span class="current-price">
                    ₹${product.price}
                </span>

                <span class="original-price">
                    ₹${product.originalPrice}
                </span>

                <span class="discount">
                    ${product.discount}% off
                </span>

            </div>

            <p class="product-description">
                ${product.description}
            </p>

           <div class="option-group">
    <label>Color</label>
   ${product.colors && product.colors.length > 0 ? `
<div class="option-group">
    <label>Color</label>
    <select id="selectedColor">
        ${product.colors.map(color => `
            <option value="${color}">${color}</option>
        `).join('')}
    </select>
</div>
` : ""}
</div>


<!-- Size -->
${product.sizes && product.sizes.length > 0 ? `
<div class="option-group">
    <label>Size</label>
    <select id="selectedSize">
        ${product.sizes.map(size => `
            <option value="${size}">${size}</option>
        `).join('')}
    </select>
</div>
` : ""}

<!-- Stock -->
<div class="stock-info">
    ${product.inStock ? "✅ In Stock" : "❌ Out of Stock"}
</div>

<!-- Delivery -->
<div class="delivery-info">
    <strong>🚚 Delivery Info:</strong>
    Arrives in ${days} days (${deliveryDates.toDateString()})

    <div class="extra-info">
        🔁 10 Days Return Policy
    </div>

    <div class="extra-info">
        💰 Cash on Delivery Available
    </div>
</div>

            <div class="address-section">

                <h3>Delivery Address</h3>

                ${currentUser.address ? `

                    <p>${currentUser.address}</p>

                    <button class="btn-secondary"
                   onclick="showPage('accountPage')">
                        Change Address
                    </button>

                ` : `

                    <p>No address added</p>

                    <button class="btn-secondary"
                    onclick="showPage('accountPage')">
                        Add Address
                    </button>

                `}

            </div>

            <div class="product-actions">

                <button class="btn-primary"
                onclick="addToCart(${product.id})">
                    Add to Cart
                </button>

                <button class="btn-secondary"
                onclick="buyNow(${product.id})">
                    Buy Now
                </button>

            </div>

        </div>

    </div>
    `;

    const pages = document.querySelectorAll(".page");

    pages.forEach(page => page.classList.add("hidden"));

    document.getElementById("productPage")
    .classList.remove("hidden");
}

function buyNow(prooductId){
    addToCart(prooductId);
    showPage("cartPage")
}

function validateName(name){
    const cleanName = name.trim().replace(/\s+/g, " ");
    const nameRegex = /^[a-zA-Z ]{2,50}$/;
    return nameRegex.test(cleanName);
}

function validateEmail(email){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

function validatePhone(phone){
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.trim());
}


function addToCart(productId) {

    const product = products.find(p => p.id === productId);

    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {

        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCartCount();

    saveCartData();

    renderCart();

    alert("Product added to cart!");
}
function renderCart(){
    const cartItems = document.getElementById("cartItems");
    const cartSummary = document.getElementById("cartSummary");

    if(cart.length === 0){
        cartItems.innerHTML = '<p>Your cart is empty. <a href="#" onclick="showPage(\'home\')">Continue shopping</a></p>';
        cartSummary.innerHTML = '';
        return;
    }
    cartItems.innerHTML = '';
    let totalOriginal = 0;
    let totalDiscounted = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        const itemOriginal = item.originalPrice * item.quantity;
        totalOriginal += itemOriginal;
        totalDiscounted += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
            <h3>${item.name}</h3>
            <div class="product-brand">${item.brand}</div>
            ${item.color ? `<p>Color: ${item.color}</p>` : ""}
            ${item.size ? `<p>Size: ${item.size}</p>` : ""}
            <div class="product-price">
                <span class="current-price">₹${item.price}</span>
                <span class="original-price">₹${item.originalPrice}</span>
                <span class="discount-price">₹${item.discount}</span>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1"
                onchange="updateQuantity(${index}, 0, this.value)">
                <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            <p>Total: ₹${itemTotal}</p>
        </div>
        <button class="btn-secondary"
onclick="removeFromCart(${index})">
    Remove
</button>
        `;
        cartItems.appendChild(cartItem);
    });

    const deliveryCharges = totalDiscounted > 500 ? 0 : 50;
    const finalTotal = totalDiscounted + deliveryCharges;

    cartSummary.innerHTML = `
    <h3>Price Details</h3>
    <div class="summary-row">
        <span>Total MRP:</span>
        <span>₹${totalOriginal}</span>
    </div>
    <div class="summary-row">
        <span>Discount:</span>
        <span>₹${totalOriginal - totalDiscounted}</span>
    </div>
    <div class="summary-row">
        <span>Delivery charges:</span>
        <span>${deliveryCharges === 0 ? "FREE" : "₹" + deliveryCharges}</span>
    </div>
    <div class="summary-divider"></div>
    <div class="summary-row summary-total">
        <span>Total Amount:</span>
        <span>₹${finalTotal}</span>
    </div>
    <button class="btn-primary" onclick="proceedToCheckout()" 
    style="width:100%; margin-top:20px;">Place Order</button>
    `;
}

function updateQuantity(index, change, newValue = null) {
    if (newValue !== null) {
        cart[index].quantity = Math.max(1, parseInt(newValue, 10) || 1)
    } else {
        cart[index].quantity = Math.max(1, cart[index].quantity + change)
    }

    updateCartCount();
    saveCartData();
    renderCart();
}

function renderOrders(){

    const orderList = document.getElementById("OrderList");

    if(orders.length === 0){

        orderList.innerHTML = "<p>No orders found.</p>";

        return;
    }

    orderList.innerHTML = "";

    orders.forEach(order => {

        orderList.innerHTML += `

        <div class="order-card">

            <div class="order-header">

                <h3>Order ID: ${order.id}</h3>

                <p>Total: ₹${order.total}</p>

            </div>

        </div>

        `;
    });
}

function renderOrderSteps(){

    const orderSteps = document.getElementById("orderSteps");

    if(currentOrderSteps === 1){

        orderSteps.innerHTML = `
        <div class="order-form">

            <h2>Step 1: Enter Your Details</h2>

            <div class="form-group">
                <label>Name:</label>

                <input type="text"
                id="orderName"
                value="${currentUser.name || ''}">
            </div>

            <div class="form-group">
                <label>Phone:</label>

                <input type="tel"
                id="orderPhone"
                value="${currentUser.phone || ''}">
            </div>

            <div class="form-group">
                <label>Address:</label>

                <textarea id="orderAddress">${currentUser.address || ''}</textarea>
            </div>

            <button class="btn-primary"
            onclick="saveOrderDetails()">
                Continue
            </button>

        </div>
        `;
    }

    else if(currentOrderSteps === 2){

        let total = cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        orderSteps.innerHTML = `
        <div class="order-form">

            <h2>Step 2: Order Summary</h2>

            ${cart.map(item => `
                <div class="cart-item">

                    <img src="${item.image}" width="100">

                    <div>
                        <h3>${item.name}</h3>

                        <p>Quantity: ${item.quantity}</p>

                        <p>₹${item.price * item.quantity}</p>
                    </div>

                </div>
            `).join('')}

            <h3>Total: ₹${total}</h3>

            <button class="btn-primary"
            onclick="goToPayment()">
                Continue to Payment
            </button>

        </div>
        `;
    }

    else if(currentOrderSteps === 3){

        orderSteps.innerHTML = `
        <div class="order-form">

            <h2>Step 3: Payment</h2>

            <label class="payment-option">
                <input type="radio"
                name="payment"
                checked>

                UPI
            </label>

            <label class="payment-option">
                <input type="radio"
                name="payment">

                Card
            </label>

            <label class="payment-option">
                <input type="radio"
                name="payment">

                Cash on Delivery
            </label>

            <button class="btn-primary"
            onclick="placeOrder()">
                Place Order
            </button>

        </div>
        `;
    }
}


function saveOrderDetails(){

    const name = document.getElementById("orderName").value.trim();
    const phone = document.getElementById("orderPhone").value.trim();
    const address = document.getElementById("orderAddress").value.trim();

    if(!name || !phone || !address){
        alert("Please fill all required fields");
        return;
    }

    if(!validateName(name)){
        alert("Please enter a valid name");
        return;
    }
    if(!validatePhone(phone)){
        alert("Please enter a valid 10-digit phone number");
        return;
    }
    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.address = address;
    saveUserData();
    currentOrderSteps = 2;
    renderOrderSteps();
}
function goToPayment(){
    currentOrderSteps = 3;
    renderOrderSteps();
}
function placeOrder(){

    if(cart.length === 0){
        alert("Your cart is empty");
        return;
    }

    const orderId = "ORD" + Date.now();

    const deliveryDate = new Date();

    deliveryDate.setDate(deliveryDate.getDate() + 5);

    const order = {

        id: orderId,

        items: [...cart],

        total: cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0),

        date: new Date().toLocaleString(),

        status: "On the Way"
    };

    orders.push(order);

    localStorage.setItem("ordersData", JSON.stringify(orders));

    cart = [];

    saveCartData();

    updateCartCount();

    const orderSteps = document.getElementById("orderSteps");

    orderSteps.innerHTML = `

    <div class="success-container">

        <div class="success-icon">🎉</div>

        <h1>Order Placed Successfully!</h1>

        <p>Your order ID is:</p>

        <h2>${orderId}</h2>

        <p>
            Expected delivery:
            <strong>${deliveryDate.toDateString()}</strong>
        </p>

        <div class="success-buttons">

            <button class="btn-primary"
            onclick="showPage('ordersPage')">
                View My Orders
            </button>

            <button class="btn-secondary"
            onclick="showPage('home')">
                Continue Shopping
            </button>

        </div>

    </div>
    `;
}
function saveOrderData(){
   localStorage.setItem("ordersData",JSON.stringify(orders))
}

function saveUserData(){
    localStorage.setItem("userData",JSON.stringify(currentUser))
}
function renderAccountPage(){
    document.getElementById("userName").value = currentUser.name || "";
    document.getElementById("userEmail").value = currentUser.email || "";
    document.getElementById("userPhone").value = currentUser.phone|| "";
    document.getElementById("userAddress").value = currentUser.address || "";
}
function saveUserInfo(){
    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    const phone = document.getElementById("userPhone").value.trim();
    const address = document.getElementById("userAddress").value.trim();

    if(name && !validateName(name)){
        alert('Please enter a valid name (2–50 letters only)');
        return;
    }

    if(email && !validateEmail(email)){
        alert('Please enter a valid email address');
        return;
    }

    if(phone && !validatePhone(phone)){
        alert('Please enter a valid 10-digit phone');
        return;
    }

   currentUser.name = name;
currentUser.phone = phone;
currentUser.address = address;

    saveUserData();

    alert("Information saved successfully!");
}

function removeFromCart(index){
    cart.splice(index, 1);
    updateCartCount();
    saveCartData();
    renderCart();
}
function proceedToCheckout(){
    currentOrderSteps = 1;
    showPage('orderPage');
}

function updateCartCount() {

    const cartCount = document.getElementById("cartCount");

    if (!cartCount) {
        console.log("cartCount element not found");
        return;
    }

    let totalItems = 0;

    cart.forEach(item => {
        totalItems += item.quantity;
    });

    cartCount.textContent = totalItems;
}

function saveCartData(){
    localStorage.setItem("cartData",JSON.stringify(cart))
}

function saveRecentlyViewed(){
    localStorage.setItem(
        "recentlyViewedData",
        JSON.stringify(recentlyViewed)
    );
}

function loadUserData(){

    const userData =
    localStorage.getItem("userData");
    if(userData){
        currentUser =
        JSON.parse(userData);
    }
}
function loadCartData(){
    const cartData = localStorage.getItem("cartData")
    if(cartData){
        cart= JSON.parse(cartData)
        updateCartCount()
    }
}
function loadOrdersData(){
    const ordersData =
    localStorage.getItem("ordersData");
    if(ordersData){
        orders =
        JSON.parse(ordersData);
    }
}

function loadRecentlyViewed(){
    const recentlyViewedData =
    localStorage.getItem("recentlyViewedData");
    if(recentlyViewedData){
        recentlyViewed =
        JSON.parse(recentlyViewedData);
    }
}
document.addEventListener("DOMContentLoaded", () => {

    loadUserData();

    loadCartData();

    loadOrdersData();

    loadRecentlyViewed();

    loadData();

    updateCartCount();

});
