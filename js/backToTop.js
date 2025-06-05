// Back to Top Button Component
const createBackToTopButton = () => {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    return button;
};

// Utility function to adjust back-to-top offset based on CTA
function adjustBackToTopOffset() {
    const cta = document.querySelector('.floating-waitlist-cta.visible');
    const backToTop = document.querySelector('.back-to-top');
    if (cta && backToTop) {
        const ctaRect = cta.getBoundingClientRect();
        // Calculate distance from bottom of viewport to top of CTA
        const offset = window.innerHeight - ctaRect.top + 16; // 16px extra space
        backToTop.style.bottom = `${offset}px`;
    } else if (backToTop) {
        // Reset to default if CTA is not visible
        backToTop.style.bottom = window.matchMedia('(max-width: 768px)').matches ? '110px' : '90px';
    }
}

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
        adjustBackToTopOffset();
    });

    // Add resize event listener
    window.addEventListener('resize', adjustBackToTopOffset);

    // Periodically check for CTA visibility changes (robust for dynamic content)
    setInterval(adjustBackToTopOffset, 200);

    // Add click event listener
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}); 