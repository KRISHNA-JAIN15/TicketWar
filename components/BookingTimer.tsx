'use client';

import { useState, useEffect, useCallback } from 'react';

interface BookingTimerProps {
  expiryTime: number;
  onExpire: () => void;
}

export default function BookingTimer({ expiryTime, onExpire }: BookingTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const calculateTimeLeft = useCallback(() => {
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
    return remaining;
  }, [expiryTime]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / 600) * 100; // 600 seconds = 10 minutes

  const getColorClass = () => {
    if (timeLeft <= 60) return 'text-red-500';
    if (timeLeft <= 180) return 'text-yellow-500';
    return 'text-[#a8c5b5]';
  };

  const getStrokeColor = () => {
    if (timeLeft <= 60) return '#ef4444';
    if (timeLeft <= 180) return '#eab308';
    return '#a8c5b5';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke={getStrokeColor()}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={352} // 2 * π * 56
            strokeDashoffset={352 - (progress / 100) * 352}
            className="transition-all duration-1000"
          />
        </svg>
        
        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-mono font-bold ${getColorClass()}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500 mt-1">REMAINING</span>
        </div>
      </div>

      {/* Warning messages */}
      {timeLeft <= 60 && timeLeft > 0 && (
        <p className="text-red-500 text-sm font-medium mt-4 animate-pulse">
          ⚠️ Hurry! Your lock is expiring soon!
        </p>
      )}
      {timeLeft <= 180 && timeLeft > 60 && (
        <p className="text-yellow-600 text-sm mt-4">
          Less than 3 minutes remaining
        </p>
      )}
    </div>
  );
}
