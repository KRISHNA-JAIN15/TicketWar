'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

// Fallback mock events data
const FALLBACK_EVENTS = [
  {
    id: 'taylor-swift-eras',
    name: 'Taylor Swift - The Eras Tour',
    artist: 'Taylor Swift',
    venue: 'SoFi Stadium, Los Angeles',
    date: 'March 15, 2025',
    time: '7:00 PM',
    image: '/events/taylor-swift.jpg',
    color: '#ff5733',
    seatsLeft: 2847,
    priceFrom: 75,
  },
  {
    id: 'coldplay-music-spheres',
    name: 'Coldplay - Music of the Spheres',
    artist: 'Coldplay',
    venue: 'Wembley Stadium, London',
    date: 'April 20, 2025',
    time: '8:00 PM',
    image: '/events/coldplay.jpg',
    color: '#1a1a1a',
    seatsLeft: 1523,
    priceFrom: 85,
  },
  {
    id: 'beyonce-renaissance',
    name: 'Beyoncé - Renaissance World Tour',
    artist: 'Beyoncé',
    venue: 'MetLife Stadium, NJ',
    date: 'May 10, 2025',
    time: '8:00 PM',
    image: '/events/beyonce.jpg',
    color: '#d4a853',
    seatsLeft: 3201,
    priceFrom: 95,
  },
  {
    id: 'ed-sheeran-mathematics',
    name: 'Ed Sheeran - Mathematics Tour',
    artist: 'Ed Sheeran',
    venue: 'AT&T Stadium, Dallas',
    date: 'June 5, 2025',
    time: '7:30 PM',
    image: '/events/ed-sheeran.jpg',
    color: '#a8c5b5',
    seatsLeft: 4102,
    priceFrom: 65,
  },
];

interface EventData {
  id: string;
  slug?: string;
  name: string;
  artist: string;
  venue: string;
  date: string;
  time: string;
  image: string;
  color: string;
  seatsLeft: number;
  priceFrom: number;
}

const TRUSTED_BRANDS = [
  'Live Nation', 'Ticketmaster', 'AXS', 'SeatGeek', 'StubHub', 'Eventbrite'
];

export default function Home() {
  const [events, setEvents] = useState<EventData[]>(FALLBACK_EVENTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events', { cache: 'no-store' });
        const data = await response.json();
        if (data.success && data.events.length > 0) {
          setEvents(data.events);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Keep fallback events on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#ff5733] overflow-hidden">
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                CONCERT<br />
                TICKETS<br />
                ON AUTOPILOT.
                <span className="text-2xl align-top ml-2">™</span>
              </h1>
            </div>
            <div className="flex justify-center lg:justify-end gap-4">
              {/* Icons similar to RetailPath */}
              <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-white rounded-lg flex items-center justify-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-white rounded-lg flex items-center justify-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-white rounded-lg flex items-center justify-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="bg-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-sm tracking-wide text-[#1a1a1a]">
              SURVIVE 100,000+ CONCURRENT USERS WITH REDIS ATOMIC LOCKS.
            </p>
            <Link 
              href="/book/taylor-swift-eras"
              className="px-6 py-2 bg-[#1a1a1a] text-white font-medium rounded hover:bg-[#333] transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs tracking-widest text-gray-500 text-center mb-6">
            TRUSTED BY LEADING EVENT PLATFORMS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {TRUSTED_BRANDS.map((brand) => (
              <span key={brand} className="text-xl font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-4">
                Book Instantly.<br />
                Eliminate Race Conditions.
              </h2>
              <p className="text-lg text-gray-600">
                TicketWar uses Redis atomic transactions and Kafka event streaming 
                to handle massive traffic spikes. Never lose a ticket to database crashes again.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#e8e4dc] rounded-lg p-4 text-center">
                <p className="font-mono text-xs text-gray-500 mb-2">3PL PROVIDER</p>
              </div>
              <div className="bg-[#e8e4dc] rounded-lg p-4 text-center">
                <p className="font-mono text-xs text-gray-500 mb-2">EDI CONNECTION</p>
              </div>
              <div className="bg-[#e8e4dc] rounded-lg p-4 text-center">
                <p className="font-mono text-xs text-gray-500 mb-2">VENUE PORTAL</p>
              </div>
            </div>
          </div>

          {/* Architecture Diagram */}
          <div className="mt-12 bg-[#1a1a1a] rounded-xl p-8 text-white">
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 border border-white/30 rounded flex items-center justify-center">
                  <span className="font-bold text-lg">T</span>
                </div>
                <span className="font-semibold">TicketWar</span>
              </div>
              <div className="flex items-center gap-3 border border-[#a8c5b5] rounded-lg px-4 py-3">
                <svg className="w-6 h-6 text-[#a8c5b5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <div>
                  <p className="text-xs text-[#a8c5b5]">REDIS</p>
                  <p className="text-sm font-semibold">ATOMIC LOCKS</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border border-[#d4a853] rounded-lg px-4 py-3">
                <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-[#d4a853]">KAFKA</p>
                  <p className="text-sm font-semibold">EVENT STREAMING</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border border-[#ff5733] rounded-lg px-4 py-3">
                <svg className="w-6 h-6 text-[#ff5733]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-xs text-[#ff5733]">NGINX</p>
                  <p className="text-sm font-semibold">LOAD BALANCING</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-mono text-xs tracking-widest text-gray-500 mb-2">UPCOMING EVENTS</p>
              <h2 className="text-3xl font-bold text-[#1a1a1a]">Hot Tickets</h2>
            </div>
            <Link href="/events" className="text-[#ff5733] font-medium hover:underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-gray-200 animate-pulse h-64" />
              ))
            ) : (
              events.slice(0, 4).map((event) => (
              <Link
                key={event.id}
                href={`/book/${event.slug || event.id}`}
                className="group relative rounded-xl overflow-hidden feature-card"
                style={{ backgroundColor: event.color }}
              >
                {/* Particles */}
                <div className="absolute inset-0 overflow-hidden">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className="particle"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 p-8 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-xs tracking-widest opacity-80 mb-2">
                        {event.venue}
                      </p>
                      <h3 className="text-2xl font-bold mb-2">{event.artist}</h3>
                      <p className="opacity-80">{event.date} · {event.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs opacity-80">FROM</p>
                      <p className="text-3xl font-bold">${event.priceFrom}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-sm">{event.seatsLeft.toLocaleString()} seats left</span>
                    </div>
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded text-sm font-medium group-hover:bg-white group-hover:text-[#1a1a1a] transition-colors">
                      Book Now
                    </span>
                  </div>
                </div>
              </Link>
            ))
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs tracking-widest text-gray-500 mb-8">
            SEE HOW FAST WE ARE
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Revenue Circles */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="w-24 h-24 rounded-full bg-[#d4a853] flex items-center justify-center text-white font-bold">
                &lt;1ms
              </div>
              <div className="w-20 h-20 rounded-full bg-[#e8e4dc] flex items-center justify-center text-[#1a1a1a] font-bold text-sm">
                100k+
              </div>
              <div className="w-28 h-28 rounded-full bg-[#e8e4dc] flex items-center justify-center text-[#1a1a1a] font-bold">
                99.99%
              </div>
              <div className="w-24 h-24 rounded-full bg-[#e8e4dc] flex items-center justify-center text-[#1a1a1a] font-bold text-sm">
                Zero DB
              </div>
            </div>

            {/* Stats Display */}
            <div className="border border-gray-200 rounded-lg p-8 bg-white">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-500 text-sm mb-2">Seat Lock Time</p>
                  <p className="text-5xl font-bold font-mono text-[#1a1a1a]">&lt;1ms</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-2">Concurrent Users</p>
                  <p className="text-5xl font-bold font-mono text-[#1a1a1a]">100k+</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-[#a8c5b5] rounded-lg p-6">
              <svg className="w-8 h-8 mb-4 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="font-semibold text-[#1a1a1a]">No race conditions,</p>
              <p className="font-semibold text-[#1a1a1a]">guaranteed</p>
            </div>
            <div className="bg-[#d4a853] rounded-lg p-6">
              <svg className="w-8 h-8 mb-4 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold text-[#1a1a1a]">Zero database</p>
              <p className="font-semibold text-[#1a1a1a]">crashes</p>
            </div>
            <div className="bg-[#e8e4dc] rounded-lg p-6">
              <svg className="w-8 h-8 mb-4 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-semibold text-[#1a1a1a]">10-minute</p>
              <p className="font-semibold text-[#1a1a1a]">lock timer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-mono text-xs tracking-widest text-gray-500 mb-8">
            WHAT OUR CLIENTS ARE SAYING
          </p>

          <blockquote className="text-2xl md:text-3xl font-semibold text-[#1a1a1a] leading-relaxed">
            &ldquo;TicketWar turned a nightmare scenario into something we don&apos;t even have to think about. 
            <span className="text-[#ff5733]">We&apos;re handling 100x our previous traffic</span> and our 
            team hasn&apos;t seen a single database crash since launch.&rdquo;
          </blockquote>

          <div className="mt-8">
            <div className="w-1 h-12 bg-[#ff5733] mx-auto mb-4"></div>
            <p className="font-mono text-sm text-gray-500">SARAH CHEN, CTO AT MEGAVENUE</p>
            <p className="font-semibold text-[#1a1a1a]">MegaVenue</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Growth Plan */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 feature-card">
              <div className="w-16 h-16 border-2 border-[#ff5733] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#ff5733]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">Growth</h3>
              <p className="text-gray-500 mb-6">Everything to handle flash sales</p>
              <hr className="mb-6" />
              <ul className="space-y-3 text-[#1a1a1a]">
                <li>Redis atomic locks</li>
                <li>Kafka event streaming</li>
                <li>Nginx load balancing</li>
                <li>Real-time seat maps</li>
                <li>10-minute lock timer</li>
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[#1a1a1a] rounded-xl p-8 text-white feature-card">
              <div className="w-16 h-16 border-2 border-[#d4a853] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-gray-400 mb-6">Everything in Growth plus</p>
              <hr className="border-gray-700 mb-6" />
              <ul className="space-y-3">
                <li className="text-[#d4a853]">Custom capacity planning</li>
                <li className="text-[#d4a853]">Multi-region deployment</li>
                <li className="text-[#d4a853]">Dedicated support</li>
                <li className="text-[#d4a853]">Custom integrations</li>
                <li className="text-[#d4a853]">SLA guarantees</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#ff5733] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Transform your ticket booking experience.
          </h2>
          <Link
            href="/book/taylor-swift-eras"
            className="px-8 py-3 bg-[#1a1a1a] text-white font-semibold rounded hover:bg-[#333] transition-colors whitespace-nowrap"
          >
            Get started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#ff5733] rounded flex items-center justify-center">
                  <span className="font-bold text-lg">T</span>
                </div>
                <span className="font-semibold text-xl">TicketWar</span>
              </div>
              <p className="text-gray-400 text-sm">
                Flash-sale booking system built for massive traffic.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white">How it Works</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Architecture</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Redis (Upstash)</li>
                <li>Kafka (AWS EC2)</li>
                <li>Nginx Load Balancer</li>
                <li>Next.js</li>
              </ul>
            </div>
          </div>
          <hr className="border-gray-800 my-8" />
          <p className="text-gray-500 text-sm text-center">
            © 2025 TicketWar. Built for surviving Taylor Swift ticket sales.
          </p>
        </div>
      </footer>
    </div>
  );
}
