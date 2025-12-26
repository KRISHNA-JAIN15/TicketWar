// Types for the Ticket-War booking system

export interface Event {
  id: string;
  name: string;
  artist: string;
  venue: string;
  date: string;
  time: string;
  image: string;
  description: string;
  totalSeats: number;
  availableSeats: number;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  section: string;
  price: number;
  status: 'available' | 'locked' | 'sold';
  lockedBy?: string;
  lockExpiry?: number;
  tier: 'vip' | 'premium' | 'standard' | 'economy';
}

export interface SeatSection {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  tier: 'vip' | 'premium' | 'standard' | 'economy';
  basePrice: number;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  seats: Seat[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  createdAt: number;
  expiresAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Stadium configuration
export const STADIUM_CONFIG = {
  sections: [
    { id: 'vip', name: 'VIP Floor', rows: 3, seatsPerRow: 20, tier: 'vip' as const, basePrice: 500 },
    { id: 'premium', name: 'Premium', rows: 5, seatsPerRow: 25, tier: 'premium' as const, basePrice: 300 },
    { id: 'standard', name: 'Standard', rows: 10, seatsPerRow: 30, tier: 'standard' as const, basePrice: 150 },
    { id: 'economy', name: 'Economy', rows: 8, seatsPerRow: 35, tier: 'economy' as const, basePrice: 75 },
  ],
};

// Generate seat ID
export function generateSeatId(section: string, row: string, number: number): string {
  return `${section}-${row}-${number}`;
}

// Parse seat ID
export function parseSeatId(seatId: string): { section: string; row: string; number: number } {
  const [section, row, number] = seatId.split('-');
  return { section, row, number: parseInt(number) };
}

// Generate all seat IDs for an event
export function generateAllSeatIds(): string[] {
  const seatIds: string[] = [];
  
  for (const section of STADIUM_CONFIG.sections) {
    for (let rowIndex = 0; rowIndex < section.rows; rowIndex++) {
      const rowLetter = String.fromCharCode(65 + rowIndex); // A, B, C, etc.
      for (let seatNum = 1; seatNum <= section.seatsPerRow; seatNum++) {
        seatIds.push(generateSeatId(section.id, rowLetter, seatNum));
      }
    }
  }
  
  return seatIds;
}

// Get seat price based on section and row
export function getSeatPrice(sectionId: string, rowIndex: number): number {
  const section = STADIUM_CONFIG.sections.find(s => s.id === sectionId);
  if (!section) return 100;
  
  // Front rows cost more
  const rowMultiplier = 1 + (section.rows - rowIndex - 1) * 0.1;
  return Math.round(section.basePrice * rowMultiplier);
}

// Get tier color
export function getTierColor(tier: string): string {
  switch (tier) {
    case 'vip': return '#d4a853';
    case 'premium': return '#a8c5b5';
    case 'standard': return '#ff5733';
    case 'economy': return '#9a9a9a';
    default: return '#1a1a1a';
  }
}
