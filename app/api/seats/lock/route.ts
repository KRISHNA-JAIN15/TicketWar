import { NextRequest, NextResponse } from 'next/server';
import { lockSeat, releaseSeat, getSeatStatus } from '@/lib/redis';
import { publishSeatLocked, publishSeatReleased, SeatLockedEvent, SeatReleasedEvent } from '@/lib/kafka';

// POST - Lock a seat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, seatId, userId } = body;

    if (!eventId || !seatId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await lockSeat(eventId, seatId, userId);

    if (result.success && result.lockExpiry) {
      // Publish to Kafka (fire and forget for better performance)
      const event: SeatLockedEvent = {
        eventId,
        seatId,
        userId,
        lockExpiry: result.lockExpiry,
        timestamp: Date.now(),
      };
      publishSeatLocked(event).catch(console.error);
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      lockExpiry: result.lockExpiry,
    });
  } catch (error) {
    console.error('Error in seat lock API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Release a seat
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const seatId = searchParams.get('seatId');
    const userId = searchParams.get('userId');

    if (!eventId || !seatId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await releaseSeat(eventId, seatId, userId);

    if (result.success) {
      // Publish to Kafka
      const event: SeatReleasedEvent = {
        eventId,
        seatId,
        userId,
        reason: 'user_cancelled',
        timestamp: Date.now(),
      };
      publishSeatReleased(event).catch(console.error);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in seat release API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get seat status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const seatId = searchParams.get('seatId');

    if (!eventId || !seatId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const status = await getSeatStatus(eventId, seatId);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error in seat status API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
