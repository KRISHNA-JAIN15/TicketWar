import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User, Event } from "@/lib/models";

// Sample events data
const sampleEvents = [
  {
    name: "Coldplay: Music of the Spheres",
    slug: "coldplay-music-spheres",
    artist: "Coldplay",
    venue: "Madison Square Garden",
    date: "January 15, 2025",
    time: "8:00 PM",
    description: "Experience the magic of Coldplay's Music of the Spheres World Tour. An unforgettable night of music, lights, and cosmic wonder.",
    image: "/events/coldplay.jpg",
    color: "#1e3a8a",
    totalSeats: 1000,
    seatsLeft: 847,
    priceFrom: 299,
    isActive: true,
  },
  {
    name: "Taylor Swift: Eras Tour",
    slug: "taylor-swift-eras",
    artist: "Taylor Swift",
    venue: "SoFi Stadium",
    date: "February 20, 2025",
    time: "7:00 PM",
    description: "Join Taylor Swift on a journey through all her musical eras. A spectacular 3+ hour show featuring hits from every album.",
    image: "/events/taylor.jpg",
    color: "#7c3aed",
    totalSeats: 1500,
    seatsLeft: 1234,
    priceFrom: 399,
    isActive: true,
  },
  {
    name: "The Weeknd: After Hours",
    slug: "weeknd-after-hours",
    artist: "The Weeknd",
    venue: "Crypto Arena",
    date: "March 10, 2025",
    time: "9:00 PM",
    description: "The Weeknd brings his After Hours Til Dawn Tour to town. Prepare for a night of R&B excellence.",
    image: "/events/weeknd.jpg",
    color: "#dc2626",
    totalSeats: 800,
    seatsLeft: 623,
    priceFrom: 249,
    isActive: true,
  },
  {
    name: "Beyoncé: Renaissance",
    slug: "beyonce-renaissance",
    artist: "Beyoncé",
    venue: "MetLife Stadium",
    date: "April 5, 2025",
    time: "8:00 PM",
    description: "Queen Bey returns with the Renaissance World Tour. An epic celebration of music, dance, and culture.",
    image: "/events/beyonce.jpg",
    color: "#c026d3",
    totalSeats: 2000,
    seatsLeft: 1567,
    priceFrom: 449,
    isActive: true,
  },
  {
    name: "Ed Sheeran: Mathematics",
    slug: "ed-sheeran-mathematics",
    artist: "Ed Sheeran",
    venue: "Wembley Stadium",
    date: "May 18, 2025",
    time: "7:30 PM",
    description: "Ed Sheeran's Mathematics Tour - just Ed, his guitar, and loop pedal creating magic on stage.",
    image: "/events/ed-sheeran.jpg",
    color: "#ea580c",
    totalSeats: 900,
    seatsLeft: 456,
    priceFrom: 199,
    isActive: true,
  },
  {
    name: "BTS: World Tour",
    slug: "bts-world-tour",
    artist: "BTS",
    venue: "Rose Bowl Stadium",
    date: "June 22, 2025",
    time: "6:00 PM",
    description: "The global phenomenon BTS brings their electrifying performance to the stage. ARMY, get ready!",
    image: "/events/bts.jpg",
    color: "#9333ea",
    totalSeats: 2500,
    seatsLeft: 2100,
    priceFrom: 349,
    isActive: true,
  },
];

// This route creates an admin user and sample events
// Access it once via: GET /api/admin/seed
export async function GET() {
  try {
    await connectToDatabase();

    // Check if admin already exists
    let adminUser = await User.findOne({ email: "admin@ticketwar.com" });
    
    if (!adminUser) {
      // Create admin user
      const hashedPassword = await bcrypt.hash("admin123", 12);
      
      adminUser = await User.create({
        email: "admin@ticketwar.com",
        password: hashedPassword,
        name: "Admin User",
        role: "admin",
      });
    }

    // Seed events if they don't exist
    const existingEvents = await Event.countDocuments();
    let eventsCreated = 0;

    if (existingEvents === 0) {
      // Create all sample events
      for (const eventData of sampleEvents) {
        await Event.create({
          ...eventData,
          createdBy: adminUser._id,
        });
        eventsCreated++;
      }
    } else {
      // Check and create any missing events by slug
      for (const eventData of sampleEvents) {
        const exists = await Event.findOne({ slug: eventData.slug });
        if (!exists) {
          await Event.create({
            ...eventData,
            createdBy: adminUser._id,
          });
          eventsCreated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      admin: {
        email: "admin@ticketwar.com",
        password: "admin123",
      },
      events: {
        total: await Event.countDocuments(),
        created: eventsCreated,
      },
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
