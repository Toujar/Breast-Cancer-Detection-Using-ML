
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Connect to database and fetch full user data
    await connectDB();
    const user = await User.findById(decoded.id).select('-password').lean();
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        location: user.location,
        phoneNumber: user.phoneNumber,
        age: user.age,
        // Doctor-specific fields
        specialization: user.specialization,
        hospital: user.hospital,
        registrationNumber: user.registrationNumber,
        experience: user.experience,
      },
    });
  } catch (err) {
    console.error("Auth GET error:", err);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
