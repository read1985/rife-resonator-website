// Cart functionality
class Cart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.init();
    }

    init() {
        this.cartSidebar = document.getElementById('cart-sidebar');
        this.cartCount = document.querySelector('.cart-count');
        this.totalAmount = document.querySelector('.total-amount');
        this.cartItems = document.querySelector('.cart-items');
        
        // Event listeners
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => this.addToCart(e));
        });

        document.querySelector('.close-cart').addEventListener('click', () => {
            this.cartSidebar.classList.remove('active');
        });

        document.querySelector('.cart-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.cartSidebar.classList.add('active');
        });

        // Load cart from localStorage
        this.loadCart();
    }

    addToCart(e) {
        const productCard = e.target.closest('.product-card');
        const product = {
            id: Date.now(), // Temporary ID
            name: productCard.querySelector('h3').textContent,
            price: parseFloat(productCard.querySelector('.price').textContent.replace('$', '').replace(',', '')),
            image: productCard.querySelector('img').src,
            quantity: 1
        };

        const existingItem = this.items.find(item => item.name === product.name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push(product);
        }

        this.updateCart();
        this.cartSidebar.classList.add('active');
        this.showNotification('Product added to cart');
    }

    updateCart() {
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.cartCount.textContent = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.totalAmount.textContent = `$${this.total.toFixed(2)}`;
        
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

        // Add event listeners for quantity controls
        this.cartItems.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.updateQuantity(e));
        });

        this.cartItems.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => this.removeItem(e));
        });

        // Save to localStorage
        this.saveCart();
    }

    updateQuantity(e) {
        const cartItem = e.target.closest('.cart-item');
        const itemId = parseInt(cartItem.dataset.id);
        const item = this.items.find(item => item.id === itemId);
        
        if (e.target.classList.contains('plus')) {
            item.quantity++;
        } else if (e.target.classList.contains('minus')) {
            item.quantity = Math.max(0, item.quantity - 1);
            if (item.quantity === 0) {
                this.items = this.items.filter(i => i.id !== itemId);
            }
        }

        this.updateCart();
    }

    removeItem(e) {
        const cartItem = e.target.closest('.cart-item');
        const itemId = parseInt(cartItem.dataset.id);
        this.items = this.items.filter(item => item.id !== itemId);
        this.updateCart();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
            this.updateCart();
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
}

// Navigation functionality
class Navigation {
    constructor() {
        this.init();
    }

    init() {
        // Mobile menu toggle
        const mobileMenuToggle = document.createElement('button');
        mobileMenuToggle.classList.add('mobile-menu-toggle');
        mobileMenuToggle.innerHTML = '<span></span><span></span><span></span>';
        document.querySelector('.main-nav .container').prepend(mobileMenuToggle);

        mobileMenuToggle.addEventListener('click', () => {
            document.querySelector('.nav-links').classList.toggle('active');
        });

        // Dropdown menus
        document.querySelectorAll('.has-dropdown').forEach(item => {
            item.addEventListener('mouseenter', (e) => {
                const dropdown = e.currentTarget.querySelector('.dropdown-menu');
                if (dropdown) {
                    const rect = dropdown.getBoundingClientRect();
                    if (rect.right > window.innerWidth) {
                        dropdown.style.left = 'auto';
                        dropdown.style.right = '0';
                    }
                }
            });
        });

        // Sticky header
        const header = document.querySelector('header');
        const topHeader = document.querySelector('.top-header');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > topHeader.offsetHeight) {
                header.classList.add('sticky');
                if (currentScroll > lastScroll) {
                    header.classList.add('hide');
                } else {
                    header.classList.remove('hide');
                }
            } else {
                header.classList.remove('sticky');
            }
            lastScroll = currentScroll;
        });
    }
}

// Search functionality
class Search {
    constructor() {
        this.init();
    }

    init() {
        const searchInput = document.querySelector('.search-bar input');
        const searchButton = document.querySelector('.search-bar button');

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value);
            }
        });

        searchButton.addEventListener('click', () => {
            this.performSearch(searchInput.value);
        });
    }

    performSearch(query) {
        if (query.trim()) {
            window.location.href = `shop.html?search=${encodeURIComponent(query.trim())}`;
        }
    }
}

// Newsletter functionality
class Newsletter {
    constructor() {
        this.init();
    }

    init() {
        const form = document.querySelector('.newsletter-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = form.querySelector('input[type="email"]').value;
                if (this.validateEmail(email)) {
                    this.subscribeToNewsletter(email);
                } else {
                    this.showError('Please enter a valid email address');
                }
            });
        }
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    subscribeToNewsletter(email) {
        // Here you would typically make an API call to your backend
        console.log('Newsletter subscription for:', email);
        this.showSuccess('Thank you for subscribing to our newsletter!');
        form.reset();
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification', 'error');
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification', 'success');
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Cart();
    new Navigation();
    new Search();
    new Newsletter();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}); 