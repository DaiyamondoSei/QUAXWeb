document.addEventListener('DOMContentLoaded', function() {
    // Handle dropdown keyboard navigation
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        const items = menu.querySelectorAll('[role="menuitem"]');
        
        toggle.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                    toggle.setAttribute('aria-expanded', !isExpanded);
                    if (!isExpanded) {
                        items[0].focus();
                    }
                    break;
                case 'Escape':
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.focus();
                    break;
            }
        });
        
        items.forEach((item, index) => {
            item.addEventListener('keydown', (e) => {
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        if (index < items.length - 1) {
                            items[index + 1].focus();
                        }
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        if (index > 0) {
                            items[index - 1].focus();
                        } else {
                            toggle.focus();
                        }
                        break;
                    case 'Escape':
                        toggle.setAttribute('aria-expanded', 'false');
                        toggle.focus();
                        break;
                }
            });
        });
    });
    
    // Handle focus trap in modals
    const modals = document.querySelectorAll('[role="dialog"]');
    
    modals.forEach(modal => {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        });
    });
}); 