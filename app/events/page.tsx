'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

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
  totalSeats?: number;
  priceFrom: number;
  description?: string;
}

// Fallback mock events
const FALLBACK_EVENTS: EventData[] = [
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

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVenue, setFilterVenue] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events', { cache: 'no-store' });
        const data = await response.json();
        if (data.success && data.events.length > 0) {
          setEvents(data.events);
        } else {
          setEvents(FALLBACK_EVENTS);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents(FALLBACK_EVENTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Get unique venues for filter
  const venues = [...new Set(events.map(e => e.venue))];

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVenue = filterVenue === 'all' || event.venue === filterVenue;
    return matchesSearch && matchesVenue;
  });

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#1a1a1a] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="font-mono text-xs tracking-widest text-[#ff5733] mb-4">UPCOMING EVENTS</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">All Events</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Browse all upcoming concerts and events. Book your tickets now before they sell out!
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search events, artists, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5733] focus:border-transparent"
              />
            </div>

            {/* Venue Filter */}
            <div className="flex items-center gap-4">
              <select
                value={filterVenue}
                onChange={(e) => setFilterVenue(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5733] bg-white"
              >
                <option value="all">All Venues</option>
                {venues.map(venue => (
                  <option key={venue} value={venue}>{venue}</option>
                ))}
              </select>
              
              <p className="text-sm text-gray-500">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-gray-200 animate-pulse h-72" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/book/${event.slug || event.id}`}
                  className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Event Card */}
                  <div 
                    className="relative h-72 p-6 flex flex-col justify-between"
                    style={{ backgroundColor: event.color }}
                  >
                    {/* Particles Effect */}
                    <div className="absolute inset-0 overflow-hidden opacity-30">
                      {Array.from({ length: 15 }, (_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                          style={{
                            left: `${(i * 17) % 100}%`,
                            top: `${(i * 23) % 100}%`,
                            animationDelay: `${i * 0.2}s`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <p className="font-mono text-xs tracking-widest text-white/70 mb-2">
                        {event.venue}
                      </p>
                      <h3 className="text-2xl font-bold text-white mb-1">{event.artist}</h3>
                      <p className="text-white/80">{event.date} · {event.time}</p>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-6 right-6 text-right">
                      <p className="font-mono text-xs text-white/70">FROM</p>
                      <p className="text-3xl font-bold text-white">${event.priceFrom}</p>
                    </div>

                    {/* Bottom Info */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm text-white">{event.seatsLeft.toLocaleString()} seats left</span>
                      </div>
                      <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded text-sm font-medium text-white group-hover:bg-white group-hover:text-[#1a1a1a] transition-colors">
                        Book Now
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#ff5733] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Don&apos;t miss out on your favorite artists!
          </h2>
          <p className="text-white/80 mb-6">
            Our Redis-powered booking system ensures you&apos;ll never lose a ticket to race conditions.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white font-mono text-sm">&lt;1ms LOCK TIME</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white font-mono text-sm">100K+ CONCURRENT</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white font-mono text-sm">99.99% UPTIME</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#ff5733] rounded flex items-center justify-center">
              <span className="font-bold text-lg">T</span>
            </div>
            <span className="font-semibold text-xl">TicketWar</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 TicketWar. Built for surviving flash sales.
          </p>
        </div>
      </footer>
    </div>
  );
}
