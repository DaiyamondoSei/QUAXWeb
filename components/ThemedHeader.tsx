import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { mainNavItems } from '../types/navigation';
import cn from 'classnames';

interface ThemedHeaderProps {
    variant?: 'default' | 'transparent';
}

const ThemedHeader: React.FC<ThemedHeaderProps> = ({ variant = 'default' }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = () => setIsMenuOpen(false);
        router.events.on('routeChangeStart', handleRouteChange);
        return () => router.events.off('routeChangeStart', handleRouteChange);
    }, [router.events]);

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

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const isActive = (href: string) => router.pathname === href;

    return (
        <header className={cn(
            'header',
            variant === 'transparent' && 'bg-transparent backdrop-filter-none'
        )}>
            <div className="header-content max-w-screen-xl mx-auto">
                <Link href="/" className="logo-container">
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
                <nav className="desktop-nav">
                    {mainNavItems.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'nav-link',
                                isActive(href) && 'active'
                            )}
                            aria-current={isActive(href) ? 'page' : undefined}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-button"
                    onClick={toggleMenu}
                    aria-expanded={isMenuOpen}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mobile-nav-backdrop"
                            onClick={toggleMenu}
                            aria-hidden="true"
                        />

                        <motion.nav
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 20 }}
                            className={cn('mobile-nav', isMenuOpen && 'active')}
                        >
                            <div className="mobile-nav-content">
                                {mainNavItems.map(({ href, label }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={cn(
                                            'nav-link',
                                            isActive(href) && 'active'
                                        )}
                                        onClick={toggleMenu}
                                        aria-current={isActive(href) ? 'page' : undefined}
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

export default ThemedHeader; 