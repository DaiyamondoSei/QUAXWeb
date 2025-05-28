// Footer Component
const createFooter = () => {
    const footer = document.createElement('footer');
    footer.innerHTML = `
        <div class="footer-content">
            <div class="footer-section">
                <h4>QUANNEX Foundation</h4>
                <p>Advancing consciousness through technology and science</p>
                <div class="social-links">
                    <a href="https://www.linkedin.com/company/quannex-foundation/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                    <a href="https://www.instagram.com/your_quantum_nexus?igsh=MWx4ZDV4a2g0NXdyaQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
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
            <p>&copy; 2024 QUANNEX Foundation. All rights reserved.</p>
        </div>
    `;
    return footer;
};

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const footerContainer = document.querySelector('footer');
    if (footerContainer) {
        footerContainer.innerHTML = '';
        footerContainer.appendChild(createFooter());
    }
}); 