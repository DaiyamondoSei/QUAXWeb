import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaBars, FaTimes, FaHome, FaSearch, FaPlus, FaUser } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { mainNavItems, bottomNavItems } from '../types/navigation';
import WaitlistCTA from './common/WaitlistCTA';
import cn from 'classnames';

// Types
interface UnifiedNavigationProps {
    variant?: 'default' | 'transparent';
    showBottomNav?: boolean;
    className?: string;
}

// Icon mapping for bottom navigation
const iconMap = {
    home: FaHome,
    search: FaSearch,
    plus: FaPlus,
    user: FaUser,
};

const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({
    variant = 'default',
    showBottomNav = true,
    className
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hasBackdropFilter, setHasBackdropFilter] = useState(true);
    const router = useRouter();

    // Check for backdrop-filter support
    useEffect(() => {
        const checkBackdropFilter = () => {
            const testElement = document.createElement('div');
            testElement.style.backdropFilter = 'blur(1px)';
            const hasSupport = testElement.style.backdropFilter !== '';
            setHasBackdropFilter(hasSupport);
        };
        checkBackdropFilter();
    }, []);

    // Close menu on route change
    useEffect(() => {
        const handleRouteChange = () => setIsMenuOpen(false);
        router.events.on('routeChangeStart', handleRouteChange);
        return () => router.events.off('routeChangeStart', handleRouteChange);
    }, [router.events]);

    // Handle body scroll lock
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isMenuOpen]);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => !prev);
    }, []);

    const isActive = useCallback((href: string) => router.pathname === href, [router.pathname]);

    return (
        <>
            {/* Header */}
            <header className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-colors duration-[var(--mobile-transition)]',
                variant === 'default' ? 'bg-white/80' : 'bg-transparent',
                hasBackdropFilter ? 'backdrop-blur-md' : 'bg-opacity-95',
                'border-b border-gray-200',
                className
            )}>
                <div className="flex items-center justify-between h-16 px-4 max-w-screen-xl mx-auto">
                    {/* Logo */}
                    <Link 
                        href="/" 
                        className="flex-shrink-0 z-50"
                        aria-label="Home"
                    >
                        <Image
                            src="/images/logo.png"
                            alt="QUANNEX"
                            width={140}
                            height={40}
                            priority
                            className="h-8 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {mainNavItems.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'text-base font-medium transition-colors duration-200',
                                    isActive(href)
                                        ? 'text-primary-600'
                                        : 'text-gray-600 hover:text-primary-600'
                                )}
                                aria-current={isActive(href) ? 'page' : undefined}
                            >
                                {label}
                            </Link>
                        ))}
                        <div className="ml-4 flex-shrink-0">
                            <WaitlistCTA variant="nav" />
                        </div>
                    </nav>

                    {/* Mobile Menu Button with Waitlist */}
                    <div className="md:hidden flex items-center gap-2 relative z-[1001]">
                        <WaitlistCTA variant="nav" className="!py-2 !px-3 text-sm" />
                        <button
                            className="p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 bg-white/80 backdrop-blur-sm"
                            onClick={toggleMenu}
                            aria-expanded={isMenuOpen}
                            aria-label="Toggle menu"
                            aria-controls="mobile-menu"
                            style={{ 
                                minHeight: 'var(--mobile-touch-target)', 
                                minWidth: 'var(--mobile-touch-target)',
                                position: 'relative',
                                zIndex: 1001
                            }}
                        >
                            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={cn(
                                "fixed inset-0 md:hidden z-[1001]",
                                hasBackdropFilter ? "bg-black/50 backdrop-blur-sm" : "bg-black/75"
                            )}
                            onClick={toggleMenu}
                            aria-hidden="true"
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        />

                        {/* Menu Panel */}
                        <motion.nav
                            id="mobile-menu"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 20 }}
                            className={cn(
                                "fixed top-0 right-0 bottom-0 w-64 md:hidden",
                                hasBackdropFilter ? "bg-white/95 backdrop-blur-md" : "bg-white",
                                "shadow-lg overflow-y-auto z-[1002]"
                            )}
                            role="navigation"
                            aria-label="Mobile menu"
                            style={{
                                paddingTop: 'var(--header-height)'
                            }}
                        >
                            <div className="px-4 py-6 space-y-4">
                                {mainNavItems.map(({ href, label }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={cn(
                                            'block px-4 py-2 text-base font-medium rounded-md transition-colors duration-200',
                                            isActive(href)
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                                        )}
                                        onClick={toggleMenu}
                                        aria-current={isActive(href) ? 'page' : undefined}
                                        style={{ minHeight: 'var(--mobile-touch-target)' }}
                                    >
                                        {label}
                                    </Link>
                                ))}
                                <div className="pt-4 mt-4 border-t border-gray-200">
                                    <WaitlistCTA variant="nav" className="w-full !py-3" />
                                </div>
                            </div>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Navigation */}
            {showBottomNav && (
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
                    <div className="flex items-center justify-around h-[var(--bottom-nav-height)] px-[var(--mobile-padding)]">
                        {bottomNavItems.map(({ href, label, icon }) => {
                            const Icon = iconMap[icon as keyof typeof iconMap];
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        'flex flex-col items-center justify-center flex-1 transition-colors duration-[var(--mobile-transition)]',
                                        'relative py-2 px-3',
                                        isActive(href) ? 'text-primary-600' : 'text-gray-600'
                                    )}
                                    aria-current={isActive(href) ? 'page' : undefined}
                                    style={{ minHeight: 'var(--mobile-touch-target)' }}
                                >
                                    <Icon className="w-6 h-6 mb-1" />
                                    <span className="text-xs font-medium">{label}</span>
                                    {isActive(href) && (
                                        <span 
                                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-600"
                                            aria-hidden="true"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}

            {/* Floating Waitlist CTA - Desktop Only */}
            <div className="hidden md:block">
                <WaitlistCTA variant="floating" />
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    /* Adjust header height for mobile */
                    header {
                        height: var(--header-height-mobile, 4rem);
                    }

                    /* Ensure proper spacing in mobile header */
                    .flex.items-center.justify-between {
                        padding-left: 0.75rem;
                        padding-right: 0.75rem;
                    }

                    /* Adjust logo size for mobile */
                    .h-8 {
                        height: 2rem;
                    }

                    /* Ensure proper touch targets */
                    button, a {
                        min-height: 44px;
                        min-width: 44px;
                    }

                    /* Improve mobile menu scrolling */
                    .overflow-y-auto {
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }

                    .overflow-y-auto::-webkit-scrollbar {
                        display: none;
                    }
                }

                /* Small mobile devices */
                @media (max-width: 360px) {
                    header {
                        height: var(--header-height-mobile-small, 3.5rem);
                    }

                    .h-8 {
                        height: 1.75rem;
                    }
                }

                /* Landscape mode adjustments */
                @media (max-height: 500px) and (orientation: landscape) {
                    header {
                        height: var(--header-height-landscape, 3.5rem);
                    }

                    .h-8 {
                        height: 1.75rem;
                    }

                    #mobile-menu {
                        top: var(--header-height-landscape, 3.5rem);
                    }
                }
            `}</style>
        </>
    );
};

export default UnifiedNavigation; 