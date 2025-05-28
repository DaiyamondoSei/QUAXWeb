import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { mainNavItems } from '../types/navigation';
import cn from 'classnames';

const Header: React.FC = () => {
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
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
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

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {mainNavItems.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'text-sm font-medium transition-colors duration-200',
                                    isActive(href)
                                        ? 'text-primary-600'
                                        : 'text-gray-600 hover:text-primary-600'
                                )}
                                aria-current={isActive(href) ? 'page' : undefined}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        onClick={toggleMenu}
                        aria-expanded={isMenuOpen}
                        aria-label="Toggle menu"
                        style={{ minHeight: 'var(--mobile-touch-target)', minWidth: 'var(--mobile-touch-target)' }}
                    >
                        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
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
        </header>
    );
};

export default Header; 