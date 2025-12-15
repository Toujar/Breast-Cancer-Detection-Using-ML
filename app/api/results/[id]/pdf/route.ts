
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Result from "@/models/Result";
import jwt from "jsonwebtoken";
import { requireUser } from "../../../_utils/auth-utils";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Auth and Token check
    const token = request.nextUrl.searchParams.get("token");
    let authedUser: any | null = null;
    if (!token) authedUser = requireUser();

    await connectDB();
    const doc: any = await Result.findOne({ predictionId: id }).lean();
    if (!doc) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const username = doc?.user?.username || authedUser?.username || "Patient";
    const userEmail = doc?.user?.email || authedUser?.email || "";

    // Make Prediction ID readable
    let readableId = "N/A";
    if (doc?.predictionId) {
      const parts = String(doc.predictionId).split("-");
      const prefix = parts[0]?.toUpperCase() || "IMG";
      const timestamp = parts[2]?.slice(-5) || "00000";
      const random = parts[3]?.slice(0, 6).toUpperCase() || "XXXXXX";
      readableId = `${prefix}-${timestamp}-${random}`;
    }

    // Token validation
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        if (decoded.predictionId !== id)
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      } catch {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 403 }
        );
      }
    } else if (authedUser) {
      if (
        authedUser.role !== "admin" &&
        String(doc.userId) !== String(authedUser.id || authedUser._id)
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // --- PDF Creation ---
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const { width, height } = page.getSize();
    const margin = 50;
    let y = height - margin;

    // Helper functions
    const drawText = (text: string, x: number, yPos: number, size: number, color = rgb(0, 0, 0), fontType = font) => {
      page.drawText(text, { x, y: yPos, size, font: fontType, color });
    };

    const drawBox = (x: number, yPos: number, w: number, h: number, color: any, borderColor?: any) => {
      page.drawRectangle({ x, y: yPos, width: w, height: h, color, borderColor, borderWidth: borderColor ? 1 : 0 });
    };

    const drawLine = (x1: number, y1: number, x2: number, y2: number, thickness = 1, color = rgb(0, 0, 0)) => {
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color });
    };

    // === HEADER SECTION ===
    // Blue header bar
    drawBox(0, height - 100, width, 100, rgb(0.05, 0.2, 0.45));
    
    // Medical cross icon (simple representation)
    drawBox(margin, height - 85, 15, 50, rgb(1, 1, 1));
    drawBox(margin - 10, height - 70, 35, 20, rgb(1, 1, 1));
    
    // Title
    drawText("MEDICAL DIAGNOSTIC REPORT", margin + 50, height - 55, 22, rgb(1, 1, 1), fontBold);
    drawText("Breast Cancer AI Detection Analysis", margin + 50, height - 78, 12, rgb(0.9, 0.9, 0.9));
    
    y = height - 120;

    // === PATIENT & REPORT INFORMATION ===
    // Info box
    drawBox(margin, y - 85, width - 2 * margin, 85, rgb(0.97, 0.97, 0.98), rgb(0.8, 0.8, 0.85));
    
    drawText("REPORT INFORMATION", margin + 10, y - 20, 11, rgb(0.2, 0.2, 0.5), fontBold);
    drawLine(margin + 10, y - 23, margin + 140, y - 23, 1, rgb(0.2, 0.2, 0.5));
    
    const reportDate = new Date(doc.timestamp || doc.createdAt);
    drawText(`Report ID:`, margin + 10, y - 40, 10, rgb(0.3, 0.3, 0.3), fontBold);
    drawText(readableId, margin + 100, y - 40, 10, rgb(0, 0, 0));
    
    drawText(`Patient Name:`, margin + 10, y - 55, 10, rgb(0.3, 0.3, 0.3), fontBold);
    drawText(username, margin + 100, y - 55, 10, rgb(0, 0, 0));
    
    drawText(`Report Date:`, margin + 10, y - 70, 10, rgb(0.3, 0.3, 0.3), fontBold);
    drawText(reportDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), margin + 100, y - 70, 10, rgb(0, 0, 0));
    
    drawText(`Analysis Type:`, margin + 300, y - 40, 10, rgb(0.3, 0.3, 0.3), fontBold);
    drawText(doc.type === 'tabular' ? 'Clinical Data Analysis' : 'Medical Imaging Analysis', margin + 390, y - 40, 10, rgb(0, 0, 0));
    
    drawText(`Model Version:`, margin + 300, y - 55, 10, rgb(0.3, 0.3, 0.3), fontBold);
    drawText(doc.modelMetrics?.version || '2.5.1', margin + 390, y - 55, 10, rgb(0, 0, 0));
    
    y -= 110;

    // === DIAGNOSTIC RESULTS ===
    const isPredictionBenign = doc.prediction === 'benign';
    const resultColor = isPredictionBenign ? rgb(0.1, 0.6, 0.2) : rgb(0.8, 0.1, 0.1);
    const resultBgColor = isPredictionBenign ? rgb(0.9, 0.98, 0.92) : rgb(0.98, 0.92, 0.92);
    
    drawBox(margin, y - 100, width - 2 * margin, 100, resultBgColor, resultColor);
    
    drawText("DIAGNOSTIC FINDINGS", margin + 10, y - 25, 13, resultColor, fontBold);
    drawLine(margin + 10, y - 28, margin + 160, y - 28, 2, resultColor);
    
    drawText("Classification:", margin + 10, y - 50, 11, rgb(0.2, 0.2, 0.2), fontBold);
    drawText(doc.prediction.toUpperCase(), margin + 120, y - 50, 14, resultColor, fontBold);
    
    drawText("AI Confidence:", margin + 10, y - 70, 11, rgb(0.2, 0.2, 0.2), fontBold);
    drawText(`${doc.confidence.toFixed(1)}%`, margin + 120, y - 70, 14, resultColor, fontBold);
    
    // Confidence bar
    const barWidth = 200;
    const barHeight = 12;
    const confidenceWidth = (doc.confidence / 100) * barWidth;
    drawBox(margin + 250, y - 72, barWidth, barHeight, rgb(0.9, 0.9, 0.9));
    drawBox(margin + 250, y - 72, confidenceWidth, barHeight, resultColor);
    
    y -= 125;

    // === CLINICAL INTERPRETATION ===
    drawText("CLINICAL INTERPRETATION", margin, y, 12, rgb(0.1, 0.1, 0.4), fontBold);
    drawLine(margin, y - 3, margin + 180, y - 3, 1.5, rgb(0.1, 0.1, 0.4));
    y -= 20;
    
    const interpretation = isPredictionBenign
      ? "The AI analysis indicates characteristics consistent with benign (non-cancerous) tissue. However, this should not replace professional medical evaluation. Continue with regular screening as recommended by your healthcare provider."
      : "The AI analysis has detected patterns that may indicate malignant (cancerous) tissue. Immediate follow-up with a qualified oncologist is strongly recommended for comprehensive evaluation and treatment planning.";
    
    const words = interpretation.split(' ');
    let line = '';
    const maxWidth = width - 2 * margin;
    const lineHeight = 14;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const testWidth = font.widthOfTextAtSize(testLine, 10);
      if (testWidth > maxWidth && line !== '') {
        drawText(line.trim(), margin, y, 10, rgb(0.2, 0.2, 0.2));
        line = word + ' ';
        y -= lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line !== '') {
      drawText(line.trim(), margin, y, 10, rgb(0.2, 0.2, 0.2));
      y -= lineHeight;
    }
    
    y -= 15;

    // === MODEL PERFORMANCE METRICS ===
    drawText("AI MODEL PERFORMANCE METRICS", margin, y, 12, rgb(0.1, 0.1, 0.4), fontBold);
    drawLine(margin, y - 3, margin + 220, y - 3, 1.5, rgb(0.1, 0.1, 0.4));
    y -= 25;
    
    const metrics = [
      { label: 'Accuracy', value: doc.modelMetrics?.accuracy || 'N/A', desc: 'Overall correctness of predictions' },
      { label: 'Precision', value: doc.modelMetrics?.precision || 'N/A', desc: 'Accuracy of positive predictions' },
      { label: 'Recall', value: doc.modelMetrics?.recall || 'N/A', desc: 'Ability to detect all positive cases' },
      { label: 'F1-Score', value: doc.modelMetrics?.f1Score || 'N/A', desc: 'Balanced performance measure' }
    ];
    
    metrics.forEach((metric, idx) => {
      const xPos = margin + (idx % 2) * 250;
      const yPos = y - Math.floor(idx / 2) * 45;
      
      drawBox(xPos, yPos - 35, 230, 35, rgb(0.96, 0.97, 0.98), rgb(0.85, 0.87, 0.9));
      drawText(metric.label, xPos + 10, yPos - 15, 10, rgb(0.2, 0.2, 0.5), fontBold);
      drawText(`${metric.value}%`, xPos + 160, yPos - 15, 12, rgb(0.1, 0.5, 0.3), fontBold);
      drawText(metric.desc, xPos + 10, yPos - 28, 8, rgb(0.4, 0.4, 0.4));
    });
    
    y -= 110;

    // === RECOMMENDATIONS ===
    drawText("RECOMMENDATIONS", margin, y, 12, rgb(0.1, 0.1, 0.4), fontBold);
    drawLine(margin, y - 3, margin + 150, y - 3, 1.5, rgb(0.1, 0.1, 0.4));
    y -= 20;
    
    const recommendations = isPredictionBenign
      ? [
          "- Continue with regular self-examinations monthly",
          "- Schedule annual mammogram screening as per age guidelines",
          "- Maintain healthy lifestyle with balanced diet and exercise",
          "- Report any changes in breast tissue to your healthcare provider",
          "- Keep this report for your medical records"
        ]
      : [
          "- Schedule immediate consultation with an oncologist",
          "- Undergo comprehensive diagnostic imaging (mammogram, ultrasound, MRI)",
          "- Consider biopsy for definitive diagnosis",
          "- Discuss treatment options with your medical team",
          "- Seek second opinion from another specialist",
          "- Connect with support groups and counseling services"
        ];
    
    recommendations.forEach(rec => {
      drawText(rec, margin, y, 10, rgb(0.2, 0.2, 0.2));
      y -= 15;
    });
    
    y -= 10;

    // === IMPORTANT DISCLAIMER ===
    drawBox(margin, y - 65, width - 2 * margin, 65, rgb(1, 0.95, 0.9), rgb(0.9, 0.6, 0.2));
    drawText("! IMPORTANT MEDICAL DISCLAIMER", margin + 10, y - 20, 11, rgb(0.7, 0.3, 0), fontBold);
    
    const disclaimer = "This AI-generated report is intended as a screening tool to assist healthcare professionals and should not be used as the sole basis for medical diagnosis or treatment decisions. Always consult with qualified medical professionals for proper diagnosis, treatment planning, and medical care. The AI model's predictions are based on statistical patterns and may not account for individual patient circumstances.";
    
    const disclaimerWords = disclaimer.split(' ');
    let disclaimerLine = '';
    let disclaimerY = y - 35;
    
    for (const word of disclaimerWords) {
      const testLine = disclaimerLine + word + ' ';
      const testWidth = font.widthOfTextAtSize(testLine, 8);
      if (testWidth > width - 2 * margin - 20 && disclaimerLine !== '') {
        drawText(disclaimerLine.trim(), margin + 10, disclaimerY, 8, rgb(0.3, 0.2, 0));
        disclaimerLine = word + ' ';
        disclaimerY -= 10;
      } else {
        disclaimerLine = testLine;
      }
    }
    if (disclaimerLine !== '') {
      drawText(disclaimerLine.trim(), margin + 10, disclaimerY, 8, rgb(0.3, 0.2, 0));
    }

    // === FOOTER ===
    const footerY = 40;
    drawLine(margin, footerY + 15, width - margin, footerY + 15, 0.5, rgb(0.7, 0.7, 0.7));
    drawText("Breast Cancer Detection AI System", margin, footerY, 8, rgb(0.5, 0.5, 0.5));
    drawText(`Report generated on ${new Date().toLocaleString()}`, width - margin - 200, footerY, 8, rgb(0.5, 0.5, 0.5));
    drawText(`Page 1 of 1`, width / 2 - 30, footerY, 8, rgb(0.5, 0.5, 0.5));

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Medical-Report-${readableId}-${username}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
