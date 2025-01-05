console.log('Loading components...');

// Make loadComponents available globally
window.loadComponents = async function loadComponents() {
    console.log('Loading components...');
    try {
        // Load header first
        await loadHeader();
        
        // Load cart sidebar
        await loadCartSidebar();
        
        // Load footer last
        await loadFooter();
        
        console.log('All components loaded successfully');
    } catch (error) {
        console.error('Error loading components:', error);
        throw error;
    }
}

async function loadHeader() {
    console.log('Loading header...');
    const headerContainer = document.getElementById('header');
    if (!headerContainer) {
        console.error('Header container not found');
        return;
    }

    try {
        console.log('Fetching header from components/header.html');
        const response = await fetch('components/header.html');
        console.log('Header fetch response:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to load header: ${response.status}`);
        }

        const headerContent = await response.text();
        console.log('Loading header content');
        headerContainer.innerHTML = headerContent;
        console.log('Header loaded successfully');
    } catch (error) {
        console.error('Error loading header:', error);
        // Use fallback header if fetch fails
        headerContainer.innerHTML = `
            <div class="top-header">
                <div class="container">
                    <nav>
                        <a href="index.html">Home</a>
                        <a href="shop.html">Shop</a>
                        <a href="about.html">About</a>
                        <a href="contact.html">Contact</a>
                        <a href="#" class="cart-link">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="cart-count">0</span>
                        </a>
                    </nav>
                </div>
            </div>
        `;
    }
}

async function loadCartSidebar() {
    console.log('Loading cart sidebar...');
    const cartContainer = document.getElementById('cart-container');
    if (!cartContainer) {
        console.error('Cart container not found');
        return;
    }

    try {
        const response = await fetch('components/cart-sidebar.html');
        if (!response.ok) {
            throw new Error(`Failed to load cart sidebar: ${response.status}`);
        }

        const cartContent = await response.text();
        cartContainer.innerHTML = cartContent;
        console.log('Cart sidebar loaded successfully');
    } catch (error) {
        console.error('Error loading cart sidebar:', error);
        // Use fallback cart sidebar if fetch fails
        cartContainer.innerHTML = `
            <div class="cart-sidebar">
                <div class="cart-header">
                    <h3>Shopping Cart</h3>
                    <button class="close-cart">&times;</button>
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
                        <div class="total-line shipping-line" style="display: none;">
                            <span>Flat Rate Shipping</span>
                            <span class="cart-shipping">$50.00</span>
                        </div>
                        <div class="total-line grand-total">
                            <span>Total</span>
                            <span class="cart-total">$0.00</span>
                        </div>
                    </div>
                    
                    <button class="checkout-button" disabled>
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        `;
    }
}

async function loadFooter() {
    console.log('Loading footer...');
    const footerContainer = document.getElementById('footer');
    if (!footerContainer) {
        console.error('Footer container not found');
        return;
    }

    try {
        const response = await fetch('components/footer.html');
        if (!response.ok) {
            throw new Error(`Failed to load footer: ${response.status}`);
        }

        const footerContent = await response.text();
        footerContainer.innerHTML = footerContent;
        console.log('Footer loaded successfully');
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

// Export the loadComponents function
window.loadComponents = loadComponents; 