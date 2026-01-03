export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '../../_utils/auth-utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt: any = require('jsonwebtoken');
import connectDB from '@/lib/mongodb';
import Result from '@/models/Result';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const token = request.nextUrl.searchParams.get('token');
    const authedUser = token ? null : await requireUser();

    await connectDB();
    const doc = await Result.findOne({ predictionId: id }).lean();
    if (!doc) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        if (decoded.predictionId !== id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
      }
    } else if (authedUser) {
      const docData: any = doc;
      if (authedUser.role !== 'admin' && String(docData.userId) !== String(authedUser.id || authedUser._id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Include gradcam and shap if requested
    const includeGradcam = request.nextUrl.searchParams.get('gradcam') === 'true';
    const includeShap = request.nextUrl.searchParams.get('shap') === 'true';

    const docData: any = doc;
    return NextResponse.json({
      id: docData.predictionId,
      type: docData.type,
      prediction: docData.prediction,
      confidence: docData.confidence,
      inputData: docData.inputData,
      modelMetrics: docData.modelMetrics,
      gradcam: (includeGradcam && docData.gradcam) ? docData.gradcam : undefined,
      shap: (includeShap && docData.shap) ? docData.shap : undefined,
      timestamp: docData.timestamp,
      userId: docData.userId,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching result:', error);
    return NextResponse.json(
      { error: 'Failed to fetch result' },
      { status: 500 }
    );
  }
}