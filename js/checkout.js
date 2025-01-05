class Checkout {
    constructor() {
        this.cart = window.cart;
        this.init();
    }

    init() {
        this.checkoutForm = document.getElementById('checkout-form');
        if (!this.checkoutForm) return;

        this.loadCartSummary();
        this.initializeFormValidation();
        this.initializePaymentFields();
        this.handleFormSubmission();
    }

    loadCartSummary() {
        const cartData = this.cart.getCartData();
        const summaryContainer = document.querySelector('.order-summary');
        
        if (!summaryContainer || cartData.items.length === 0) {
            window.location.href = 'shop.html';
            return;
        }

        // Update items list
        const itemsList = summaryContainer.querySelector('.order-items');
        itemsList.innerHTML = cartData.items.map(item => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="item-quantity">Quantity: ${item.quantity}</div>
                    <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            </div>
        `).join('');

        // Update totals
        const totalsContainer = summaryContainer.querySelector('.order-totals');
        totalsContainer.innerHTML = `
            <div class="total-line">
                <span>Subtotal:</span>
                <span>$${cartData.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-line">
                <span>Shipping:</span>
                <span>${cartData.shipping === 0 ? 'Free' : '$' + cartData.shipping.toFixed(2)}</span>
            </div>
            <div class="total-line">
                <span>Tax:</span>
                <span>$${cartData.tax.toFixed(2)}</span>
            </div>
            <div class="total-line total">
                <span>Total:</span>
                <span>$${cartData.total.toFixed(2)}</span>
            </div>
        `;
    }

    initializeFormValidation() {
        const inputs = this.checkoutForm.querySelectorAll('input[required], select[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('invalid')) {
                    this.validateField(input);
                }
            });
        });
    }

    validateField(field) {
        const errorClass = 'invalid';
        let isValid = true;
        let errorMessage = '';

        // Remove existing error message
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Validate based on field type
        switch(field.type) {
            case 'email':
                if (!this.isValidEmail(field.value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;
            
            case 'tel':
                if (!this.isValidPhone(field.value)) {
                    errorMessage = 'Please enter a valid phone number';
                    isValid = false;
                }
                break;
            
            case 'text':
                if (field.name === 'card-number') {
                    if (!this.isValidCardNumber(field.value)) {
                        errorMessage = 'Please enter a valid card number';
                        isValid = false;
                    }
                } else if (field.name === 'cvv') {
                    if (!this.isValidCVV(field.value)) {
                        errorMessage = 'Please enter a valid CVV';
                        isValid = false;
                    }
                } else if (!field.value.trim()) {
                    errorMessage = 'This field is required';
                    isValid = false;
                }
                break;
            
            default:
                if (!field.value.trim()) {
                    errorMessage = 'This field is required';
                    isValid = false;
                }
        }

        if (!isValid) {
            this.showError(field, errorMessage);
        }

        field.classList.toggle(errorClass, !isValid);
        return isValid;
    }

    showError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentElement.appendChild(errorDiv);
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^[\d\s-+()]{10,}$/.test(phone);
    }

    isValidCardNumber(number) {
        return /^\d{16}$/.test(number.replace(/\s/g, ''));
    }

    isValidCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }

    initializePaymentFields() {
        // Card number formatting
        const cardInput = this.checkoutForm.querySelector('input[name="card-number"]');
        if (cardInput) {
            cardInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})/g, '$1 ').trim();
                e.target.value = value;
            });
        }

        // Expiry date formatting
        const expiryInput = this.checkoutForm.querySelector('input[name="expiry"]');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2);
                }
                e.target.value = value;
            });
        }
    }

    handleFormSubmission() {
        this.checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate all required fields
            const requiredFields = this.checkoutForm.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                return;
            }

            // Show loading state
            const submitButton = this.checkoutForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';

            try {
                // Collect form data
                const formData = new FormData(this.checkoutForm);
                const orderData = {
                    customer: {
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        firstName: formData.get('first-name'),
                        lastName: formData.get('last-name')
                    },
                    shipping: {
                        address: formData.get('address'),
                        city: formData.get('city'),
                        state: formData.get('state'),
                        zip: formData.get('zip'),
                        country: formData.get('country')
                    },
                    payment: {
                        cardNumber: formData.get('card-number'),
                        expiry: formData.get('expiry'),
                        cvv: formData.get('cvv')
                    },
                    order: this.cart.getCartData()
                };

                // Here you would typically send the order to your server
                await this.processOrder(orderData);

                // Show success message and redirect
                this.showSuccessMessage();
                this.cart.clearCart();
                
                setTimeout(() => {
                    window.location.href = 'order-confirmation.html';
                }, 2000);

            } catch (error) {
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-error';
                errorMessage.textContent = 'There was an error processing your order. Please try again.';
                this.checkoutForm.insertBefore(errorMessage, this.checkoutForm.firstChild);

                // Remove error message after 5 seconds
                setTimeout(() => errorMessage.remove(), 5000);

            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    async processOrder(orderData) {
        // Simulate API call delay
        return new Promise(resolve => setTimeout(resolve, 2000));
    }

    showSuccessMessage() {
        const successMessage = document.createElement('div');
        successMessage.className = 'checkout-success';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h3>Order Successful!</h3>
            <p>Thank you for your purchase. You will be redirected to the order confirmation page.</p>
        `;

        this.checkoutForm.innerHTML = '';
        this.checkoutForm.appendChild(successMessage);
    }
}

// Initialize checkout functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('checkout-form')) {
        new Checkout();
    }
}); 