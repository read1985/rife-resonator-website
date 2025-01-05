// Main initialization sequence
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Starting initialization sequence...');
    
    try {
        // First, load components (header, footer, cart sidebar)
        await loadComponents();
        console.log('Components loaded successfully');
        
        // Wait a bit to ensure DOM is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Initialize cart if not already initialized
        if (!window.cartInstance?.initialized) {
            window.cartInstance = new Cart();
            await window.cartInstance.init();
            console.log('Cart initialized successfully');
        }
        
        // Initialize page-specific functionality
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        console.log('Current page:', currentPage);
        
        switch (currentPage) {
            case 'checkout.html':
                // Checkout page will initialize itself
                break;
            case 'shop.html':
                if (typeof Shop !== 'undefined') {
                    window.shop = new Shop();
                }
                break;
            // Add other page-specific initializations as needed
        }
        
        console.log('Initialization sequence completed');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}); 