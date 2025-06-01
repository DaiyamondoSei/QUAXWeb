// Centralized Header and Footer Management
document.addEventListener('DOMContentLoaded', () => {
    // Header Implementation
    const header = document.querySelector('header');
    if (header) {
        header.innerHTML = `
            <div class="header-flex" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <a href="index.html" class="logo-container" style="display: flex; align-items: center; gap: 0.5rem;">
                    <div class="logo">
                        <div class="quantum-symbol">
                            <div class="quantum-particles">
                                <div class="quantum-particle" style="--tx: 20px; --ty: -20px;"></div>
                                <div class="quantum-particle" style="--tx: -20px; --ty: 20px;"></div>
                                <div class="quantum-particle" style="--tx: 15px; --ty: 15px;"></div>
                                <div class="quantum-particle" style="--tx: -15px; --ty: -15px;"></div>
                            </div>
                        </div>
                        <h1 style="margin: 0; font-size: 1.5rem;">QUANNEX</h1>
                    </div>
                    <p class="tagline" style="display: none;">Quantum Nexus: Bridge to Higher Consciousness</p>
                </a>
                <button class="mobile-menu-button" aria-label="Open menu" aria-expanded="false" tabindex="0" style="margin-left: auto; background: rgba(255,255,255,0.12); box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: none; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.5rem; cursor: pointer; z-index: 1100;">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
            <nav class="mobile-nav" aria-label="Mobile navigation" style="position: fixed; top: 0; left: 0; width: 80vw; max-width: 320px; height: 100vh; background: rgba(5,5,32,0.98); box-shadow: 2px 0 16px rgba(0,0,0,0.12); transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); z-index: 1200; overflow-y: auto; padding: 0;">
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem 0.5rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(5,5,32,0.98);">
                    <a href="index.html" class="logo-container" style="display: flex; align-items: center; gap: 0.5rem;">
                        <div class="logo">
                            <h1 style="margin: 0; font-size: 1.25rem; color: #fff;">QUANNEX</h1>
                        </div>
                    </a>
                    <button class="mobile-menu-close" aria-label="Close menu" tabindex="0" style="background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <ul style="padding: 1.5rem 1.25rem; list-style: none; margin: 0; display: flex; flex-direction: column; gap: 1rem;">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="consciousness_accelerator.html">Consciousness Accelerator</a></li>
                    <li><a href="quantum_parameters.html">Quantum Parameters</a></li>
                    <li><a href="app_features.html">App Features</a></li>
                    <li><a href="academic_alignment.html">Academic</a></li>
                    <li><a href="advanced_concepts.html">Advanced</a></li>
                    <li class="dropdown">
                        <a href="index.html#resources">Resources</a>
                        <ul class="dropdown-menu">
                            <li><a href="project_proposal.html"><i class="fas fa-file-alt"></i> Project Proposal</a></li>
                            <li><a href="business_model.html"><i class="fas fa-chart-line"></i> Business Model</a></li>
                            <li><a href="academic_alignment.html"><i class="fas fa-graduation-cap"></i> Academic Alignment</a></li>
                            <li><a href="scientific_validation.html"><i class="fas fa-flask"></i> Scientific Validation</a></li>
                            <li><a href="technical_implementation.html"><i class="fas fa-code"></i> Technical Implementation</a></li>
                            <li><a href="consciousness_bands.html"><i class="fas fa-brain"></i> Consciousness Bands</a></li>
                            <li><a href="advanced_progression.html"><i class="fas fa-level-up-alt"></i> Progression System</a></li>
                            <li><a href="implementation_plan.html"><i class="fas fa-tasks"></i> Implementation Plan</a></li>
                            <li><a href="app_screens.html"><i class="fas fa-mobile-alt"></i> App Screen Inventory</a></li>
                            <li><a href="curriculum.html"><i class="fas fa-book"></i> 4-Week Curriculum</a></li>
                            <li><a href="privacy.html"><i class="fas fa-shield-alt"></i> Privacy Policy</a></li>
                            <li><a href="terms.html"><i class="fas fa-file-contract"></i> Terms of Use</a></li>
                        </ul>
                    </li>
                    <li><a href="contact.html">Contact</a></li>
                </ul>
            </nav>
            <div class="nav-backdrop" tabindex="-1" aria-hidden="true" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1190; opacity: 0; pointer-events: none; transition: opacity 0.2s;"></div>
        `;

        // Hamburger menu logic
        const menuButton = header.querySelector('.mobile-menu-button:not(.close)');
        const closeButton = header.querySelector('.mobile-menu-close');
        const mobileNav = header.querySelector('.mobile-nav');
        const navBackdrop = header.querySelector('.nav-backdrop');
        const icon = menuButton.querySelector('i');

        function openMenu() {
            mobileNav.style.transform = 'translateX(0)';
            navBackdrop.style.opacity = '1';
            navBackdrop.style.pointerEvents = 'auto';
            menuButton.setAttribute('aria-expanded', 'true');
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
            document.body.classList.add('menu-open');
        }
        function closeMenu() {
            mobileNav.style.transform = 'translateX(-100%)';
            navBackdrop.style.opacity = '0';
            navBackdrop.style.pointerEvents = 'none';
            menuButton.setAttribute('aria-expanded', 'false');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
            document.body.classList.remove('menu-open');
        }
        menuButton.addEventListener('click', () => {
            if (mobileNav.style.transform === 'translateX(0)') {
                closeMenu();
            } else {
                openMenu();
            }
        });
        // Attach direct event listener to the close button for reliability
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked');
                closeMenu();
            });
        }
        // Remove event delegation for close button
        // navBackdrop and ESC key logic remain unchanged
        navBackdrop.addEventListener('click', closeMenu);
        // Close menu on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
        // Close menu on navigation
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // Footer Implementation
    const footer = document.querySelector('footer');
    if (footer) {
        footer.innerHTML = `
            <div class="footer-content">
                <div class="footer-section foundation-section">
                    <h4>QUANNEX Foundation</h4>
                    <p>Advancing consciousness through technology and science</p>
                    <div class="social-links">
                        <a href="https://www.linkedin.com/company/quannex-foundation/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><i class="fab fa-linkedin"></i></a>
                        <a href="https://www.instagram.com/your_quantum_nexus?igsh=MWx4ZDV4a2g0NXdyaQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="https://github.com/quannex" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><i class="fab fa-github"></i></a>
                        <a href="https://discord.gg/dZ95cJmw" target="_blank" rel="noopener noreferrer" aria-label="Discord" title="Join our Discord"><i class="fab fa-discord"></i></a>
                    </div>
                    <div class="contact-info">
                        <a href="contact.html"><i class="fas fa-envelope"></i> Contact Us</a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Quick Navigation</h4>
                    <ul>
                        <li><a href="index.html"><i class="fas fa-home"></i> Home</a></li>
                        <li><a href="consciousness_accelerator.html"><i class="fas fa-brain"></i> Consciousness Accelerator</a></li>
                        <li><a href="quantum_parameters.html"><i class="fas fa-atom"></i> Quantum Parameters</a></li>
                        <li><a href="app_features.html"><i class="fas fa-mobile-alt"></i> App Features</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="academic_alignment.html"><i class="fas fa-graduation-cap"></i> Academic Alignment</a></li>
                        <li><a href="scientific_validation.html"><i class="fas fa-flask"></i> Scientific Validation</a></li>
                        <li><a href="advanced_concepts.html"><i class="fas fa-lightbulb"></i> Advanced Concepts</a></li>
                        <li><a href="privacy.html"><i class="fas fa-shield-alt"></i> Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} QUANNEX Foundation. All rights reserved.</p>
            </div>
        `;
    }

    // Add back-to-top button
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTopButton);

    // Back to Top Button Functionality
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Enhanced Hero Animation
    const heroSection = document.querySelector('section.hero');
    if (heroSection) {
        const heroHeadline = heroSection.querySelector('.hero-content h1');
        const heroContent = heroSection.querySelector('.hero-content');
        const ctaButtons = heroSection.querySelector('.cta-buttons');
        const heroImage = heroSection.querySelector('.hero-image');

        // Trigger initial animations
        setTimeout(() => {
            heroHeadline?.classList.add('download-animate');
            heroContent?.classList.add('download-animate');
            ctaButtons?.classList.add('download-animate');
            heroImage?.classList.add('download-animate');
        }, 350);

        // Scroll-triggered animations for other sections
        const animateOnScroll = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        };

        const scrollObserver = new IntersectionObserver(animateOnScroll, {
            threshold: 0.2,
            rootMargin: '0px 0px -10% 0px'
        });

        // Observe sections for scroll animation
        document.querySelectorAll('section:not(.hero)').forEach(section => {
            section.classList.add('scroll-animate');
            scrollObserver.observe(section);
        });
    }

    // Resource section scroll indicator logic
    (function() {
        const grid = document.querySelector('.resources-grid');
        const dots = document.querySelectorAll('.resources-indicator .dot');
        const cards = document.querySelectorAll('.resources-grid .resource-card');
        if (!grid || !dots.length || !cards.length) return;

        // Helper: get the index of the most visible card
        function getMostVisibleCardIndex() {
            let maxVisible = 0, maxIndex = 0;
            cards.forEach((card, i) => {
                const rect = card.getBoundingClientRect();
                const visible = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
                if (visible > maxVisible) {
                    maxVisible = visible;
                    maxIndex = i;
                }
            });
            return maxIndex;
        }

        // IntersectionObserver for separation of concerns
        const observer = new IntersectionObserver(() => {
            const idx = getMostVisibleCardIndex();
            dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
        }, { threshold: 0.5 });

        cards.forEach(card => observer.observe(card));

        // Optional: click dot to scroll to card
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
            });
        });
    })();
}); 