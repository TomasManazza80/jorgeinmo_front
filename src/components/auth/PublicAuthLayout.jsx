import React from 'react';
import { Link } from 'react-router-dom';

export function PublicAuthLayout({ children }) {
    return (
        <div className="theme-public dark min-h-screen relative flex items-center justify-center bg-black text-foreground font-sans selection:bg-[#C7A15E]/30 selection:text-white">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/hero-property.jpg"
                    alt="Background"
                    className="w-full h-full object-cover object-center opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            {/* Header/Logo Overlay */}
            <header className="absolute top-0 left-0 right-0 z-50 py-6 px-6">
                <Link to="/" className="flex items-center gap-4 group w-fit">
                    <img
                        src="/images/logo.png"
                        alt="Logo"
                        width={100}
                        height={100}
                        className="h-12 md:h-14 w-auto object-contain transition-all duration-300"
                    />
                    <div className="hidden sm:flex flex-col justify-center">
                        <span className="text-xl font-bold tracking-widest text-white transition-colors duration-300">
                        JORGE A. PIGHIN
                        </span>
                        <span className="w-full h-[2px] bg-[#C7A15E] mt-1 transition-all duration-300"></span>
                    </div>
                </Link>
            </header>

            {/* Content (Card) */}
            <main className="relative z-10 w-full max-w-md px-4 mt-16 md:mt-0">
                <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-[#C7A15E]/30">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default PublicAuthLayout;
