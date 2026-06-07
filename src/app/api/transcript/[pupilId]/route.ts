import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
// Database access removed - use backend API instead
import { getParentSession, getStaffSession } from "@/lib/auth";
import { pupilName } from "@/lib/format";
// Persisting transcripts is handled by backend; frontend will stream PDF directly.

const BRAND_BLUE = rgb(0.04, 0.4, 0.76); // #0A66C2
const LIGHT_BLUE = rgb(0.91, 0.96, 0.99); // #E8F4FC
const SUCCESS_GREEN = rgb(0.02, 0.46, 0.26); // #057642
const TEXT_DARK = rgb(0.1, 0.1, 0.1);
const TEXT_MUTED = rgb(0.4, 0.4, 0.4);

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(png|jpe?g));base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    base64: match[3],
  };
}

async function embedPhoto(pdfDoc: PDFDocument, photoUrl: string) {
  const parsed = parseDataUrl(photoUrl);
  if (!parsed) return null;
  const bytes = Buffer.from(parsed.base64, "base64");
  if (parsed.mimeType === "image/png") {
    const image = await pdfDoc.embedPng(bytes);
    return { image, width: 80, height: 80 };
  }
  const image = await pdfDoc.embedJpg(bytes);
  return { image, width: 80, height: 80 };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ pupilId: string }> },
) {
  const { pupilId } = await context.params;
  const parentSession = await getParentSession();
  const staffSession = await getStaffSession();
  if (!parentSession && !staffSession) {
    return new Response("Unauthorized", { status: 401 });
  }

  const session = parentSession ?? staffSession!;

  const pupil = await prisma.pupil.findFirst({
    where: { id: pupilId, schoolId: session.schoolId as string },
    include: {
      class: true,
      results: {
        where: { publishedAt: { not: null } },
        include: { 
          assessment: true,
        },
        orderBy: [{ assessment: { createdAt: "desc" } }, { subject: "asc" }],
      },
    },
  });

  if (!pupil) {
    return new Response("Not found", { status: 404 });
  }

  if (parentSession) {
    const linked = await prisma.guardianPupil.findFirst({
      where: { pupilId: pupil.id, guardianId: parentSession.guardianId },
    });

    if (!linked) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  // For teachers: verify they have access to this student's class
  if (staffSession && staffSession.role === "TEACHER") {
    const { getTeacherAccessibleClassIds } = await import("@/lib/teacher-permissions");
    const accessibleClassIds = await getTeacherAccessibleClassIds(
      staffSession.userId,
      session.schoolId as string
    );
    if (!pupil.classId || !accessibleClassIds.includes(pupil.classId)) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const school = await prisma.school.findUnique({
    where: { id: session.schoolId as string },
    include: {
      gradingScales: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  
  if (!school) {
    return new Response("Not found", { status: 404 });
  }

  // Group results by assessment
  const resultsByAssessment = new Map<string, typeof pupil.results>();
  for (const result of pupil.results) {
    const key = result.assessmentId;
    if (!resultsByAssessment.has(key)) {
      resultsByAssessment.set(key, []);
    }
    resultsByAssessment.get(key)!.push(result);
  }

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let y = 800;
  const pageWidth = 595.28;
  const margin = 40;

  // ===== HEADER =====
  // School name
  page.drawText(school.name ?? "SchoolBase School", {
    x: margin,
    y,
    size: 20,
    font: helveticaBold,
    color: BRAND_BLUE,
  });
  y -= 26;

  // Subtitle
  page.drawText("PUPIL REPORT CARD", {
    x: margin,
    y,
    size: 14,
    font: helveticaBold,
    color: TEXT_DARK,
  });
  y -= 22;

  // Horizontal line
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 2,
    color: BRAND_BLUE,
  });
  y -= 20;

  // ===== STUDENT INFO CARD =====
  // Background for info card
  page.drawRectangle({
    x: margin,
    y: y - 90,
    width: pageWidth - 2 * margin,
    height: 90,
    color: LIGHT_BLUE,
    borderColor: BRAND_BLUE,
    borderWidth: 1,
  });

  let infoX = margin + 10;
  let infoY = y - 15;

  // Student photo on right
  if (pupil.photoUrl) {
    try {
      const photo = await embedPhoto(pdfDoc, pupil.photoUrl);
      if (photo) {
        page.drawImage(photo.image, {
          x: pageWidth - margin - 90,
          y: y - 90 + 5,
          width: photo.width,
          height: photo.height,
        });
      }
    } catch (error) {
      // ignore photo embed failures
    }
  }

  page.drawText("Name:", {
    x: infoX,
    y: infoY,
    size: 10,
    font: helveticaBold,
    color: TEXT_MUTED,
  });
  page.drawText(pupilName(pupil.firstName, pupil.lastName), {
    x: infoX + 120,
    y: infoY,
    size: 12,
    font: helveticaBold,
    color: TEXT_DARK,
  });
  infoY -= 18;

  page.drawText("Admission No:", {
    x: infoX,
    y: infoY,
    size: 10,
    font: helveticaBold,
    color: TEXT_MUTED,
  });
  page.drawText(pupil.admissionNo ?? "—", {
    x: infoX + 120,
    y: infoY,
    size: 11,
    font: helvetica,
    color: TEXT_DARK,
  });
  infoY -= 18;

  page.drawText("Class:", {
    x: infoX,
    y: infoY,
    size: 10,
    font: helveticaBold,
    color: TEXT_MUTED,
  });
  const classLabel = pupil.class
    ? `${pupil.class.name}${pupil.class.arm ? ` ${pupil.class.arm}` : ""}`
    : "Unassigned";
  page.drawText(classLabel, {
    x: infoX + 120,
    y: infoY,
    size: 11,
    font: helvetica,
    color: TEXT_DARK,
  });

  y -= 110;

  // ===== RESULTS BY ASSESSMENT =====
  if (pupil.results.length === 0) {
    page.drawText("No published results available.", {
      x: margin,
      y,
      size: 12,
      font: helvetica,
      color: TEXT_MUTED,
    });
  } else {
    let assessmentIndex = 0;
    for (const [assessmentId, results] of resultsByAssessment.entries()) {
      // New page if needed
      if (y < 200) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 800;
      }

      const assessment = results[0]?.assessment;
      if (!assessment) continue;

      assessmentIndex++;

      // Assessment title
      page.drawText(`${assessment.name}`, {
        x: margin,
        y,
        size: 13,
        font: helveticaBold,
        color: BRAND_BLUE,
      });
      y -= 18;

      // Results table header
      const colW = 75;
      const tableX = margin;
      let tableY = y;

      const cols = [
        { label: "Subject", width: 140 },
        { label: "CA", width: colW },
        { label: "Test", width: colW },
        { label: "Exam", width: colW },
        { label: "Total", width: colW },
        { label: "Grade", width: colW },
      ];

      // Header background
      let headerX = tableX;
      for (const col of cols) {
        page.drawRectangle({
          x: headerX,
          y: tableY - 18,
          width: col.width,
          height: 18,
          color: BRAND_BLUE,
        });
        page.drawText(col.label, {
          x: headerX + 4,
          y: tableY - 14,
          size: 9,
          font: helveticaBold,
          color: rgb(1, 1, 1),
        });
        headerX += col.width;
      }

      tableY -= 20;
      const lineHeight = 16;
      let rowCount = 0;

      for (const result of results) {
        // Check page space
        if (tableY < 120) {
          page = pdfDoc.addPage([595.28, 841.89]);
          tableY = 800;

          // Redraw header on new page
          let hx = tableX;
          for (const col of cols) {
            page.drawRectangle({
              x: hx,
              y: tableY - 18,
              width: col.width,
              height: 18,
              color: BRAND_BLUE,
            });
            page.drawText(col.label, {
              x: hx + 4,
              y: tableY - 14,
              size: 9,
              font: helveticaBold,
              color: rgb(1, 1, 1),
            });
            hx += col.width;
          }
          tableY -= 20;
        }

        // Alternating row background
        if (rowCount % 2 === 0) {
          page.drawRectangle({
            x: tableX,
            y: tableY - lineHeight,
            width: pageWidth - 2 * margin,
            height: lineHeight,
            color: LIGHT_BLUE,
          });
        }

        const subjectName = result.subject ?? "General";
        const ca = result.caScore?.toFixed(1) ?? "—";
        const test = result.testScore?.toFixed(1) ?? "—";
        const exam = result.examScore?.toFixed(1) ?? "—";
        const total = result.totalScore?.toFixed(1) ?? "—";
        const grade = result.grade ?? "—";

        let cellX = tableX;
        page.drawText(subjectName, {
          x: cellX + 4,
          y: tableY - 12,
          size: 10,
          font: helvetica,
          color: TEXT_DARK,
        });
        cellX += cols[0].width;

        for (const val of [ca, test, exam, total]) {
          page.drawText(val, {
            x: cellX + 4,
            y: tableY - 12,
            size: 10,
            font: helvetica,
            color: TEXT_DARK,
          });
          cellX += colW;
        }

        // Grade with color
        const gradeColor =
          grade === "A"
            ? SUCCESS_GREEN
            : grade.match(/B|C/)
              ? BRAND_BLUE
              : grade.match(/D|E/)
                ? rgb(0.57, 0.35, 0.04)
                : rgb(0.8, 0.06, 0.09);

        page.drawText(grade, {
          x: cellX + 4,
          y: tableY - 12,
          size: 10,
          font: helveticaBold,
          color: gradeColor,
        });

        tableY -= lineHeight;
        rowCount++;

        // Teacher remark/comment
        if (result.comment) {
          tableY -= 2;
          page.drawText(`Remark: ${result.comment}`, {
            x: margin + 10,
            y: tableY,
            size: 9,
            font: helvetica,
            color: TEXT_MUTED,
          });
          tableY -= 12;
        }
      }

      y = tableY - 16;
    }
  }

  // ===== GRADING SCALE LEGEND =====
  if (y < 150) {
    page = pdfDoc.addPage([595.28, 841.89]);
    y = 800;
  }

  page.drawText("Grading Scale", {
    x: margin,
    y,
    size: 12,
    font: helveticaBold,
    color: BRAND_BLUE,
  });
  y -= 16;

  const gradingScales = school.gradingScales || [];
  if (gradingScales.length > 0) {
    let legendX = margin;
    let legendY = y;
    const scalePerRow = 3;
    let scaleCount = 0;

    for (const scale of gradingScales) {
      if (scaleCount % scalePerRow === 0 && scaleCount > 0) {
        legendY -= 22;
        legendX = margin;
      }

      page.drawRectangle({
        x: legendX,
        y: legendY - 16,
        width: 30,
        height: 14,
        color:
          scale.grade === "A"
            ? SUCCESS_GREEN
            : scale.grade.match(/B|C/)
              ? BRAND_BLUE
              : scale.grade.match(/D|E/)
                ? rgb(0.57, 0.35, 0.04)
                : rgb(0.8, 0.06, 0.09),
      });

      page.drawText(`${scale.grade}: ${scale.minScore}-${scale.maxScore}`, {
        x: legendX + 35,
        y: legendY - 12,
        size: 10,
        font: helvetica,
        color: TEXT_DARK,
      });

      legendX += 180;
      scaleCount++;
    }
  }

  // ===== FOOTER WITH DATE =====
  page.drawLine({
    start: { x: margin, y: 40 },
    end: { x: pageWidth - margin, y: 40 },
    thickness: 1,
    color: TEXT_MUTED,
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  page.drawText(`Printed on ${dateStr}`, {
    x: margin,
    y: 25,
    size: 9,
    font: helvetica,
    color: TEXT_MUTED,
  });

  page.drawText("SchoolBase © 2026", {
    x: pageWidth - margin - 80,
    y: 25,
    size: 9,
    font: helvetica,
    color: TEXT_MUTED,
  });

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="report-card-${pupil.id}.pdf"`,
    },
  });
}
