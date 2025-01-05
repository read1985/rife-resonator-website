class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }

    init() {
        this.addFormValidation();
        this.handleFormSubmission();
    }

    addFormValidation() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            // Add validation on blur
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            // Add validation on input
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

        // Remove existing error message
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Check if field is empty
        if (!field.value.trim()) {
            this.showError(field, 'This field is required');
            isValid = false;
        }
        // Email validation
        else if (field.type === 'email' && !this.isValidEmail(field.value)) {
            this.showError(field, 'Please enter a valid email address');
            isValid = false;
        }
        // Phone validation (if provided)
        else if (field.type === 'tel' && field.value.trim() && !this.isValidPhone(field.value)) {
            this.showError(field, 'Please enter a valid phone number');
            isValid = false;
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
        // Basic phone validation - can be customized based on requirements
        return /^[\d\s-+()]{10,}$/.test(phone);
    }

    handleFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate all required fields
            const requiredFields = this.form.querySelectorAll('[required]');
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
            const submitButton = this.form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            try {
                // Collect form data
                const formData = new FormData(this.form);
                const data = Object.fromEntries(formData.entries());

                // Here you would typically send the data to your server
                // For demonstration, we'll simulate an API call
                await this.simulateFormSubmission(data);

                // Show success message
                this.showSuccessMessage();

                // Reset form
                this.form.reset();

            } catch (error) {
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-error';
                errorMessage.textContent = 'There was an error sending your message. Please try again later.';
                this.form.insertBefore(errorMessage, this.form.firstChild);

                // Remove error message after 5 seconds
                setTimeout(() => errorMessage.remove(), 5000);

            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    async simulateFormSubmission(data) {
        // Simulate API call delay
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    showSuccessMessage() {
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h3>Thank You!</h3>
            <p>Your message has been sent successfully. We'll get back to you shortly.</p>
        `;

        // Replace form with success message
        this.form.innerHTML = '';
        this.form.appendChild(successMessage);

        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Initialize contact form functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('contactForm')) {
        new ContactForm();
    }
}); 