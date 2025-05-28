import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import { NavItem, NavigationProps } from '../types/navigation';
import cn from 'classnames';

const navItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' }
];

export default function Navigation({ className, variant = 'default' }: NavigationProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = () => setIsOpen(false);
        router.events.on('routeChangeStart', handleRouteChange);
        return () => router.events.off('routeChangeStart', handleRouteChange);
    }, [router.events]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const isActive = (href: string) => {
        return router.pathname === href;
    };

    return (
        <nav 
            className={cn(
                'fixed bottom-0 left-0 right-0 z-50 transition-colors duration-[var(--mobile-transition)]',
                variant === 'default' ? 'bg-[var(--bottom-nav-bg)] backdrop-blur-md border-t border-[var(--bottom-nav-border)]' : 'bg-transparent',
                'md:relative md:bg-transparent md:border-none',
                className
            )}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-between max-w-screen-xl mx-auto px-6 py-4">
                <div className="flex items-center space-x-8">
                    {navItems.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'text-base font-medium transition-colors duration-[var(--mobile-transition)]',
                                isActive(href) ? 'text-[var(--bottom-nav-active)]' : 'text-[var(--bottom-nav-inactive)] hover:text-[var(--bottom-nav-active)]'
                            )}
                            aria-current={isActive(href) ? 'page' : undefined}
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
                <div className="flex items-center justify-around h-[var(--bottom-nav-height)] px-[var(--mobile-padding)]">
                    {navItems.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex flex-col items-center justify-center flex-1 transition-colors duration-[var(--mobile-transition)]',
                                'relative py-2 px-3',
                                isActive(href) ? 'text-[var(--bottom-nav-active)]' : 'text-[var(--bottom-nav-inactive)]'
                            )}
                            aria-current={isActive(href) ? 'page' : undefined}
                        >
                            <span className="text-sm font-medium">{label}</span>
                            {isActive(href) && (
                                <span 
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--bottom-nav-active)]"
                                    aria-hidden="true"
                                />
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile Menu Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </nav>
    );
} 