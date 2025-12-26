import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/lib/models";
import { auth } from "@/lib/auth";

// GET - Get all events (public) or admin events
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const adminOnly = searchParams.get("adminOnly") === "true";

    let query = {};
    
    if (!adminOnly) {
      query = { isActive: true };
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      events: events.map((event) => ({
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
        createdAt: event.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new event (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { name, artist, venue, date, time, description, image, color, totalSeats, priceFrom } = body;

    if (!name || !artist || !venue || !date || !time || !priceFrom) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await Event.create({
      name,
      artist,
      venue,
      date,
      time,
      description: description || "",
      image: image || "/events/default.jpg",
      color: color || "#ff5733",
      totalSeats: totalSeats || 1000,
      seatsLeft: totalSeats || 1000,
      priceFrom,
      isActive: true,
      createdBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      event: {
        id: event._id.toString(),
        name: event.name,
        artist: event.artist,
        venue: event.venue,
        date: event.date,
        time: event.time,
      },
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
