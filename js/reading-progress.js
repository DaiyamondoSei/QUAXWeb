// Reading Progress Bar Module
class ReadingProgress {
    constructor() {
        this.progressBar = null;
        this.init();
    }

    init() {
        // Create progress bar element
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'reading-progress';
        document.body.appendChild(this.progressBar);

        // Add scroll event listener with throttling
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateProgress();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Initial update
        this.updateProgress();
    }

    updateProgress() {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        // Use transform with correct calculation for progress
        this.progressBar.style.transform = `translateX(${-100 + scrolled}%)`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReadingProgress();
}); 