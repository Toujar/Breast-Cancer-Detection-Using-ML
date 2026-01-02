import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Result from "@/models/Result";
import { requireUser } from "../../_utils/auth-utils";

export async function GET() {
  try {
    const authedUser = await requireUser();
    await connectDB();

    const userQuery = { userId: authedUser.id || authedUser._id };

    // Get predictions from last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const results = await Result.find({
      ...userQuery,
      createdAt: { $gte: sixMonthsAgo }
    }).select('createdAt modelMetrics').lean();

    // Group by month
    const monthlyData: any = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    results.forEach((result: any) => {
      const date = new Date(result.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = monthNames[date.getMonth()];

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          predictions: 0,
          totalAccuracy: 0,
          count: 0
        };
      }

      monthlyData[monthKey].predictions++;
      monthlyData[monthKey].totalAccuracy += result.modelMetrics?.accuracy || 0;
      monthlyData[monthKey].count++;
    });

    // Calculate average accuracy per month and format
    const formattedData = Object.values(monthlyData).map((data: any) => ({
      month: data.month,
      predictions: data.predictions,
      accuracy: data.count > 0 ? parseFloat((data.totalAccuracy / data.count).toFixed(1)) : 0
    }));

    // If no data, return empty array (frontend will show "No data")
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch monthly analytics" },
      { status: 500 }
    );
  }
}
