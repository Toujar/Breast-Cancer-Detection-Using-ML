export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    // Find doctors in the same location first, then nearby locations
    const doctors = await User.find({
      role: "doctor",
      isActive: true,
    })
      .select("username email specialization hospital location experience registrationNumber")
      .lean();

    // Sort doctors by location proximity (same location first)
    const sortedDoctors = doctors.sort((a, b) => {
      const aMatch = a.location?.toLowerCase().includes(location.toLowerCase());
      const bMatch = b.location?.toLowerCase().includes(location.toLowerCase());
      
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

    // Add distance simulation and availability
    const doctorsWithDetails = sortedDoctors.map((doctor, index) => ({
      id: doctor._id,
      name: doctor.username,
      specialization: doctor.specialization || "General Practitioner",
      hospital: doctor.hospital || "Private Practice",
      location: doctor.location,
      experience: doctor.experience || 0,
      registrationNumber: doctor.registrationNumber,
      distance: doctor.location?.toLowerCase().includes(location.toLowerCase()) 
        ? Math.random() * 5 + 1 // 1-6 km for same location
        : Math.random() * 20 + 10, // 10-30 km for different locations
      rating: (4.2 + Math.random() * 0.8).toFixed(1), // 4.2-5.0 rating
      availability: index < 3 ? "Available today" : "Available this week",
      consultationModes: ["online", "in-person"],
    }));

    return NextResponse.json({
      doctors: doctorsWithDetails.slice(0, 10), // Limit to 10 doctors
      total: doctorsWithDetails.length,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}