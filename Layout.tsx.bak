import React, { useEffect } from 'react';
import UnifiedNavigation from './UnifiedNavigation';
import cn from 'classnames';

interface LayoutProps {
    children: React.ReactNode;
    variant?: 'default' | 'transparent';
    showBottomNav?: boolean;
    className?: string;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    variant = 'default',
    showBottomNav = true,
    className
}) => {
    // Check for static header script
    useEffect(() => {
        const staticHeaderScript = document.querySelector('script[src*="header-footer.js"]');
        if (staticHeaderScript) {
            console.error(
                'WARNING: The static header-footer.js script is detected while using the React Layout component. ' +
                'This will cause header duplication. Please remove the static header script from this page.'
            );
        }
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <UnifiedNavigation
                variant={variant}
                showBottomNav={showBottomNav}
            />
            <main className={cn(
                'pt-16', // Add padding for fixed header
                showBottomNav && 'pb-[var(--bottom-nav-height)]', // Add padding for bottom nav if shown
                className
            )}>
                {children}
            </main>
        </div>
    );
};

export default Layout; 