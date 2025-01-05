console.log('Loading components...');

async function loadComponents() {
    try {
        // Load header
        await loadHeader();
        
        // Load cart sidebar
        await loadCartSidebar();
        
        // Load footer
        await loadFooter();
        
        // Initialize cart after all components are loaded
        console.log('Initializing cart...');
        if (typeof Cart !== 'undefined') {
            if (!window.cartInstance) {
                window.cartInstance = new Cart();
                await window.cartInstance.init();
                console.log('Cart initialized successfully');
            }
        } else {
            console.error('Cart class not found');
        }
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

async function loadHeader() {
    const headerResponse = await fetch('components/header.html');
    if (!headerResponse.ok) {
        console.log('Using fallback header');
        const headerElement = document.querySelector('header');
        if (headerElement) {
            headerElement.innerHTML = `
                <div class="announcement-bar">
                    <p>Free Shipping on Orders Over $500 | 30-Day Money-Back Guarantee</p>
                </div>
                
                <div class="top-header">
                    <div class="container">
                        <div class="logo">
                            <a href="index.html">
                                <img src="images/logo.png" alt="Wave Technologies Logo">
                            </a>
                        </div>
                        <nav class="main-nav">
                            <ul class="nav-links">
                                <li><a href="index.html">Home</a></li>
                                <li><a href="shop.html">Shop</a></li>
                                <li><a href="information.html">Information</a></li>
                                <li><a href="blog.html">Blog</a></li>
                                <li><a href="contact.html">Contact</a></li>
                            </ul>
                            <div class="header-icons">
                                <a href="#" class="cart-link">
                                    <i class="fas fa-shopping-cart"></i>
                                    <span class="cart-count">0</span>
                                </a>
                            </div>
                        </nav>
                    </div>
                </div>
            `;
        }
    } else {
        const headerContent = await headerResponse.text();
        const headerElement = document.querySelector('header');
        if (headerElement) {
            headerElement.innerHTML = headerContent;
        }
    }
}

async function loadCartSidebar() {
    const cartSidebarResponse = await fetch('components/cart-sidebar.html');
    if (!cartSidebarResponse.ok) {
        console.log('Using fallback cart sidebar');
        const cartSidebar = document.createElement('div');
        cartSidebar.innerHTML = `
            <div class="cart-sidebar">
                <div class="cart-header">
                    <h3>Shopping Cart</h3>
                    <button class="close-cart">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="cart-items">
                    <!-- Cart items will be dynamically added here -->
                </div>
                
                <div class="cart-footer">
                    <div class="cart-totals">
                        <div class="total-line">
                            <span>Subtotal</span>
                            <span class="cart-subtotal">$0.00</span>
                        </div>
                        <div class="total-line">
                            <span>Shipping</span>
                            <span class="cart-shipping">$0.00</span>
                        </div>
                        <div class="total-line">
                            <span>Tax</span>
                            <span class="cart-tax">$0.00</span>
                        </div>
                        <div class="total-line total">
                            <span>Total</span>
                            <span class="cart-total">$0.00</span>
                        </div>
                    </div>
                    
                    <button class="checkout-button" onclick="window.location.href='checkout.html'" disabled>
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(cartSidebar.firstElementChild);
    } else {
        const cartSidebarContent = await cartSidebarResponse.text();
        const cartSidebarElement = document.createElement('div');
        cartSidebarElement.innerHTML = cartSidebarContent;
        document.body.appendChild(cartSidebarElement.firstElementChild);
    }
}

async function loadFooter() {
    const footerResponse = await fetch('components/footer.html');
    if (!footerResponse.ok) {
        console.log('Using fallback footer');
        const footerElement = document.querySelector('footer');
        if (footerElement) {
            footerElement.innerHTML = `
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="index.html">Home</a></li>
                            <li><a href="shop.html">Shop</a></li>
                            <li><a href="information.html">Information</a></li>
                            <li><a href="contact.html">Contact</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>&copy; 2024 Wave Technologies. All rights reserved.</p>
                </div>
            `;
        }
    } else {
        const footerContent = await footerResponse.text();
        const footerElement = document.querySelector('footer');
        if (footerElement) {
            footerElement.innerHTML = footerContent;
        }
    }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', loadComponents); 