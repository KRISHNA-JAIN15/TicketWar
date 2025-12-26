'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const isAdmin = session?.user?.role === 'admin';

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
            <Link href="/events" className="text-[#1a1a1a] hover:text-[#ff5733] transition-colors font-medium">
              Events
            </Link>
            {session && (
              <Link href="/my-tickets" className="text-[#1a1a1a] hover:text-[#ff5733] transition-colors font-medium">
                My Tickets
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-[#1a1a1a] hover:text-[#ff5733] transition-colors font-medium">
                Admin
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#ff5733] rounded-full flex items-center justify-center text-white font-semibold">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium text-[#1a1a1a]">{session.user?.name}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-[#1a1a1a]">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[#ff5733] text-white text-xs rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <Link
                      href="/my-tickets"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Tickets
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/signin" className="px-4 py-2 text-[#1a1a1a] font-medium hover:text-[#ff5733] transition-colors">
                  Sign in
                </Link>
                <Link href="/auth/signup" className="px-5 py-2 bg-[#1a1a1a] text-white rounded font-medium hover:bg-[#333] transition-colors">
                  Get started
                </Link>
              </>
            )}
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
              {session && (
                <Link href="/my-tickets" className="text-[#1a1a1a] font-medium">My Tickets</Link>
              )}
              {isAdmin && (
                <Link href="/admin" className="text-[#1a1a1a] font-medium">Admin Dashboard</Link>
              )}
              <hr className="border-gray-200" />
              {session ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#ff5733] rounded-full flex items-center justify-center text-white font-semibold">
                      {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-[#1a1a1a]">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="text-left text-red-600 font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-[#1a1a1a] font-medium">Sign in</Link>
                  <Link href="/auth/signup" className="px-5 py-2 bg-[#1a1a1a] text-white rounded font-medium w-fit">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
