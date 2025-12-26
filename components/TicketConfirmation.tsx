'use client';

interface TicketConfirmationProps {
  ticketData: {
    ticketId: string;
    paymentId: string;
    seatId: string;
    row: string;
    seatNumber: number;
    price: number;
    eventName: string;
  };
  onClose: () => void;
}

export default function TicketConfirmation({ ticketData, onClose }: TicketConfirmationProps) {
  const [section] = ticketData.seatId.split('-');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Success Header */}
        <div className="bg-[#a8c5b5] p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
            <svg className="w-10 h-10 text-[#a8c5b5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
          <p className="text-white/80">Your ticket has been secured</p>
        </div>

        {/* Ticket Details */}
        <div className="p-6">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 relative">
            {/* Ticket Punch Holes */}
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#f5f3ef] rounded-full"></div>
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#f5f3ef] rounded-full"></div>

            {/* Event Name */}
            <h3 className="text-xl font-bold text-center text-[#1a1a1a] mb-6">{ticketData.eventName}</h3>

            {/* Seat Info */}
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <p className="text-2xl font-bold text-[#ff5733]">{section.toUpperCase()}</p>
                <p className="text-xs text-gray-500 font-mono">SECTION</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a1a1a]">{ticketData.row}</p>
                <p className="text-xs text-gray-500 font-mono">ROW</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a1a1a]">{ticketData.seatNumber}</p>
                <p className="text-xs text-gray-500 font-mono">SEAT</p>
              </div>
            </div>

            {/* Barcode Simulation */}
            <div className="flex justify-center gap-[2px] mb-4">
              {Array.from({ length: 40 }, (_, i) => (
                <div
                  key={i}
                  className="bg-[#1a1a1a]"
                  style={{
                    width: Math.random() > 0.5 ? '2px' : '1px',
                    height: '40px',
                  }}
                />
              ))}
            </div>

            {/* Ticket ID */}
            <p className="text-center font-mono text-xs text-gray-500">
              {ticketData.ticketId.toUpperCase()}
            </p>
          </div>

          {/* Price */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <span className="text-gray-600">Total Paid</span>
            <span className="text-2xl font-bold text-[#1a1a1a]">
              ${ticketData.price + Math.round(ticketData.price * 0.1)}
            </span>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <button className="w-full py-3 bg-[#1a1a1a] text-white font-semibold rounded hover:bg-[#333] transition-colors">
              Download Ticket
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors"
            >
              Book Another Seat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
