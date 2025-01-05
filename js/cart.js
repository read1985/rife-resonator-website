class Cart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.shipping = 0;
        this.tax = 0;
        this.init();
    }

    init() {
        this.cartSidebar = document.getElementById('cart-sidebar');
        this.cartCount = document.querySelector('.cart-count');
        this.cartItems = document.querySelector('.cart-items');
        this.totalAmount = document.querySelector('.total-amount');
        this.checkoutButton = document.querySelector('.checkout-button');

        this.loadCart();
        this.bindEvents();
    }

    bindEvents() {
        // Cart toggle
        document.querySelector('.cart-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleCart();
        });

        document.querySelector('.close-cart').addEventListener('click', () => {
            this.closeCart();
        });

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            if (this.cartSidebar.classList.contains('active') && 
                !e.target.closest('#cart-sidebar') && 
                !e.target.closest('.cart-link')) {
                this.closeCart();
            }
        });

        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => this.addToCart(e));
        });

        // Checkout button
        this.checkoutButton.addEventListener('click', () => {
            if (this.items.length > 0) {
                window.location.href = 'checkout.html';
            }
        });

        // Handle quantity changes and item removal
        this.cartItems.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            if (!cartItem) return;

            if (e.target.classList.contains('quantity-btn')) {
                this.updateQuantity(cartItem, e.target.classList.contains('plus') ? 1 : -1);
            } else if (e.target.classList.contains('remove-item')) {
                this.removeItem(cartItem);
            }
        });
    }

    toggleCart() {
        this.cartSidebar.classList.toggle('active');
    }

    closeCart() {
        this.cartSidebar.classList.remove('active');
    }

    addToCart(e) {
        const productCard = e.target.closest('.product-card');
        const product = {
            id: productCard.dataset.id || Date.now(),
            name: productCard.querySelector('h3').textContent,
            price: parseFloat(productCard.querySelector('.price').textContent.replace(/[^0-9.-]+/g, '')),
            image: productCard.querySelector('img').src,
            quantity: 1
        };

        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push(product);
        }

        this.updateCart();
        this.showNotification('Product added to cart');
        this.openCart();
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
        // Update cart count
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCount.textContent = totalItems;

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
        localStorage.setItem('cart', JSON.stringify({
            items: this.items,
            total: this.total,
            shipping: this.shipping,
            tax: this.tax
        }));
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const cart = JSON.parse(savedCart);
            this.items = cart.items;
            this.total = cart.total;
            this.shipping = cart.shipping;
            this.tax = cart.tax;
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
        this.updateCart();
    }

    getCartData() {
        return {
            items: this.items,
            subtotal: this.total,
            shipping: this.shipping,
            tax: this.tax,
            total: this.total + this.shipping + this.tax
        };
    }
}

// Initialize cart functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new Cart();
}); 