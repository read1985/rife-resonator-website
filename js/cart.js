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
            const maxAttempts = 10;
            
            const checkElements = () => {
                this.cartToggle = document.querySelector('.cart-link');
                this.cartSidebar = document.querySelector('.cart-sidebar');
                this.cartItems = document.querySelector('.cart-items');
                this.cartCount = document.querySelector('.cart-count');
                this.cartSubtotal = document.querySelector('.cart-subtotal');
                this.cartShipping = document.querySelector('.cart-shipping');
                this.cartTax = document.querySelector('.cart-tax');
                this.cartTotal = document.querySelector('.cart-total');
                this.checkoutButton = document.querySelector('.cart-sidebar .checkout-button');
                
                if (this.cartToggle && this.cartSidebar && this.cartItems && 
                    this.cartCount && this.cartSubtotal && this.cartShipping && 
                    this.cartTax && this.cartTotal && this.checkoutButton) {
                    console.log('Cart elements found, initializing...');
                    resolve();
                } else {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        reject(new Error('Could not find cart elements'));
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
        
        // Cart toggle
        if (this.cartToggle) {
            this.cartToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCart();
            });
        }
        
        // Close cart button
        const closeCart = this.cartSidebar.querySelector('.close-cart');
        if (closeCart) {
            closeCart.addEventListener('click', () => this.closeCart());
        }
        
        // Add to cart buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart, .add-to-cart-btn');
        console.log('Found add to cart buttons:', addToCartButtons.length);
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.addToCart(e.target.closest('.product-card, .product-details'));
            });
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
        if (!productElement) return;
        
        const id = parseInt(productElement.dataset.productId) || Date.now();
        const name = productElement.querySelector('h2, h3, .product-title').textContent;
        const price = parseFloat(productElement.dataset.price || productElement.querySelector('.price').textContent.replace(/[^0-9.]/g, ''));
        const image = productElement.querySelector('img').src;
        const quantity = 1;
        
        console.log(`Adding to cart: ${quantity}x ${name} at $${price.toFixed(2)} each`);
        
        // Check if item already exists in cart
        const existingItem = this.items.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ id, name, price, image, quantity });
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

// Initialize cart when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.cartInstance) {
        window.cartInstance = new Cart();
        window.cartInstance.init();
    }
}); 