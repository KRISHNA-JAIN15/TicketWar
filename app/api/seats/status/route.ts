import { NextRequest, NextResponse } from 'next/server';
import { getAllSeatsStatus } from '@/lib/redis';
import { generateAllSeatIds } from '@/lib/types';

// GET - Get all seats status for an event
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Missing eventId' },
        { status: 400 }
      );
    }

    const allSeatIds = generateAllSeatIds();
    const seatsStatus = await getAllSeatsStatus(eventId, allSeatIds);

    return NextResponse.json({
      success: true,
      data: seatsStatus,
    });
  } catch (error) {
    console.error('Error in seats status API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
