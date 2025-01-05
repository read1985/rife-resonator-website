// Main initialization sequence
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Starting initialization sequence...');
    
    try {
        // First, load components (header, footer, cart sidebar)
        await loadComponents();
        console.log('Components loaded successfully');
        
        // Wait a bit to ensure DOM is updated
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Initialize cart if not already initialized
        if (!window.cartInstance?.initialized) {
            console.log('Initializing cart...');
            window.cartInstance = new Cart();
            await window.cartInstance.init();
            console.log('Cart initialized successfully');
            
            // Re-bind cart events after initialization
            console.log('Re-binding cart events...');
            window.cartInstance.bindEvents();
        }
        
        // Initialize page-specific functionality
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        console.log('Current page:', currentPage);
        
        switch (currentPage) {
            case 'checkout.html':
                console.log('Initializing checkout page...');
                const checkout = new Checkout();
                await checkout.init();
                break;
                
            case 'shop.html':
                console.log('Initializing shop page...');
                if (typeof Shop !== 'undefined') {
                    window.shop = new Shop();
                    // Re-bind cart events after shop initialization
                    if (window.cartInstance?.initialized) {
                        console.log('Re-binding cart events after shop init...');
                        window.cartInstance.bindEvents();
                    }
                }
                break;
                
            case 'blog.html':
                console.log('Initializing blog page...');
                if (document.querySelector('.blog-posts')) {
                    new Blog();
                }
                break;
                
            case 'contact.html':
                console.log('Initializing contact page...');
                if (document.getElementById('contactForm')) {
                    new ContactForm();
                }
                break;
        }
        
        // Initialize newsletter if present
        if (document.querySelector('.newsletter-form')) {
            console.log('Initializing newsletter...');
            new Newsletter();
        }
        
        // Initialize treatments if present
        if (document.querySelector('.toggle-item, .frequency-item')) {
            console.log('Initializing treatments...');
            initializeTreatments();
        }
        
        console.log('Initialization sequence completed');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Helper function for treatments initialization
function initializeTreatments() {
    const toggleItems = document.querySelectorAll('.toggle-item');
    toggleItems.forEach(item => {
        const header = item.querySelector('.toggle-header');
        if (header) {
            header.addEventListener('click', () => {
                toggleItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                item.classList.toggle('active');
            });
        }
    });

    const frequencyItems = document.querySelectorAll('.frequency-item');
    frequencyItems.forEach(item => {
        const header = item.querySelector('h3');
        if (header) {
            header.addEventListener('click', () => {
                frequencyItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                item.classList.toggle('active');
            });
        }
    });
} 