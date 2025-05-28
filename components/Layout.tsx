import React from 'react';
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