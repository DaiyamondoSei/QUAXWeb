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

    // Store the last focused element before opening a modal
    let lastFocusedElement = null;

    // Utility: Get all focusable elements in a container
    function getFocusableElements(container) {
        return Array.from(container.querySelectorAll(
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(el => el.offsetParent !== null);
    }

    // Focus trap handler
    function trapFocus(modal) {
        const focusableEls = getFocusableElements(modal);
        if (focusableEls.length === 0) return;
        let firstEl = focusableEls[0];
        let lastEl = focusableEls[focusableEls.length - 1];
        function handleTab(e) {
            if (e.key !== 'Tab') return;
            if (focusableEls.length === 1) {
                e.preventDefault();
                firstEl.focus();
                return;
            }
            if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            } else if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            }
        }
        modal.addEventListener('keydown', handleTab);
        // Remove handler on close
        modal._removeTrapFocus = () => modal.removeEventListener('keydown', handleTab);
    }

    // Open Waitlist Modal with focus management
    window.openWaitlistModal = function() {
        const modal = document.getElementById('waitlistModal');
        lastFocusedElement = document.activeElement;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Focus first focusable element
        setTimeout(() => {
            const focusable = getFocusableElements(modal);
            if (focusable.length) focusable[0].focus();
        }, 10);
        trapFocus(modal);
    };

    window.closeWaitlistModal = function() {
        const modal = document.getElementById('waitlistModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (modal._removeTrapFocus) modal._removeTrapFocus();
        if (lastFocusedElement) setTimeout(() => lastFocusedElement.focus(), 10);
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
        waitlistForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (!waitlistForm.checkValidity()) {
                waitlistForm.reportValidity();
                return;
            }
            submitButton.classList.add('loading');
            submitButton.disabled = true;
            const formData = new FormData(waitlistForm);
            try {
                await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });
                showSuccessModal();
            } catch (error) {
                alert('There was an error. Please try again.');
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }
        });
    }

    // Success Modal logic
    function showSuccessModal() {
        closeWaitlistModal();
        let successModal = document.getElementById('successModal');
        if (!successModal) {
            successModal = document.createElement('div');
            successModal.id = 'successModal';
            successModal.className = 'modal active';
            successModal.setAttribute('role', 'dialog');
            successModal.setAttribute('aria-modal', 'true');
            successModal.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close" onclick="closeSuccessModal()" aria-label="Close modal">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2>Thank you!</h2>
                    <p style="margin-bottom: 0.5rem;">We will activate your quantum synchronization protocol soon.</p>
                    <div style="margin-top: 1.5rem; font-size: 1.1rem; color: var(--accent-color, #00B8FF); font-weight: 600;">- Quannex Foundation</div>
                </div>
            `;
            document.body.appendChild(successModal);
        } else {
            successModal.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
        // Focus management for success modal
        setTimeout(() => {
            const focusable = getFocusableElements(successModal);
            if (focusable.length) focusable[0].focus();
        }, 10);
        trapFocus(successModal);
        // Auto-dismiss after 4 seconds with fade-out
        setTimeout(() => {
            if (successModal.classList.contains('active')) {
                successModal.classList.add('fade-out');
                setTimeout(() => {
                    closeSuccessModal();
                    successModal.classList.remove('fade-out');
                }, 500); // match fade-out duration
            }
        }, 4000);
    }
    window.closeSuccessModal = function() {
        const modal = document.getElementById('successModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (modal._removeTrapFocus) modal._removeTrapFocus();
        if (lastFocusedElement) setTimeout(() => lastFocusedElement.focus(), 10);
    };

    // Add fade-out CSS via JS if not present
    (function ensureFadeOutCSS() {
        if (!document.getElementById('success-modal-fadeout-style')) {
            const style = document.createElement('style');
            style.id = 'success-modal-fadeout-style';
            style.innerHTML = `
                #successModal.fade-out { opacity: 0; transition: opacity 0.5s; pointer-events: none; }
            `;
            document.head.appendChild(style);
        }
    })();
}); 