export interface NavItem {
    href: string;
    label: string;
    icon?: string;
}

export interface NavigationProps {
    className?: string;
    variant?: 'default' | 'transparent' | 'bottom';
    onItemClick?: () => void;
}

export const mainNavItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' }
];

export const bottomNavItems: NavItem[] = [
    { href: '/', label: 'Home', icon: 'home' },
    // { href: '/search', label: 'Search', icon: 'search' },
    { href: '/create', label: 'Create', icon: 'plus' },
    { href: '/profile', label: 'Profile', icon: 'user' }
]; 