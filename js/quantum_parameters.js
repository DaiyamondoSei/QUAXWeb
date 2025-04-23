// Quantum Parameters Page Enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize accessibility features
    initAccessibility();
    // Initialize visual enhancements
    initVisualEnhancements();
});

// Accessibility Features
function initAccessibility() {
    // Add ARIA labels to interactive elements
    const parameterCards = document.querySelectorAll('.parameter-card');
    parameterCards.forEach((card, index) => {
        card.setAttribute('role', 'article');
        card.setAttribute('aria-labelledby', `parameter-title-${index}`);
        card.setAttribute('aria-describedby', `parameter-desc-${index}`);
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const focusableElements = document.querySelectorAll(
                'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
            );
            focusableElements.forEach(el => {
                el.classList.add('keyboard-focus');
            });
        }
    });

    // Add skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// Visual Enhancements
function initVisualEnhancements() {
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add progress indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // Add hover effects to parameter cards
    const cards = document.querySelectorAll('.parameter-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('card-hover');
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('card-hover');
        });
    });
} 