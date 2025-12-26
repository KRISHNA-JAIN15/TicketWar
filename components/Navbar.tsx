'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ff5733] rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-semibold text-xl text-[#1a1a1a]">TicketWar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-[#1a1a1a] hover:text-[#ff5733] transition-colors font-medium">
              Events
            </Link>
            <Link href="/how-it-works" className="text-[#1a1a1a] hover:text-[#ff5733] transition-colors font-medium">
              How it Works
            </Link>
            <Link href="/pricing" className="text-[#1a1a1a] hover:text-[#ff5733] transition-colors font-medium">
              Pricing
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 text-[#1a1a1a] font-medium hover:text-[#ff5733] transition-colors">
              Sign in
            </button>
            <button className="px-5 py-2 bg-[#1a1a1a] text-white rounded font-medium hover:bg-[#333] transition-colors">
              Get started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-[#1a1a1a] font-medium">Events</Link>
              <Link href="/how-it-works" className="text-[#1a1a1a] font-medium">How it Works</Link>
              <Link href="/pricing" className="text-[#1a1a1a] font-medium">Pricing</Link>
              <hr className="border-gray-200" />
              <button className="text-left text-[#1a1a1a] font-medium">Sign in</button>
              <button className="px-5 py-2 bg-[#1a1a1a] text-white rounded font-medium w-fit">
                Get started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
