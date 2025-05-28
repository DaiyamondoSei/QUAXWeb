// Navigation and Footer Implementation
document.addEventListener('DOMContentLoaded', () => {
    // Navigation Menu Implementation
    const nav = document.querySelector('nav');
    if (nav) {
        nav.innerHTML = `
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
                        <li><a href="partnerships.html"><i class="fas fa-handshake"></i> Partnerships</a></li>
                        <li><a href="privacy.html"><i class="fas fa-shield-alt"></i> Privacy Policy</a></li>
                        <li><a href="terms.html"><i class="fas fa-file-contract"></i> Terms of Use</a></li>
                    </ul>
                </li>
                <li><a href="contact.html">Contact</a></li>
            </ul>
        `;
    }

    // Resource Navigation Implementation
    const resourceNav = document.querySelector('.resource-navigation-container');
    if (resourceNav) {
        resourceNav.innerHTML = `
            <div class="resource-navigation">
                <a href="academic_alignment.html" class="resource-link">
                    <i class="fas fa-graduation-cap"></i>
                    <span>Academic Alignment</span>
                </a>
                <a href="scientific_validation.html" class="resource-link">
                    <i class="fas fa-flask"></i>
                    <span>Scientific Validation</span>
                </a>
                <a href="advanced_concepts.html" class="resource-link">
                    <i class="fas fa-lightbulb"></i>
                    <span>Advanced Concepts</span>
                </a>
            </div>
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

    // Load smooth scroll script after navigation is set up
    const smoothScrollScript = document.createElement('script');
    smoothScrollScript.src = 'js/smooth-scroll.js';
    document.body.appendChild(smoothScrollScript);
}); 