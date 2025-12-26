'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';

interface TicketData {
  id: string;
  ticketId: string;
  eventName: string;
  eventVenue: string;
  eventDate: string;
  eventTime: string;
  eventSlug: string;
  seatId: string;
  section: string;
  row: string;
  seatNumber: number;
  price: number;
  serviceFee: number;
  totalPaid: number;
  status: string;
  purchasedAt: string;
}

export default function MyTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/my-tickets');
      return;
    }

    fetchTickets();
  }, [session, status, router]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      const data = await response.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f3ef]">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff5733]"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">My Tickets</h1>
          <p className="text-gray-600 mt-1">View and download your purchased tickets</p>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-2">No tickets yet</h2>
            <p className="text-gray-500 mb-6">You haven&apos;t purchased any tickets yet.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#ff5733] text-white font-semibold rounded-lg hover:bg-[#e64d2e] transition-colors"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Ticket Color Bar */}
                  <div className="w-full md:w-2 bg-[#ff5733]"></div>
                  
                  {/* Ticket Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#1a1a1a]">{ticket.eventName}</h3>
                        <p className="text-gray-500 text-sm mt-1">{ticket.eventVenue}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {ticket.eventDate}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {ticket.eventTime}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        {/* Seat Info */}
                        <div className="flex gap-4 text-center">
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Section</p>
                            <p className="text-lg font-bold text-[#ff5733]">{ticket.section.toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Row</p>
                            <p className="text-lg font-bold text-[#1a1a1a]">{ticket.row}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Seat</p>
                            <p className="text-lg font-bold text-[#1a1a1a]">{ticket.seatNumber}</p>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            ticket.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : ticket.status === 'used'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Bottom Section */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="text-sm text-gray-500">
                        <span>Ticket ID: </span>
                        <span className="font-mono">{ticket.ticketId.slice(0, 8).toUpperCase()}</span>
                        <span className="mx-2">•</span>
                        <span>Purchased {new Date(ticket.purchasedAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-[#1a1a1a]">${ticket.totalPaid}</span>
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="px-4 py-2 bg-[#1a1a1a] text-white font-medium rounded-lg hover:bg-[#333] transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          View Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}

interface TicketModalProps {
  ticket: TicketData;
  onClose: () => void;
}

function TicketModal({ ticket, onClose }: TicketModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ticketRef.current) return;

    try {
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `ticket-${ticket.ticketId.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating ticket image:', error);
      // Fallback: Print window
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-[#1a1a1a]">Your Ticket</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ticket Content */}
        <div ref={ticketRef} className="p-6 bg-white">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#a8c5b5] flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">TICKET CONFIRMED</p>
          </div>

          {/* Ticket Visual */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 relative">
            {/* Punch Holes */}
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-gray-200"></div>
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-gray-200"></div>

            {/* Event Info */}
            <h3 className="text-xl font-bold text-center text-[#1a1a1a] mb-1">{ticket.eventName}</h3>
            <p className="text-center text-gray-500 text-sm mb-4">{ticket.eventVenue}</p>

            {/* Date/Time */}
            <div className="flex justify-center gap-6 text-center mb-6">
              <div>
                <p className="text-sm text-gray-500">DATE</p>
                <p className="font-semibold text-[#1a1a1a]">{ticket.eventDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">TIME</p>
                <p className="font-semibold text-[#1a1a1a]">{ticket.eventTime}</p>
              </div>
            </div>

            {/* Seat Info */}
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-[#ff5733]">{ticket.section.toUpperCase()}</p>
                <p className="text-xs text-gray-500 font-mono">SECTION</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-[#1a1a1a]">{ticket.row}</p>
                <p className="text-xs text-gray-500 font-mono">ROW</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-[#1a1a1a]">{ticket.seatNumber}</p>
                <p className="text-xs text-gray-500 font-mono">SEAT</p>
              </div>
            </div>

            {/* Barcode */}
            <div className="flex justify-center gap-[2px] mb-3">
              {Array.from({ length: 50 }, (_, i) => (
                <div
                  key={i}
                  className="bg-[#1a1a1a]"
                  style={{
                    width: ((i * 7) % 3) + 1 + 'px',
                    height: '50px',
                  }}
                />
              ))}
            </div>

            {/* Ticket ID */}
            <p className="text-center font-mono text-xs text-gray-500">
              {ticket.ticketId.toUpperCase()}
            </p>
          </div>

          {/* Price Summary */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Ticket Price</span>
              <span>${ticket.price}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Service Fee</span>
              <span>${ticket.serviceFee}</span>
            </div>
            <div className="flex justify-between font-bold text-[#1a1a1a]">
              <span>Total Paid</span>
              <span>${ticket.totalPaid}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-3 bg-[#1a1a1a] text-white font-semibold rounded-lg hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
