// Smooth Scroll Implementation
document.addEventListener('DOMContentLoaded', () => {
    // Get header height for offset calculation
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;

    // Handle all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // If it's a cross-page navigation (e.g., index.html#section)
            if (href.includes('.html')) {
                return; // Let the browser handle the navigation
            }

            // For same-page navigation
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const targetPosition = targetElement.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}); 