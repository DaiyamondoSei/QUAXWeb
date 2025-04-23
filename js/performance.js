// Performance Optimization Script
document.addEventListener('DOMContentLoaded', function() {
    // Lazy load images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // Preload critical resources
    const preloadResources = [
        '/styles.css',
        '/footer.css',
        '/dropdown.css',
        '/vision.css'
    ];

    preloadResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = 'style';
        document.head.appendChild(link);
    });

    // Add loading="lazy" to non-critical images
    document.querySelectorAll('img:not(.hero-image img)').forEach(img => {
        if (!img.loading) {
            img.loading = 'lazy';
        }
    });
});

// Cache management
const CACHE_NAME = 'quannex-cache-v1';
const urlsToCache = [
    '/',
    '/styles.css',
    '/footer.css',
    '/dropdown.css',
    '/vision.css',
    '/js/header-footer.js',
    '/js/navigation.js',
    '/js/smooth-scroll.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
}); 