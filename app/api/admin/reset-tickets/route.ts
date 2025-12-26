import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";

// This route resets the tickets collection to fix schema issues
// Access it once via: GET /api/admin/reset-tickets
export async function GET() {
  try {
    await connectToDatabase();

    // Drop the tickets collection to clear old schema
    try {
      await mongoose.connection.db?.dropCollection("tickets");
    } catch {
      // Collection might not exist
    }

    return NextResponse.json({
      success: true,
      message: "Tickets collection reset successfully. New tickets will use the updated schema.",
    });
  } catch (error) {
    console.error("Error resetting tickets:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset tickets collection" },
      { status: 500 }
    );
  }
}
