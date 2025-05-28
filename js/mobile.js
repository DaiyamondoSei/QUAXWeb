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

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('header nav');
    const body = document.body;

    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        body.classList.toggle('menu-open');
        
        // Update aria-expanded
        const isExpanded = nav.classList.contains('active');
        mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
        
        // Update icon
        const icon = mobileMenuToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!nav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            nav.classList.remove('active');
            body.classList.remove('menu-open');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 767) {
                nav.classList.remove('active');
                body.classList.remove('menu-open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        }, 250);
    });

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

// Enhanced Mobile Navigation
const initMobileNavigation = () => {
    const nav = document.querySelector('.main-nav');
    if (!nav) return;

    const navList = nav.querySelector('ul');
    let isScrolling = false;
    let startX = 0;
    let scrollLeft = 0;

    // Add scroll indicators
    const leftIndicator = document.createElement('div');
    leftIndicator.className = 'nav-scroll-indicator left';
    leftIndicator.innerHTML = '<i class="fas fa-chevron-left"></i>';
    
    const rightIndicator = document.createElement('div');
    rightIndicator.className = 'nav-scroll-indicator right';
    rightIndicator.innerHTML = '<i class="fas fa-chevron-right"></i>';
    
    nav.appendChild(leftIndicator);
    nav.appendChild(rightIndicator);

    // Check scroll position
    const checkScroll = () => {
        const canScrollLeft = nav.scrollLeft > 0;
        const canScrollRight = nav.scrollLeft < (nav.scrollWidth - nav.clientWidth);
        
        nav.classList.toggle('can-scroll-left', canScrollLeft);
        nav.classList.toggle('can-scroll-right', canScrollRight);
    };

    // Smooth scroll to active item
    const scrollToActive = () => {
        const activeItem = nav.querySelector('.active');
        if (activeItem) {
            const navRect = nav.getBoundingClientRect();
            const activeRect = activeItem.getBoundingClientRect();
            const scrollOffset = activeRect.left - navRect.left - (navRect.width / 2) + (activeRect.width / 2);
            
            nav.scrollTo({
                left: nav.scrollLeft + scrollOffset,
                behavior: 'smooth'
            });
        }
    };

    // Touch events for smooth scrolling
    nav.addEventListener('touchstart', (e) => {
        isScrolling = true;
        startX = e.touches[0].pageX - nav.offsetLeft;
        scrollLeft = nav.scrollLeft;
        
        nav.style.scrollBehavior = 'auto';
        nav.style.cursor = 'grabbing';
    });

    nav.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        
        const x = e.touches[0].pageX - nav.offsetLeft;
        const walk = (x - startX) * 2;
        nav.scrollLeft = scrollLeft - walk;
        
        checkScroll();
    });

    nav.addEventListener('touchend', () => {
        isScrolling = false;
        nav.style.cursor = '';
        nav.style.scrollBehavior = 'smooth';
    });

    // Initialize
    window.addEventListener('resize', checkScroll);
    nav.addEventListener('scroll', checkScroll);
    checkScroll();
    scrollToActive();

    // Add active indicator
    const activeIndicator = document.createElement('div');
    activeIndicator.className = 'nav-active-indicator';
    nav.appendChild(activeIndicator);

    // Update active indicator position
    const updateActiveIndicator = () => {
        const activeItem = nav.querySelector('.active');
        if (activeItem) {
            const navRect = nav.getBoundingClientRect();
            const activeRect = activeItem.getBoundingClientRect();
            
            activeIndicator.style.width = `${activeRect.width}px`;
            activeIndicator.style.transform = `translateX(${activeRect.left - navRect.left}px)`;
        }
    };

    // Update indicator on scroll and resize
    nav.addEventListener('scroll', updateActiveIndicator);
    window.addEventListener('resize', updateActiveIndicator);
    updateActiveIndicator();
};

// Animation System
class AnimationSystem {
    constructor() {
        this.observers = new Map();
        this.initializeAnimations();
        this.ensureContentVisibility();
    }

    ensureContentVisibility() {
        // Force visibility for all content elements
        const contentElements = document.querySelectorAll(
            '.hero-content, .section, .card, .feature-card, .quantum-state-card, .resource-card, .scroll-animate'
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
    initMobileNavigation();
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