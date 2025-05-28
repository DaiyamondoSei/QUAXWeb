class ProgressTracking {
    constructor() {
        this.progressData = {
            consciousnessExpansion: 0.75,
            meditationConsistency: 0.85,
            parameterAlignment: 0.90,
            lastUpdate: new Date().toISOString()
        };

        this.init();
    }

    init() {
        this.loadProgressData();
        this.setupEventListeners();
        this.updateProgressBars();
    }

    loadProgressData() {
        const savedData = localStorage.getItem('consciousnessProgress');
        if (savedData) {
            try {
                this.progressData = JSON.parse(savedData);
            } catch (e) {
                console.error('Error loading progress data:', e);
            }
        }
    }

    saveProgressData() {
        try {
            localStorage.setItem('consciousnessProgress', JSON.stringify(this.progressData));
        } catch (e) {
            console.error('Error saving progress data:', e);
        }
    }

    setupEventListeners() {
        // Accessibility controls
        document.getElementById('increaseFont').addEventListener('click', () => this.adjustFontSize(1.1));
        document.getElementById('decreaseFont').addEventListener('click', () => this.adjustFontSize(0.9));
        document.getElementById('toggleHighContrast').addEventListener('click', () => this.toggleHighContrast());
        document.getElementById('toggleReducedMotion').addEventListener('click', () => this.toggleReducedMotion());

        // Progress update simulation (for demo purposes)
        setInterval(() => this.simulateProgressUpdate(), 5000);
    }

    updateProgressBars() {
        const bars = document.querySelectorAll('.progress-fill');
        bars.forEach(bar => {
            const card = bar.closest('.insight-card');
            const title = card.querySelector('h4').textContent;
            let value;

            switch (title) {
                case 'Consciousness Expansion Rate':
                    value = this.progressData.consciousnessExpansion;
                    break;
                case 'Meditation Consistency':
                    value = this.progressData.meditationConsistency;
                    break;
                case 'Quantum Parameter Alignment':
                    value = this.progressData.parameterAlignment;
                    break;
                default:
                    value = 0;
            }

            this.animateProgressBar(bar, value);
        });
    }

    animateProgressBar(bar, targetValue) {
        const currentValue = parseFloat(bar.style.width) / 100 || 0;
        const duration = 1000; // 1 second
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeProgress = this.easeInOutQuad(progress);
            const currentWidth = currentValue + (targetValue - currentValue) * easeProgress;

            bar.style.width = `${currentWidth * 100}%`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    simulateProgressUpdate() {
        // Simulate small random progress updates
        this.progressData.consciousnessExpansion = Math.min(1, Math.max(0, 
            this.progressData.consciousnessExpansion + (Math.random() - 0.5) * 0.02));
        this.progressData.meditationConsistency = Math.min(1, Math.max(0, 
            this.progressData.meditationConsistency + (Math.random() - 0.5) * 0.01));
        this.progressData.parameterAlignment = Math.min(1, Math.max(0, 
            this.progressData.parameterAlignment + (Math.random() - 0.5) * 0.015));
        this.progressData.lastUpdate = new Date().toISOString();

        this.saveProgressData();
        this.updateProgressBars();
    }

    // Accessibility functions
    adjustFontSize(factor) {
        const root = document.documentElement;
        const currentSize = parseFloat(getComputedStyle(root).fontSize);
        const newSize = currentSize * factor;
        
        // Limit font size between 12px and 24px
        if (newSize >= 12 && newSize <= 24) {
            root.style.fontSize = `${newSize}px`;
        }
    }

    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        localStorage.setItem('highContrast', isHighContrast);
    }

    toggleReducedMotion() {
        document.body.classList.toggle('reduced-motion');
        const isReducedMotion = document.body.classList.contains('reduced-motion');
        localStorage.setItem('reducedMotion', isReducedMotion);
        
        // Update animation states
        if (isReducedMotion) {
            document.querySelectorAll('.quantum-particle').forEach(particle => {
                particle.style.animation = 'none';
            });
        } else {
            document.querySelectorAll('.quantum-particle').forEach(particle => {
                particle.style.animation = '';
            });
        }
    }
}

// Initialize progress tracking when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const progressTracking = new ProgressTracking();
}); 