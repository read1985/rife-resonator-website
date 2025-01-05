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
        this.shipping = 50;
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
        
        // Remove any existing event listeners
        if (this.eventsInitialized) {
            console.log('Events already initialized, skipping');
            return;
        }
        
        // Cart toggle - bind to document for better event delegation
        document.addEventListener('click', (e) => {
            const cartToggle = e.target.closest('.cart-link');
            if (cartToggle) {
                e.preventDefault();
                console.log('Cart toggle clicked');
                this.toggleCart();
            }
        });
        
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
        
        // Use event delegation for add to cart buttons
        document.addEventListener('click', (e) => {
            const addToCartButton = e.target.closest('.add-to-cart-btn, .add-to-cart');
            if (addToCartButton) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add to cart clicked (delegated)');
                const productCard = addToCartButton.closest('.product-card, .product-details');
                if (productCard) {
                    console.log('Found product container:', productCard);
                    this.addToCart(productCard);
                } else {
                    console.error('No product container found');
                }
            }
        });

        this.eventsInitialized = true;
        console.log('Events initialized');
    }

    toggleCart() {
        console.log('Toggling cart');
        if (this.cartSidebar) {
            const isActive = this.cartSidebar.classList.contains('active');
            console.log('Cart is currently:', isActive ? 'active' : 'inactive');
            
            if (isActive) {
                this.closeCart();
            } else {
                this.openCart();
            }
        } else {
            console.error('Cart sidebar not found');
        }
    }

    closeCart() {
        console.log('Closing cart');
        if (this.cartSidebar) {
            this.cartSidebar.classList.remove('active');
            const overlay = document.querySelector('.cart-overlay');
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300); // Remove after transition
            }
        }
    }

    openCart() {
        console.log('Opening cart');
        if (this.cartSidebar) {
            this.cartSidebar.classList.add('active');
            let overlay = document.querySelector('.cart-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'cart-overlay';
                document.body.appendChild(overlay);
                overlay.addEventListener('click', () => this.closeCart());
            }
            // Force a reflow before adding active class
            overlay.offsetHeight;
            overlay.classList.add('active');
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
            this.cartSubtotal.innerHTML = `
                <div class="total-line">
                    <span>Subtotal:</span>
                    <span>$${this.total.toFixed(2)}</span>
                </div>
            `;
        }

        // Only show shipping if there are items in cart
        this.shipping = this.items.length > 0 ? 50 : 0;
        if (this.cartShipping) {
            const shippingLine = this.cartShipping.closest('.shipping-line');
            if (shippingLine) {
                if (this.items.length > 0) {
                    shippingLine.style.display = 'flex';
                    this.cartShipping.innerHTML = `$${this.shipping.toFixed(2)}`;
                } else {
                    shippingLine.style.display = 'none';
                }
            }
        }

        // Total
        const finalTotal = this.total + this.shipping;
        if (this.cartTotal) {
            this.cartTotal.innerHTML = `
                <div class="total-line grand-total">
                    <span>Total:</span>
                    <span>$${finalTotal.toFixed(2)}</span>
                </div>
            `;
        }
    }

    saveCart() {
        console.log('Saving cart data:', {
            items: this.items,
            total: this.total,
            shipping: this.shipping
        });
        
        localStorage.setItem('cart', JSON.stringify({
            items: this.items,
            total: this.total,
            shipping: this.shipping
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
                this.shipping = 50; // Always set to flat rate
                console.log('Cart data loaded successfully:', this.items);
                this.updateCart();
            } catch (error) {
                console.error('Error loading cart data:', error);
                this.items = [];
                this.total = 0;
                this.shipping = 50;
                this.updateCart();
            }
        } else {
            console.log('No saved cart data found');
            this.items = [];
            this.total = 0;
            this.shipping = 50;
            this.updateCart();
        }
    }

    clearCart() {
        this.items = [];
        this.total = 0;
        this.shipping = 50;
        localStorage.removeItem('cart');
        this.updateCart();
        console.log('Cart cleared');
    }

    getCartData() {
        console.log('Getting cart data:', {
            items: this.items,
            subtotal: this.total,
            shipping: this.shipping,
            total: this.total + this.shipping
        });
        
        return {
            items: this.items,
            subtotal: this.total,
            shipping: this.shipping,
            total: this.total + this.shipping
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