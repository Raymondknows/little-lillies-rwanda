"use client";

import { getBackendUrl } from "@/lib/backend-url";




import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, ChevronDown, ChevronLeft } from "lucide-react";
import { pupilName } from "@/lib/format";
import { resolveFileUrl } from "@/lib/api-client";

export default function StudentEditClient({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [gender, setGender] = useState("Male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [classId, setClassId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [address, setAddress] = useState("");

  const [mother, setMother] = useState({ id: "", firstName: "", lastName: "", email: "", phone: "", altPhone: "", occupation: "" });
  const [father, setFather] = useState({ id: "", firstName: "", lastName: "", email: "", phone: "", altPhone: "", occupation: "" });

  const [bloodGroup, setBloodGroup] = useState("");
  const [genotype, setGenotype] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  const [previousSchool, setPreviousSchool] = useState("");
  const [previousClass, setPreviousClass] = useState("");

  const [classes, setClasses] = useState<any[]>([]);
  const [medicalOpen, setMedicalOpen] = useState(false);
  const [previousOpen, setPreviousOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const backendUrl = getBackendUrl();

        // Load student data
        const studentResponse = await fetch(`${backendUrl}/api/admin/students/${studentId}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!studentResponse.ok) {
          throw new Error("Failed to load student");
        }
        const studentData = await studentResponse.json();
        setStudent(studentData);

        // Populate form fields
        setFirstName(studentData.firstName || "");
        setMiddleName(studentData.middleName || "");
        setLastName(studentData.lastName || "");
        setStudentEmail(studentData.studentEmail || "");
        setStudentPhone(studentData.studentPhone || "");
        setGender(studentData.gender || "Male");
        setDateOfBirth(studentData.dateOfBirth ? studentData.dateOfBirth.split("T")[0] : "");
        setAdmissionDate(studentData.admissionDate ? studentData.admissionDate.split("T")[0] : "");
        setClassId(studentData.classId || "");
        setStatus(studentData.status || "ACTIVE");
        setAddress(studentData.address || "");
        setBloodGroup(studentData.bloodGroup || "");
        setGenotype(studentData.genotype || "");
        setMedicalNotes(studentData.medicalNotes || "");
        setPreviousSchool(studentData.previousSchool || "");
        setPreviousClass(studentData.previousClass || "");

        // Load guardian data if exists
        const guardianEntries = studentData.guardians || [];
        const toParent = (entry: any) => ({
          id: entry.guardian?.id || "",
          firstName: entry.guardian?.firstName || "",
          lastName: entry.guardian?.lastName || "",
          email: entry.guardian?.email || "",
          phone: entry.guardian?.phone || "",
          altPhone: entry.guardian?.altPhone || "",
          occupation: entry.guardian?.occupation || "",
        });
        const motherEntry = guardianEntries.find((entry: any) => entry.relation === "Mother") || guardianEntries[0];
        const fatherEntry = guardianEntries.find((entry: any) => entry.relation === "Father") || guardianEntries[1];
        if (motherEntry) setMother(toParent(motherEntry));
        if (fatherEntry && fatherEntry !== motherEntry) setFather(toParent(fatherEntry));

        // Set photo preview if exists
        if (studentData.photoUrl) {
          const resolvedUrl = resolveFileUrl(studentData.photoUrl, studentData.id);
          if (resolvedUrl) {
            setPhotoPreview(resolvedUrl);
          }
        }

        // Load classes
        const classesResponse = await fetch(`${backendUrl}/api/admin/students/data`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          setClasses(classesData.classes || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load student");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [studentId]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("lastName", lastName);
      formData.append("firstName", firstName);
      formData.append("middleName", middleName);
      formData.append("classId", classId);
      formData.append("status", status);
      formData.append("admissionDate", admissionDate || new Date().toISOString().split("T")[0]);
      formData.append("gender", gender);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("studentEmail", studentEmail);
      formData.append("studentPhone", studentPhone);
      formData.append("address", address);
      formData.append("bloodGroup", bloodGroup);
      formData.append("genotype", genotype);
      formData.append("medicalNotes", medicalNotes);
      formData.append("previousSchool", previousSchool);
      formData.append("previousClass", previousClass);
      const guardians = [
        { guardianId: mother.id || undefined, firstName: mother.firstName.trim(), lastName: mother.lastName.trim(), relation: "Mother", email: mother.email.trim() || null, phone: mother.phone.trim() || null, altPhone: mother.altPhone.trim() || null, occupation: mother.occupation.trim() || null },
        { guardianId: father.id || undefined, firstName: father.firstName.trim(), lastName: father.lastName.trim(), relation: "Father", email: father.email.trim() || null, phone: father.phone.trim() || null, altPhone: father.altPhone.trim() || null, occupation: father.occupation.trim() || null },
      ].filter((guardian) => guardian.firstName || guardian.lastName);
      if (guardians.some((guardian) => !guardian.firstName || !guardian.lastName)) {
        throw new Error("Enter both first and last name for each parent you add.");
      }
      formData.append("guardians", JSON.stringify(guardians));

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/students/${studentId}`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update student");
      }

      router.push(`/admin/students/${studentId}?updated=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading student information...</div>;
  }

  if (error && !student) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-16 pt-0">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm py-1.5 -mx-6 px-6 mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/admin/students/${studentId}`}>
            <ChevronLeft className="h-5 w-5 text-muted hover:text-foreground transition" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Student</h1>
            <p className="mt-0.5 text-sm text-muted">Update {student?.firstName} {student?.lastName}'s information</p>
          </div>
          <Button variant="secondary" href={`/admin/students/${studentId}`}>
            Cancel
          </Button>
          <Button type="submit" form="edit-student-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>

      <form id="edit-student-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Error Alert */}
        {error && (
          <div className="lg:col-span-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Left: photo card (sticky) */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm lg:sticky lg:top-28">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Profile photo</p>
                <p className="mt-1 text-sm text-muted">Upload a clear student portrait for the profile card.</p>
              </div>
              <div className="rounded-full bg-surface/80 p-2 text-muted">
                <Upload className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-dashed border-border/70 bg-surface/80 p-4 text-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Selected student photo" className="mx-auto h-40 w-40 rounded-3xl object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-3xl bg-surface/80 text-muted">
                  <span className="text-sm">No photo selected</span>
                </div>
              )}
            </div>

            <label className="mt-5 block text-sm font-semibold text-foreground">
              Upload photo
              <input name="photo" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handlePhotoChange} className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:text-white" />
            </label>
            <p className="mt-3 text-xs leading-5 text-muted">JPG, PNG or WEBP. Keep the file under 4MB and use a square image for best layout.</p>

            <div className="mt-6 space-y-2 text-sm text-muted border-t border-border pt-6">
              <div>
                <p className="text-xs text-muted uppercase">Admission Number</p>
                <p className="font-semibold text-foreground">{student?.admissionNo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: main form fields */}
        <div className="lg:col-span-2 space-y-2">
          {/* Admission Details */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-semibold text-foreground">
                Class *
                <select name="classId" value={classId} onChange={(e) => setClassId(e.target.value)} required className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10">
                  <option value="">Select class</option>
                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}{item.arm ? ` ${item.arm}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-foreground">
                Status
                <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-foreground">
                Admission date
                <input name="admissionDate" type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>
            </div>
          </div>

          {/* Student Information */}
          <div className="rounded-lg border border-border bg-surface p-4 mb-3">
            <h3 className="text-lg font-semibold text-foreground mb-4">Student information</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-semibold text-foreground">
                Surname *
                <input name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-foreground">
                First name *
                <input name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-foreground">
                Middle name
                <input name="middleName" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-foreground">
                Gender *
                <select name="gender" value={gender} onChange={(e) => setGender(e.target.value)} required className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-foreground">
                Date of birth
                <input name="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-foreground">
                Email
                <input name="studentEmail" type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="student@example.com" className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-foreground">
                Phone number
                <input name="studentPhone" type="tel" value={studentPhone} onChange={(e) => setStudentPhone(e.target.value)} placeholder="+234..." className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-foreground lg:col-span-3">
                Address
                <textarea name="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>
            </div>
          </div>

          {/* Parent Information */}
          <div className="rounded-lg border border-border bg-surface p-4 mb-3">
            <h3 className="text-lg font-semibold text-foreground mb-1">Parent information <span className="text-sm font-normal text-muted">(optional)</span></h3>
            <p className="text-sm text-muted">Update either parent or both parents. Contact details are optional.</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {[
                { label: "Mother", value: mother, setValue: setMother },
                { label: "Father", value: father, setValue: setFather },
              ].map((parent) => (
                <fieldset key={parent.label} className="rounded-2xl border border-border p-4">
                  <legend className="px-2 text-sm font-bold text-foreground">{parent.label}</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["firstName", "lastName", "phone", "email"] as const).map((field) => (
                      <label key={field} className="text-sm font-semibold text-foreground">
                        {field === "firstName" ? "First name" : field === "lastName" ? "Last name" : field === "phone" ? "Phone" : "Email"}
                        <input type={field === "email" ? "email" : field === "phone" ? "tel" : "text"} value={parent.value[field]} onChange={(event) => parent.setValue((current) => ({ ...current, [field]: event.target.value }))} placeholder={field === "phone" ? "+250 788 123 456" : `${parent.label} ${field === "firstName" ? "first name" : field === "lastName" ? "last name" : field}`} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
                      </label>
                    ))}
                    {(["altPhone", "occupation"] as const).map((field) => (
                      <label key={field} className="text-sm font-semibold text-foreground sm:col-span-2">
                        {field === "altPhone" ? "Alternative phone" : "Occupation"}
                        <input type={field === "altPhone" ? "tel" : "text"} value={parent.value[field]} onChange={(event) => parent.setValue((current) => ({ ...current, [field]: event.target.value }))} placeholder="Optional" className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </div>

          {/* Medical Information (collapsible) */}
          <div className="rounded-lg border border-border bg-surface p-0 mb-3">
            <button type="button" onClick={() => setMedicalOpen((v) => !v)} className="w-full flex items-center justify-between p-4 text-left hover:bg-surface/90 transition">
              <div className="flex items-center gap-3">
                <ChevronDown className={`h-5 w-5 text-muted transition-transform ${medicalOpen ? "rotate-180" : ""}`} />
                <div>
                  <h4 className="text-lg font-semibold text-foreground">Medical information</h4>
                  <p className="mt-1 text-sm text-muted">Optional medical details (expand to edit).</p>
                </div>
              </div>
            </button>

            {medicalOpen && (
              <div className="border-t border-border p-4">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <label className="text-sm font-semibold text-foreground">
                    Blood group
                    <input name="bloodGroup" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
                  </label>

                  <label className="text-sm font-semibold text-foreground">
                    Genotype
                    <input name="genotype" value={genotype} onChange={(e) => setGenotype(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
                  </label>

                  <label className="text-sm font-semibold text-foreground lg:col-span-3">
                    Medical notes
                    <textarea name="medicalNotes" value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Previous School (collapsible) */}
          <div className="rounded-lg border border-border bg-surface p-0 mb-3">
            <button type="button" onClick={() => setPreviousOpen((v) => !v)} className="w-full flex items-center justify-between p-4 text-left hover:bg-surface/90 transition">
              <div className="flex items-center gap-3">
                <ChevronDown className={`h-5 w-5 text-muted transition-transform ${previousOpen ? "rotate-180" : ""}`} />
                <div>
                  <h4 className="text-lg font-semibold text-foreground">Previous school</h4>
                  <p className="mt-1 text-sm text-muted">Optional previous school information.</p>
                </div>
              </div>
            </button>

            {previousOpen && (
              <div className="border-t border-border p-4">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <label className="text-sm font-semibold text-foreground">
                    Previous school
                    <input name="previousSchool" value={previousSchool} onChange={(e) => setPreviousSchool(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
                  </label>

                  <label className="text-sm font-semibold text-foreground">
                    Previous class
                    <input name="previousClass" value={previousClass} onChange={(e) => setPreviousClass(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
