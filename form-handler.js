document.addEventListener('DOMContentLoaded', function() {
    const partnershipForm = document.querySelector('form[name="partnership-form"]');
    if (!partnershipForm) return;

    const submitButton = partnershipForm.querySelector('.submit-button');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoading = submitButton.querySelector('.button-loading');

    partnershipForm.addEventListener('submit', function(e) {
        // Basic form validation
        if (!partnershipForm.checkValidity()) {
            e.preventDefault();
            return;
        }

        // Show loading state
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        // Form will be handled by Netlify
        // The loading state will be cleared when the page redirects
    });

    // Handle form validation styling
    const formInputs = partnershipForm.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('invalid', function() {
            input.classList.add('invalid');
        });

        input.addEventListener('input', function() {
            if (input.validity.valid) {
                input.classList.remove('invalid');
            }
        });
    });
}); 