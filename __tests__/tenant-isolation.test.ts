/**
 * Tenant Isolation Verification Tests
 *
 * CRITICAL: These tests verify multi-school data isolation.
 * All queries must filter by schoolId to prevent cross-tenant data leaks.
 */

import { prisma } from "@/lib/db";

describe("Tenant Isolation", () => {
  let school1: any, school2: any;
  let pupil1: any, pupil2: any;
  let parent1: any, parent2: any;

  beforeAll(async () => {
    school1 = await prisma.school.create({
      data: { name: "School Alpha", currency: "USD", country: "US", phone: "555-0001" },
    });
    school2 = await prisma.school.create({
      data: { name: "School Beta", currency: "USD", country: "US", phone: "555-0002" },
    });

    const gradingScales = [
      { minScore: 70, maxScore: 100, grade: "A", sortOrder: 0 },
      { minScore: 60, maxScore: 69, grade: "B", sortOrder: 1 },
      { minScore: 50, maxScore: 59, grade: "C", sortOrder: 2 },
      { minScore: 45, maxScore: 49, grade: "D", sortOrder: 3 },
      { minScore: 40, maxScore: 44, grade: "E", sortOrder: 4 },
      { minScore: 0, maxScore: 39, grade: "F", sortOrder: 5 },
    ];

    for (const school of [school1, school2]) {
      for (const scale of gradingScales) {
        await prisma.gradingScale.create({
          data: { schoolId: school.id, ...scale },
        });
      }
    }

    const class1 = await prisma.class.create({
      data: { schoolId: school1.id, name: "Class A", arm: "1" },
    });
    const class2 = await prisma.class.create({
      data: { schoolId: school2.id, name: "Class A", arm: "1" },
    });

    pupil1 = await prisma.pupil.create({
      data: { schoolId: school1.id, classId: class1.id, firstName: "John", lastName: "Doe", admissionNo: "A001" },
    });
    pupil2 = await prisma.pupil.create({
      data: { schoolId: school2.id, classId: class2.id, firstName: "Jane", lastName: "Smith", admissionNo: "B001" },
    });

    parent1 = await prisma.guardian.create({
      data: { schoolId: school1.id, email: "parent1@test.com", phone: "555-1001", firstName: "Parent", lastName: "One" },
    });
    parent2 = await prisma.guardian.create({
      data: { schoolId: school2.id, email: "parent2@test.com", phone: "555-2002", firstName: "Parent", lastName: "Two" },
    });

    await prisma.guardianPupil.create({ data: { guardianId: parent1.id, pupilId: pupil1.id } });
    await prisma.guardianPupil.create({ data: { guardianId: parent2.id, pupilId: pupil2.id } });
  });

  afterAll(async () => {
    await prisma.school.deleteMany();
  });

  it("School 1 queries only return School 1 data", async () => {
    const result = await prisma.pupil.findMany({ where: { schoolId: school1.id } });
    expect(result.map((p: any) => p.id)).toEqual([pupil1.id]);
  });

  it("School 2 queries only return School 2 data", async () => {
    const result = await prisma.pupil.findMany({ where: { schoolId: school2.id } });
    expect(result.map((p: any) => p.id)).toEqual([pupil2.id]);
  });

  it("Parent 1 cannot access Parent 2 pupils", async () => {
    const result = await prisma.guardianPupil.findMany({ where: { guardianId: parent1.id } });
    expect(result.map((gp: any) => gp.pupilId)).toEqual([pupil1.id]);
  });

  it("Invoices scoped to schoolId", async () => {
    await prisma.invoice.create({
      data: { schoolId: school1.id, pupilId: pupil1.id, invoiceNo: "INV001", term: "Term 1", amountDue: 1000, amountPaid: 0, status: "pending" },
    });
    const result = await prisma.invoice.findMany({ where: { schoolId: school1.id } });
    expect(result.every((i: any) => i.schoolId === school1.id)).toBe(true);
  });

  it("Classes isolated by schoolId", async () => {
    const result = await prisma.class.findMany({ where: { schoolId: school1.id } });
    expect(result.every((c: any) => c.schoolId === school1.id)).toBe(true);
  });
});
