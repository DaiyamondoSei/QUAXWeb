/**
 * IndexNow Implementation for QUANNEX
 * Automatically notifies search engines of content updates
 * Supports Bing, Google, Yandex, and other IndexNow-compatible engines
 */

class IndexNowManager {
    constructor() {
        this.apiKey = 'e47b3e8f4c5d6a9b2e1f8c7d3a9b6e4f7c2d5a8b1e9f6c3d7a4b8e5f2c9d6a3b';
        this.baseUrl = 'https://quannex.earth';
        this.indexNowEndpoints = [
            'https://api.indexnow.org/indexnow', // Primary endpoint
            'https://www.bing.com/indexnow',     // Bing endpoint
            'https://yandex.com/indexnow'       // Yandex endpoint
        ];
        this.submissionQueue = [];
        this.isSubmitting = false;
    }

    /**
     * Submit a single URL to IndexNow
     * @param {string} url - The URL to submit
     * @param {string} host - The host domain
     */
    async submitUrl(url, host = 'quannex.earth') {
        const payload = {
            host: host,
            key: this.apiKey,
            keyLocation: `${this.baseUrl}/indexnow-key.txt`,
            urlList: [url]
        };

        console.log('🔄 IndexNow: Submitting URL to search engines:', url);

        // Submit to all IndexNow endpoints
        const promises = this.indexNowEndpoints.map(endpoint => 
            this.makeRequest(endpoint, payload)
        );

        try {
            const results = await Promise.allSettled(promises);
            const successful = results.filter(result => result.status === 'fulfilled').length;
            const failed = results.filter(result => result.status === 'rejected').length;
            
            console.log(`✅ IndexNow: ${successful} successful submissions, ${failed} failed`);
            
            // Log any errors for debugging
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.warn(`⚠️ IndexNow endpoint ${this.indexNowEndpoints[index]} failed:`, result.reason);
                }
            });

            return successful > 0;
        } catch (error) {
            console.error('❌ IndexNow submission error:', error);
            return false;
        }
    }

    /**
     * Submit multiple URLs to IndexNow
     * @param {Array<string>} urls - Array of URLs to submit
     * @param {string} host - The host domain
     */
    async submitUrls(urls, host = 'quannex.earth') {
        if (!urls || urls.length === 0) return false;

        // IndexNow supports up to 10,000 URLs per request, but we'll batch in smaller chunks
        const batchSize = 100;
        const batches = [];
        
        for (let i = 0; i < urls.length; i += batchSize) {
            batches.push(urls.slice(i, i + batchSize));
        }

        console.log(`🔄 IndexNow: Submitting ${urls.length} URLs in ${batches.length} batches`);

        let totalSuccessful = 0;
        
        for (const batch of batches) {
            const payload = {
                host: host,
                key: this.apiKey,
                keyLocation: `${this.baseUrl}/indexnow-key.txt`,
                urlList: batch
            };

            const promises = this.indexNowEndpoints.map(endpoint => 
                this.makeRequest(endpoint, payload)
            );

            try {
                const results = await Promise.allSettled(promises);
                const successful = results.filter(result => result.status === 'fulfilled').length;
                totalSuccessful += successful;
                
                // Small delay between batches to be respectful to APIs
                if (batches.length > 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error(`❌ IndexNow batch submission error:`, error);
            }
        }

        console.log(`✅ IndexNow: ${totalSuccessful} total successful batch submissions`);
        return totalSuccessful > 0;
    }

    /**
     * Make HTTP request to IndexNow endpoint
     * @param {string} endpoint - The IndexNow endpoint URL
     * @param {Object} payload - The payload to send
     */
    async makeRequest(endpoint, payload) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'User-Agent': 'QUANNEX-IndexNow-Client/1.0'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    }

    /**
     * Submit the current page to IndexNow
     */
    async submitCurrentPage() {
        const currentUrl = window.location.href;
        return await this.submitUrl(currentUrl);
    }

    /**
     * Submit all main pages of the website
     */
    async submitAllMainPages() {
        const mainPages = [
            `${this.baseUrl}/`,
            `${this.baseUrl}/index.html`,
            `${this.baseUrl}/consciousness_accelerator.html`,
            `${this.baseUrl}/app_features.html`,
            `${this.baseUrl}/quantum_parameters.html`,
            `${this.baseUrl}/scientific_validation.html`,
            `${this.baseUrl}/business_model.html`,
            `${this.baseUrl}/curriculum.html`,
            `${this.baseUrl}/partnerships.html`,
            `${this.baseUrl}/progress.html`,
            `${this.baseUrl}/contact.html`,
            `${this.baseUrl}/academic_alignment.html`,
            `${this.baseUrl}/advanced_concepts.html`,
            `${this.baseUrl}/app_screens.html`,
            `${this.baseUrl}/implementation_plan.html`,
            `${this.baseUrl}/technical_implementation.html`,
            `${this.baseUrl}/search.html`,
            `${this.baseUrl}/understanding-quantum-self.html`
        ];

        return await this.submitUrls(mainPages);
    }

    /**
     * Auto-submit current page on load (for content updates)
     */
    initAutoSubmission() {
        // Submit current page when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // Delay submission slightly to ensure page is fully loaded
                setTimeout(() => this.submitCurrentPage(), 2000);
            });
        } else {
            // DOM already loaded
            setTimeout(() => this.submitCurrentPage(), 2000);
        }
    }

    /**
     * Manual trigger for admin/developer use
     */
    async manualSubmitAll() {
        console.log('🚀 IndexNow: Manual submission of all main pages initiated');
        return await this.submitAllMainPages();
    }
}

// Initialize IndexNow manager
const indexNowManager = new IndexNowManager();

// Auto-submit current page (only in production)
if (window.location.hostname === 'quannex.earth') {
    indexNowManager.initAutoSubmission();
}

// Make available globally for manual triggers
window.indexNowManager = indexNowManager;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexNowManager;
} 