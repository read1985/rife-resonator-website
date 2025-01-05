console.log('Loading components...');

async function loadComponents() {
    try {
        // Load header
        const headerResponse = await fetch('components/header.html');
        if (!headerResponse.ok) {
            console.error('Failed to load header, falling back to inline header');
            const headerElement = document.getElementById('header');
            if (headerElement) {
                headerElement.innerHTML = `
                    <header>
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
                    </header>
                `;
                console.log('Header loaded from fallback');
            }
        } else {
            const headerContent = await headerResponse.text();
            const headerElement = document.getElementById('header');
            if (headerElement) {
                headerElement.innerHTML = headerContent;
                console.log('Header loaded from file');
            }
        }

        // Load cart sidebar
        const cartSidebarResponse = await fetch('components/cart-sidebar.html');
        if (!cartSidebarResponse.ok) {
            console.error('Failed to load cart sidebar, falling back to inline cart');
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
            console.log('Cart sidebar loaded from fallback');
        } else {
            const cartSidebarContent = await cartSidebarResponse.text();
            const cartSidebarElement = document.createElement('div');
            cartSidebarElement.innerHTML = cartSidebarContent;
            document.body.appendChild(cartSidebarElement.firstElementChild);
            console.log('Cart sidebar loaded from file');
        }

        // Load footer
        const footerResponse = await fetch('components/footer.html');
        if (!footerResponse.ok) {
            console.error('Failed to load footer, falling back to inline footer');
            const footerElement = document.getElementById('footer');
            if (footerElement) {
                footerElement.innerHTML = `
                    <footer>
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
                            
                            <div class="footer-section">
                                <h3>Customer Service</h3>
                                <ul>
                                    <li><a href="shipping.html">Shipping Information</a></li>
                                    <li><a href="returns.html">Returns & Refunds</a></li>
                                    <li><a href="privacy.html">Privacy Policy</a></li>
                                    <li><a href="terms.html">Terms of Service</a></li>
                                </ul>
                            </div>
                            
                            <div class="footer-section">
                                <h3>Contact Us</h3>
                                <ul>
                                    <li>
                                        <i class="fas fa-envelope"></i>
                                        <a href="mailto:support@waveresonator.com">support@waveresonator.com</a>
                                    </li>
                                    <li>
                                        <i class="fas fa-phone"></i>
                                        <a href="tel:+1234567890">+1 (234) 567-890</a>
                                    </li>
                                </ul>
                            </div>
                            
                            <div class="footer-section">
                                <h3>Newsletter</h3>
                                <p>Subscribe to receive updates and special offers.</p>
                                <form class="newsletter-form">
                                    <input type="email" placeholder="Enter your email">
                                    <button type="submit">Subscribe</button>
                                </form>
                            </div>
                        </div>
                        
                        <div class="footer-bottom">
                            <p>&copy; 2024 Wave Technologies. All rights reserved.</p>
                        </div>
                    </footer>
                `;
                console.log('Footer loaded from fallback');
            }
        } else {
            const footerContent = await footerResponse.text();
            const footerElement = document.getElementById('footer');
            if (footerElement) {
                footerElement.innerHTML = footerContent;
                console.log('Footer loaded from file');
            }
        }

        // Initialize cart after components are loaded
        console.log('Creating cart instance');
        if (typeof Cart !== 'undefined') {
            if (!window.cartInstance) {
                window.cartInstance = new Cart();
                await window.cartInstance.init();
                console.log('Cart initialized');
            }
        } else {
            console.error('Cart class not found');
        }

    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', loadComponents); 