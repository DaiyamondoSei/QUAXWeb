document.addEventListener('DOMContentLoaded', function() {
    // Collapsible functionality
    const collapsibles = document.querySelectorAll('.collapsible');
    
    collapsibles.forEach(collapsible => {
        const header = collapsible.querySelector('.collapsible-header');
        const content = collapsible.querySelector('.collapsible-content');
        const icon = header.querySelector('i');
        
        header.addEventListener('click', () => {
            collapsible.classList.toggle('active');
            
            // Toggle content visibility with animation
            if (collapsible.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-down');
            } else {
                content.style.maxHeight = '0';
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-right');
            }
        });
    });

    // Feature card hover effects
    const features = document.querySelectorAll('.feature');
    
    features.forEach(feature => {
        const icon = feature.querySelector('.feature-icon i');
        const title = feature.querySelector('h3');
        const description = feature.querySelector('p');
        
        // Initial state
        description.style.opacity = '0';
        description.style.transform = 'translateY(10px)';
        
        feature.addEventListener('mouseenter', () => {
            // Icon animation
            icon.style.transform = 'scale(1.2) rotate(10deg)';
            icon.style.color = 'var(--accent-color)';
            
            // Title animation
            title.style.transform = 'translateY(-5px)';
            title.style.color = 'var(--accent-color)';
            
            // Description animation
            description.style.opacity = '1';
            description.style.transform = 'translateY(0)';
            
            // Create quantum particles
            createQuantumParticles(feature);
        });
        
        feature.addEventListener('mouseleave', () => {
            // Reset icon
            icon.style.transform = 'scale(1) rotate(0deg)';
            icon.style.color = '';
            
            // Reset title
            title.style.transform = 'translateY(0)';
            title.style.color = '';
            
            // Reset description
            description.style.opacity = '0';
            description.style.transform = 'translateY(10px)';
        });
    });

    // Quantum particle effect
    function createQuantumParticles(feature) {
        const rect = feature.getBoundingClientRect();
        const particles = document.createElement('div');
        particles.className = 'quantum-particles';
        feature.appendChild(particles);
        
        // Create multiple particles
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'quantum-particle';
            
            // Random position within feature
            const x = Math.random() * rect.width;
            const y = Math.random() * rect.height;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            particles.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
        
        // Remove particles container after all animations
        setTimeout(() => {
            particles.remove();
        }, 1000);
    }

    // Add smooth scroll to feature sections
    const featureLinks = document.querySelectorAll('a[href^="#features"]');
    featureLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Roadmap Interactivity
    // Initialize progress bars
    const progressBars = {
        phase1: document.querySelector('.phase1-progress'),
        phase2: document.querySelector('.phase2-progress'),
        phase3: document.querySelector('.phase3-progress'),
        phase4: document.querySelector('.phase4-progress'),
        overall: document.getElementById('roadmapProgress')
    };

    // Enhanced progress tracking with sub-tasks
    const progressData = {
        phase1: {
            progress: 75,
            tasks: [
                { name: 'Core Framework', progress: 90, dependencies: [] },
                { name: 'Future Self Connection', progress: 80, dependencies: ['Core Framework'] },
                { name: 'Daily Task System', progress: 70, dependencies: ['Core Framework'] },
                { name: 'Basic AI Guidance', progress: 60, dependencies: ['Core Framework'] }
            ]
        },
        phase2: {
            progress: 40,
            tasks: [
                { name: 'Week 3 Content', progress: 50, dependencies: ['Core Framework'] },
                { name: 'Astral Visualization', progress: 30, dependencies: ['Week 3 Content'] },
                { name: 'Community Features', progress: 40, dependencies: [] }
            ]
        },
        phase3: {
            progress: 15,
            tasks: [
                { name: 'Week 4 Content', progress: 20, dependencies: ['Week 3 Content'] },
                { name: 'Advanced Abilities', progress: 10, dependencies: ['Week 4 Content'] },
                { name: 'Quantum Engine', progress: 15, dependencies: [] }
            ]
        },
        phase4: {
            progress: 0,
            tasks: [
                { name: '13-Stage System', progress: 0, dependencies: ['Advanced Abilities'] },
                { name: 'Holographic UI', progress: 0, dependencies: ['Quantum Engine'] },
                { name: 'AI-Hologram Guide', progress: 0, dependencies: ['13-Stage System'] }
            ]
        }
    };

    // Calculate overall progress
    const overallProgress = Object.values(progressData).reduce((acc, phase) => acc + phase.progress, 0) / 4;
    document.getElementById('progressPercentage').textContent = `${Math.round(overallProgress)}%`;

    // Set progress bar widths and update task visualization
    Object.keys(progressBars).forEach(key => {
        if (progressBars[key] && key !== 'overall') {
            progressBars[key].style.setProperty('--progress-width', `${progressData[key].progress}%`);
            
            // Add task visualization
            const phaseElement = progressBars[key].closest('.timeline-item');
            if (phaseElement) {
                const taskList = document.createElement('div');
                taskList.className = 'task-visualization';
                
                progressData[key].tasks.forEach(task => {
                    const taskElement = document.createElement('div');
                    taskElement.className = 'task-item';
                    taskElement.innerHTML = `
                        <div class="task-progress" style="width: ${task.progress}%"></div>
                        <span class="task-name">${task.name}</span>
                        <span class="task-percentage">${task.progress}%</span>
                    `;
                    taskList.appendChild(taskElement);
                });
                
                phaseElement.querySelector('.phase-details').appendChild(taskList);
            }
        }
    });

    // Timeline navigation functionality
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Scroll to corresponding phase
            const phase = button.getAttribute('data-phase');
            const phaseElement = document.querySelector(`.timeline-item:nth-child(${phase})`);
            if (phaseElement) {
                phaseElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Expand/Collapse functionality
    const expandButtons = document.querySelectorAll('.expand-button');
    expandButtons.forEach(button => {
        button.addEventListener('click', function() {
            const details = this.nextElementSibling;
            details.classList.toggle('active');
            this.classList.toggle('active');
        });
    });

    // Timeline animation
    const timelineItems = document.querySelectorAll('.timeline-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    timelineItems.forEach(item => {
        observer.observe(item);
    });

    // Feature item hover effects
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.background = 'rgba(255, 255, 255, 0.05)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            this.style.background = 'transparent';
        });
    });

    // Progress bar animation
    const progressFillElements = document.querySelectorAll('.progress-fill');
    progressFillElements.forEach(bar => {
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = bar.getAttribute('data-progress') + '%';
        }, 100);
    });
}); 