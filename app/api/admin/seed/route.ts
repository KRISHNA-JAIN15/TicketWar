import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models";

// This route creates an admin user for testing
// Access it once via: GET /api/admin/seed
export async function GET() {
  try {
    await connectToDatabase();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@ticketwar.com" });
    
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "Admin user already exists",
        credentials: {
          email: "admin@ticketwar.com",
          password: "admin123",
        },
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 12);
    
    await User.create({
      email: "admin@ticketwar.com",
      password: hashedPassword,
      name: "Admin User",
      role: "admin",
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      credentials: {
        email: "admin@ticketwar.com",
        password: "admin123",
      },
    });
  } catch (error) {
    console.error("Error seeding admin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}
