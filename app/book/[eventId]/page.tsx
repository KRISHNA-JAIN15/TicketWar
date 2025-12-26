'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Navbar from '@/components/Navbar';
import StadiumMap from '@/components/StadiumMap';
import BookingPanel from '@/components/BookingPanel';
import TicketConfirmation from '@/components/TicketConfirmation';

// Fallback mock event data
const FALLBACK_EVENT_DATA: Record<string, EventInfo> = {
  'taylor-swift-eras': {
    id: 'taylor-swift-eras',
    name: 'Taylor Swift - The Eras Tour',
    artist: 'Taylor Swift',
    venue: 'SoFi Stadium, Los Angeles',
    date: 'March 15, 2025',
    time: '7:00 PM',
    image: '/events/taylor-swift.jpg',
  },
  'coldplay-music-spheres': {
    id: 'coldplay-music-spheres',
    name: 'Coldplay - Music of the Spheres',
    artist: 'Coldplay',
    venue: 'Wembley Stadium, London',
    date: 'April 20, 2025',
    time: '8:00 PM',
    image: '/events/coldplay.jpg',
  },
};

interface EventInfo {
  id: string;
  name: string;
  artist: string;
  venue: string;
  date: string;
  time: string;
  image?: string;
}

interface TicketData {
  ticketId: string;
  paymentId: string;
  seatId: string;
  row: string;
  seatNumber: number;
  price: number;
  eventName: string;
}

export default function BookingPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [userId] = useState(() => {
    // Get or create user ID from localStorage
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('ticketwar_user_id');
      if (!id) {
        id = uuidv4();
        localStorage.setItem('ticketwar_user_id', id);
      }
      return id;
    }
    return uuidv4();
  });

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [seatPrice, setSeatPrice] = useState<number>(0);
  const [lockExpiry, setLockExpiry] = useState<number | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState<TicketData | null>(null);
  const [event, setEvent] = useState<EventInfo>(
    FALLBACK_EVENT_DATA[eventId] || {
      id: eventId,
      name: 'Live Concert Event',
      artist: 'Various Artists',
      venue: 'Main Arena',
      date: 'TBD',
      time: 'TBD',
    }
  );

  // Fetch event details from MongoDB
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();
        if (data.success && data.event) {
          setEvent({
            id: data.event.id,
            name: data.event.name,
            artist: data.event.artist,
            venue: data.event.venue,
            date: data.event.date,
            time: data.event.time,
            image: data.event.image,
          });
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        // Keep fallback event data
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleSeatSelect = async (seatId: string, price: number) => {
    if (isLocking) return;

    // If clicking the same seat, deselect it
    if (selectedSeat === seatId) {
      return;
    }

    setIsLocking(true);

    try {
      // Release previous seat if any
      if (selectedSeat) {
        await fetch(
          `/api/seats/lock?eventId=${eventId}&seatId=${selectedSeat}&userId=${userId}`,
          { method: 'DELETE' }
        );
      }

      // Lock new seat
      const response = await fetch('/api/seats/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, seatId, userId }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedSeat(seatId);
        setSeatPrice(price);
        setLockExpiry(data.lockExpiry);
      } else {
        alert(data.message || 'Failed to lock seat');
      }
    } catch (error) {
      console.error('Error locking seat:', error);
      alert('Failed to lock seat. Please try again.');
    } finally {
      setIsLocking(false);
    }
  };

  const handleRelease = () => {
    setSelectedSeat(null);
    setSeatPrice(0);
    setLockExpiry(null);
  };

  const handlePaymentSuccess = (ticketData: unknown) => {
    setConfirmedTicket(ticketData as TicketData);
    setSelectedSeat(null);
    setSeatPrice(0);
    setLockExpiry(null);
  };

  const handleCloseConfirmation = () => {
    setConfirmedTicket(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <Navbar />

      {/* Event Header */}
      <div className="bg-[#ff5733] text-white relative overflow-hidden">
        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }, (_, i) => (
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="font-mono text-xs tracking-widest text-white/80 mb-2">
                {event.venue}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{event.name}</h1>
              <p className="text-xl text-white/90">
                {event.date} · {event.time}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 text-center">
                <p className="font-mono text-xs text-white/80">SEATS LEFT</p>
                <p className="text-2xl font-bold">2,847</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 text-center">
                <p className="font-mono text-xs text-white/80">LIVE USERS</p>
                <p className="text-2xl font-bold">12,453</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Info Banner */}
      <div className="bg-[#1a1a1a] text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#a8c5b5] rounded-full animate-pulse"></div>
              <span className="font-mono">REDIS ATOMIC LOCKS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#d4a853] rounded-full animate-pulse"></div>
              <span className="font-mono">KAFKA EVENT STREAMING</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#ff5733] rounded-full animate-pulse"></div>
              <span className="font-mono">NGINX LOAD BALANCED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stadium Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Select Your Seat</h2>
                {isLocking && (
                  <div className="flex items-center gap-2 text-[#ff5733]">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-medium">Locking seat...</span>
                  </div>
                )}
              </div>
              <StadiumMap
                eventId={eventId}
                userId={userId}
                onSeatSelect={handleSeatSelect}
                selectedSeat={selectedSeat}
              />
            </div>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingPanel
                eventId={eventId}
                eventName={event.name}
                eventVenue={event.venue}
                eventDate={event.date}
                eventTime={event.time}
                userId={userId}
                selectedSeat={selectedSeat}
                seatPrice={seatPrice}
                lockExpiry={lockExpiry}
                onRelease={handleRelease}
                onPaymentSuccess={handlePaymentSuccess}
              />

              {/* How It Works */}
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="font-mono text-xs tracking-widest text-gray-500 mb-4">HOW IT WORKS</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ff5733] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium text-sm">Click a Seat</p>
                      <p className="text-xs text-gray-500">Redis SETNX atomically locks it in &lt;1ms</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#a8c5b5] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium text-sm">10-Minute Timer</p>
                      <p className="text-xs text-gray-500">Complete payment before lock expires</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#d4a853] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium text-sm">Kafka Event</p>
                      <p className="text-xs text-gray-500">Sale published for async DB update</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Confirmation Modal */}
      {confirmedTicket && (
        <TicketConfirmation
          ticketData={confirmedTicket}
          onClose={handleCloseConfirmation}
        />
      )}
    </div>
  );
}
