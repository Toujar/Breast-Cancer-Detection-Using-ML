// import { NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Result from '@/models/Result';
// import { requireUser } from '../../_utils/auth-utils';

// export async function GET() {
//   try {
//     const authedUser = requireUser();
//     await connectDB();

//     const userQuery = { userId: authedUser.id || authedUser._id };
//     const [totalPredictions, recentPredictionsDoc] = await Promise.all([
//       Result.countDocuments(userQuery),
//       Result.aggregate([
//         { $match: userQuery },
//         { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
//         { $count: 'count' }
//       ]),
//     ]);
//     const recentPredictions = (recentPredictionsDoc[0]?.count) || 0;

//     const stats = {
//       totalPredictions,
//       recentPredictions,
//       accuracy: 97.8,
//       lastActive: 'Today',
//     };

//     return NextResponse.json(stats);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to fetch stats' },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Result from "@/models/Result";
import { requireUser } from "../../_utils/auth-utils";

export async function GET() {
  try {
    const authedUser = requireUser(); // Ensure it works without request param
    await connectDB();

    const userQuery = { userId: authedUser.id || authedUser._id };

    // Fetch total predictions & last 7 days predictions
    const [totalPredictions, recentPredictionsDoc, allUserResults] =
      await Promise.all([
        Result.countDocuments(userQuery),
        Result.countDocuments({
          ...userQuery,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
        Result.find(userQuery).select('modelMetrics').lean(),
      ]);

    // Calculate average accuracy from user's actual predictions
    let avgAccuracy = 97.8; // Default fallback
    if (allUserResults.length > 0) {
      const totalAccuracy = allUserResults.reduce((sum, result: any) => {
        return sum + (result.modelMetrics?.accuracy || 0);
      }, 0);
      avgAccuracy = parseFloat((totalAccuracy / allUserResults.length).toFixed(1));
    }

    const stats = {
      totalPredictions,
      recentPredictions: recentPredictionsDoc,
      accuracy: avgAccuracy, // ✅ Real average from user's predictions
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
