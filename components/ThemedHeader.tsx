import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { mainNavItems } from '../types/navigation';
import cn from 'classnames';

interface ThemedHeaderProps {
    variant?: 'default' | 'transparent';
}

const ThemedHeader: React.FC<ThemedHeaderProps> = ({ variant = 'default' }) => {
    const router = useRouter();
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
            </div>
        </header>
    );
};

export default ThemedHeader; 