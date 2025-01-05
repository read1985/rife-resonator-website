class Checkout {
    constructor() {
        console.log('Initializing checkout...');
        this.cartLoadAttempts = 0;
        this.maxCartLoadAttempts = 10;
        this.init();
    }

    async init() {
        try {
            await this.waitForElements();
            this.setupStripe();
            this.loadCartSummary();
            this.bindEvents();
        } catch (error) {
            console.error('Error initializing checkout:', error);
            this.showError('Failed to initialize checkout. Please try again.');
        }
    }

    async waitForElements() {
        return new Promise((resolve, reject) => {
            const checkElements = () => {
                const elements = {
                    cartInstance: window.cartInstance !== undefined && window.cartInstance !== null,
                    subtotal: document.getElementById('subtotal'),
                    shipping: document.getElementById('shipping'),
                    tax: document.getElementById('tax'),
                    total: document.getElementById('total'),
                    cartItemsList: document.getElementById('cart-items-list'),
                    cardElement: document.getElementById('card-element'),
                    cardErrors: document.getElementById('card-errors'),
                    submitButton: document.querySelector('.checkout-button')
                };

                // Log which elements are missing
                const missingElements = Object.entries(elements)
                    .filter(([key, value]) => !value)
                    .map(([key]) => key);
                
                console.log('Attempt', this.cartLoadAttempts + 1, 'of', this.maxCartLoadAttempts);
                console.log('Missing elements:', missingElements);

                if (Object.values(elements).every(element => element)) {
                    console.log('All elements found');
                    this.elements = elements;
                    resolve();
                } else {
                    if (this.cartLoadAttempts >= this.maxCartLoadAttempts) {
                        console.error('Failed to find elements:', missingElements);
                        // Don't redirect immediately if in debug mode
                        if (!localStorage.getItem('debug')) {
                            console.log('Will redirect to shop in 5 seconds...');
                            setTimeout(() => {
                                window.location.href = 'shop.html';
                            }, 5000);
                        }
                        reject(new Error('Checkout initialization timed out'));
                        return;
                    }
                    this.cartLoadAttempts++;
                    setTimeout(checkElements, 1000); // Increased delay between attempts
                }
            };

            checkElements();
        });
    }

    setupStripe() {
        // Initialize Stripe with test key
        this.stripe = Stripe('pk_test_51OfzlCG4gwxEhtFQ7zIWmvCsFLjQbncrnl112lJzia0LfJJhEoYACz7RKI0SIIAHkbNBWD60vFnoUOMiq9WNOtob00UFQ4CSAa'); // Replace with your actual publishable key
        this.elements = this.stripe.elements();
        
        // Create card element
        this.card = this.elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                }
            }
        });

        // Mount card element
        this.card.mount('#card-element');

        // Handle validation errors
        this.card.addEventListener('change', ({error}) => {
            const displayError = document.getElementById('card-errors');
            if (error) {
                displayError.textContent = error.message;
            } else {
                displayError.textContent = '';
            }
        });
    }

    async loadCartSummary() {
        console.log('Starting loadCartSummary...');
        try {
            // Check localStorage directly
            const savedCart = localStorage.getItem('cart');
            console.log('Raw cart data from localStorage:', savedCart);

            // Wait for cart instance to be ready
            if (!window.cartInstance || !window.cartInstance.initialized) {
                console.log('Cart instance status:', {
                    windowCartInstance: window.cartInstance,
                    isInitialized: window.cartInstance?.initialized
                });
                if (this.cartLoadAttempts < this.maxCartLoadAttempts) {
                    console.log('Cart not ready, retrying...', this.cartLoadAttempts);
                    this.cartLoadAttempts++;
                    setTimeout(() => this.loadCartSummary(), 1000);
                    return;
                } else {
                    throw new Error('Cart failed to initialize');
                }
            }

            // Parse saved cart data
            let parsedCart = null;
            try {
                parsedCart = JSON.parse(savedCart);
                console.log('Parsed cart data:', parsedCart);
            } catch (e) {
                console.error('Error parsing cart data:', e);
            }

            // If we have saved cart data but cart instance is empty, reload the cart
            if (parsedCart?.items?.length > 0 && window.cartInstance.items.length === 0) {
                console.log('Reloading cart data from localStorage...');
                window.cartInstance.items = parsedCart.items;
                window.cartInstance.total = parsedCart.total;
                window.cartInstance.shipping = parsedCart.shipping;
                window.cartInstance.tax = parsedCart.tax;
                window.cartInstance.updateCart();
            }

            const cartData = window.cartInstance.getCartData();
            console.log('Cart data from getCartData:', cartData);

            if (!cartData || !cartData.items) {
                console.error('Invalid cart data structure:', cartData);
                throw new Error('Invalid cart data structure');
            }

            // Only redirect if cart is empty AND we've confirmed the cart is properly loaded
            if (cartData.items.length === 0) {
                console.log('Cart is empty, will redirect to shop in 5 seconds...');
                console.log('Set localStorage.debug = true to prevent redirect');
                
                // Check if we're in debug mode
                if (!localStorage.getItem('debug')) {
                    setTimeout(() => {
                        window.location.href = 'shop.html';
                    }, 5000);
                }
                return;
            }

            console.log('Updating checkout summary with cart data...');
            // Update summary
            this.elements.subtotal.textContent = `$${cartData.subtotal.toFixed(2)}`;
            this.elements.shipping.textContent = `$${cartData.shipping.toFixed(2)}`;
            this.elements.tax.textContent = `$${cartData.tax.toFixed(2)}`;
            this.elements.total.textContent = `$${cartData.total.toFixed(2)}`;

            // Update items list
            this.elements.cartItemsList.innerHTML = cartData.items.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading cart summary:', error);
            this.showError('Failed to load cart data. Please try again.');
        }
    }

    bindEvents() {
        const form = document.querySelector('.checkout-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const submitButton = this.elements.submitButton;
        const spinner = document.getElementById('spinner');

        try {
            submitButton.disabled = true;
            spinner.classList.remove('hidden');

            // Create payment intent using local server
            const response = await fetch('http://localhost:3000/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: window.cartInstance.getCartData().items
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const data = await response.json();
            
            // Confirm card payment
            const result = await this.stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: this.card,
                    billing_details: {
                        name: document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        address: {
                            line1: document.getElementById('address').value,
                            city: document.getElementById('city').value,
                            state: document.getElementById('state').value,
                            postal_code: document.getElementById('zip').value,
                            country: document.getElementById('country').value
                        }
                    }
                }
            });

            if (result.error) {
                throw result.error;
            }

            // Payment successful
            window.cartInstance.clearCart();
            window.location.href = 'order-confirmation.html';

        } catch (error) {
            console.error('Payment error:', error);
            this.showError(error.message);
        } finally {
            submitButton.disabled = false;
            spinner.classList.add('hidden');
        }
    }

    showError(message) {
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = message;
        setTimeout(() => {
            errorElement.textContent = '';
        }, 5000);
    }
}

// Initialize checkout when DOM is ready
document.addEventListener('DOMContentLoaded', () => new Checkout()); 