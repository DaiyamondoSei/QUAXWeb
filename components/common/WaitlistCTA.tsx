import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface WaitlistCTAProps {
    variant?: 'nav' | 'floating' | 'hero';
    className?: string;
}

const WaitlistCTA: React.FC<WaitlistCTAProps> = ({ variant = 'nav', className = '' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFloatingVisible, setIsFloatingVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (variant === 'floating') {
            const handleScroll = () => {
                setIsFloatingVisible(window.scrollY > 300);
            };

            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [variant]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isModalOpen) {
                setIsModalOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isModalOpen]);

    const openModal = () => {
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = '';
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const submitButton = form.querySelector('.submit-button') as HTMLButtonElement;

        if (!form.checkValidity()) {
            return;
        }

        submitButton.classList.add('loading');
        submitButton.disabled = true;

        try {
            const formData = new FormData(form);
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData as any).toString()
            });

            if (response.ok) {
                router.push('/success.html');
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    };

    const buttonClasses = {
        nav: 'waitlist-button',
        floating: 'floating-waitlist-cta',
        hero: 'cta-button primary'
    };

    if (variant === 'floating' && !isFloatingVisible) {
        return null;
    }

    return (
        <>
            <button
                className={`${buttonClasses[variant]} ${className}`}
                onClick={openModal}
                aria-label="Join Beta Waitlist"
            >
                <span className="button-text">Join Beta Waitlist</span>
                <i className="fas fa-rocket" aria-hidden="true"></i>
            </button>

            {isModalOpen && (
                <div 
                    className="modal active" 
                    role="dialog" 
                    aria-labelledby="waitlistModalTitle" 
                    aria-modal="true"
                    onClick={(e) => e.target === e.currentTarget && closeModal()}
                >
                    <div className="modal-content">
                        <button 
                            className="modal-close" 
                            onClick={closeModal}
                            aria-label="Close modal"
                        >
                            <i className="fas fa-times" aria-hidden="true"></i>
                        </button>
                        
                        <h2 id="waitlistModalTitle">Join the QUANNEX Beta Waitlist</h2>
                        <p>Be among the first to experience the future of consciousness acceleration. Sign up now to get early access to our beta version.</p>
                        
                        <form 
                            name="waitlist-form" 
                            method="POST" 
                            data-netlify="true" 
                            netlify-honeypot="bot-field" 
                            onSubmit={handleSubmit}
                            className="waitlist-form"
                        >
                            <input type="hidden" name="form-name" value="waitlist-form" />
                            <div className="hidden">
                                <input name="bot-field" />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="waitlist-name">Name <span className="required">*</span></label>
                                <input 
                                    type="text" 
                                    id="waitlist-name" 
                                    name="name" 
                                    required 
                                    minLength={2} 
                                    maxLength={100} 
                                    placeholder="Your full name"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="waitlist-email">Email <span className="required">*</span></label>
                                <input 
                                    type="email" 
                                    id="waitlist-email" 
                                    name="email" 
                                    required 
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="waitlist-interest">
                                    What interests you most about QUANNEX? <span className="required">*</span>
                                </label>
                                <select id="waitlist-interest" name="interest" required>
                                    <option value="">Select your primary interest</option>
                                    <option value="consciousness">Consciousness Expansion</option>
                                    <option value="quantum">Quantum State Awareness</option>
                                    <option value="future-self">Future Self Integration</option>
                                    <option value="personal-growth">Personal Growth</option>
                                    <option value="research">Research & Development</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label className="checkbox-container">
                                    <input type="checkbox" name="privacy-consent" required />
                                    <span className="checkmark"></span>
                                    I agree to receive updates about the beta launch and agree to the processing of my data according to the{' '}
                                    <a href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                                </label>
                            </div>
                            
                            <button type="submit" className="submit-button">
                                <span className="button-text">Join Waitlist</span>
                                <i className="fas fa-rocket" aria-hidden="true"></i>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                /* Waitlist Button Styles */
                .waitlist-button {
                    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
                    color: var(--light-text);
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-family: var(--font-heading);
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    transition: all 0.3s ease;
                }

                .waitlist-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(110, 0, 255, 0.3);
                }

                .waitlist-button:active {
                    transform: translateY(0);
                }

                /* Floating CTA Styles (only unique, not sizing/padding/font-size) */
                .floating-waitlist-cta {
                    position: fixed;
                    transition: all 0.3s ease;
                    z-index: 2000;
                }
                .floating-waitlist-cta.visible {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: auto;
                }
                .floating-waitlist-cta:active {
                    transform: translateY(0);
                }
                .floating-waitlist-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 25px rgba(110, 0, 255, 0.4);
                }

                /* Enhanced Modal Styles for Mobile */
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    padding: 1rem;
                }

                .modal.active {
                    opacity: 1;
                }

                .modal-content {
                    background: rgba(5, 5, 32, 0.95);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    padding: 2rem;
                    max-width: 500px;
                    width: 100%;
                    position: relative;
                    transform: translateY(20px);
                    transition: transform 0.3s ease;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    max-height: calc(100vh - 2rem);
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .modal.active .modal-content {
                    transform: translateY(0);
                }

                .modal-close {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    background: none;
                    border: none;
                    color: var(--light-text);
                    font-size: 1.25rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    transition: all 0.3s ease;
                }

                .modal-close:hover {
                    color: var(--accent-color);
                    transform: rotate(90deg);
                }

                .modal h2 {
                    color: var(--light-text);
                    font-size: 1.8rem;
                    margin-bottom: 1rem;
                    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }

                .modal p {
                    color: var(--medium-text);
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }

                /* Enhanced Form Styles for Mobile */
                .waitlist-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-group {
                    margin-bottom: 0;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--light-text);
                    font-weight: 500;
                    font-size: 0.95rem;
                }

                .form-group .required {
                    color: var(--accent-color);
                    margin-left: 0.25rem;
                }

                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(110, 0, 255, 0.3);
                    border-radius: 8px;
                    color: var(--light-text);
                    font-family: var(--font-main);
                    transition: all 0.3s ease;
                    font-size: 16px; /* Prevent zoom on iOS */
                    -webkit-appearance: none;
                    appearance: none;
                }

                .form-group select {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                    background-size: 1.25rem;
                    padding-right: 2.5rem;
                }

                .checkbox-container {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    cursor: pointer;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }

                .checkbox-container input[type="checkbox"] {
                    width: 1.25rem;
                    height: 1.25rem;
                    margin-top: 0.125rem;
                    flex-shrink: 0;
                }

                .submit-button {
                    margin-top: 0.5rem;
                    padding: 1rem;
                    font-size: 1rem;
                    min-height: 3rem;
                }

                /* Mobile-specific styles */
                @media (max-width: 768px) {
                    .modal {
                        padding: 0.5rem;
                    }

                    .modal-content {
                        padding: 1.5rem;
                        border-radius: 12px;
                        margin: 0.5rem;
                    }

                    .modal h2 {
                        font-size: 1.5rem;
                        margin-bottom: 0.75rem;
                    }

                    .modal p {
                        font-size: 0.95rem;
                        margin-bottom: 1.5rem;
                    }

                    .modal-close {
                        top: 0.75rem;
                        right: 0.75rem;
                        padding: 0.5rem;
                        font-size: 1.25rem;
                    }

                    .waitlist-button {
                        padding: 0.75rem 1rem;
                        font-size: 0.95rem;
                        white-space: nowrap;
                    }

                    .waitlist-button .button-text {
                        display: inline-block;
                    }

                    .floating-waitlist-cta {
                        bottom: calc(var(--bottom-nav-height) + 2.5rem) !important;
                        right: 1.25rem !important;
                        padding: 1.25rem 2.25rem !important;
                        border-radius: 50px !important;
                        min-width: 200px !important;
                        min-height: 60px !important;
                        width: auto !important;
                        height: auto !important;
                        font-size: 1.25rem !important;
                        font-weight: 800 !important;
                        letter-spacing: 0.5px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        box-shadow: 0 8px 32px rgba(110, 0, 255, 0.6) !important;
                        z-index: 2000 !important;
                        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)) !important;
                    }
                    .floating-waitlist-cta .button-text {
                        display: inline-block !important;
                        margin-right: 0.85rem !important;
                        font-size: 1.25rem !important;
                        font-weight: 800 !important;
                    }
                    .floating-waitlist-cta i {
                        font-size: 1.5rem !important;
                    }
                }

                /* Small mobile devices */
                @media (max-width: 360px) {
                    .modal-content {
                        padding: 1.25rem;
                    }

                    .modal h2 {
                        font-size: 1.35rem;
                    }

                    .waitlist-button {
                        padding: 0.625rem 0.875rem;
                        font-size: 0.875rem;
                    }

                    .form-group label {
                        font-size: 0.875rem;
                    }

                    .floating-waitlist-cta {
                        min-width: 140px !important;
                        min-height: 48px !important;
                        padding: 1rem 1.25rem !important;
                        font-size: 1.05rem !important;
                    }
                    .floating-waitlist-cta .button-text {
                        font-size: 1.05rem !important;
                    }
                }

                /* Landscape mode adjustments */
                @media (max-height: 500px) and (orientation: landscape) {
                    .modal-content {
                        max-height: 90vh;
                        padding: 1.25rem;
                    }

                    .modal h2 {
                        font-size: 1.35rem;
                        margin-bottom: 0.5rem;
                    }

                    .modal p {
                        margin-bottom: 1rem;
                    }

                    .waitlist-form {
                        gap: 0.75rem;
                    }

                    .form-group {
                        margin-bottom: 0.25rem;
                    }

                    .form-group input,
                    .form-group select {
                        padding: 0.625rem 0.875rem;
                    }

                    .floating-waitlist-cta {
                        bottom: 1.5rem;
                        right: 1.5rem;
                        padding: 0.875rem 1.25rem;
                        font-size: 0.95rem;
                    }
                }

                /* Ensure button is visible when keyboard is open on mobile */
                @media (max-height: 400px) {
                    .floating-waitlist-cta {
                        position: absolute;
                        bottom: 1rem;
                    }
                }
            `}</style>
        </>
    );
};

export default WaitlistCTA; 