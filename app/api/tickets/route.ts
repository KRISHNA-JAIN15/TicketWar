import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Ticket, Event } from "@/lib/models";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// GET - Get user's tickets
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const tickets = await Ticket.find({ userId: session.user.id })
      .sort({ purchasedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      tickets: tickets.map((ticket) => ({
        id: ticket._id.toString(),
        ticketId: ticket.ticketId,
        eventName: ticket.eventName,
        eventVenue: ticket.eventVenue,
        eventDate: ticket.eventDate,
        eventTime: ticket.eventTime,
        eventSlug: ticket.eventSlug,
        seatId: ticket.seatId,
        section: ticket.section,
        row: ticket.row,
        seatNumber: ticket.seatNumber,
        price: ticket.price,
        serviceFee: ticket.serviceFee,
        totalPaid: ticket.totalPaid,
        status: ticket.status,
        purchasedAt: ticket.purchasedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Purchase/Create a ticket
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Please sign in to purchase tickets" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { eventId, eventSlug, seatId, section, row, seatNumber, price, paymentId, eventName, eventVenue, eventDate, eventTime } = body;

    if (!eventId || !seatId || !price) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if seat is already sold
    const existingTicket = await Ticket.findOne({ eventSlug, seatId });
    if (existingTicket) {
      return NextResponse.json(
        { success: false, error: "Seat already sold" },
        { status: 400 }
      );
    }

    const serviceFee = Math.round(price * 0.1);
    const totalPaid = price + serviceFee;
    const ticketId = uuidv4();

    const ticket = await Ticket.create({
      ticketId,
      userId: session.user.id,
      eventId,
      eventSlug,
      eventName: eventName || "Concert Event",
      eventVenue: eventVenue || "Main Arena",
      eventDate: eventDate || "TBD",
      eventTime: eventTime || "TBD",
      seatId,
      section: section || seatId.split("-")[0],
      row: row || seatId.split("-")[1],
      seatNumber: seatNumber || parseInt(seatId.split("-")[2]),
      price,
      serviceFee,
      totalPaid,
      paymentId: paymentId || uuidv4(),
      status: "confirmed",
    });

    // Update seats left in event (if it's a MongoDB event)
    try {
      await Event.findByIdAndUpdate(eventId, { $inc: { seatsLeft: -1 } });
    } catch {
      // Event might not exist in MongoDB (mock events)
    }

    return NextResponse.json({
      success: true,
      message: "Ticket purchased successfully!",
      ticket: {
        id: ticket._id.toString(),
        ticketId: ticket.ticketId,
        eventName: ticket.eventName,
        seatId: ticket.seatId,
        section: ticket.section,
        row: ticket.row,
        seatNumber: ticket.seatNumber,
        price: ticket.price,
        serviceFee: ticket.serviceFee,
        totalPaid: ticket.totalPaid,
        paymentId: ticket.paymentId,
      },
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
