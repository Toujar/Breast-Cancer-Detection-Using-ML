export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Result from "@/models/Result";
import { requireUser } from "../../_utils/auth-utils";

export async function GET() {
  try {
    const authedUser = await requireUser();
    await connectDB();

    const userQuery = { userId: authedUser.id || authedUser._id };

    // Fetch all user's results to calculate average metrics
    const allUserResults = await Result.find(userQuery)
      .select('modelMetrics')
      .lean();

    // Calculate average metrics from user's actual predictions
    let avgMetrics = {
      accuracy: 94.6, // Real model accuracy: 94.62%
      precision: 95.0, // Weighted average precision: 95%
      recall: 95.0,    // Weighted average recall: 95%
      f1Score: 95.0    // Weighted average F1-score: 95%
    };

    if (allUserResults.length > 0) {
      const totals = allUserResults.reduce((acc: any, result: any) => {
        const metrics = result.modelMetrics || {};
        return {
          accuracy: acc.accuracy + (metrics.accuracy || 0),
          precision: acc.precision + (metrics.precision || 0),
          recall: acc.recall + (metrics.recall || 0),
          f1Score: acc.f1Score + (metrics.f1Score || 0)
        };
      }, { accuracy: 0, precision: 0, recall: 0, f1Score: 0 });

      avgMetrics = {
        accuracy: parseFloat((totals.accuracy / allUserResults.length).toFixed(1)),
        precision: parseFloat((totals.precision / allUserResults.length).toFixed(1)),
        recall: parseFloat((totals.recall / allUserResults.length).toFixed(1)),
        f1Score: parseFloat((totals.f1Score / allUserResults.length).toFixed(1))
      };
    }

    return NextResponse.json(avgMetrics);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
