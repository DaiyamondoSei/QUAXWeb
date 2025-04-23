// Back to Top Button Component
const createBackToTopButton = () => {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    return button;
};

// Initialize back to top button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const button = createBackToTopButton();
    document.body.appendChild(button);

    // Add scroll event listener
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });

    // Add click event listener
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}); 