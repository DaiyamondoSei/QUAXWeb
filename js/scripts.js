// QUANNEX Website Scripts

document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.padding = '1rem 5%';
            header.style.backgroundColor = 'rgba(3, 3, 18, 0.95)';
        } else {
            header.style.padding = '1.5rem 5%';
            header.style.backgroundColor = 'rgba(5, 5, 32, 0.9)';
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Particle effect for quantum visualization
    const quantumVisualization = document.querySelector('.quantum-visualization');
    if (quantumVisualization) {
        createParticles(quantumVisualization);
    }

    // Animation for timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        observeElements(timelineItems, 'animate-timeline');
    }

    // Animation for features
    const features = document.querySelectorAll('.feature');
    if (features.length > 0) {
        observeElements(features, 'animate-feature');
    }

    // Animation for resource cards
    const resourceCards = document.querySelectorAll('.resource-card');
    if (resourceCards.length > 0) {
        observeElements(resourceCards, 'animate-resource');
    }

    // Create quantum particles
    createQuantumParticles();
});

// Create particle effect
function createParticles(element) {
    const particleCount = 50;
    const colors = ['#6e00ff', '#00b8ff', '#ff00e6'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 5 + 2;
        
        // Random color
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Random animation duration
        const duration = Math.random() * 3 + 2;
        
        // Set styles
        particle.style.cssText = `
            position: absolute;
            top: ${posY}%;
            left: ${posX}%;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            opacity: ${Math.random() * 0.5 + 0.3};
            animation: float ${duration}s infinite ease-in-out;
            animation-delay: ${Math.random() * 2}s;
            z-index: 1;
        `;
        
        element.appendChild(particle);
    }
}

// Intersection Observer for animations
function observeElements(elements, animationClass) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(animationClass);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0) scale(1);
        }
        50% {
            transform: translateY(-10px) scale(1.1);
        }
    }
    
    .animate-timeline {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .animate-feature {
        opacity: 0;
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .animate-resource {
        opacity: 0;
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Create quantum particles
function createQuantumParticles() {
    const container = document.querySelector('.quantum-silhouette');
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'quantum-particles';
    container.appendChild(particlesContainer);

    for (let i = 0; i < 20; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'quantum-particle';
    
    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    particle.style.left = `${x}%`;
    particle.style.top = `${y}%`;
    
    // Random movement
    const tx = (Math.random() - 0.5) * 100;
    const ty = (Math.random() - 0.5) * 100;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    
    // Animation
    particle.style.animation = `float-particle ${3 + Math.random() * 4}s infinite`;
    
    container.appendChild(particle);
    
    // Remove and recreate particle after animation
    particle.addEventListener('animationend', () => {
        particle.remove();
        createParticle(container);
    });
}

// Add smooth scroll behavior for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Back to top button functionality
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Quantum Parameter Interactions
document.addEventListener('DOMContentLoaded', () => {
    // Mouse tracking effect for parameters
    document.querySelectorAll('.parameter-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });

        // Create quantum particles
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'quantum-particles';
        card.appendChild(particlesContainer);

        // Create 15 particles for each parameter card
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'quantum-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 3}s`;
            particlesContainer.appendChild(particle);
        }

        // Add click event for mobile devices
        card.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
    });

    // Add index to parameter details items for staggered animation
    document.querySelectorAll('.parameter-details li, .parameter-details p').forEach((item, index) => {
        item.style.setProperty('--index', index);
        item.style.animationDelay = `${index * 0.05}s`;
    });

    // Add intersection observer for parameter cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.parameter-card').forEach(card => {
        observer.observe(card);
    });
});

// Add this to your existing CSS:
/*
.parameter-card {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.5s ease;
}

.parameter-card.visible {
    opacity: 1;
    transform: translateY(0);
}
*/
