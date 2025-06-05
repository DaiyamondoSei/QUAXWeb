/**
 * WARNING: This script should only be included ONCE per page.
 * For Next.js pages, use the Layout component instead.
 * Including this script multiple times will cause header duplication.
 * 
 * This script manages the header and footer for static HTML pages only.
 * It should not be used in conjunction with React components.
 */

// Prevent multiple initializations
if (window.headerFooterInitialized) {
    console.warn('header-footer.js has already been initialized. Skipping duplicate initialization.');
} else {
    window.headerFooterInitialized = true;

    // --- MOBILE MENU STYLES ---
    const mobileMenuStyles = `
    <style>
    /* Mobile Menu Base Styles */
    .mobile-menu-button {
        width: 44px;
        height: 44px;
        min-width: 44px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border: none;
        border-radius: 50%;
        color: var(--light-text, #ffffff);
        font-size: 1.25rem;
        cursor: pointer;
        transition: all var(--mobile-transition, 0.2s ease);
        z-index: 1101;
        margin-left: auto;
    }

    .mobile-menu-button:active {
        background: rgba(255, 255, 255, 0.1);
        transform: scale(0.95);
    }

    .mobile-nav {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(5, 5, 32, 0.98);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1200;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        padding: calc(var(--header-height, 56px) + 2rem) 1.25rem 2rem;
    }

    .mobile-nav.active {
        transform: translateX(0);
    }

    .mobile-nav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1rem 1rem 0;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(5, 5, 32, 0.98);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        z-index: 1201;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .mobile-nav-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .mobile-nav-list li a, .mobile-nav-list .dropdown-toggle {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        color: var(--bottom-nav-inactive, rgba(255, 255, 255, 0.7));
        font-size: 1.25rem;
        text-decoration: none;
        border-radius: var(--mobile-border-radius, 8px);
        background: rgba(255, 255, 255, 0.05);
        transition: all var(--mobile-transition, 0.2s ease);
        white-space: normal;
        word-break: break-word;
        line-height: 1.4;
        min-width: 44px;
        min-height: 44px;
        font-family: inherit;
        font-weight: 500;
        box-shadow: none;
        outline: none;
        cursor: pointer;
    }

    .mobile-nav-list li a:hover, .mobile-nav-list li a.active, .mobile-nav-list .dropdown-toggle:hover, .mobile-nav-list .dropdown-toggle[aria-expanded="true"] {
        color: var(--light-text, #ffffff);
        background: linear-gradient(45deg, var(--primary-color, #4a90e2), var(--secondary-color, #50e3c2));
        transform: translateX(8px);
        box-shadow: 0 2px 8px rgba(80, 227, 194, 0.10);
    }

    .mobile-nav-list li a i {
        width: 24px;
        text-align: center;
        font-size: 1.2rem;
        color: var(--secondary-color, #50e3c2);
        flex-shrink: 0;
    }

    .mobile-nav-list .dropdown-toggle {
        border: none;
        background: rgba(255, 255, 255, 0.05);
        position: relative;
        justify-content: space-between;
    }

    .mobile-nav-list .dropdown-toggle::after {
        content: '\u25BC';
        display: inline-block;
        margin-left: 0.5em;
        font-size: 0.7em;
        transition: transform 0.3s ease;
        vertical-align: middle;
        opacity: 0.7;
    }

    .mobile-nav-list .dropdown.open .dropdown-toggle::after,
    .mobile-nav-list .dropdown-toggle[aria-expanded="true"]::after {
        transform: rotate(180deg);
        opacity: 1;
    }

    .nav-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 1190;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
    }

    .nav-backdrop.active {
        opacity: 1;
        pointer-events: auto;
    }

    /* Mobile Menu Animations */
    @keyframes slideIn {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
    }

    @keyframes slideOut {
        from { transform: translateX(0); }
        to { transform: translateX(-100%); }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    /* Mobile Menu Responsive Adjustments */
    @media (max-width: 767px) {
        .mobile-nav {
            bottom: unset !important;
            right: unset !important;
            border-top: none !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
            height: 100vh !important;
            padding-bottom: 2rem !important;
        }
    }

    @media (orientation: landscape) and (max-height: 500px) {
        .mobile-nav {
            padding-top: calc(var(--header-height, 56px) + 1rem);
        }
        
        .mobile-nav-list li a {
            padding: 0.5rem 1rem;
        }
    }

    /* Reduced Motion Support */
    @media (prefers-reduced-motion: reduce) {
        .mobile-nav,
        .nav-backdrop,
        .mobile-menu-button {
            transition: none !important;
        }
        
        .mobile-nav-list li a {
            transition: none !important;
        }
    }

    .mobile-nav-list .dropdown-menu {
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition: max-height 0.3s ease, opacity 0.3s ease;
    }
    .mobile-nav-list .dropdown.open .dropdown-menu {
        max-height: 500px; /* large enough for all items */
        opacity: 1;
        overflow: visible;
    }

    .mobile-menu-close {
        width: 48px;
        height: 48px;
        min-width: 44px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(45deg, var(--primary-color, #4a90e2), var(--secondary-color, #50e3c2));
        border: none;
        border-radius: 50%;
        color: #fff;
        font-size: 1.5rem;
        box-shadow: 0 4px 16px rgba(80, 227, 194, 0.15);
        cursor: pointer;
        transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
        margin-left: 1rem;
        outline: none;
        z-index: 1300;
    }
    .mobile-menu-close:hover, .mobile-menu-close:focus {
        background: linear-gradient(45deg, var(--secondary-color, #50e3c2), var(--primary-color, #4a90e2));
        box-shadow: 0 6px 24px rgba(80, 227, 194, 0.25);
        transform: scale(1.08);
    }
    </style>
    `;

    // Centralized Header and Footer Management
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Attempting to remove static navs');
        document.querySelectorAll('.static-fallback-nav').forEach(el => {
            console.log('Removing:', el);
            el.remove();
        });
        // Add mobile menu styles to document
        document.head.insertAdjacentHTML('beforeend', mobileMenuStyles);

        // --- HEADER IMPLEMENTATION (ALL DEVICES) ---
        const header = document.querySelector('header');
        if (header) {
            // Desktop header HTML structure
            const desktopHeaderHTML = `
                <a href="index.html" class="logo-container" aria-label="QUANNEX Home">
                    <div class="logo" role="img" aria-label="QUANNEX Logo">
                        <div class="quantum-symbol" aria-hidden="true">
                            <div class="quantum-particles">
                                <div class="quantum-particle" style="--tx: 20px; --ty: -20px;"></div>
                                <div class="quantum-particle" style="--tx: -20px; --ty: 20px;"></div>
                                <div class="quantum-particle" style="--tx: 15px; --ty: 15px;"></div>
                                <div class="quantum-particle" style="--tx: -15px; --ty: -15px;"></div>
                            </div>
                        </div>
                        <span class="logo-text" tabindex="0" aria-label="QUANNEX Logo Text">QUANNEX</span>
                    </div>
                    <p class="tagline">Quantum Nexus: Bridge to Higher Consciousness</p>
                </a>
                <nav role="navigation" aria-label="Main navigation">
                    <ul>
                        <li><a href="index.html" ${window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') ? 'aria-current="page"' : ''}>Home</a></li>
                        <li><a href="consciousness_accelerator.html" ${window.location.pathname.includes('consciousness_accelerator.html') ? 'aria-current="page"' : ''}>Consciousness Accelerator</a></li>
                        <li><a href="quantum_parameters.html" ${window.location.pathname.includes('quantum_parameters.html') ? 'aria-current="page"' : ''}>Quantum Parameters</a></li>
                        <li><a href="app_features.html" ${window.location.pathname.includes('app_features.html') ? 'aria-current="page"' : ''}>App Features</a></li>
                        <li><a href="academic_alignment.html" ${window.location.pathname.includes('academic_alignment.html') ? 'aria-current="page"' : ''}>Academic</a></li>
                        <li><a href="advanced_concepts.html" ${window.location.pathname.includes('advanced_concepts.html') ? 'aria-current="page"' : ''}>Advanced</a></li>
                        <li class="dropdown">
                            <button class="dropdown-toggle" aria-haspopup="true" aria-expanded="false">
                                Resources
                                <span class="sr-only">(click to expand)</span>
                            </button>
                            <ul class="dropdown-menu" role="menu" aria-label="Resources submenu">
                                <li role="none"><a href="project_proposal.html" role="menuitem"><i class="fas fa-file-alt" aria-hidden="true"></i> Project Proposal</a></li>
                                <li role="none"><a href="business_model.html" role="menuitem"><i class="fas fa-chart-line" aria-hidden="true"></i> Business Model</a></li>
                                <li role="none"><a href="academic_alignment.html" role="menuitem"><i class="fas fa-graduation-cap" aria-hidden="true"></i> Academic Alignment</a></li>
                                <li role="none"><a href="scientific_validation.html" role="menuitem"><i class="fas fa-flask" aria-hidden="true"></i> Scientific Validation</a></li>
                                <li role="none"><a href="technical_implementation.html" role="menuitem"><i class="fas fa-code" aria-hidden="true"></i> Technical Implementation</a></li>
                                <li role="none"><a href="consciousness_bands.html" role="menuitem"><i class="fas fa-brain" aria-hidden="true"></i> Consciousness Bands</a></li>
                                <li role="none"><a href="advanced_progression.html" role="menuitem"><i class="fas fa-level-up-alt" aria-hidden="true"></i> Progression System</a></li>
                                <li role="none"><a href="implementation_plan.html" role="menuitem"><i class="fas fa-tasks" aria-hidden="true"></i> Implementation Plan</a></li>
                                <li role="none"><a href="app_screens.html" role="menuitem"><i class="fas fa-mobile-alt" aria-hidden="true"></i> App Screen Inventory</a></li>
                                <li role="none"><a href="curriculum.html" role="menuitem"><i class="fas fa-book" aria-hidden="true"></i> 4-Week Curriculum</a></li>
                                <li role="none"><a href="partnerships.html" role="menuitem"><i class="fas fa-handshake" aria-hidden="true"></i> Partnerships</a></li>
                            </ul>
                        </li>
                        <li><a href="contact.html" ${window.location.pathname.includes('contact.html') ? 'aria-current="page"' : ''}>Contact</a></li>
                    </ul>
                </nav>
            `;

            // Mobile header HTML structure
            const mobileHeaderHTML = `
                <div class="header-flex">
                    <a href="index.html" class="logo-container" aria-label="QUANNEX Home">
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
                    </a>
                    <button class="mobile-menu-button" aria-label="Open menu" aria-expanded="false" tabindex="0">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
                <nav class="mobile-nav" aria-label="Mobile navigation">
                    <div class="mobile-nav-header">
                        <a href="index.html" class="logo-container">
                            <div class="logo">
                                <h1>QUANNEX</h1>
                            </div>
                        </a>
                        <button class="mobile-menu-close" aria-label="Close menu" tabindex="0">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <ul class="mobile-nav-list">
                        <li><a href="index.html" ${window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') ? 'aria-current="page"' : ''}>Home</a></li>
                        <li><a href="consciousness_accelerator.html" ${window.location.pathname.includes('consciousness_accelerator.html') ? 'aria-current="page"' : ''}>Consciousness Accelerator</a></li>
                        <li><a href="quantum_parameters.html" ${window.location.pathname.includes('quantum_parameters.html') ? 'aria-current="page"' : ''}>Quantum Parameters</a></li>
                        <li><a href="app_features.html" ${window.location.pathname.includes('app_features.html') ? 'aria-current="page"' : ''}>App Features</a></li>
                        <li><a href="academic_alignment.html" ${window.location.pathname.includes('academic_alignment.html') ? 'aria-current="page"' : ''}>Academic</a></li>
                        <li><a href="advanced_concepts.html" ${window.location.pathname.includes('advanced_concepts.html') ? 'aria-current="page"' : ''}>Advanced</a></li>
                        <li class="dropdown">
                            <button class="dropdown-toggle" aria-haspopup="true" aria-expanded="false" tabindex="0">
                                Resources
                                <span class="sr-only">(click to expand)</span>
                            </button>
                            <ul class="dropdown-menu" role="menu" aria-label="Resources submenu" style="display: none;">
                                <li role="none"><a href="project_proposal.html" role="menuitem"><i class="fas fa-file-alt" aria-hidden="true"></i> Project Proposal</a></li>
                                <li role="none"><a href="business_model.html" role="menuitem"><i class="fas fa-chart-line" aria-hidden="true"></i> Business Model</a></li>
                                <li role="none"><a href="academic_alignment.html" role="menuitem"><i class="fas fa-graduation-cap" aria-hidden="true"></i> Academic Alignment</a></li>
                                <li role="none"><a href="scientific_validation.html" role="menuitem"><i class="fas fa-flask" aria-hidden="true"></i> Scientific Validation</a></li>
                                <li role="none"><a href="technical_implementation.html" role="menuitem"><i class="fas fa-code" aria-hidden="true"></i> Technical Implementation</a></li>
                                <li role="none"><a href="consciousness_bands.html" role="menuitem"><i class="fas fa-brain" aria-hidden="true"></i> Consciousness Bands</a></li>
                                <li role="none"><a href="advanced_progression.html" role="menuitem"><i class="fas fa-level-up-alt" aria-hidden="true"></i> Progression System</a></li>
                                <li role="none"><a href="implementation_plan.html" role="menuitem"><i class="fas fa-tasks" aria-hidden="true"></i> Implementation Plan</a></li>
                                <li role="none"><a href="app_screens.html" role="menuitem"><i class="fas fa-mobile-alt" aria-hidden="true"></i> App Screen Inventory</a></li>
                                <li role="none"><a href="curriculum.html" role="menuitem"><i class="fas fa-book" aria-hidden="true"></i> 4-Week Curriculum</a></li>
                                <li role="none"><a href="partnerships.html" role="menuitem"><i class="fas fa-handshake" aria-hidden="true"></i> Partnerships</a></li>
                            </ul>
                        </li>
                        <li><a href="contact.html" ${window.location.pathname.includes('contact.html') ? 'aria-current="page"' : ''}>Contact</a></li>
                    </ul>
                </nav>
                <div class="nav-backdrop" tabindex="-1" aria-hidden="true" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1190; opacity: 0; pointer-events: none; transition: opacity 0.2s;"></div>
            `;

            // Set header content based on screen width
            if (window.innerWidth < 768) {
                header.innerHTML = mobileHeaderHTML;
                initializeMobileMenu(header);
            } else {
                header.innerHTML = desktopHeaderHTML;
                initializeDesktopMenu(header);
            }

            // Handle window resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (window.innerWidth < 768) {
                        header.innerHTML = mobileHeaderHTML;
                        initializeMobileMenu(header);
                    } else {
                        header.innerHTML = desktopHeaderHTML;
                        initializeDesktopMenu(header);
                    }
                }, 250); // Debounce resize events
            });
        }

        // Initialize mobile menu functionality
        function initializeMobileMenu(header) {
            const menuButton = header.querySelector('.mobile-menu-button');
            const closeButton = header.querySelector('.mobile-menu-close');
            const mobileNav = header.querySelector('.mobile-nav');
            const navBackdrop = header.querySelector('.nav-backdrop');
            const icon = menuButton.querySelector('i');

            // Prevent body scroll when menu is open
            function toggleBodyScroll(disable) {
                document.body.style.overflow = disable ? 'hidden' : '';
                document.body.style.touchAction = disable ? 'none' : '';
                document.body.style.overscrollBehavior = disable ? 'none' : '';
            }

            function openMenu() {
                mobileNav.classList.add('active');
                navBackdrop.classList.add('active');
                menuButton.setAttribute('aria-expanded', 'true');
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                toggleBodyScroll(true);
                
                // Force reflow to ensure DOM is ready
                mobileNav.offsetHeight;

                // Focus the first visible menu item for accessibility and interaction
                setTimeout(() => {
                    const firstMenuItem = mobileNav.querySelector('.mobile-nav-list > li:not(.dropdown) a, .mobile-nav-list > li.dropdown .dropdown-toggle');
                    if (firstMenuItem) {
                        firstMenuItem.focus();
                    }
                }, 50);
                
                // Focus trap
                const focusableElements = mobileNav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
                const firstFocusable = focusableElements[0];
                const lastFocusable = focusableElements[focusableElements.length - 1];
                
                mobileNav.addEventListener('keydown', function trapFocus(e) {
                    if (e.key === 'Tab') {
                        if (e.shiftKey && document.activeElement === firstFocusable) {
                            e.preventDefault();
                            lastFocusable.focus();
                        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                            e.preventDefault();
                            firstFocusable.focus();
                        }
                    }
                });
            }

            function closeMenu() {
                mobileNav.classList.remove('active');
                navBackdrop.classList.remove('active');
                menuButton.setAttribute('aria-expanded', 'false');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
                toggleBodyScroll(false);
                menuButton.focus();
            }

            menuButton.addEventListener('click', () => {
                if (mobileNav.classList.contains('active')) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });

            if (closeButton) {
                closeButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMenu();
                });
            }

            navBackdrop.addEventListener('click', closeMenu);
            
            // Handle escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                    closeMenu();
                }
            });

            // Close menu on route change
            mobileNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (e) => {
                    // Only close if not a dropdown toggle or inside a dropdown menu
                    const isDropdownToggle = link.closest('.dropdown') && link.parentElement.classList.contains('dropdown');
                    const isInDropdownMenu = link.closest('.dropdown-menu');
                    if (!link.getAttribute('href').startsWith('#') && !isDropdownToggle && !isInDropdownMenu) {
                        closeMenu();
                    }
                });
            });

            // Handle window resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (window.innerWidth >= 768 && mobileNav.classList.contains('active')) {
                        closeMenu();
                    }
                }, 250);
            });

            // Dropdown (submenu) toggle for mobile
            const mobileDropdowns = header.querySelectorAll('.mobile-nav-list .dropdown');
            mobileDropdowns.forEach(dropdown => {
                const toggle = dropdown.querySelector('.dropdown-toggle');
                const menu = dropdown.querySelector('.dropdown-menu');
                if (toggle && menu) {
                    console.log('Dropdown event listener attached:', toggle.textContent.trim());
                    toggle.addEventListener('click', function(e) {
                        e.preventDefault();
                        const isOpen = dropdown.classList.contains('open');
                        // Close all dropdowns first
                        mobileDropdowns.forEach(d => {
                            d.classList.remove('open');
                            d.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
                            d.querySelector('.dropdown-menu').style.display = 'none'; // Ensure closed
                        });
                        // Open this one if it was not already open
                        if (!isOpen) {
                            dropdown.classList.add('open');
                            toggle.setAttribute('aria-expanded', 'true');
                            menu.style.display = 'block'; // Show menu
                        } else {
                            menu.style.display = 'none'; // Hide menu if closing
                        }
                    });
                    // Keyboard accessibility
                    toggle.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggle.click();
                        }
                    });
                }
            });
        }

        // Initialize desktop menu functionality
        function initializeDesktopMenu(header) {
            const dropdowns = header.querySelectorAll('.dropdown');
            
            dropdowns.forEach(dropdown => {
                const button = dropdown.querySelector('.dropdown-toggle');
                const menu = dropdown.querySelector('.dropdown-menu');
                
                if (button && menu) {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        const isExpanded = button.getAttribute('aria-expanded') === 'true';
                        button.setAttribute('aria-expanded', !isExpanded);
                        menu.style.display = isExpanded ? 'none' : 'block';
                    });

                    // Close dropdown when clicking outside
                    document.addEventListener('click', (e) => {
                        if (!dropdown.contains(e.target)) {
                            button.setAttribute('aria-expanded', 'false');
                            menu.style.display = 'none';
                        }
                    });
                }
            });
        }

        // --- ALL OTHER LOGIC (runs on all devices) ---
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
            }, 400);

            // Animate on scroll
            const animateOnScroll = (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            };
            const observer = new IntersectionObserver(animateOnScroll, { threshold: 0.2 });
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                observer.observe(el);
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

        // Resource Navigation Implementation (migrated from navigation.js)
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
    });
} 