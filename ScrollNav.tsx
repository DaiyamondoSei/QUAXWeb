import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavItem {
    path: string;
    label: string;
}

const ScrollNav: React.FC = () => {
    const router = useRouter();
    const currentPath = router.pathname;
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(false);

    const navItems: NavItem[] = [
        { path: '/feed', label: 'Feed' },
        { path: '/trending', label: 'Trending' },
        { path: '/discover', label: 'Discover' },
        { path: '/categories', label: 'Categories' },
        { path: '/bookmarks', label: 'Bookmarks' },
        { path: '/following', label: 'Following' },
    ];

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftFade(scrollLeft > 0);
            setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer) {
            checkScroll();
            scrollContainer.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);

            return () => {
                scrollContainer.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, []);

    return (
        <nav className="scroll-nav">
            {showLeftFade && <div className="scroll-fade-left" />}
            <div className="scroll-nav-container" ref={scrollRef}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`scroll-nav-item ${currentPath === item.path ? 'active' : ''}`}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>
            {showRightFade && <div className="scroll-fade-right" />}
        </nav>
    );
};

export default ScrollNav; 