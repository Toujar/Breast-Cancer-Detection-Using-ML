// import { NextRequest, NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Result from "@/models/Result";
// import jwt from "jsonwebtoken";
// import { requireUser } from "../../../_utils/auth-utils";
// import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const id = params.id;

//     // Auth: allow either owner/admin or a valid share token
//     const token = request.nextUrl.searchParams.get("token");
//     let authedUser: any | null = null;
//     if (!token) {
//       authedUser = requireUser();
//     }

//     await connectDB();
//     const doc: any = await Result.findOne({ predictionId: id }).lean();
//     if (!doc) {
//       return NextResponse.json({ error: "Result not found" }, { status: 404 });
//     }
//     // Format your predictionId nicely
//     let readableId = "N/A";
//     if (doc?.predictionId) {
//       const parts = String(doc.predictionId).split("-");
//       // Example: ["img", "pred", "1761999385686", "jczuq6kg3"]
//       const prefix = parts[0]?.toUpperCase() || "IMG";
//       const timestamp = parts[2]?.slice(-5) || "00000";
//       const random = parts[3]?.slice(0, 6).toUpperCase() || "XXXXXX";
//       readableId = `${prefix}-${timestamp}-${random}`;
//     }

//     if (token) {
//       try {
//         const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
//         if (decoded.predictionId !== id) {
//           return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//         }
//       } catch {
//         return NextResponse.json(
//           { error: "Invalid or expired token" },
//           { status: 403 }
//         );
//       }
//     } else if (authedUser) {
//       if (
//         authedUser.role !== "admin" &&
//         String(doc.userId) !== String(authedUser.id || authedUser._id)
//       ) {
//         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//       }
//     }

//     // Create PDF with pdf-lib
//     const pdfDoc = await PDFDocument.create();
//     const page = pdfDoc.addPage([600, 800]);
//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

//     const { height } = page.getSize();
//     let y = height - 50;

//     const drawLine = (text: string, size = 12, color = rgb(0, 0, 0)) => {
//       page.drawText(text, { x: 50, y, size, font, color });
//       y -= size + 8;
//     };

//     // Title
//     drawLine("BREAST CANCER AI DETECTION REPORT", 18);
//     y -= 10;
//     page.drawLine({
//       start: { x: 50, y },
//       end: { x: 550, y },
//       thickness: 1,
//       color: rgb(0, 0, 0),
//     });
//     y -= 30;

//     // Info
//     // drawLine(`Prediction ID: ${doc.predictionId}`);
//     drawLine(`Prediction ID: ${readableId}`);

//     drawLine(
//       `Generated: ${new Date(doc.timestamp || doc.createdAt).toLocaleString()}`
//     );
//     y -= 20;

//     // Results
//     drawLine("ANALYSIS RESULTS:", 14);
//     drawLine(`- Classification: ${doc.prediction}`);
//     drawLine(`- Confidence Score: ${doc.confidence}%`);
//     drawLine(
//       `- Analysis Type: ${
//         doc.type === "tabular" ? "Data Analysis" : "Image Analysis"
//       }`
//     );
//     y -= 20;

//     // Metrics
//     drawLine("MODEL METRICS:", 14);
//     drawLine(`- Accuracy: ${doc?.modelMetrics?.accuracy ?? "N/A"}%`);
//     drawLine(`- Precision: ${doc?.modelMetrics?.precision ?? "N/A"}%`);
//     drawLine(`- Recall: ${doc?.modelMetrics?.recall ?? "N/A"}%`);
//     drawLine(`- F1-Score: ${doc?.modelMetrics?.f1Score ?? "N/A"}%`);
//     y -= 20;

//     // Disclaimer
//     drawLine("CLINICAL INTERPRETATION:", 14, rgb(0.8, 0, 0));
//     drawLine(
//       "This AI analysis is intended as a screening tool to assist healthcare professionals."
//     );
//     drawLine(
//       "It should not be used as the sole basis for diagnosis or treatment."
//     );

//     // Finalize PDF
//     const pdfBytes = await pdfDoc.save();

//     return new NextResponse(Buffer.from(pdfBytes), {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="breast-cancer-analysis-${readableId}.pdf"`,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to generate PDF" },
//       { status: 500 }
//     );
//   }
// }
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

    const username = doc?.username || authedUser?.username || "User";

    // Make Prediction ID readable and personalized
    let readableId = "N/A";
    if (doc?.predictionId) {
      const parts = String(doc.predictionId).split("-");
      const prefix = parts[0]?.toUpperCase() || "IMG";
      const timestamp = parts[2]?.slice(-5) || "00000";
      const random = parts[3]?.slice(0, 6).toUpperCase() || "XXXXXX";
      readableId = `${prefix}-${username.toUpperCase()}-${timestamp}-${random}`;
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
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();
    let y = height - 50;

    const drawLine = (
      text: string,
      size = 12,
      color = rgb(0, 0, 0)
    ) => {
      page.drawText(text, {
        x: 50,
        y,
        size,
        font,
        color,
      });
      y -= size + 8;
    };

    // --- Header Banner ---
    page.drawRectangle({
      x: 0,
      y: height - 90,
      width: 600,
      height: 60,
      color: rgb(0.18, 0.38, 0.8), // blue header
    });
    page.drawText("BREAST CANCER AI DETECTION REPORT", {
      x: 70,
      y: height - 65,
      size: 18,
      font,
      color: rgb(1, 1, 1),
    });
    y -= 90;

    // --- User & Report Info ---
    drawLine(`Prediction ID: ${readableId}`, 13, rgb(0.2, 0.2, 0.6));
    drawLine(
      `Generated: ${new Date(
        doc.timestamp || doc.createdAt
      ).toLocaleString()}`,
      12,
      rgb(0.3, 0.3, 0.3)
    );
    y -= 15;

    // --- Results Section ---
    drawLine("ANALYSIS RESULTS", 15, rgb(0.1, 0.3, 0.8));
    drawLine(`- Classification: ${doc.prediction}`, 12);
    drawLine(`- Confidence Score: ${doc.confidence}%`, 12);
    drawLine(
      `- Analysis Type: ${
        doc.type === "tabular" ? "Data Analysis" : "Image Analysis"
      }`,
      12
    );
    y -= 10;

    // --- Metrics Section ---
    drawLine("MODEL METRICS", 15, rgb(0.1, 0.6, 0.3));
    drawLine(`- Accuracy: ${doc?.modelMetrics?.accuracy ?? "N/A"}%`);
    drawLine(`- Precision: ${doc?.modelMetrics?.precision ?? "N/A"}%`);
    drawLine(`- Recall: ${doc?.modelMetrics?.recall ?? "N/A"}%`);
    drawLine(`- F1-Score: ${doc?.modelMetrics?.f1Score ?? "N/A"}%`);
    y -= 15;

    // --- Disclaimer Section ---
    drawLine("CLINICAL INTERPRETATION", 14, rgb(0.8, 0, 0));
    drawLine(
      "This AI analysis is intended as a screening aid for healthcare professionals.",
      12,
      rgb(0.2, 0.2, 0.2)
    );
    drawLine(
      "It should not be used as the sole basis for medical diagnosis or treatment.",
      12,
      rgb(0.2, 0.2, 0.2)
    );

    // --- Footer ---
    y -= 40;
    page.drawLine({
      start: { x: 50, y },
      end: { x: 550, y },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 20;
    drawLine("Generated by Breast Cancer Detection AI © 2025", 10, rgb(0.4, 0.4, 0.4));

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="breast-cancer-${username}-${readableId}.pdf"`,
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
