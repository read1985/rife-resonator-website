// Singleton instance
let cartInstance = null;

class Cart {
    constructor() {
        if (cartInstance) {
            return cartInstance;
        }
        
        console.log('Creating new cart instance');
        this.items = [];
        this.total = 0;
        this.shipping = 0;
        this.tax = 0;
        this.initialized = false;
        
        cartInstance = this;
        return this;
    }

    async init() {
        console.log('Cart init started');
        try {
            // Wait for DOM elements
            await this.waitForElements();
            
            // Load saved cart data
            this.loadCart();
            
            // Bind events
            this.bindEvents();
            
            this.initialized = true;
            console.log('Cart initialization complete');
        } catch (error) {
            console.error('Error initializing cart:', error);
        }
    }

    async waitForElements() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 20;
            
            const checkElements = () => {
                console.log('Checking cart elements, attempt:', attempts + 1);
                
                // Required elements
                this.cartSidebar = document.querySelector('.cart-sidebar');
                this.cartItems = document.querySelector('.cart-items');
                this.cartSubtotal = document.querySelector('.cart-subtotal');
                this.cartShipping = document.querySelector('.cart-shipping');
                this.cartTax = document.querySelector('.cart-tax');
                this.cartTotal = document.querySelector('.cart-total');
                this.checkoutButton = document.querySelector('.cart-sidebar .checkout-button');
                
                // Optional elements (header-dependent)
                this.cartToggle = document.querySelector('.cart-link');
                this.cartCount = document.querySelector('.cart-count');
                
                // Log which required elements are missing
                const missingRequired = {
                    cartSidebar: !this.cartSidebar,
                    cartItems: !this.cartItems,
                    cartSubtotal: !this.cartSubtotal,
                    cartShipping: !this.cartShipping,
                    cartTax: !this.cartTax,
                    cartTotal: !this.cartTotal,
                    checkoutButton: !this.checkoutButton
                };
                
                // Log which optional elements are missing
                const missingOptional = {
                    cartToggle: !this.cartToggle,
                    cartCount: !this.cartCount
                };
                
                const missingRequiredElements = Object.entries(missingRequired)
                    .filter(([_, isMissing]) => isMissing)
                    .map(([name]) => name);
                
                const missingOptionalElements = Object.entries(missingOptional)
                    .filter(([_, isMissing]) => isMissing)
                    .map(([name]) => name);
                
                if (missingRequiredElements.length > 0) {
                    console.log('Missing required elements:', missingRequiredElements);
                }
                
                if (missingOptionalElements.length > 0) {
                    console.log('Missing optional elements:', missingOptionalElements);
                }
                
                // Only check required elements for resolution
                if (Object.values(missingRequired).every(missing => !missing)) {
                    console.log('All required cart elements found');
                    if (missingOptionalElements.length > 0) {
                        console.log('Some optional elements are missing, but we can proceed');
                    }
                    resolve();
                } else {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        console.error('Could not find required cart elements after', maxAttempts, 'attempts');
                        reject(new Error('Could not find required cart elements'));
                        return;
                    }
                    setTimeout(checkElements, 500);
                }
            };
            
            checkElements();
        });
    }

    bindEvents() {
        console.log('Binding cart events');
        
        // Cart toggle - handle both types of cart toggle buttons
        this.cartToggle = document.querySelector('.cart-link, .cart-toggle');
        if (this.cartToggle) {
            console.log('Setting up cart toggle');
            this.cartToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCart();
            });
        } else {
            console.log('Cart toggle not found');
        }
        
        // Close cart button
        this.cartSidebar = document.querySelector('.cart-sidebar');
        const closeCart = this.cartSidebar?.querySelector('.close-cart');
        if (closeCart) {
            console.log('Setting up close cart button');
            closeCart.addEventListener('click', () => this.closeCart());
        } else {
            console.log('Close cart button not found');
        }
        
        // Checkout button
        this.checkoutButton = document.querySelector('.cart-sidebar .checkout-button');
        if (this.checkoutButton) {
            console.log('Setting up checkout button');
            this.checkoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.checkoutButton.disabled && this.items.length > 0) {
                    window.location.href = 'checkout.html';
                }
            });
        } else {
            console.log('Checkout button not found');
        }
        
        // Add to cart buttons - handle both button types
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn, .add-to-cart');
        console.log('Found add to cart buttons:', addToCartButtons.length);
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add to cart clicked');
                const productCard = e.target.closest('.product-card, .product-details');
                if (productCard) {
                    console.log('Found product container:', productCard);
                    this.addToCart(productCard);
                } else {
                    console.error('No product container found');
                }
            });
        });

        // Also bind to document for dynamically added buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart-btn, .add-to-cart') || 
                e.target.closest('.add-to-cart-btn, .add-to-cart')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add to cart clicked (delegated)');
                const productCard = e.target.closest('.product-card, .product-details');
                if (productCard) {
                    console.log('Found product container:', productCard);
                    this.addToCart(productCard);
                } else {
                    console.error('No product container found');
                }
            }
        });
    }

    toggleCart() {
        if (this.cartSidebar) {
            this.cartSidebar.classList.toggle('active');
        }
    }

    closeCart() {
        if (this.cartSidebar) {
            this.cartSidebar.classList.remove('active');
        }
    }

    openCart() {
        if (this.cartSidebar) {
            this.cartSidebar.classList.add('active');
        }
    }

    addToCart(productElement) {
        if (!productElement) {
            console.error('No product element provided');
            return;
        }
        
        console.log('Adding to cart, product element:', productElement);
        
        // Try to find elements in both structures
        const titleElement = productElement.querySelector('.product-title') || 
                           productElement.querySelector('.product-info h3 a') ||
                           productElement.querySelector('.product-info h3');
        const priceElement = productElement.querySelector('.price');
        const imageElement = productElement.querySelector('img');
        
        if (!titleElement || !priceElement || !imageElement) {
            console.error('Missing required product elements:', {
                title: !titleElement,
                price: !priceElement,
                image: !imageElement
            });
            return;
        }
        
        const id = parseInt(productElement.dataset.productId) || 
                  parseInt(productElement.dataset.id) || 
                  Date.now();
        const name = titleElement.textContent.trim();
        const price = parseFloat(productElement.dataset.price || 
                               priceElement.textContent.replace(/[^0-9.]/g, ''));
        const image = imageElement.src;
        const quantity = 1;
        
        console.log('Product details:', { id, name, price, image, quantity });
        
        // Check if item already exists in cart
        const existingItem = this.items.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += quantity;
            console.log('Updated existing item quantity:', existingItem);
        } else {
            this.items.push({ id, name, price, image, quantity });
            console.log('Added new item to cart');
        }
        
        this.updateCart();
        this.showNotification(`${name} added to cart`);
        this.openCart();
    }

    updateCart() {
        console.log('Updating cart with items:', this.items);
        
        // Update cart count
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        if (this.cartCount) {
            this.cartCount.textContent = totalItems;
            console.log('Updated cart count:', totalItems);
        }
        
        // Update cart items display
        if (this.cartItems) {
            this.cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                        <div class="item-quantity">
                            <button class="quantity-btn minus">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn plus">+</button>
                        </div>
                    </div>
                    <button class="remove-item">&times;</button>
                </div>
            `).join('');
            
            // Add event listeners for quantity buttons and remove buttons
            this.cartItems.querySelectorAll('.quantity-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                    const item = this.items.find(i => i.id === itemId);
                    if (item) {
                        if (btn.classList.contains('plus')) {
                            item.quantity++;
                        } else if (btn.classList.contains('minus')) {
                            item.quantity = Math.max(0, item.quantity - 1);
                            if (item.quantity === 0) {
                                this.items = this.items.filter(i => i.id !== itemId);
                            }
                        }
                        this.updateCart();
                    }
                });
            });
            
            this.cartItems.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                    this.items = this.items.filter(item => item.id !== itemId);
                    this.updateCart();
                });
            });
        }
        
        // Calculate and update totals
        this.calculateTotals();
        
        // Enable/disable checkout button
        if (this.checkoutButton) {
            this.checkoutButton.disabled = this.items.length === 0;
        }
        
        // Save cart data
        this.saveCart();
        
        console.log('Cart update complete');
    }

    calculateTotals() {
        // Subtotal
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (this.cartSubtotal) {
            this.cartSubtotal.textContent = `$${this.total.toFixed(2)}`;
        }

        // Shipping (free over $500)
        this.shipping = this.total >= 500 ? 0 : 29.95;
        if (this.cartShipping) {
            this.cartShipping.textContent = `$${this.shipping.toFixed(2)}`;
        }

        // Tax (8.25%)
        this.tax = this.total * 0.0825;
        if (this.cartTax) {
            this.cartTax.textContent = `$${this.tax.toFixed(2)}`;
        }

        // Total
        if (this.cartTotal) {
            this.cartTotal.textContent = `$${(this.total + this.shipping + this.tax).toFixed(2)}`;
        }
    }

    saveCart() {
        console.log('Saving cart data:', {
            items: this.items,
            total: this.total,
            shipping: this.shipping,
            tax: this.tax
        });
        
        localStorage.setItem('cart', JSON.stringify({
            items: this.items,
            total: this.total,
            shipping: this.shipping,
            tax: this.tax
        }));
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        console.log('Loading saved cart data:', savedCart);
        
        if (savedCart) {
            try {
                const cart = JSON.parse(savedCart);
                this.items = cart.items || [];
                this.total = cart.total || 0;
                this.shipping = cart.shipping || 0;
                this.tax = cart.tax || 0;
                console.log('Cart data loaded successfully:', this.items);
                this.updateCart();
            } catch (error) {
                console.error('Error loading cart data:', error);
                this.items = [];
                this.total = 0;
                this.shipping = 0;
                this.tax = 0;
                this.updateCart();
            }
        } else {
            console.log('No saved cart data found');
            this.items = [];
            this.total = 0;
            this.shipping = 0;
            this.tax = 0;
            this.updateCart();
        }
    }

    clearCart() {
        this.items = [];
        this.total = 0;
        this.shipping = 0;
        this.tax = 0;
        localStorage.removeItem('cart');
        this.updateCart();
        console.log('Cart cleared');
    }

    getCartData() {
        console.log('Getting cart data:', {
            items: this.items,
            subtotal: this.total,
            shipping: this.shipping,
            tax: this.tax,
            total: this.total + this.shipping + this.tax
        });
        
        return {
            items: this.items,
            subtotal: this.total,
            shipping: this.shipping,
            tax: this.tax,
            total: this.total + this.shipping + this.tax
        };
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Export the Cart class
window.Cart = Cart; 