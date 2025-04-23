// Initialize Quantum Particles
function initQuantumParticles() {
    const container = document.querySelector('.logo-container');
    if (!container) return;

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'quantum-particles';
    container.appendChild(particlesContainer);

    // Create particles
    for (let i = 0; i < 20; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'quantum-particle';
    
    // Random position within container
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    
    // Random movement direction
    const tx = (Math.random() - 0.5) * 200;
    const ty = (Math.random() - 0.5) * 200;
    
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.left = `${x}%`;
    particle.style.top = `${y}%`;
    
    // Random delay for staggered animation
    particle.style.animationDelay = `${Math.random() * 3}s`;
    
    container.appendChild(particle);
    
    // Remove particle after animation completes
    particle.addEventListener('animationend', () => {
        particle.remove();
        createParticle(container);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initQuantumParticles();
    
    // Initialize staged learning system
    const learningStages = document.querySelectorAll('.stages-container .stage');
    learningStages.forEach(stage => {
        // Initialize progress bars
        const progressBar = stage.querySelector('.progress');
        if (progressBar) {
            const progress = progressBar.style.width || '0%';
            const progressText = stage.querySelector('.progress-text');
            if (progressText) {
                progressText.textContent = progress;
            }
        }

        // Initialize stage details
        const details = stage.querySelector('.stage-details');
        if (details) {
            details.style.display = 'none';
            details.style.opacity = '0';
            details.style.maxHeight = '0';
            details.style.overflow = 'hidden';
            details.style.transition = 'all 0.3s ease-in-out';
        }

        // Add click handler for toggle button
        const toggleButton = stage.querySelector('.toggle-details');
        if (toggleButton) {
            toggleButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const details = stage.querySelector('.stage-details');
                if (details) {
                    const isHidden = details.style.display === 'none' || details.style.display === '';
                    
                    if (isHidden) {
                        // Show details
                        details.style.display = 'block';
                        requestAnimationFrame(() => {
                            details.style.opacity = '1';
                            details.style.maxHeight = details.scrollHeight + 'px';
                            this.textContent = 'Less';
                            this.classList.add('active');
                        });
                    } else {
                        // Hide details
                        details.style.opacity = '0';
                        details.style.maxHeight = '0';
                        this.textContent = 'More';
                        this.classList.remove('active');
                        setTimeout(() => {
                            details.style.display = 'none';
                        }, 300);
                    }
                }
            });
        }
    });

    // Handle toggle buttons for quantum mastery paths
    document.querySelectorAll('.paths-container .toggle-details').forEach(button => {
        button.addEventListener('click', function() {
            const path = this.closest('.path');
            const details = path.querySelector('.path-details');
            
            // Toggle the clicked details
            if (details.style.display === 'none' || details.style.display === '') {
                details.style.display = 'block';
                setTimeout(() => {
                    details.classList.add('active');
                    this.textContent = 'Show Less';
                }, 10);
            } else {
                details.classList.remove('active');
                this.textContent = 'Show Details';
                setTimeout(() => {
                    details.style.display = 'none';
                }, 300);
            }
        });
    });

    // Smooth scrolling for quantum state cards
    const quantumCards = document.querySelectorAll('.quantum-state-card');
    quantumCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Add highlight effect
                targetElement.classList.add('highlight');
                setTimeout(() => {
                    targetElement.classList.remove('highlight');
                }, 2000);
            }
        });
    });

    // Initialize progress bars and stage details
    const stages = document.querySelectorAll('.stage');
    stages.forEach(stage => {
        const progressBar = stage.querySelector('.progress');
        if (progressBar) {
            // Get the width that was set in HTML
            const staticWidth = progressBar.style.width;
            if (staticWidth) {
                const progressText = stage.querySelector('.progress-text');
                if (progressText) {
                    progressText.textContent = `${parseInt(staticWidth)}% Complete`;
                }
            }
        }
        
        // Add hover effect for stage cards
        stage.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        });
        
        stage.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        // Add click effect for stage cards
        stage.addEventListener('click', function(e) {
            if (!e.target.closest('.interactive-elements')) {
                const details = this.querySelector('.stage-details');
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
            }
        });
    });

    // Enhanced stage interaction handlers
    const startButtons = document.querySelectorAll('.start-stage');
    startButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const stage = this.closest('.stage');
            const stageNumber = stage.querySelector('.stage-number').textContent;
            
            // Check prerequisites
            const prerequisites = stage.querySelectorAll('.prerequisites li');
            let canStart = true;
            
            prerequisites.forEach(prereq => {
                if (prereq.textContent.includes('Completion of')) {
                    const requiredStage = prereq.textContent.match(/Completion of (\w+) stage/)[1];
                    const requiredProgress = localStorage.getItem(`stage-${getStageNumber(requiredStage)}-progress`) || 0;
                    if (parseInt(requiredProgress) < 100) {
                        canStart = false;
                        alert(`Please complete the ${requiredStage} stage first.`);
                    }
                }
            });
            
            if (canStart) {
                // Implement stage start logic here
                console.log(`Starting stage ${stageNumber}`);
                // Add loading animation
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...';
                setTimeout(() => {
                    this.innerHTML = 'Begin Stage';
                }, 2000);
            }
        });
    });

    const resourceButtons = document.querySelectorAll('.view-resources');
    resourceButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const stage = this.closest('.stage');
            const stageNumber = stage.querySelector('.stage-number').textContent;
            
            // Implement resource viewing logic here
            console.log(`Viewing resources for stage ${stageNumber}`);
            // Add loading animation
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            setTimeout(() => {
                this.innerHTML = 'View Resources';
            }, 2000);
        });
    });

    // Helper function to get stage number from stage name
    function getStageNumber(stageName) {
        const stages = {
            'Foundation': '1',
            'Connection': '2',
            'Expansion': '3',
            'Integration': '4',
            'Transcendence': '5'
        };
        return stages[stageName];
    }

    // Add progress update functionality
    function updateProgress(stageNumber, progress) {
        const stage = document.querySelector(`.stage .stage-number:contains("${stageNumber}")`).closest('.stage');
        const progressBar = stage.querySelector('.progress');
        const progressText = stage.querySelector('.progress-text');
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}% Complete`;
        localStorage.setItem(`stage-${stageNumber}-progress`, progress);
    }

    // Feature hover effects
    const features = document.querySelectorAll('.feature');
    features.forEach(feature => {
        feature.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        feature.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Remove any duplicate event listeners that might have been added
    const stageElements = document.querySelectorAll('.stage');
    stageElements.forEach(stage => {
        stage.removeEventListener('click', null);
    });
}); 