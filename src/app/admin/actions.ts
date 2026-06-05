"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PaymentMethod, SchoolPhase, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getStaffSession, requireStaffSession, hashPassword, normalizePhone } from "@/lib/auth";
import { getCurrentSchoolId } from "@/lib/school";
import { sendEmail, buildGuardianRegistrationEmail, buildTeacherRegistrationEmail, buildTeacherAssignmentEmail } from "@/lib/email";
import { sendFeeReminderNotification } from "@/lib/notification";
import { uploadStudentPhotoToBackend } from "@/lib/storage";
import { calculateGrade, updateAssessmentPositions } from "@/lib/grade-calculator";
import { sendResultPublishedNotifications } from "@/lib/notification";
import { getTeacherAccessibleClassIds, getTeacherAccessibleSubjectIds } from "@/lib/teacher-permissions";

async function requireSchoolId() {
  await requireStaffSession();
  return getCurrentSchoolId();
}

export async function recordPayment(formData: FormData) {
  const session = await requireStaffSession();
  const schoolId = await getCurrentSchoolId();
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const amountNaira = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "CASH") as PaymentMethod;
  const reference = String(formData.get("reference") ?? "").trim() || null;

  if (!invoiceId || !amountNaira || amountNaira <= 0) {
    throw new Error("Enter a valid amount.");
  }

  const amountMinor = Math.round(amountNaira * 100);
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, schoolId },
    include: {
      pupil: {
        include: {
          class: true,
          guardians: {
            include: { guardian: true },
          },
        },
      },
      feeSchedule: {
        include: {
          term: {
            include: {
              academicYear: true,
            },
          },
        },
      },
    },
  });
  
  if (!invoice) throw new Error("Invoice not found.");

  const newPaid = invoice.amountPaid + amountMinor;
  const status =
    newPaid >= invoice.amountDue
      ? "PAID"
      : newPaid > 0
        ? "PART_PAID"
        : invoice.status;

  const payment = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.create({
      data: {
        invoiceId,
        amount: amountMinor,
        method,
        reference,
        recordedBy: session.name,
      },
    });
    await tx.invoice.update({
      where: { id: invoiceId },
      data: { amountPaid: newPaid, status },
    });
    return p;
  });

  // Send payment confirmation email to all guardians
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: {
      name: true,
      currency: true,
      logoUrl: true,
    },
  });

  if (school && invoice.pupil.guardians.length > 0) {
    const { buildInvoicePaymentEmail } = await import("@/lib/email");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://schoolbase.live";
    const rawLogo = (school as any)?.logoUrl;
    const logoUrlForEmail = rawLogo
      ? rawLogo.startsWith("/")
        ? `${appUrl.replace(/\/$/, "")}${rawLogo}`
        : rawLogo
      : undefined;
    const headerLogoUrl = logoUrlForEmail ?? `${appUrl.replace(/\/$/, "")}/logo.png`;
    const classLabel = invoice.pupil.class
      ? `${invoice.pupil.class.name}${invoice.pupil.class.arm ? ` ${invoice.pupil.class.arm}` : ""}`
      : "Unassigned";

    const termName = invoice.feeSchedule?.term?.name ?? null;
    const sessionName = invoice.feeSchedule?.term?.academicYear?.name ?? null;

    for (const guardianLink of invoice.pupil.guardians) {
      const email = buildInvoicePaymentEmail({
        guardianName: `${guardianLink.guardian.firstName} ${guardianLink.guardian.lastName}`,
        pupilName: `${invoice.pupil.firstName} ${invoice.pupil.lastName}`,
        className: classLabel,
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        amount: amountMinor,
        reference: reference ?? "",
        termName,
        sessionName,
        schoolName: school.name,
        appUrl,
        headerLogoUrl,
      });

      if (guardianLink.guardian.email) {
        await sendEmail({
          to: guardianLink.guardian.email,
          subject: email.subject,
          text: email.text,
          html: email.html,
        }).catch((err) => {
          console.error(`Failed to send payment email to ${guardianLink.guardian.email}:`, err);
        });
      }
    }
  }

  revalidatePath("/admin/fees");
  redirect("/admin/fees?paymentRecorded=1");
}

export async function createFeeScheduleAction(formData: FormData) {
  const schoolId = await requireSchoolId();
  const termId = String(formData.get("termId") ?? "");
  const classIdRaw = String(formData.get("classId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const amountValue = Number(formData.get("amount") ?? 0);

  if (!termId) throw new Error("Select a term for this fee schedule.");
  if (!name) throw new Error("Enter a fee schedule name.");
  if (!amountValue || amountValue <= 0) throw new Error("Enter a valid amount.");

  const term = await prisma.term.findFirst({
    where: { id: termId, academicYear: { schoolId } },
  });

  if (!term) throw new Error("Term not found.");

  const classId = classIdRaw || null;
  if (classId) {
    const classItem = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });
    if (!classItem) throw new Error("Class not found.");
  }

  const createData: {
    schoolId: string;
    termId: string;
    name: string;
    amount: number;
    classId?: string | null;
  } = {
    schoolId,
    termId,
    name,
    amount: Math.round(amountValue * 100),
  };

  if (classId) {
    createData.classId = classId;
  }

  await prisma.feeSchedule.create({
    data: createData,
  });

  revalidatePath("/admin/fees");
  revalidatePath("/admin/fees/schedules");
  redirect("/admin/fees/schedules?success=1");
}

export async function issueTermInvoicesAction(formData: FormData) {
  const schoolId = await requireSchoolId();
  const termId = String(formData.get("termId") ?? "");

  let term = null;
  if (termId) {
    term = await prisma.term.findFirst({
      where: { id: termId, academicYear: { schoolId } },
    });
  }

  if (!term) {
    term = await prisma.term.findFirst({
      where: { academicYear: { schoolId, isCurrent: true } },
      orderBy: { sortOrder: "asc" },
    });
  }

  if (!term) return;
  if (!term) {
    // Redirect back with an error so the UI can show feedback
    redirect(`/admin/fees?error=term_not_found`);
  }

  const feeSchedules = await prisma.feeSchedule.findMany({
    where: { termId: term.id },
    select: {
      id: true,
      schoolId: true,
      termId: true,
      classId: true,
      name: true,
      amount: true,
      createdAt: true,
    },
  });
  if (feeSchedules.length === 0) {
    // No fee schedules found for this term — notify the UI
    redirect(`/admin/fees?error=no_schedules&termId=${term.id}`);
  }

  const defaultSchedule = feeSchedules.find((schedule) => !schedule.classId) ?? null;
  const pupils = await prisma.pupil.findMany({
    where: { schoolId, isActive: true },
    include: { class: true },
  });

  const existing = await prisma.invoice.findMany({
    where: { schoolId, feeSchedule: { termId: term.id } },
    select: { pupilId: true },
  });
  const hasInvoice = new Set(existing.map((e) => e.pupilId));
  let created = 0;
  const count = await prisma.invoice.count({ where: { schoolId } });

  for (const pupil of pupils) {
    if (hasInvoice.has(pupil.id)) continue;

    const schedule =
      (pupil.classId && feeSchedules.find((s) => s.classId === pupil.classId)) ||
      defaultSchedule;
    if (!schedule) continue;

    await prisma.invoice.create({
      data: {
        schoolId,
        pupilId: pupil.id,
        feeScheduleId: schedule.id,
        invoiceNo: `INV-${new Date().getFullYear()}-${String(count + created + 1).padStart(4, "0")}`,
        amountDue: schedule.amount,
        status: "SENT",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    created++;
  }
  revalidatePath("/admin/fees");
  redirect(`/admin/fees?success=1&created=${created}&termId=${term.id}`);
}

export async function sendFeeRemindersAction() {
  const schoolId = await requireSchoolId();
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) return;

  const invoices = await prisma.invoice.findMany({
    where: {
      schoolId,
      status: { in: ["SENT", "PART_PAID", "OVERDUE"] },
    },
    include: {
      feeSchedule: {
        include: {
          term: {
            include: {
              academicYear: true,
            },
          },
        },
      },
      pupil: {
        include: {
          class: true,
          guardians: { include: { guardian: true } },
        },
      },
    },
  });

  const rawLogo = (school as any)?.logoUrl;
  const logoUrlForEmail = rawLogo
    ? rawLogo.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live"}${rawLogo}`
      : rawLogo
    : undefined;

  let sent = 0;
  for (const invoice of invoices) {
    const guardianLinks = invoice.pupil.guardians;

    if (guardianLinks.length === 0) {
      continue;
    }

    const termName = invoice.feeSchedule?.term?.name ?? null;
    const sessionName = invoice.feeSchedule?.term?.academicYear?.name ?? null;

    for (const link of guardianLinks) {
      const success = await sendFeeReminderNotification(
        schoolId,
        link.guardian.id,
        link.guardian.whatsapp,
        link.guardian.phone,
        link.guardian.email,
        invoice.pupil.firstName,
        invoice.pupil.lastName,
        invoice.id,
        invoice.invoiceNo,
        invoice.amountDue,
        invoice.amountPaid,
        invoice.dueDate,
        school.name,
        school.currency,
        logoUrlForEmail,
        termName,
        sessionName,
      );
      if (success) {
        sent++;
      }
    }
  }

  revalidatePath("/admin/fees");
  redirect(`/admin/fees?reminders=1&sent=${sent}`);
}

// Validation: Check if assessment is ready to publish
async function validateAssessmentPublish(assessmentId: string, schoolId: string) {
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, schoolId },
    include: {
      results: { include: { pupil: true } },
    },
  });
  
  if (!assessment) return { valid: false, errors: ["Assessment not found"] };
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Get all pupils in this assessment's phase
  const expectedPupils = await prisma.pupil.findMany({
    where: { schoolId, class: { phase: assessment.phase }, isActive: true },
  });
  
  // resultsByPupil intentionally omitted (not used here currently)
  
  // Check each student
  for (const pupil of expectedPupils) {
    const results = assessment.results.filter(r => r.pupilId === pupil.id);
    
    if (results.length === 0) {
      errors.push(`${pupil.firstName} ${pupil.lastName}: No subjects entered`);
      continue;
    }
    
    for (const result of results) {
      // Check for empty grades
      if (!result.grade) {
        errors.push(`${pupil.firstName} ${pupil.lastName} — ${result.subject}: No grade calculated`);
      }
      
      // Check for missing total score
      if (result.totalScore === null || result.totalScore === undefined) {
        errors.push(`${pupil.firstName} ${pupil.lastName} — ${result.subject}: Total score missing`);
      }
      
      // Check for missing scores
      if (result.caScore === null || result.testScore === null || result.examScore === null) {
        errors.push(`${pupil.firstName} ${pupil.lastName} — ${result.subject}: Incomplete scores (CA/Test/Exam)`);
      }
    }
    
    // Check for duplicate subjects
    const subjectsCount = new Map<string, number>();
    results.forEach(r => {
      const key = r.subject || r.subjectId || "unknown";
      subjectsCount.set(key, (subjectsCount.get(key) ?? 0) + 1);
    });
    
    for (const [subject, count] of subjectsCount) {
      if (count > 1) {
        errors.push(`${pupil.firstName} ${pupil.lastName}: Duplicate entries for ${subject}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalStudents: expectedPupils.length,
      completedStudents: expectedPupils.filter(p => assessment.results.some(r => r.pupilId === p.id)).length,
      issueCount: errors.length,
    },
  };
}

export async function publishAssessment(assessmentId: string) {
  const schoolId = await requireSchoolId();
  const session = await requireStaffSession();
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, schoolId },
  });
  if (!assessment) return { error: "Assessment not found." };
  
  // Validate before publishing
  const validation = await validateAssessmentPublish(assessmentId, schoolId);
  if (!validation.valid) {
    return {
      error: "Cannot publish: validation errors found",
      issues: validation.errors,
      summary: validation.summary,
    };
  }

  // Calculate positions (ranking) for the class before publishing
  await updateAssessmentPositions(assessmentId);

  const now = new Date();
  const results = await prisma.result.findMany({
    where: { assessmentId },
  });

  await prisma.$transaction([
    prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: "PUBLISHED" },
    }),
    prisma.result.updateMany({
      where: { assessmentId },
      data: { publishedAt: now },
    }),
    // Log the publishing action for all results
    ...results.map((result) =>
      prisma.resultAudit.create({
        data: {
          schoolId,
          resultId: result.id,
          assessmentId,
          pupilId: result.pupilId,
          action: "PUBLISHED",
          changedBy: session.email || session.name,
        },
      })
    ),
  ]);

  // Send notifications to parents (non-blocking)
  sendResultPublishedNotifications(assessmentId, schoolId).catch((error) => {
    console.error("Failed to send result notifications:", error);
  });

  revalidatePath("/admin/results");
  revalidatePath("/parent");
  return { success: true };
}

export async function approveAssessment(assessmentId: string) {
  const schoolId = await requireSchoolId();
  await prisma.assessment.updateMany({
    where: { id: assessmentId, schoolId, status: "DRAFT" },
    data: { status: "APPROVED" },
  });
  revalidatePath("/admin/results");
  revalidatePath(`/admin/results/${assessmentId}`);
  return { success: true };
}

// Return assessment to DRAFT status (admin only)
export async function returnAssessmentToDraft(assessmentId: string, reason: string) {
  const schoolId = await requireSchoolId();
  const session = await requireStaffSession();
  
  // Only school administrators can return an assessment to draft
  if (session.role !== "SCHOOL_ADMIN") {
    return { error: "Only school administrators can return assessments to draft" };
  }
  
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, schoolId },
  });
  
  if (!assessment) return { error: "Assessment not found" };
  if (assessment.status === "DRAFT") return { error: "Assessment is already in draft status" };
  
  await prisma.$transaction([
    prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: "DRAFT" },
    }),
    // Log the action (store changes as JSON string)
    prisma.resultAudit.createMany({
      data: (await prisma.result.findMany({ where: { assessmentId } })).map(r => ({
        schoolId,
        resultId: r.id,
        assessmentId,
        pupilId: r.pupilId,
        action: "RETURNED_TO_DRAFT",
        changes: JSON.stringify({ reason }),
        changedBy: `${session.email || session.name}`,
      })),
    }),
  ]);
  
  revalidatePath("/admin/results");
  revalidatePath(`/admin/results/${assessmentId}`);
  return { success: true };
}

export async function approveAssessmentForm(formData: FormData) {
  const id = String(formData.get("assessmentId") ?? "");
  await approveAssessment(id);
}

export async function returnAssessmentToDraftForm(formData: FormData) {
  const id = String(formData.get("assessmentId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const result = await returnAssessmentToDraft(id, reason);
  if (result.error) throw new Error(result.error);
}

export async function createAssessment(formData: FormData) {
  const schoolId = await requireSchoolId();
  const id = String(formData.get("termId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phase = String(formData.get("phase") ?? "PRIMARY") as SchoolPhase;

  if (!id || !name || !phase) {
    throw new Error("Please fill in all assessment details.");
  }

  const term = await prisma.term.findFirst({
    where: { id, academicYear: { schoolId } },
  });

  if (!term) {
    throw new Error("Selected term was not found.");
  }

  const assessment = await prisma.assessment.create({
    data: {
      schoolId,
      termId: term.id,
      name,
      phase,
    },
  });

  revalidatePath("/admin/results");
  redirect(`/admin/results/${assessment.id}`);
}

export async function saveResultMarks(formData: FormData) {
  const session = await requireStaffSession();
  const schoolId = await requireSchoolId();
  const assessmentId = String(formData.get("assessmentId") ?? "");
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, schoolId },
  });
  if (!assessment) throw new Error("Assessment not found");
  
  // CHECK: LOCK EDITING AFTER APPROVAL
  // Teachers can ONLY edit in DRAFT status
  if (session.role === "TEACHER") {
    if (assessment.status !== "DRAFT") {
      throw new Error(
        assessment.status === "APPROVED"
          ? "Assessment is locked for editing. Your administrator must return it to draft status for changes."
          : "Published assessments cannot be edited"
      );
    }
  }
  
  // Admins can edit DRAFT and APPROVED, but warn if APPROVED
  if (session.role === "SCHOOL_ADMIN" && assessment.status === "APPROVED") {
    console.warn(`Admin ${session.email} editing APPROVED assessment ${assessmentId} - this should trigger audit trail`);
  }
  
  // Block edits on PUBLISHED (admins too)
  if (assessment.status === "PUBLISHED") {
    throw new Error("Published assessments are locked and cannot be edited");
  }

  // Teacher permission check: Get accessible classes and subjects
  let teacherClassIds: string[] | null = null;
  let teacherSubjectIds: string[] | null = null;
  
  if (session.role === "TEACHER") {
    teacherClassIds = await getTeacherAccessibleClassIds(session.userId, schoolId);
    teacherSubjectIds = await getTeacherAccessibleSubjectIds(session.userId, schoolId);
    
    if (teacherClassIds.length === 0 || teacherSubjectIds.length === 0) {
      console.error(`Teacher ${session.userId} has no class/subject assignments`);
      return;
    }
  }

  // Expect form entries like `entry` = "pupilId|subjectId"
  const entries = formData.getAll("entry").map(String).filter(Boolean);
  for (const entry of entries) {
    const [pupilId, subjectId] = entry.split("|");
    if (!pupilId) continue;

    // Teacher permission check: Verify access to this pupil's class
    if (session.role === "TEACHER" && teacherClassIds) {
      const pupil = await prisma.pupil.findUnique({
        where: { id: pupilId },
        select: { classId: true },
      });
      
      if (!pupil?.classId || !teacherClassIds.includes(pupil.classId)) {
        console.error(`Teacher ${session.userId} does not have access to pupil ${pupilId}'s class`);
        continue; // Skip this entry
      }

      // Verify access to subject
      if (subjectId && !teacherSubjectIds!.includes(subjectId)) {
        console.error(`Teacher ${session.userId} does not have access to subject ${subjectId}`);
        continue; // Skip this entry
      }
    }
    const ca = formData.get(`ca_${pupilId}_${subjectId}`);
    const test = formData.get(`test_${pupilId}_${subjectId}`);
    const exam = formData.get(`exam_${pupilId}_${subjectId}`);
    const comment = String(formData.get(`comment_${pupilId}_${subjectId}`) ?? "").trim();

    // Numeric scores
    const caNum = ca ? Number(ca) : null;
    const testNum = test ? Number(test) : null;
    const examNum = exam ? Number(exam) : null;

    // Skip empty entries that have no scores and no comment.
    if (caNum === null && testNum === null && examNum === null && !comment) {
      continue;
    }

    // Calculate total score automatically
    const totalScore = (caNum ?? 0) + (testNum ?? 0) + (examNum ?? 0);

    // Calculate grade from total score
    const grade = await calculateGrade(schoolId, totalScore);

    // Resolve subject name if subjectId provided
    let subjectName = "General";
    if (subjectId) {
      const subj = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (subj) subjectName = subj.name;
    }

    // Get existing result to detect changes
    const existing = await prisma.result.findFirst({
      where: {
        assessmentId,
        pupilId,
        subject: subjectName,
      },
    });

    const updateData = {
      caScore: caNum,
      testScore: testNum,
      examScore: examNum,
      totalScore: totalScore > 0 ? totalScore : null,
      grade,
      comment: comment || null,
      subjectId: subjectId || null,
      updatedBy: session.name,
    };

    const result = await prisma.result.upsert({
      where: {
        assessmentId_pupilId_subject: {
          assessmentId,
          pupilId,
          subject: subjectName,
        },
      },
      update: updateData,
      create: {
        assessmentId,
        pupilId,
        subject: subjectName,
        ...updateData,
      },
    });

    // Log score entry/edit to audit trail
    if (existing && (existing.caScore !== caNum || existing.testScore !== testNum || existing.examScore !== examNum)) {
      await prisma.resultAudit.create({
        data: {
          schoolId,
          resultId: result.id,
          assessmentId,
          pupilId,
          action: "SCORE_EDITED",
          changes: JSON.stringify({
            ca: { from: existing.caScore, to: caNum },
            test: { from: existing.testScore, to: testNum },
            exam: { from: existing.examScore, to: examNum },
          }),
          changedBy: session.email || session.name,
        },
      });
    } else if (!existing) {
      await prisma.resultAudit.create({
        data: {
          schoolId,
          resultId: result.id,
          assessmentId,
          pupilId,
          action: "SCORE_ENTERED",
          changes: JSON.stringify({ ca: caNum, test: testNum, exam: examNum }),
          changedBy: session.email || session.name,
        },
      });
    }
  }

  revalidatePath(`/admin/results/${assessmentId}`);
  revalidatePath("/admin/results");
  const classId = String(formData.get("classId") ?? "").trim();
  if (classId) {
    redirect(`/admin/results/${assessmentId}?classId=${classId}&saved=true`);
  }
  redirect(`/admin/results/${assessmentId}?saved=true`);
}

export async function createStudent(formData: FormData) {
  const schoolId = await requireSchoolId();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const middleName = String(formData.get("middleName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const classId = String(formData.get("classId") ?? "");
  const admissionNo = String(formData.get("admissionNo") ?? "").trim();
  const guardianFirst = String(formData.get("guardianFirst") ?? "").trim();
  const guardianLast = String(formData.get("guardianLast") ?? "").trim();
  const guardianRelationship = String(formData.get("guardianRelationship") ?? "").trim();
  const guardianEmail = String(formData.get("guardianEmail") ?? "").trim();
  const guardianPhone = String(formData.get("guardianPhone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  const normalizedGuardianPhone = guardianPhone
    ? normalizePhone(guardianPhone, school?.country ?? undefined)
    : "";

  if (!firstName || !lastName || !classId || !gender || !guardianPhone || !guardianRelationship) return;

  // If an admission number wasn't provided, generate one using the school's
  // slug as a prefix and the current year, e.g. GFA-2026-0012
  let finalAdmissionNo: string | undefined = admissionNo || undefined;
  if (!finalAdmissionNo) {
    // Otherwise derive initials from the school name (up to 3 letters).
    const rawInitials = (school as { initials?: string } | null)?.initials;
    let prefix = "SCH";
    if (rawInitials && typeof rawInitials === "string" && rawInitials.trim()) {
      prefix = rawInitials.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    } else if (school?.name) {
      const words = school.name.split(/[^A-Za-z0-9]+/).filter(Boolean);
      // Take first letters of up to 3 words
      let letters = words.slice(0, 3).map((w: string) => w[0]).join("").toUpperCase();
      // If < 3 letters, take more letters from the first word
      if (letters.length < 3 && words[0]) {
        const remaining = words[0].slice(1).replace(/[^A-Za-z0-9]/g, "");
        for (const ch of remaining) {
          letters += ch.toUpperCase();
          if (letters.length >= 3) break;
        }
      }
      prefix = (letters || "SCH").replace(/[^A-Z0-9]/g, "").slice(0, 6);
    }
    const year = new Date().getFullYear();

    // Use an admission counter to allocate a unique sequence atomically per school/year
    const counter = await prisma.$transaction(async (tx) => {
      const up = await tx.admissionCounter.upsert({
        where: { schoolId_year: { schoolId, year } },
        update: { lastSeq: { increment: 1 } },
        create: { schoolId, year, lastSeq: 1 },
      });
      return up;
    });

    const seq = String(counter.lastSeq).padStart(4, "0");
    finalAdmissionNo = `${prefix}-${year}-${seq}`;
  }

  const pupil = await prisma.pupil.create({
    data: {
      schoolId,
      classId,
      firstName,
      middleName: middleName || undefined,
      lastName,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      address: address || undefined,
      admissionNo: finalAdmissionNo,
    },
  });

  const photoFile = formData.get("photo") as File | null;
  if (photoFile?.size && photoFile.type.startsWith("image/")) {
    const photoUrl = await uploadStudentPhotoToBackend(pupil.id, photoFile);
    await prisma.pupil.update({
      where: { id: pupil.id },
      data: { photoUrl },
    });
  }

  const guardian = await prisma.guardian.create({
    data: {
      schoolId,
      firstName: guardianFirst || "Parent",
      lastName: guardianLast || lastName,
      phone: normalizedGuardianPhone,
      whatsapp: normalizedGuardianPhone,
      email: guardianEmail || undefined,
    },
  });

  await prisma.guardianPupil.create({
    data: {
      guardianId: guardian.id,
      pupilId: pupil.id,
      relation: guardianRelationship || "Guardian",
    },
  });

  let guardianEmailFailed = false;
  let guardianEmailError = "";

  if (guardianEmail) {
    try {
      const classRecord = await prisma.class.findUnique({ where: { id: classId } });
      const className = classRecord?.arm
        ? `${classRecord.name} ${classRecord.arm}`
        : classRecord?.name ?? "your class";
      const guardianName = [guardianFirst || "Parent", guardianLast].filter(Boolean).join(" ");
      const schoolNameValue = school?.name?.trim() || "SchoolBase";
      const rawLogo = (school as any)?.logoUrl;
      const logoUrlForEmail = rawLogo
        ? rawLogo.startsWith("/")
          ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live"}${rawLogo}`
          : rawLogo
        : undefined;
      const emailContent = buildGuardianRegistrationEmail({
        guardianName,
        pupilName: `${firstName} ${lastName}`,
        className,
        admissionNo: finalAdmissionNo,
        relation: guardianRelationship || "Guardian",
        schoolName: schoolNameValue,
        headerLogoUrl: logoUrlForEmail,
      });

      const info = await sendEmail({
        to: guardianEmail,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      console.info("Parent registration email accepted by SMTP:", {
        guardianEmail,
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected,
      });
    } catch (error) {
      guardianEmailFailed = true;
      guardianEmailError = String(error instanceof Error ? error.message : error);
      console.error("Parent registration email failed for guardian:", guardianEmail, error);
      // Keep registration working while surfacing the failure in the UI.
    }
  }

  revalidatePath("/admin/students");
  redirect(
    `/admin/students?saved=1${guardianEmailFailed ? `&emailFailed=1&emailError=${encodeURIComponent(guardianEmailError)}` : ""}`
  );
}

export async function updateStudent(formData: FormData) {
  const schoolId = await requireSchoolId();
  const studentId = String(formData.get("studentId") ?? "");
  const guardianId = String(formData.get("guardianId") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const classId = String(formData.get("classId") ?? "");
  const admissionNo = String(formData.get("admissionNo") ?? "").trim();
  const guardianFirst = String(formData.get("guardianFirst") ?? "").trim();
  const guardianLast = String(formData.get("guardianLast") ?? "").trim();
  const guardianPhone = String(formData.get("guardianPhone") ?? "").trim();
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { country: true },
  });
  const normalizedGuardianPhone = guardianPhone
    ? normalizePhone(guardianPhone, school?.country ?? undefined)
    : "";

  if (!studentId || !firstName || !lastName || !classId) return;

  const middleName = String(formData.get("middleName") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const guardianRelationship = String(formData.get("guardianRelationship") ?? "").trim();
  const guardianEmail = String(formData.get("guardianEmail") ?? "").trim();

  const updateData: Record<string, unknown> = {
    firstName,
    middleName: middleName || null,
    lastName,
    gender: gender || null,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    address: address || null,
    classId,
    admissionNo: admissionNo || null,
  };

  const photoFile = formData.get("photo") as File | null;
  if (photoFile?.size && photoFile.type.startsWith("image/")) {
    const photoUrl = await uploadStudentPhotoToBackend(studentId, photoFile);
    updateData.photoUrl = photoUrl;
  }

  await prisma.pupil.updateMany({
    where: { id: studentId, schoolId },
    data: updateData,
  });

  if (guardianId || guardianPhone || guardianFirst || guardianLast || guardianEmail || guardianRelationship) {
    if (guardianId) {
      const guardian = await prisma.guardian.findFirst({ where: { id: guardianId, schoolId } });
      if (guardian) {
        const guardianUpdateData: Record<string, string> = {};
        if (guardianFirst) guardianUpdateData.firstName = guardianFirst;
        if (guardianLast) guardianUpdateData.lastName = guardianLast;
        if (guardianPhone) {
          guardianUpdateData.phone = normalizedGuardianPhone;
          guardianUpdateData.whatsapp = normalizedGuardianPhone;
        }
        if (guardianEmail) guardianUpdateData.email = guardianEmail;
        if (Object.keys(guardianUpdateData).length > 0) {
          await prisma.guardian.update({
            where: { id: guardianId },
            data: guardianUpdateData,
          });
        }
      }
      if (guardianRelationship) {
        await prisma.guardianPupil.updateMany({
          where: { guardianId, pupilId: studentId },
          data: { relation: guardianRelationship },
        });
      }
    } else if (guardianPhone) {
      const guardian = await prisma.guardian.create({
        data: {
          schoolId,
          firstName: guardianFirst || "Parent",
          lastName: guardianLast || lastName,
          phone: normalizedGuardianPhone,
          whatsapp: normalizedGuardianPhone,
          email: guardianEmail || undefined,
        },
      });
      await prisma.guardianPupil.create({
        data: {
          guardianId: guardian.id,
          pupilId: studentId,
          relation: guardianRelationship || "Guardian",
        },
      });
    }
  }

  revalidatePath("/admin/students");
  redirect("/admin/students?updated=1");
}

export async function createSubject(formData: FormData) {
  const schoolId = await requireSchoolId();
  const name = String(formData.get("name") ?? "").trim();
  const classIds = formData.getAll("classIds").map(String).filter(Boolean);
  if (!name) return;

  const subject = await prisma.subject.upsert({
    where: {
      schoolId_name: {
        schoolId,
        name,
      },
    },
    update: {},
    create: {
      schoolId,
      name,
    },
  });

  if (classIds.length > 0) {
    const uniqueClassIds = Array.from(new Set(classIds));
    await Promise.all(
      uniqueClassIds.map((classId) =>
        prisma.subjectClass.create({
          data: {
            schoolId,
            classId,
            subjectId: subject.id,
          },
        }),
      ),
    );
  }

  revalidatePath("/admin/subjects");
  redirect("/admin/subjects");
}

export async function updateSubject(formData: FormData) {
  const schoolId = await requireSchoolId();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const classIds = formData.getAll("classIds").map(String).filter(Boolean);
  if (!id || !name) return;

  const subject = await prisma.subject.findFirst({ where: { id, schoolId } });
  if (!subject) return;

  await prisma.$transaction([
    prisma.subject.update({ where: { id }, data: { name } }),
    prisma.subjectClass.deleteMany({ where: { subjectId: id } }),
    ...Array.from(new Set(classIds)).map((classId) =>
      prisma.subjectClass.create({
        data: {
          schoolId,
          classId,
          subjectId: id,
        },
      }),
    ),
  ]);

  revalidatePath("/admin/subjects");
  redirect("/admin/subjects");
}

export async function deleteSubject(formData: FormData) {
  const schoolId = await requireSchoolId();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  // ensure subject belongs to this school before deleting
  const subj = await prisma.subject.findFirst({ where: { id, schoolId } });
  if (!subj) return;

  await prisma.subject.delete({ where: { id } });
  revalidatePath("/admin/subjects");
  redirect("/admin/subjects");
}

export async function createClass(formData: FormData) {
  const schoolId = await requireSchoolId();
  const name = String(formData.get("name") ?? "").trim();
  const phase = String(formData.get("phase") ?? "PRIMARY") as SchoolPhase;
  const arm = String(formData.get("arm") ?? "").trim() || null;

  if (!name || !phase) return;

  await prisma.class.create({
    data: {
      schoolId,
      name,
      phase,
      arm,
    },
  });

  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function createAcademicYear(formData: FormData) {
  const schoolId = await requireSchoolId();
  const name = String(formData.get("name") ?? "").trim();
  const isCurrent = String(formData.get("isCurrent") ?? "") === "true";

  if (!name) return;

  if (isCurrent) {
    await prisma.academicYear.updateMany({
      where: { schoolId },
      data: { isCurrent: false },
    });
  }

  await prisma.academicYear.create({
    data: {
      schoolId,
      name,
      isCurrent,
      terms: {
        create: [
          { name: "Term 1", sortOrder: 1 },
          { name: "Term 2", sortOrder: 2 },
          { name: "Term 3", sortOrder: 3 },
        ],
      },
    },
  });

  revalidatePath("/admin/settings/academic-years");
  redirect("/admin/settings/academic-years");
}

export async function setCurrentAcademicYear(formData: FormData) {
  const schoolId = await requireSchoolId();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const year = await prisma.academicYear.findFirst({ where: { id, schoolId } });
  if (!year) return;

  await prisma.$transaction([
    prisma.academicYear.updateMany({ where: { schoolId }, data: { isCurrent: false } }),
    prisma.academicYear.update({ where: { id }, data: { isCurrent: true } }),
  ]);

  revalidatePath("/admin/settings/academic-years");
  redirect("/admin/settings/academic-years");
}

export async function createTerm(formData: FormData) {
  const schoolId = await requireSchoolId();
  const academicYearId = String(formData.get("academicYearId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const sortOrderRaw = formData.get("sortOrder");
  const sortOrderNum = sortOrderRaw === null ? null : Number(sortOrderRaw);

  if (!academicYearId || !name) return;

  const academicYear = await prisma.academicYear.findFirst({
    where: { id: academicYearId, schoolId },
  });
  if (!academicYear) return;

  // If no explicit sortOrder provided, auto-assign as (max existing sortOrder + 1)
  let finalSortOrder = 1;
  if (typeof sortOrderNum === "number" && !Number.isNaN(sortOrderNum) && sortOrderNum > 0) {
    finalSortOrder = Math.floor(sortOrderNum);
  } else {
    const agg = await prisma.term.aggregate({
      where: { academicYearId },
      _max: { sortOrder: true },
    });
    const maxSort = agg._max?.sortOrder ?? 0;
    finalSortOrder = (maxSort || 0) + 1;
  }

  await prisma.term.create({
    data: {
      academicYearId,
      name,
      sortOrder: finalSortOrder,
    },
  });

  revalidatePath("/admin/settings/academic-years");
  redirect("/admin/settings/academic-years");
}

export async function updateTerm(formData: FormData) {
  const schoolId = await requireSchoolId();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const startsOnRaw = String(formData.get("startsOn") ?? "").trim() || null;
  const endsOnRaw = String(formData.get("endsOn") ?? "").trim() || null;

  if (!id) return;

  const term = await prisma.term.findFirst({
    where: { id },
    include: { academicYear: true },
  });
  if (!term) return;

  // ensure the term belongs to the current school
  if (term.academicYear.schoolId !== schoolId) return;

  const data: any = {};
  if (name) data.name = name;
  if (startsOnRaw) data.startsOn = new Date(startsOnRaw);
  if (endsOnRaw) data.endsOn = new Date(endsOnRaw);

  if (Object.keys(data).length > 0) {
    await prisma.term.update({ where: { id }, data });
  }

  revalidatePath("/admin/settings/academic-years");
  redirect("/admin/settings/academic-years");
}

export async function updateSchool(formData: FormData) {
  const schoolId = await requireSchoolId();
  const name = String(formData.get("name") ?? "").trim();
  const initials = String(formData.get("initials") ?? "").trim();

  const data: Record<string, string> = {};
  if (name) data.name = name;
  if (initials) data.initials = initials.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

  if (Object.keys(data).length > 0) {
    await prisma.school.update({ where: { id: schoolId }, data });
  }

  revalidatePath("/admin/settings");
  redirect("/admin/settings");
}

export async function updateClass(formData: FormData) {
  const schoolId = await requireSchoolId();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phase = String(formData.get("phase") ?? "PRIMARY") as SchoolPhase;
  const arm = String(formData.get("arm") ?? "").trim() || null;

  if (!id || !name || !phase) return;

  const existing = await prisma.class.findFirst({ where: { id, schoolId } });
  if (!existing) return;

  await prisma.class.update({
    where: { id },
    data: {
      name,
      phase,
      arm,
    },
  });

  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function deleteClass(formData: FormData) {
  const schoolId = await requireSchoolId();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const existing = await prisma.class.findFirst({ where: { id, schoolId } });
  if (!existing) return;

  await prisma.pupil.updateMany({
    where: { classId: id, schoolId },
    data: { classId: null },
  });

  await prisma.class.delete({ where: { id } });
  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function unassignSubjectClass(formData: FormData) {
  const schoolId = await requireSchoolId();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const mapping = await prisma.subjectClass.findFirst({ where: { id, schoolId } });
  if (!mapping) return;

  await prisma.subjectClass.delete({ where: { id } });
  revalidatePath("/admin/subjects");
  redirect("/admin/subjects");
}

export async function createTeacher(formData: FormData) {
  const schoolId = await requireSchoolId();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const classIds = formData.getAll("classIds").map(String).filter(Boolean);
  const subjectIds = formData.getAll("subjectIds").map(String).filter(Boolean);

  if (!name || !email || !password) {
    return { success: false, error: "Name, email, and password are required." };
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: `An account already exists with the email ${email}. Please use a different email.` };
    }

    const passwordHash = await hashPassword(password);

    const teacher = await prisma.user.create({
      data: {
        schoolId,
        name,
        email,
        role: UserRole.TEACHER,
        passwordHash,
      },
    });

    await Promise.all([
      ...Array.from(new Set(classIds)).map((classId) =>
        prisma.teacherClass.create({
          data: {
            schoolId,
            teacherId: teacher.id,
            classId,
          },
        }),
      ),
      ...Array.from(new Set(subjectIds)).map((subjectId) =>
        prisma.teacherSubject.create({
          data: {
            schoolId,
            teacherId: teacher.id,
            subjectId,
          },
        }),
      ),
    ]);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true, logoUrl: true },
    });

    const uniqueClassIds = Array.from(new Set(classIds));
    const uniqueSubjectIds = Array.from(new Set(subjectIds));
    const assignedClasses =
      uniqueClassIds.length > 0
        ? await prisma.class.findMany({
            where: { id: { in: uniqueClassIds }, schoolId },
            select: { name: true, arm: true },
          })
        : [];
    const assignedSubjects =
      uniqueSubjectIds.length > 0
        ? await prisma.subject.findMany({
            where: { id: { in: uniqueSubjectIds }, schoolId },
            select: { name: true },
          })
        : [];

    const headerLogoUrl = school?.logoUrl
      ? school.logoUrl.startsWith("/")
        ? `${appUrl.replace(/\/$/, "")}${school.logoUrl}`
        : school.logoUrl
      : `${appUrl.replace(/\/$/, "")}/logo.png`;

    try {
      if (teacher.email) {
        const emailPayload = buildTeacherRegistrationEmail({
          teacherName: teacher.name,
          teacherEmail: teacher.email,
          schoolName: school?.name ?? "your school",
          assignedClasses: assignedClasses.map((cls) =>
            cls.arm ? `${cls.name} ${cls.arm}` : cls.name,
          ),
          assignedSubjects: assignedSubjects.map((subject) => subject.name),
          registrationTime: new Date().toISOString(),
          appUrl,
          headerLogoUrl,
        });

        await sendEmail({
          to: teacher.email,
          subject: emailPayload.subject,
          text: emailPayload.text,
          html: emailPayload.html,
        });
      }
    } catch (error: unknown) {
      console.error("Failed to send teacher onboarding email:", error);
    }

    revalidatePath("/admin/teachers");
    return { success: true, message: "Teacher created successfully." };
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Check for Prisma unique constraint error
      if (error.message.includes('Unique constraint failed')) {
        return { success: false, error: `An account already exists with the email ${email}. Please use a different email.` };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create teacher. Please try again." };
  }
}

export async function updateTeacher(formData: FormData) {
  const schoolId = await requireSchoolId();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const classIds = formData.getAll("classIds").map(String).filter(Boolean);
  const subjectIds = formData.getAll("subjectIds").map(String).filter(Boolean);
  if (!id) return;

  const teacher = await prisma.user.findFirst({
    where: { id, schoolId, role: UserRole.TEACHER },
    include: {
      teacherClasses: { include: { class: true } },
      teacherSubjects: { include: { subject: true } },
    },
  });
  if (!teacher) return;

  const oldClassIds = teacher.teacherClasses.map((assignment) => assignment.classId);
  const oldSubjectIds = teacher.teacherSubjects.map((assignment) => assignment.subjectId);
  const oldClassSet = new Set(oldClassIds);
  const oldSubjectSet = new Set(oldSubjectIds);
  const assignmentsChanged =
    classIds.length !== oldClassIds.length ||
    subjectIds.length !== oldSubjectIds.length ||
    classIds.some((classId) => !oldClassSet.has(classId)) ||
    subjectIds.some((subjectId) => !oldSubjectSet.has(subjectId));

  const updateData: Record<string, unknown> = { name, email };
  if (password) {
    updateData.passwordHash = await hashPassword(password);
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: updateData }),
    prisma.teacherClass.deleteMany({ where: { teacherId: id } }),
    prisma.teacherSubject.deleteMany({ where: { teacherId: id } }),
    ...Array.from(new Set(classIds)).map((classId) =>
      prisma.teacherClass.create({ data: { schoolId, teacherId: id, classId } }),
    ),
    ...Array.from(new Set(subjectIds)).map((subjectId) =>
      prisma.teacherSubject.create({ data: { schoolId, teacherId: id, subjectId } }),
    ),
  ]);

  if (assignmentsChanged && teacher.email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true, logoUrl: true },
    });
    const uniqueClassIds = Array.from(new Set(classIds));
    const uniqueSubjectIds = Array.from(new Set(subjectIds));
    const assignedClasses =
      uniqueClassIds.length > 0
        ? await prisma.class.findMany({
            where: { id: { in: uniqueClassIds }, schoolId },
            select: { name: true, arm: true },
          })
        : [];
    const assignedSubjects =
      uniqueSubjectIds.length > 0
        ? await prisma.subject.findMany({
            where: { id: { in: uniqueSubjectIds }, schoolId },
            select: { name: true },
          })
        : [];

    const headerLogoUrl = school?.logoUrl
      ? school.logoUrl.startsWith("/")
        ? `${appUrl.replace(/\/$/, "")}${school.logoUrl}`
        : school.logoUrl
      : `${appUrl.replace(/\/$/, "")}/logo.png`;

    try {
      const emailPayload = buildTeacherAssignmentEmail({
        teacherName: name || teacher.name,
        schoolName: school?.name ?? "your school",
        assignedClasses: assignedClasses.map((cls) =>
          cls.arm ? `${cls.name} ${cls.arm}` : cls.name,
        ),
        assignedSubjects: assignedSubjects.map((subject) => subject.name),
        appUrl,
        headerLogoUrl,
      });

      await sendEmail({
        to: email,
        subject: emailPayload.subject,
        text: emailPayload.text,
        html: emailPayload.html,
      });
    } catch (error: unknown) {
      console.error("Failed to send teacher assignment email:", error);
    }
  }

  revalidatePath("/admin/teachers");
  redirect("/admin/teachers");
}

export async function saveTeacherAssignments(formData: FormData) {
  await requireStaffSession();
  const schoolId = await getCurrentSchoolId();
  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const classIds = formData.getAll("classes").map(String).filter(Boolean);
  const subjectIds = formData.getAll("subjects").map(String).filter(Boolean);

  if (!teacherId) {
    throw new Error("Teacher ID is required.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.teacherClass.deleteMany({ where: { teacherId, schoolId } });
    await tx.teacherSubject.deleteMany({ where: { teacherId, schoolId } });

    if (classIds.length > 0) {
      await tx.teacherClass.createMany({
        data: classIds.map((classId) => ({ teacherId, classId, schoolId })),
        skipDuplicates: true,
      });
    }

    if (subjectIds.length > 0) {
      await tx.teacherSubject.createMany({
        data: subjectIds.map((subjectId) => ({ teacherId, subjectId, schoolId })),
        skipDuplicates: true,
      });
    }
  });

  const teacher = await prisma.user.findFirst({
    where: { id: teacherId, schoolId, role: UserRole.TEACHER },
  });

  if (teacher?.email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true, logoUrl: true },
    });

    const uniqueClassIds = Array.from(new Set(classIds));
    const uniqueSubjectIds = Array.from(new Set(subjectIds));
    const assignedClasses =
      uniqueClassIds.length > 0
        ? await prisma.class.findMany({
            where: { id: { in: uniqueClassIds }, schoolId },
            select: { name: true, arm: true },
          })
        : [];
    const assignedSubjects =
      uniqueSubjectIds.length > 0
        ? await prisma.subject.findMany({
            where: { id: { in: uniqueSubjectIds }, schoolId },
            select: { name: true },
          })
        : [];

    const headerLogoUrl = school?.logoUrl
      ? school.logoUrl.startsWith("/")
        ? `${appUrl.replace(/\/$/, "")}${school.logoUrl}`
        : school.logoUrl
      : `${appUrl.replace(/\/$/, "")}/logo.png`;

    try {
      const emailPayload = buildTeacherAssignmentEmail({
        teacherName: teacher.name,
        schoolName: school?.name ?? "your school",
        assignedClasses: assignedClasses.map((cls) =>
          cls.arm ? `${cls.name} ${cls.arm}` : cls.name,
        ),
        assignedSubjects: assignedSubjects.map((subject) => subject.name),
        appUrl,
        headerLogoUrl,
      });

      await sendEmail({
        to: teacher.email,
        subject: emailPayload.subject,
        text: emailPayload.text,
        html: emailPayload.html,
      });
    } catch (error: unknown) {
      console.error("Failed to send teacher assignment email:", error);
    }
  }

  revalidatePath("/admin/teacher-assignments");
  return { success: true };
}

export async function deleteTeacher(formData: FormData) {
  const schoolId = await requireSchoolId();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const teacher = await prisma.user.findFirst({ where: { id, schoolId, role: UserRole.TEACHER } });
  if (!teacher) return;

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/teachers");
  redirect("/admin/teachers");
}

export async function addTeacherClass(teacherId: string, classId: string) {
  const schoolId = await requireSchoolId();
  const teacher = await prisma.user.findFirst({ where: { id: teacherId, schoolId, role: UserRole.TEACHER } });
  if (!teacher) throw new Error("Teacher not found");

  await prisma.teacherClass.create({
    data: { schoolId, teacherId, classId },
  });

  revalidatePath("/admin/teachers");
}

export async function removeTeacherClass(teacherId: string, classId: string) {
  const schoolId = await requireSchoolId();
  await prisma.teacherClass.deleteMany({
    where: { teacherId, classId, schoolId },
  });

  revalidatePath("/admin/teachers");
}

export async function addTeacherSubject(teacherId: string, subjectId: string) {
  const schoolId = await requireSchoolId();
  const teacher = await prisma.user.findFirst({ where: { id: teacherId, schoolId, role: UserRole.TEACHER } });
  if (!teacher) throw new Error("Teacher not found");

  await prisma.teacherSubject.create({
    data: { schoolId, teacherId, subjectId },
  });

  revalidatePath("/admin/teachers");
}

export async function removeTeacherSubject(teacherId: string, subjectId: string) {
  const schoolId = await requireSchoolId();
  await prisma.teacherSubject.deleteMany({
    where: { teacherId, subjectId, schoolId },
  });

  revalidatePath("/admin/teachers");
}

export async function createAnnouncement(formData: FormData) {
  const schoolId = await requireSchoolId();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const publish = formData.get("publish") === "on";

  if (!title || !body) return;

  await prisma.announcement.create({
    data: {
      schoolId,
      title,
      body,
      published: publish,
      publishedAt: publish ? new Date() : null,
    },
  });

  revalidatePath("/admin/website");
  revalidatePath("/demo");
  redirect("/admin/website");
}

export async function saveAttendance(formData: FormData) {
  const schoolId = await requireSchoolId();
  const classId = String(formData.get("classId") ?? "");
  const dateStr = String(formData.get("date") ?? "");
  if (!classId || !dateStr) return;

  const session = await getStaffSession();
  if (session?.role === "TEACHER") {
    const accessibleClassIds = await getTeacherAccessibleClassIds(session.userId, schoolId);
    if (!accessibleClassIds.includes(classId)) {
      throw new Error("You do not have permission to take attendance for this class.");
    }
  }

  const date = new Date(dateStr);
  const pupils = await prisma.pupil.findMany({
    where: { schoolId, classId, isActive: true },
  });

  for (const pupil of pupils) {
    const status = String(formData.get(`status_${pupil.id}`) ?? "PRESENT");
    await prisma.attendanceRecord.upsert({
      where: {
        pupilId_date: { pupilId: pupil.id, date },
      },
      update: { status: status as "PRESENT" | "ABSENT" | "LATE" },
      create: {
        schoolId,
        classId,
        pupilId: pupil.id,
        date,
        status: status as "PRESENT" | "ABSENT" | "LATE",
      },
    });
  }

  revalidatePath("/admin/attendance");
  redirect(`/admin/attendance?success=1&classId=${classId}&date=${encodeURIComponent(dateStr)}`);
}

export async function sendSetupCompletionReminder(schoolId?: string) {
  const session = await requireStaffSession();
  const school = schoolId || (await getCurrentSchoolId());

  // Get school with admin user
  const schoolData = await prisma.school.findUnique({
    where: { id: school },
    include: {
      users: {
        where: { role: "SCHOOL_ADMIN" },
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!schoolData || !schoolData.users[0]) {
    throw new Error("School or admin user not found.");
  }

  const adminUser = schoolData.users[0];

  // Check setup status
  const { incompleteTasks } = await import("@/lib/setup-checker").then((m) =>
    m.checkSchoolSetup(school)
  );

  if (incompleteTasks.length === 0) {
    throw new Error("School setup is already complete.");
  }

  // Build and send email
  const { buildSetupCompletionReminderEmail } = await import("@/lib/email");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";
  const emailContent = buildSetupCompletionReminderEmail({
    adminName: adminUser.name,
    schoolName: schoolData.name,
    adminEmail: adminUser.email,
    appUrl,
    incompleteTasks,
  });

  await sendEmail({
    to: adminUser.email,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });

  return {
    success: true,
    message: `Setup completion reminder sent to ${adminUser.email}`,
  };
}
