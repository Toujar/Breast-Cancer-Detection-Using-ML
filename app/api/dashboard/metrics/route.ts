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

    // Return static EfficientNet metrics on BUSI dataset (matches home page)
    const staticMetrics = {
      accuracy: 96.8,  // EfficientNet accuracy on BUSI dataset
      precision: 95.2, // EfficientNet precision on BUSI dataset  
      recall: 97.1,    // EfficientNet recall on BUSI dataset
      f1Score: 96.1    // EfficientNet F1-score on BUSI dataset
    };

    return NextResponse.json(staticMetrics);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
