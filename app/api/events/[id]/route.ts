import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/lib/models";
import { auth } from "@/lib/auth";

// GET - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const event = await Event.findById(id).lean();

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event._id.toString(),
        slug: event._id.toString(),
        name: event.name,
        artist: event.artist,
        venue: event.venue,
        date: event.date,
        time: event.time,
        description: event.description,
        image: event.image,
        color: event.color,
        totalSeats: event.totalSeats,
        seatsLeft: event.seatsLeft,
        priceFrom: event.priceFrom,
        isActive: event.isActive,
      },
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update event (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    const body = await request.json();
    const { name, artist, venue, date, time, description, image, color, totalSeats, priceFrom, isActive } = body;

    const event = await Event.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(artist && { artist }),
        ...(venue && { venue }),
        ...(date && { date }),
        ...(time && { time }),
        ...(description !== undefined && { description }),
        ...(image && { image }),
        ...(color && { color }),
        ...(totalSeats && { totalSeats }),
        ...(priceFrom && { priceFrom }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      event: {
        id: event._id.toString(),
        name: event.name,
      },
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete event (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
