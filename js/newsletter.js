class Newsletter {
    constructor() {
        this.forms = document.querySelectorAll('.newsletter-form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            this.addFormValidation(form);
            this.handleFormSubmission(form);
        });
    }

    addFormValidation(form) {
        const emailInput = form.querySelector('input[type="email"]');
        
        emailInput.addEventListener('blur', () => {
            this.validateEmail(emailInput);
        });

        emailInput.addEventListener('input', () => {
            if (emailInput.classList.contains('invalid')) {
                this.validateEmail(emailInput);
            }
        });
    }

    validateEmail(input) {
        const errorClass = 'invalid';
        let isValid = true;

        // Remove existing error message
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Check if email is empty
        if (!input.value.trim()) {
            this.showError(input, 'Please enter your email address');
            isValid = false;
        }
        // Validate email format
        else if (!this.isValidEmail(input.value)) {
            this.showError(input, 'Please enter a valid email address');
            isValid = false;
        }

        input.classList.toggle(errorClass, !isValid);
        return isValid;
    }

    showError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    handleFormSubmission(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]');
            if (!this.validateEmail(emailInput)) {
                return;
            }

            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Subscribing...';

            try {
                // Collect form data
                const email = emailInput.value;

                // Here you would typically send the data to your server
                // For demonstration, we'll simulate an API call
                await this.simulateSubscription(email);

                // Show success message
                this.showSuccessMessage(form);

                // Reset form
                form.reset();

            } catch (error) {
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-error';
                errorMessage.textContent = 'There was an error subscribing. Please try again later.';
                form.insertBefore(errorMessage, form.firstChild);

                // Remove error message after 5 seconds
                setTimeout(() => errorMessage.remove(), 5000);

            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    async simulateSubscription(email) {
        // Simulate API call delay
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    showSuccessMessage(form) {
        const successMessage = document.createElement('div');
        successMessage.className = 'newsletter-success';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <p>Thank you for subscribing to our newsletter!</p>
        `;

        // Replace form with success message
        form.innerHTML = '';
        form.appendChild(successMessage);

        // Remove success message after 5 seconds and restore form
        setTimeout(() => {
            form.innerHTML = `
                <input type="email" placeholder="Enter your email">
                <button type="submit">Subscribe</button>
            `;
            this.addFormValidation(form);
        }, 5000);
    }
}

// Initialize newsletter functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.newsletter-form')) {
        new Newsletter();
    }
}); 