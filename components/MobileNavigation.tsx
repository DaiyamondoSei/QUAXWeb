import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaBars, FaTimes, FaHome, FaSearch, FaPlus, FaUser } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { mainNavItems, bottomNavItems } from '../types/navigation';
import cn from 'classnames';

const iconMap = {
    home: FaHome,
    search: FaSearch,
    plus: FaPlus,
    user: FaUser,
};

interface MobileNavigationProps {
    showBottomNav?: boolean;
    variant?: 'default' | 'transparent';
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
    showBottomNav = true,
    variant = 'default'
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    // Close menu on route change
    useEffect(() => {
        const handleRouteChange = () => setIsMenuOpen(false);
        router.events.on('routeChangeStart', handleRouteChange);
        return () => router.events.off('routeChangeStart', handleRouteChange);
    }, [router.events]);

    // Prevent body scroll when menu is open
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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const isActive = (href: string) => router.pathname === href;

    return (
        <>
            {/* Mobile Header */}
            <header className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-colors duration-[var(--mobile-transition)]',
                variant === 'default' ? 'bg-white/80 backdrop-blur-md border-b border-gray-200' : 'bg-transparent',
                'md:hidden'
            )}>
                <div className="flex items-center justify-between h-16 px-4">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <Image
                            src="/images/logo.png"
                            alt="QUANNEX"
                            width={140}
                            height={40}
                            priority
                            className="h-8 w-auto"
                        />
                    </Link>

                    {/* Menu Button */}
                    <button
                        className="p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        onClick={toggleMenu}
                        aria-expanded={isMenuOpen}
                        aria-label="Toggle menu"
                        style={{ minHeight: 'var(--mobile-touch-target)', minWidth: 'var(--mobile-touch-target)' }}
                    >
                        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden"
                            onClick={toggleMenu}
                            aria-hidden="true"
                        />

                        {/* Menu Panel */}
                        <motion.nav
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="fixed top-16 right-0 bottom-0 w-64 bg-white shadow-lg md:hidden"
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
                            </div>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Navigation */}
            {showBottomNav && (
                <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-gray-200 md:hidden">
                    <div className="flex items-center justify-around h-16 px-4">
                        {bottomNavItems.map(({ href, label, icon }) => {
                            const IconComponent = iconMap[icon as keyof typeof iconMap];
                            const isActive = router.pathname === href;

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        'flex flex-col items-center justify-center flex-1 h-full',
                                        'transition-colors duration-200',
                                        isActive
                                            ? 'text-primary-600'
                                            : 'text-gray-600 hover:text-primary-600'
                                    )}
                                    aria-current={isActive ? 'page' : undefined}
                                    style={{ minHeight: 'var(--mobile-touch-target)' }}
                                >
                                    <IconComponent
                                        size={20}
                                        className={cn(
                                            'transition-transform duration-200',
                                            isActive && 'scale-110'
                                        )}
                                    />
                                    <span className="mt-1 text-xs font-medium">{label}</span>
                                    {isActive && (
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
        </>
    );
};

export default MobileNavigation; 