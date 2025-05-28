import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaHome, FaSearch, FaPlus, FaUser } from 'react-icons/fa';
import { bottomNavItems } from '../types/navigation';
import cn from 'classnames';

const iconMap = {
    home: FaHome,
    search: FaSearch,
    plus: FaPlus,
    user: FaUser,
};

const BottomNav: React.FC = () => {
    const router = useRouter();
    const currentPath = router.pathname;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-gray-200 md:hidden">
            <div className="flex items-center justify-around h-16 px-4">
                {bottomNavItems.map(({ href, label, icon }) => {
                    const IconComponent = iconMap[icon as keyof typeof iconMap];
                    const isActive = currentPath === href;

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
    );
};

export default BottomNav; 