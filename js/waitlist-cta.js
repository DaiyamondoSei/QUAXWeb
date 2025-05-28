// Waitlist CTA Component
document.addEventListener('DOMContentLoaded', function() {
    // Create and append the floating CTA button
    const floatingCTA = document.createElement('button');
    floatingCTA.className = 'floating-waitlist-cta';
    floatingCTA.setAttribute('onclick', 'openWaitlistModal()');
    floatingCTA.setAttribute('aria-label', 'Join Beta Waitlist');
    floatingCTA.innerHTML = `
        <span class="button-text">Join Beta Waitlist</span>
        <i class="fas fa-rocket"></i>
    `;
    document.body.appendChild(floatingCTA);

    // Create and append the modal
    const modal = document.createElement('div');
    modal.id = 'waitlistModal';
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'waitlistModalTitle');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeWaitlistModal()" aria-label="Close modal">
                <i class="fas fa-times"></i>
            </button>
            <h2 id="waitlistModalTitle">Join the QUANNEX Beta Waitlist</h2>
            <p>Be among the first to experience the future of consciousness acceleration. Sign up now to get early access to our beta version.</p>
            
            <form name="waitlist-form" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/success.html">
                <input type="hidden" name="form-name" value="waitlist-form" />
                <div class="hidden">
                    <input name="bot-field" />
                </div>
                
                <div class="form-group">
                    <label for="waitlist-name">Name <span class="required">*</span></label>
                    <input type="text" id="waitlist-name" name="name" required minlength="2" maxlength="100" placeholder="Your full name">
                </div>
                
                <div class="form-group">
                    <label for="waitlist-email">Email <span class="required">*</span></label>
                    <input type="email" id="waitlist-email" name="email" required placeholder="your.email@example.com">
                </div>
                
                <div class="form-group">
                    <label for="waitlist-interest">What interests you most about QUANNEX? <span class="required">*</span></label>
                    <select id="waitlist-interest" name="interest" required>
                        <option value="">Select your primary interest</option>
                        <option value="consciousness">Consciousness Expansion</option>
                        <option value="quantum">Quantum State Awareness</option>
                        <option value="future-self">Future Self Integration</option>
                        <option value="personal-growth">Personal Growth</option>
                        <option value="research">Research & Development</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-container">
                        <input type="checkbox" name="privacy-consent" required>
                        <span class="checkmark"></span>
                        I agree to receive updates about the beta launch and agree to the processing of my data according to the <a href="privacy.html" target="_blank">Privacy Policy</a>
                    </label>
                </div>
                
                <button type="submit" class="submit-button">
                    <span class="button-text">Join Waitlist</span>
                    <i class="fas fa-rocket"></i>
                </button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Add modal functions to window object
    window.openWaitlistModal = function() {
        const modal = document.getElementById('waitlistModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeWaitlistModal = function() {
        const modal = document.getElementById('waitlistModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeWaitlistModal();
        }
    });

    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeWaitlistModal();
        }
    });

    // Show floating CTA when scrolling
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        const floatingCTA = document.querySelector('.floating-waitlist-cta');
        const scrollPosition = window.scrollY;
        
        // Clear any existing timeout
        clearTimeout(scrollTimeout);
        
        // Add a small delay to prevent too many updates
        scrollTimeout = setTimeout(() => {
            if (scrollPosition > 300) {
                floatingCTA.classList.add('visible');
            } else {
                floatingCTA.classList.remove('visible');
            }
        }, 100);
    });

    // Form handling
    const waitlistForm = document.querySelector('form[name="waitlist-form"]');
    if (waitlistForm) {
        const submitButton = waitlistForm.querySelector('.submit-button');
        
        waitlistForm.addEventListener('submit', function(e) {
            if (!waitlistForm.checkValidity()) {
                e.preventDefault();
                return;
            }
            
            submitButton.classList.add('loading');
            submitButton.disabled = true;
        });
    }
}); 