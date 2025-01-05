console.log('Loading components...');

async function loadComponents() {
    try {
        // Load header
        await loadHeader();
        
        // Load cart sidebar
        await loadCartSidebar();
        
        // Load footer
        await loadFooter();
        
        console.log('All components loaded successfully');
    } catch (error) {
        console.error('Error loading components:', error);
        throw error;
    }
}

async function loadHeader() {
    console.log('Loading header...');
    const headerElement = document.getElementById('header');
    if (!headerElement) {
        console.error('Header element not found');
        return;
    }

    try {
        const headerResponse = await fetch('components/header.html');
        if (!headerResponse.ok) {
            console.log('Using fallback header');
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
        } else {
            const headerContent = await headerResponse.text();
            headerElement.innerHTML = headerContent;
        }
        console.log('Header loaded successfully');
    } catch (error) {
        console.error('Error loading header:', error);
        throw error;
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
    console.log('Loading footer...');
    const footerElement = document.getElementById('footer');
    if (!footerElement) {
        console.error('Footer element not found');
        return;
    }

    try {
        const footerResponse = await fetch('components/footer.html');
        if (!footerResponse.ok) {
            console.log('Using fallback footer');
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
                    </div>
                    
                    <div class="footer-bottom">
                        <p>&copy; 2024 Wave Technologies. All rights reserved.</p>
                    </div>
                </footer>
            `;
        } else {
            const footerContent = await footerResponse.text();
            footerElement.innerHTML = footerContent;
        }
        console.log('Footer loaded successfully');
    } catch (error) {
        console.error('Error loading footer:', error);
        throw error;
    }
} 