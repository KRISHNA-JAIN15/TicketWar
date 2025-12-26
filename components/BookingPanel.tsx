'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import BookingTimer from './BookingTimer';

interface BookingPanelProps {
  eventId: string;
  eventName: string;
  eventVenue?: string;
  eventDate?: string;
  eventTime?: string;
  userId: string;
  selectedSeat: string | null;
  seatPrice: number;
  lockExpiry: number | null;
  onRelease: () => void;
  onPaymentSuccess: (ticketData: unknown) => void;
}

export default function BookingPanel({
  eventId,
  eventName,
  eventVenue,
  eventDate,
  eventTime,
  userId,
  selectedSeat,
  seatPrice,
  lockExpiry,
  onRelease,
  onPaymentSuccess,
}: BookingPanelProps) {
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment'>('details');
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  const handleExpire = async () => {
    alert('Your seat lock has expired. Please select a new seat.');
    onRelease();
  };

  const handleRelease = async () => {
    if (!selectedSeat) return;

    try {
      const response = await fetch(
        `/api/seats/lock?eventId=${eventId}&seatId=${selectedSeat}&userId=${userId}`,
        { method: 'DELETE' }
      );
      const data = await response.json();
      if (data.success) {
        onRelease();
      }
    } catch (error) {
      console.error('Error releasing seat:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedSeat) return;

    // Check if user is logged in
    if (!session) {
      alert('Please sign in to purchase tickets');
      return;
    }

    setIsProcessing(true);
    try {
      // First, call the original payment API to process with Redis
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          seatId: selectedSeat,
          userId,
          eventName,
        }),
      });

      const paymentData = await paymentResponse.json();
      if (!paymentData.success) {
        alert(paymentData.error || 'Payment failed');
        return;
      }

      // Then, create the ticket in MongoDB
      const seatParts = selectedSeat.split('-');
      const ticketResponse = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          eventSlug: eventId,
          seatId: selectedSeat,
          section: seatParts[0],
          row: seatParts[1],
          seatNumber: parseInt(seatParts[2]),
          price: seatPrice,
          paymentId: paymentData.data.paymentId,
          eventName,
          eventVenue: eventVenue || 'Main Arena',
          eventDate: eventDate || 'TBD',
          eventTime: eventTime || 'TBD',
        }),
      });

      const ticketData = await ticketResponse.json();
      if (ticketData.success) {
        onPaymentSuccess({
          ...paymentData.data,
          ticketId: ticketData.ticket.ticketId,
        });
      } else {
        // Payment succeeded but ticket creation failed - still show success
        // The ticket exists in Redis, just not in MongoDB
        onPaymentSuccess(paymentData.data);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSeatId = (seatId: string) => {
    const [section, row, number] = seatId.split('-');
    return {
      section: section.charAt(0).toUpperCase() + section.slice(1),
      row,
      number,
    };
  };

  if (!selectedSeat || !lockExpiry) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Seat</h3>
          <p className="text-gray-500 text-sm">
            Click on an available seat in the stadium map to begin booking
          </p>
        </div>
      </div>
    );
  }

  const seatInfo = formatSeatId(selectedSeat);
  const serviceFee = Math.round(seatPrice * 0.1);
  const totalPrice = seatPrice + serviceFee;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a1a1a] text-white p-4">
        <h3 className="font-mono text-xs tracking-widest mb-1">SEAT LOCKED</h3>
        <p className="text-lg font-semibold">{eventName}</p>
      </div>

      {/* Timer */}
      <div className="p-6 border-b border-gray-100">
        <BookingTimer expiryTime={lockExpiry} onExpire={handleExpire} />
      </div>

      {/* Seat Details */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="font-mono text-xs tracking-widest text-gray-500 mb-4">SEAT DETAILS</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#ff5733]">{seatInfo.section}</p>
            <p className="text-xs text-gray-500 mt-1">SECTION</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1a1a1a]">{seatInfo.row}</p>
            <p className="text-xs text-gray-500 mt-1">ROW</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1a1a1a]">{seatInfo.number}</p>
            <p className="text-xs text-gray-500 mt-1">SEAT</p>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="font-mono text-xs tracking-widest text-gray-500 mb-4">PRICE BREAKDOWN</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Ticket Price</span>
            <span className="font-medium">${seatPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service Fee</span>
            <span className="font-medium">${serviceFee}</span>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-[#ff5733]">${totalPrice}</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      {paymentStep === 'payment' && (
        <div className="p-6 border-b border-gray-100">
          <h4 className="font-mono text-xs tracking-widest text-gray-500 mb-4">PAYMENT DETAILS</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input
                type="text"
                placeholder="4242 4242 4242 4242"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#ff5733] focus:border-transparent"
                value={cardInfo.number}
                onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#ff5733] focus:border-transparent"
                  value={cardInfo.expiry}
                  onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#ff5733] focus:border-transparent"
                  value={cardInfo.cvv}
                  onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#ff5733] focus:border-transparent"
                value={cardInfo.name}
                onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-6 space-y-3">
        {status === 'loading' ? (
          <div className="py-3 bg-gray-100 text-gray-500 font-medium rounded text-center">
            Loading...
          </div>
        ) : !session ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center">Sign in to complete your purchase</p>
            <Link
              href={`/auth/signin?callbackUrl=/book/${eventId}`}
              className="block w-full py-3 bg-[#ff5733] text-white font-semibold rounded hover:bg-[#e64a2e] transition-colors text-center"
            >
              Sign In to Purchase
            </Link>
            <Link
              href={`/auth/signup?callbackUrl=/book/${eventId}`}
              className="block w-full py-3 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors text-center"
            >
              Create Account
            </Link>
          </div>
        ) : (
          <>
            {paymentStep === 'details' ? (
              <button
                onClick={() => setPaymentStep('payment')}
                className="w-full py-3 bg-[#ff5733] text-white font-semibold rounded hover:bg-[#e64a2e] transition-colors btn-primary"
              >
                Continue to Payment
              </button>
            ) : (
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-3 bg-[#ff5733] text-white font-semibold rounded hover:bg-[#e64a2e] transition-colors btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay $${totalPrice}`
                )}
              </button>
            )}
            <button
              onClick={handleRelease}
              className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors"
            >
              Release Seat
            </button>
          </>
        )}
      </div>
    </div>
  );
}
