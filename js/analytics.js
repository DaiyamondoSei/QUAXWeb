// Google Analytics Configuration
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX'); // Replace with your Google Analytics ID

// Performance Monitoring
const performanceMetrics = {
    init() {
        this.trackPageLoad();
        this.trackUserInteractions();
        this.monitorResourceTiming();
    },

    trackPageLoad() {
        window.addEventListener('load', () => {
            const timing = performance.timing;
            const metrics = {
                dns: timing.domainLookupEnd - timing.domainLookupStart,
                tcp: timing.connectEnd - timing.connectStart,
                ttfb: timing.responseStart - timing.requestStart,
                domLoad: timing.domComplete - timing.domLoading,
                windowLoad: timing.loadEventEnd - timing.navigationStart
            };

            // Send to analytics
            gtag('event', 'performance_metrics', {
                'event_category': 'Performance',
                'event_label': 'Page Load',
                'value': metrics.windowLoad,
                'non_interaction': true,
                'metrics': metrics
            });
        });
    },

    trackUserInteractions() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-track]');
            if (target) {
                gtag('event', 'click', {
                    'event_category': target.dataset.trackCategory || 'Interaction',
                    'event_label': target.dataset.trackLabel || target.textContent.trim(),
                    'value': 1
                });
            }
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                gtag('event', 'scroll_depth', {
                    'event_category': 'Engagement',
                    'event_label': 'Scroll Depth',
                    'value': maxScroll,
                    'non_interaction': true
                });
            }
        });
    },

    monitorResourceTiming() {
        // Monitor resource loading performance
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                if (entry.initiatorType === 'img') {
                    gtag('event', 'resource_timing', {
                        'event_category': 'Performance',
                        'event_label': 'Image Load',
                        'value': entry.duration,
                        'non_interaction': true,
                        'resource': entry.name
                    });
                }
            });
        });

        observer.observe({ entryTypes: ['resource'] });
    }
};

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    performanceMetrics.init();
}); 