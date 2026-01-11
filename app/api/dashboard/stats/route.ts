
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Result from "@/models/Result";
import { requireUser } from "../../_utils/auth-utils";

export async function GET() {
  try {
    const authedUser = await requireUser(); // Make it async
    await connectDB();

    const userQuery = { userId: authedUser.id || authedUser._id };

    // Fetch total predictions & last 7 days predictions
    const [totalPredictions, recentPredictionsDoc] =
      await Promise.all([
        Result.countDocuments(userQuery),
        Result.countDocuments({
          ...userQuery,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
      ]);

    // Use static EfficientNet accuracy on BUSI dataset (matches home page)
    const avgAccuracy = 96.8; // EfficientNet accuracy on BUSI dataset

    const stats = {
      totalPredictions,
      recentPredictions: recentPredictionsDoc,
      accuracy: avgAccuracy, // Static accuracy from BUSI dataset performance
      lastActive: "Today",
    };
    // console.log('Stats:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
