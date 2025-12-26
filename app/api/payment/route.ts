import { NextRequest, NextResponse } from 'next/server';
import { markSeatSold, getSeatStatus } from '@/lib/redis';
import { publishTicketSold, publishPaymentProcessed, TicketSoldEvent, PaymentProcessedEvent } from '@/lib/kafka';
import { parseSeatId, getSeatPrice } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// POST - Process payment and confirm booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, seatId, userId, eventName } = body;

    if (!eventId || !seatId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify seat is still locked by this user
    const status = await getSeatStatus(eventId, seatId);
    if (status.status !== 'locked' || status.lockedBy !== userId) {
      return NextResponse.json(
        { success: false, error: 'Seat lock expired or not owned by you' },
        { status: 400 }
      );
    }

    // Simulate payment processing (in production, integrate with Stripe/PayPal)
    const paymentId = uuidv4();
    const { section, row, number } = parseSeatId(seatId);
    const rowIndex = row.charCodeAt(0) - 65;
    const price = getSeatPrice(section, rowIndex);

    // Mark seat as sold in Redis
    const result = await markSeatSold(eventId, seatId, userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // Publish payment processed event
    const paymentEvent: PaymentProcessedEvent = {
      eventId,
      seatId,
      userId,
      paymentId,
      amount: price,
      status: 'success',
      timestamp: Date.now(),
    };
    publishPaymentProcessed(paymentEvent).catch(console.error);

    // Publish ticket sold event (this will be consumed to update MongoDB)
    const ticketEvent: TicketSoldEvent = {
      eventId,
      seatId,
      userId,
      price,
      timestamp: Date.now(),
      row,
      seatNumber: number,
      eventName: eventName || 'Concert',
    };
    publishTicketSold(ticketEvent).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Payment successful! Ticket confirmed.',
      data: {
        ticketId: uuidv4(),
        paymentId,
        seatId,
        row,
        seatNumber: number,
        price,
        eventName: eventName || 'Concert',
      },
    });
  } catch (error) {
    console.error('Error in payment API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
