// Centralized Header and Footer Management
document.addEventListener('DOMContentLoaded', () => {
    // Header Implementation
    const header = document.querySelector('header');
    if (header) {
        header.innerHTML = `
            <a href="index.html" class="logo-container">
                <div class="logo">
                    <div class="quantum-symbol">
                        <div class="quantum-particles">
                            <div class="quantum-particle" style="--tx: 20px; --ty: -20px;"></div>
                            <div class="quantum-particle" style="--tx: -20px; --ty: 20px;"></div>
                            <div class="quantum-particle" style="--tx: 15px; --ty: 15px;"></div>
                            <div class="quantum-particle" style="--tx: -15px; --ty: -15px;"></div>
                        </div>
                    </div>
                    <h1>QUANNEX</h1>
                </div>
                <p class="tagline">Quantum Nexus: Bridge to Higher Consciousness</p>
            </a>
            <nav>
                <ul>
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
        `;
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
                        <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                        <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                        <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
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
}); 