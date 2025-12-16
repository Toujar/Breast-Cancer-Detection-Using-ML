import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    // Get all doctors
    const doctors = await User.find({ role: "doctor" })
      .select("username email specialization hospital location experience registrationNumber")
      .lean();

    // Group by location
    const doctorsByLocation = {};
    doctors.forEach(doctor => {
      const location = doctor.location || 'Unknown';
      if (!doctorsByLocation[location]) {
        doctorsByLocation[location] = [];
      }
      doctorsByLocation[location].push(doctor);
    });

    return NextResponse.json({
      total: doctors.length,
      doctors: doctors,
      byLocation: doctorsByLocation,
      message: doctors.length > 0 ? "Doctors found in database" : "No doctors found - please run seeding script"
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors", details: error.message },
      { status: 500 }
    );
  }
}