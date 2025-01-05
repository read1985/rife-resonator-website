// Singleton instance
let cartInstance = null;

class Cart {
    constructor() {
        // Return existing instance if it exists
        if (cartInstance) {
            console.log('Returning existing cart instance');
            return cartInstance;
        }

        console.log('Creating new cart instance');
        cartInstance = this;
        this.items = [];
        this.total = 0;
        this.shipping = 0;
        this.tax = 0;
        this.initialized = false;
        this.init();
        
        return cartInstance;
    }

    init() {
        if (this.initialized) {
            console.log('Cart already initialized');
            return;
        }

        console.log('Cart init started');
        // Wait for elements to be available
        const initInterval = setInterval(() => {
            this.cartSidebar = document.getElementById('cart-sidebar');
            this.cartCount = document.querySelector('.cart-count');
            this.cartItems = document.querySelector('.cart-items');
            this.totalAmount = document.querySelector('.total-amount');
            this.checkoutButton = document.querySelector('.checkout-button');
            
            if (this.cartSidebar && this.cartCount && this.cartItems && this.totalAmount && this.checkoutButton) {
                console.log('Cart elements found, initializing...');
                clearInterval(initInterval);
                this.initialized = true;
                this.loadCart();
                this.bindEvents();
                console.log('Cart initialization complete');
            } else {
                console.log('Waiting for cart elements...', {
                    cartSidebar: !!this.cartSidebar,
                    cartCount: !!this.cartCount,
                    cartItems: !!this.cartItems,
                    totalAmount: !!this.totalAmount,
                    checkoutButton: !!this.checkoutButton
                });
            }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
            if (!this.initialized) {
                console.error('Cart initialization timed out');
                clearInterval(initInterval);
            }
        }, 5000);
    }

    bindEvents() {
        if (!this.initialized) {
            console.error('Cannot bind events before initialization');
            return;
        }

        console.log('Binding cart events');
        
        // Cart toggle
        const cartLink = document.querySelector('.cart-link');
        if (cartLink) {
            cartLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cart toggle clicked');
                this.toggleCart();
            });
        }

        // Close cart
        const closeCart = document.querySelector('.close-cart');
        if (closeCart) {
            closeCart.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close cart clicked');
                this.closeCart();
            });
        }

        // Add to cart buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart, .add-to-cart-btn');
        console.log('Found add to cart buttons:', addToCartButtons.length);
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add to cart clicked');
                this.addToCart(e);
            });
        });

        // Outside click
        document.addEventListener('click', (e) => {
            if (this.cartSidebar && this.cartSidebar.classList.contains('active') && 
                !e.target.closest('#cart-sidebar') && 
                !e.target.closest('.cart-link')) {
                this.closeCart();
            }
        });

        // Checkout button
        if (this.checkoutButton) {
            this.checkoutButton.addEventListener('click', () => {
                if (this.items.length > 0) {
                    window.location.href = 'checkout.html';
                }
            });
        }
    }

    toggleCart() {
        this.cartSidebar.classList.toggle('active');
    }

    closeCart() {
        this.cartSidebar.classList.remove('active');
    }

    addToCart(e) {
        console.log('Adding to cart...', e.target);
        const productCard = e.target.closest('.product-card');
        const productPage = e.target.closest('.product-details');
        
        let product;
        
        try {
            if (productCard) {
                console.log('Adding from shop page');
                const productInfo = productCard.querySelector('.product-info');
                const nameElement = productInfo.querySelector('h3 a');
                const priceElement = productInfo.querySelector('.price');
                const imageElement = productCard.querySelector('img');

                if (!nameElement || !priceElement || !imageElement) {
                    throw new Error('Missing required product elements');
                }

                product = {
                    id: Date.now(),
                    name: nameElement.textContent.trim(),
                    price: parseFloat(priceElement.textContent.replace(/[^0-9.-]+/g, '')),
                    image: imageElement.src,
                    quantity: 1
                };
                console.log('Product info found:', product);
            } else if (productPage) {
                console.log('Adding from product page');
                const nameElement = productPage.querySelector('h1');
                const priceElement = productPage.querySelector('.price');
                const imageElement = document.getElementById('main-product-image');
                const quantityInput = document.getElementById('quantity');

                if (!nameElement || !priceElement || !imageElement) {
                    throw new Error('Missing required product elements');
                }

                product = {
                    id: Date.now(),
                    name: nameElement.textContent.trim(),
                    price: parseFloat(priceElement.textContent.replace(/[^0-9.-]+/g, '')),
                    image: imageElement.src,
                    quantity: quantityInput ? parseInt(quantityInput.value) : 1
                };
                console.log('Product info found:', product);
            } else {
                console.error('Could not find product container');
                return;
            }

            if (!product.name || !product.price || !product.image) {
                throw new Error('Invalid product data');
            }

            const existingItem = this.items.find(item => item.name === product.name);
            if (existingItem) {
                existingItem.quantity += product.quantity;
                console.log('Updated existing item quantity:', existingItem);
            } else {
                this.items.push(product);
                console.log('Added new item to cart:', product);
            }

            this.updateCart();
            this.showNotification('Product added to cart');
            this.openCart();
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Error adding product to cart');
        }
    }

    updateQuantity(cartItem, change) {
        const itemId = cartItem.dataset.id;
        const item = this.items.find(item => item.id === itemId);
        if (!item) return;

        item.quantity += change;
        if (item.quantity <= 0) {
            this.removeItem(cartItem);
        } else {
            this.updateCart();
        }
    }

    removeItem(cartItem) {
        const itemId = cartItem.dataset.id;
        this.items = this.items.filter(item => item.id !== itemId);
        this.updateCart();
        this.showNotification('Product removed from cart');
    }

    updateCart() {
        console.log('Updating cart with items:', this.items);
        
        // Update cart count
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCount.textContent = totalItems;
        console.log('Updated cart count:', totalItems);

        // Update cart items display
        this.cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                    </div>
                </div>
                <button class="remove-item">&times;</button>
            </div>
        `).join('');

        // Calculate totals
        this.calculateTotals();

        // Update checkout button state
        this.checkoutButton.disabled = this.items.length === 0;

        // Save cart to localStorage
        this.saveCart();
        console.log('Cart update complete');
    }

    calculateTotals() {
        // Subtotal
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Shipping (free over $500)
        this.shipping = this.total >= 500 ? 0 : 29.95;

        // Tax (example: 8.25%)
        this.tax = this.total * 0.0825;

        // Update display
        this.totalAmount.textContent = `$${(this.total + this.shipping + this.tax).toFixed(2)}`;
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

    openCart() {
        this.cartSidebar.classList.add('active');
    }

    clearCart() {
        this.items = [];
        this.total = 0;
        this.shipping = 0;
        this.tax = 0;
        localStorage.removeItem('cart'); // Clear cart data from localStorage
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
} 