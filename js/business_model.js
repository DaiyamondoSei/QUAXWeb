// Business Model Page Scripts

class BusinessModelAnimationSystem {
    constructor() {
        this.observers = new Map();
        this.animationClasses = [
            '.scroll-animate',
            '.fade-in',
            '.slide-up',
            '.scale-in',
            '.canvas-block',
            '.stat-card',
            '.differentiator-card',
            '.tier',
            '.stream',
            '.financial-card'
        ];
        
        // Initialize immediately
        this.initialize();
    }

    initialize() {
        // Ensure all content is visible initially
        this.animationClasses.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.style.opacity = '1';
                element.style.visibility = 'visible';
                element.style.transform = 'none';
            });
        });

        // Create a single observer for all animated elements
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        // Once animated, we can unobserve
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '-5% 0px'
            }
        );

        // Observe all elements with animation classes
        this.animationClasses.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                observer.observe(element);
            });
        });

        // Store the observer
        this.observers.set('main', observer);
    }

    // Clean up observers when needed
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

// Initialize animation system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animation system
    window.businessModelAnimations = new BusinessModelAnimationSystem();

    // Add hardware acceleration class to elements that need it
    document.querySelectorAll('.canvas-block, .revenue-chart-container, .financial-card')
        .forEach(element => element.classList.add('hardware-accelerated'));

    // Check for low-end devices
    if (navigator.hardwareConcurrency <= 4 || !window.matchMedia('(min-resolution: 2dppx)').matches) {
        document.documentElement.classList.add('low-end-device');
    }
});

// ... existing code ... 