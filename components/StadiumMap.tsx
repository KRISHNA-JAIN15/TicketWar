'use client';

import { useState, useEffect, useCallback } from 'react';
import { STADIUM_CONFIG, generateSeatId, getSeatPrice, getTierColor } from '@/lib/types';

interface SeatStatus {
  status: 'available' | 'locked' | 'sold';
  lockedBy?: string;
  ttl?: number;
}

interface StadiumMapProps {
  eventId: string;
  userId: string;
  onSeatSelect: (seatId: string, price: number) => void;
  selectedSeat: string | null;
}

export default function StadiumMap({ eventId, userId, onSeatSelect, selectedSeat }: StadiumMapProps) {
  const [seatsStatus, setSeatsStatus] = useState<Record<string, SeatStatus>>({});
  const [loading, setLoading] = useState(true);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  const fetchSeatsStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/seats/status?eventId=${eventId}`);
      const data = await response.json();
      if (data.success) {
        setSeatsStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching seats status:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchSeatsStatus();
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchSeatsStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchSeatsStatus]);

  const getSeatStatusClass = (seatId: string, tier: string) => {
    const status = seatsStatus[seatId]?.status || 'available';
    const isSelected = selectedSeat === seatId;
    const isOwnLock = seatsStatus[seatId]?.lockedBy === userId;

    if (status === 'sold') {
      return 'bg-gray-400 cursor-not-allowed';
    }
    if (status === 'locked' && !isOwnLock) {
      return 'bg-yellow-500 cursor-not-allowed opacity-60';
    }
    if (isSelected || (status === 'locked' && isOwnLock)) {
      return `bg-[${getTierColor(tier)}] ring-2 ring-[#1a1a1a] seat-locked cursor-pointer`;
    }
    return `bg-[${getTierColor(tier)}] hover:opacity-80 cursor-pointer seat-available`;
  };

  const handleSeatClick = (seatId: string, section: string, rowIndex: number) => {
    const status = seatsStatus[seatId]?.status || 'available';
    const isOwnLock = seatsStatus[seatId]?.lockedBy === userId;

    if (status === 'sold') return;
    if (status === 'locked' && !isOwnLock) return;

    const price = getSeatPrice(section, rowIndex);
    onSeatSelect(seatId, price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#ff5733] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-sm text-gray-600">LOADING STADIUM MAP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Stage */}
      <div className="flex justify-center mb-8">
        <div className="bg-[#1a1a1a] text-white px-16 py-4 rounded-b-full">
          <span className="font-mono text-sm tracking-widest">STAGE</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        {STADIUM_CONFIG.sections.map((section) => (
          <div key={section.id} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getTierColor(section.tier) }}
            />
            <span className="text-sm font-medium">{section.name}</span>
            <span className="text-sm text-gray-500">(${section.basePrice}+)</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-400" />
          <span className="text-sm font-medium">Sold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500 opacity-60" />
          <span className="text-sm font-medium">Locked</span>
        </div>
      </div>

      {/* Seat Sections */}
      <div className="space-y-8">
        {STADIUM_CONFIG.sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="font-mono text-xs tracking-widest text-gray-500 mb-4 text-center">
              {section.name.toUpperCase()}
            </h3>
            <div className="space-y-2">
              {Array.from({ length: section.rows }, (_, rowIndex) => {
                const rowLetter = String.fromCharCode(65 + rowIndex);
                return (
                  <div key={rowLetter} className="flex items-center justify-center gap-1">
                    <span className="w-6 text-xs font-mono text-gray-400 text-right mr-2">
                      {rowLetter}
                    </span>
                    <div className="flex gap-1 flex-wrap justify-center">
                      {Array.from({ length: section.seatsPerRow }, (_, seatIndex) => {
                        const seatNum = seatIndex + 1;
                        const seatId = generateSeatId(section.id, rowLetter, seatNum);
                        const status = seatsStatus[seatId]?.status || 'available';
                        const isSelected = selectedSeat === seatId;
                        const isOwnLock = seatsStatus[seatId]?.lockedBy === userId;
                        const price = getSeatPrice(section.id, rowIndex);

                        let bgColor = getTierColor(section.tier);
                        let opacity = 1;
                        let cursor = 'cursor-pointer';
                        let extraClass = '';

                        if (status === 'sold') {
                          bgColor = '#9ca3af';
                          cursor = 'cursor-not-allowed';
                        } else if (status === 'locked' && !isOwnLock) {
                          bgColor = '#eab308';
                          opacity = 0.6;
                          cursor = 'cursor-not-allowed';
                        } else if (isSelected || (status === 'locked' && isOwnLock)) {
                          extraClass = 'ring-2 ring-[#1a1a1a] seat-locked';
                        }

                        return (
                          <button
                            key={seatId}
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-sm transition-all ${cursor} ${extraClass} hover:scale-110`}
                            style={{ 
                              backgroundColor: bgColor, 
                              opacity,
                            }}
                            onClick={() => handleSeatClick(seatId, section.id, rowIndex)}
                            onMouseEnter={() => setHoveredSeat(seatId)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            disabled={status === 'sold' || (status === 'locked' && !isOwnLock)}
                            title={`Row ${rowLetter}, Seat ${seatNum} - $${price}`}
                          />
                        );
                      })}
                    </div>
                    <span className="w-6 text-xs font-mono text-gray-400 text-left ml-2">
                      {rowLetter}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredSeat && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] text-white px-4 py-2 rounded shadow-lg z-50">
          <p className="font-mono text-sm">
            {hoveredSeat.replace(/-/g, ' · ').toUpperCase()} - 
            ${getSeatPrice(
              hoveredSeat.split('-')[0], 
              hoveredSeat.split('-')[1].charCodeAt(0) - 65
            )}
          </p>
        </div>
      )}
    </div>
  );
}
