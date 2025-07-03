document.addEventListener('DOMContentLoaded', () => {
    const products = [
        { id: 1, name: 'Minimalist Tee', price: 25.00, image: 'placeholder.jpg', category: 'Apparel' },
        { id: 2, name: 'Sleek Mug', price: 15.50, image: 'placeholder.jpg', category: 'Home Goods' },
        { id: 3, name: 'Modern Notebook', price: 12.00, image: 'placeholder.jpg', category: 'Stationery' },
        { id: 4, name: 'Classic Watch', price: 120.00, image: 'placeholder.jpg', category: 'Accessories' },
        { id: 5, name: 'Canvas Tote Bag', price: 30.00, image: 'placeholder.jpg', category: 'Accessories' },
        { id: 6, name: 'Steel Water Bottle', price: 22.75, image: 'placeholder.jpg', category: 'Home Goods' },
    ];

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const productGrid = document.querySelector('#product-grid .grid-container');
    const productGridShop = document.querySelector('#product-grid-shop .grid-container');
    const cartLink = document.getElementById('cart-link');
    const cartPopup = document.getElementById('cart-popup');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const featuredImg = document.getElementById('featured-img');
    const featuredName = document.getElementById('featured-name');
    const featuredPrice = document.getElementById('featured-price');
    const featuredBtn = document.querySelector('#featured-product .add-to-cart-btn');

    // Burger Menu for mobile
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksLi = document.querySelectorAll('.nav-links li');

    if (burger) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            burger.classList.toggle('toggle');

            navLinksLi.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
        });
    }

    // --- Product Display Functions ---
    function displayProducts(container, productList) {
        if (!container) return;
        container.innerHTML = ''; // Clear existing products
        productList.forEach(product => {
            const productCard = `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>$${product.price.toFixed(2)}</p>
                    <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                </div>
            `;
            container.innerHTML += productCard;
        });
    }

    function displayFeaturedProduct() {
        if (featuredImg && products.length > 0) { // Ensure featured elements and products exist
            const featuredProduct = products[0]; // Display the first product as featured
            featuredImg.src = featuredProduct.image;
            featuredImg.alt = featuredProduct.name;
            if (featuredName) featuredName.textContent = featuredProduct.name;
            if (featuredPrice) featuredPrice.textContent = `$${featuredProduct.price.toFixed(2)}`;
            if (featuredBtn) featuredBtn.dataset.id = featuredProduct.id;
        }
    }

    // --- Cart Functions ---
    function addToCart(productId) {
        const product = products.find(p => p.id === parseInt(productId));
        if (!product) return;

        const cartItem = cart.find(item => item.id === product.id);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        updateCartDisplay();
        showCartPopup(); // Optionally show popup when item is added
    }

    function removeFromCart(productId, removeAll = false) {
        const itemIndex = cart.findIndex(item => item.id === parseInt(productId));
        if (itemIndex > -1) {
            if (removeAll || cart[itemIndex].quantity === 1) {
                cart.splice(itemIndex, 1);
            } else {
                cart[itemIndex].quantity--;
            }
        }
        saveCart();
        updateCartDisplay();
        // Also update cart page if on cart.html
        if (document.getElementById('cart-page-items')) {
            displayCartPageItems();
        }
    }

    function updateCartItemQuantity(productId, newQuantity) {
        const itemIndex = cart.findIndex(item => item.id === parseInt(productId));
        newQuantity = parseInt(newQuantity);

        if (itemIndex > -1) {
            if (newQuantity > 0) {
                cart[itemIndex].quantity = newQuantity;
            } else { // If quantity is 0 or less, remove item
                cart.splice(itemIndex, 1);
            }
        }
        saveCart();
        updateCartDisplay();
        if (document.getElementById('cart-page-items')) {
            displayCartPageItems();
        }
    }


    function updateCartDisplay() {
        // Update popup cart
        if (cartItemsContainer && cartTotalElement && cartCountElement) {
            cartItemsContainer.innerHTML = '';
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p class="empty-message">Your cart is empty.</p>';
            } else {
                cart.forEach(item => {
                    const cartItemElement = `
                        <div class="cart-item">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="cart-item-info">
                                <h4>${item.name}</h4>
                                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                                <button class="remove-item-btn" data-id="${item.id}">Remove</button>
                            </div>
                        </div>
                    `;
                    cartItemsContainer.innerHTML += cartItemElement;
                });
            }

            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            cartTotalElement.textContent = total.toFixed(2);
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = count;

            // Attach event listeners for remove buttons in popup
            cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.target.dataset.id;
                    removeFromCart(productId, true); // Remove all quantity of this item from popup
                });
            });
        }

        // Update cart count on dedicated cart page if it exists
        const cartCountPage = document.getElementById('cart-count-page');
        if (cartCountPage) {
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountPage.textContent = count;
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function showCartPopup() {
        if (cartPopup) cartPopup.classList.add('open');
    }

    function hideCartPopup() {
        if (cartPopup) cartPopup.classList.remove('open');
    }

    // --- Cart Page Specific Functions ---
    function displayCartPageItems() {
        const cartPageItemsContainer = document.getElementById('cart-page-items');
        const cartPageTotalElement = document.getElementById('cart-page-total');

        if (!cartPageItemsContainer || !cartPageTotalElement) return;

        cartPageItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartPageItemsContainer.innerHTML = '<p class="empty-message">Your cart is currently empty. <a href="shop.html">Continue shopping?</a></p>';
        } else {
            cart.forEach(item => {
                const cartItemRow = `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>$${item.price.toFixed(2)}</p>
                        </div>
                        <div class="cart-item-actions">
                            <input type="number" value="${item.quantity}" min="1" class="item-quantity-input" data-id="${item.id}">
                            <button class="remove-page-item-btn" data-id="${item.id}">Remove</button>
                        </div>
                        <p class="cart-item-subtotal">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                `;
                cartPageItemsContainer.innerHTML += cartItemRow;
            });
        }

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartPageTotalElement.textContent = total.toFixed(2);

        // Add event listeners for quantity inputs and remove buttons on cart page
        cartPageItemsContainer.querySelectorAll('.item-quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = e.target.dataset.id;
                const newQuantity = parseInt(e.target.value);
                updateCartItemQuantity(productId, newQuantity);
            });
        });

        cartPageItemsContainer.querySelectorAll('.remove-page-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                removeFromCart(productId, true); // Remove all quantity
            });
        });
    }


    // --- Event Listeners ---
    if (cartLink) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            showCartPopup();
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', hideCartPopup);
    }

    // Add to cart buttons (delegated event listener)
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = e.target.dataset.id;
            addToCart(productId);
        }
    });

    // Checkout buttons (placeholder functionality)
    const checkoutBtnPopup = document.getElementById('checkout-btn');
    if (checkoutBtnPopup) {
        checkoutBtnPopup.addEventListener('click', () => {
            if (cart.length > 0) {
                alert('Proceeding to checkout with ' + cart.length + ' item(s)! (This is a demo)');
                // Potentially clear cart and redirect:
                // cart = [];
                // saveCart();
                // updateCartDisplay();
                // hideCartPopup();
                // window.location.href = 'thankyou.html';
            } else {
                alert('Your cart is empty.');
            }
        });
    }

    const checkoutBtnPage = document.getElementById('cart-page-checkout-btn');
    if (checkoutBtnPage) {
        checkoutBtnPage.addEventListener('click', () => {
             if (cart.length > 0) {
                alert('Proceeding to checkout from page with ' + cart.length + ' item(s)! (This is a demo)');
            } else {
                alert('Your cart is empty.');
            }
        });
    }

    // --- Initialization ---
    // Determine current page and load content accordingly
    if (productGrid) { // Homepage
        displayFeaturedProduct();
        displayProducts(productGrid, products.slice(1, 4)); // Display a few products on home, excluding featured
    }
    if (productGridShop) { // Shop page
        displayProducts(productGridShop, products); // Display all products
    }
    if (document.getElementById('cart-page-items')) { // Cart page
        displayCartPageItems();
    }

    updateCartDisplay(); // Initial cart display update for all pages
});
