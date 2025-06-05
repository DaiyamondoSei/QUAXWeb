// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/js/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Mobile functionality
document.addEventListener('DOMContentLoaded', function() {
    // Lazy load images
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    // Progressive Image Loading
    const heroImage = document.querySelector('.quantum-visualization-image');
    if (heroImage) {
        heroImage.classList.add('loading');
        
        // Create a low-quality placeholder
        const placeholder = new Image();
        placeholder.src = heroImage.src.replace('.webp', '-placeholder.webp');
        placeholder.classList.add('placeholder');
        heroImage.parentNode.insertBefore(placeholder, heroImage);

        // Load the high-quality image
        const highQualityImage = new Image();
        highQualityImage.src = heroImage.src;
        highQualityImage.onload = function() {
            heroImage.classList.remove('loading');
            heroImage.classList.add('loaded');
            if (placeholder) {
                placeholder.remove();
            }
        };
    }

    // Intersection Observer for lazy loading
    const lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                if (target.classList.contains('lazy-load')) {
                    const src = target.dataset.src;
                    if (src) {
                        target.src = src;
                        target.classList.add('loaded');
                        lazyLoadObserver.unobserve(target);
                    }
                }
            }
        });
    }, {
        rootMargin: '50px'
    });

    // Observe all lazy load elements
    document.querySelectorAll('.lazy-load').forEach(img => {
        lazyLoadObserver.observe(img);
    });

    // Ensure all .scroll-animate elements are observed for animation
    observeScrollAnimateSections();
});

// Bottom Sheet Navigation
const initBottomSheet = () => {
    const sheet = document.querySelector('.bottom-sheet');
    const backdrop = document.querySelector('.bottom-sheet-backdrop');
    let startY = 0;
    let currentY = 0;
    let initialY = 0;

    const onTouchStart = (e) => {
        startY = e.touches[0].clientY;
        initialY = sheet.getBoundingClientRect().top;
        
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    };

    const onTouchMove = (e) => {
        e.preventDefault();
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        if (deltaY > 0) { // Only allow dragging down
            const translateY = deltaY;
            sheet.style.transform = `translateY(${translateY}px)`;
            backdrop.style.opacity = 1 - (translateY / sheet.offsetHeight);
        }
    };

    const onTouchEnd = () => {
        const deltaY = currentY - startY;
        
        if (deltaY > sheet.offsetHeight * 0.4) {
            closeSheet();
        } else {
            // Snap back
            sheet.style.transform = '';
            backdrop.style.opacity = '1';
        }
        
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    };

    const openSheet = () => {
        sheet.classList.add('active');
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeSheet = () => {
        sheet.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
        sheet.style.transform = '';
    };

    if (sheet && backdrop) {
        const handle = sheet.querySelector('.bottom-sheet-handle');
        handle.addEventListener('touchstart', onTouchStart);
        
        backdrop.addEventListener('click', closeSheet);
        
        // Toggle sheet with menu button
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sheet.classList.contains('active')) {
                closeSheet();
            } else {
                openSheet();
            }
        });
    }
};

// Animation System
class AnimationSystem {
    constructor() {
        this.observers = new Map();
        this.initializeAnimations();
        this.ensureContentVisibility();
        this.ensureMultiSensoryVisibility();
    }

    ensureMultiSensoryVisibility() {
        // Force visibility for multi-sensory section and its children
        const multiSensorySection = document.querySelector('.multi-sensory');
        if (multiSensorySection) {
            multiSensorySection.style.opacity = '1';
            multiSensorySection.style.visibility = 'visible';
            multiSensorySection.style.transform = 'none';
            
            // Ensure all child elements are visible
            const childElements = multiSensorySection.querySelectorAll('*');
            childElements.forEach(element => {
                element.style.opacity = '1';
                element.style.visibility = 'visible';
                element.style.transform = 'none';
            });
        }
    }

    ensureContentVisibility() {
        // Force visibility for all content elements
        const contentElements = document.querySelectorAll(
            '.hero-content, .section, .card, .feature-card, .quantum-state-card, .resource-card, .scroll-animate, .multi-sensory, .multi-sensory *'
        );
        
        contentElements.forEach(element => {
            element.style.opacity = '1';
            element.style.visibility = 'visible';
            element.style.transform = 'none';
        });
    }

    createObserver(options = {}) {
        const defaultOptions = {
            threshold: 0.1, // Lower threshold for earlier triggering
            rootMargin: '0px 0px -10% 0px' // Increased margin for earlier triggering
        };

        const observerOptions = { ...defaultOptions, ...options };
        
        return new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    
                    // Ensure element is visible
                    target.style.opacity = '1';
                    target.style.visibility = 'visible';
                    target.style.transform = 'none';
                    
                    // Add animation class if needed
                    if (target.classList.contains('scroll-animate') ||
                        target.classList.contains('feature-card') ||
                        target.classList.contains('quantum-state-card') ||
                        target.classList.contains('resource-card')) {
                        target.classList.add('animate-in');
                    }
                    
                    // Unobserve after animation is triggered
                    this.observers.get(observerOptions.id)?.unobserve(target);
                }
            });
        }, observerOptions);
    }

    observeElements(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;

        // Ensure elements are visible before observing
        elements.forEach(element => {
            element.style.opacity = '1';
            element.style.visibility = 'visible';
            element.style.transform = 'none';
        });

        const observer = this.createObserver(options);
        this.observers.set(options.id || selector, observer);

        elements.forEach(element => {
            observer.observe(element);
        });
    }

    initializeAnimations() {
        // First ensure all content is visible
        this.ensureContentVisibility();
        
        // Then observe elements for animations
        this.observeElements('.scroll-animate', { id: 'scroll' });
        this.observeElements('.feature-card', { id: 'features' });
        this.observeElements('.quantum-state-card', { id: 'states' });
        this.observeElements('.resource-card', { id: 'resources' });
    }
}

// Initialize animation system
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    const animationSystem = new AnimationSystem();
    
    // Ensure multi-sensory section is visible
    const multiSensorySection = document.querySelector('.multi-sensory');
    if (multiSensorySection) {
        multiSensorySection.style.opacity = '1';
        multiSensorySection.style.visibility = 'visible';
        multiSensorySection.style.transform = 'none';
        
        // Ensure all child elements are visible
        const childElements = multiSensorySection.querySelectorAll('*');
        childElements.forEach(element => {
            element.style.opacity = '1';
            element.style.visibility = 'visible';
            element.style.transform = 'none';
        });
    }

    // Ensure all content is visible initially
    document.querySelectorAll('.hero-content, .section, .card, .feature-card, .quantum-state-card, .resource-card, .scroll-animate')
        .forEach(element => {
            element.style.opacity = '1';
            element.style.visibility = 'visible';
            element.style.transform = 'none';
        });

    // Optimize touch interactions
    optimizeTouchInteractions();
    
    // Initialize other mobile features
    initBottomSheet();
});

// Ensure all .scroll-animate elements are observed for animation
function observeScrollAnimateSections() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px'
    });

    document.querySelectorAll('.scroll-animate').forEach(section => {
        observer.observe(section);
    });
}

// Optimize touch interactions
function optimizeTouchInteractions() {
    const touchTargets = document.querySelectorAll('.quantum-state-card, .nav-item, .dropdown-toggle, .cta-button');
    
    touchTargets.forEach(target => {
        // Add touch feedback class
        target.classList.add('touch-feedback');
        
        // Handle touch events with passive listeners for better performance
        target.addEventListener('touchstart', function() {
            if (this.classList.contains('touch-feedback')) {
                this.classList.add('touch-active');
            }
        }, { passive: true });
        
        target.addEventListener('touchend', function() {
            if (this.classList.contains('touch-feedback')) {
                this.classList.remove('touch-active');
            }
        }, { passive: true });
        
        // Prevent default touch behavior only when necessary
        target.addEventListener('touchmove', function(e) {
            if (this.classList.contains('touch-active')) {
                e.preventDefault();
            }
        }, { passive: false });
    });
} 