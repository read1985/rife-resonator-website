// Main initialization sequence
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Starting initialization sequence...');
    
    // Load components first
    await loadComponents();
    console.log('Components loaded successfully');
    
    // Initialize cart
    console.log('Initializing cart...');
    const cart = new Cart();
    await cart.init();
    console.log('Cart initialized successfully');
    
    // Get current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log('Current page:', currentPage);
    
    // Handle page-specific initialization
    switch (currentPage) {
        case 'checkout.html':
            // Initialize checkout page
            if (typeof initCheckout === 'function') {
                await initCheckout();
            }
            break;
            
        case 'product.html':
            // Initialize product page
            if (typeof initProduct === 'function') {
                await initProduct();
            }
            break;
            
        // Add more pages as needed
    }
    
    console.log('Initialization sequence completed');
}); 