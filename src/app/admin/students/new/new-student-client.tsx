"use client";

import { getBackendUrl } from "@/lib/backend-url";




import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, ChevronDown } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/icons";

export default function NewStudentClient() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [nextAdmissionNo, setNextAdmissionNo] = useState("---");
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const [whatsAppConnected, setWhatsAppConnected] = useState<boolean | null>(null);
  const [whatsAppStatusMessage, setWhatsAppStatusMessage] = useState<string | null>(null);

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

  const [guardianFirst, setGuardianFirst] = useState("");
  const [guardianLast, setGuardianLast] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("Parent");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianAltPhone, setGuardianAltPhone] = useState("");
  const [guardianOccupation, setGuardianOccupation] = useState("");

  const [bloodGroup, setBloodGroup] = useState("");
  const [genotype, setGenotype] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  const [previousSchool, setPreviousSchool] = useState("");
  const [previousClass, setPreviousClass] = useState("");

  const [medicalOpen, setMedicalOpen] = useState(false);
  const [previousOpen, setPreviousOpen] = useState(false);

  // Fetch classes and next admission number on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/admin/students/data', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setClasses(data.classes || []);
          setNextAdmissionNo(data.nextAdmissionNo || "---");
        }
      } catch (err) {
        console.error("Failed to load page data:", err);
      } finally {
        setIsLoadingPage(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    async function fetchWhatsAppStatus() {
      try {
        const res = await fetch(`/api/admin/whatsapp/status`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          setWhatsAppConnected(data?.session?.status === 'connected');
          setWhatsAppStatusMessage(data?.session?.statusMessage || data?.session?.status || null);
        } else {
          setWhatsAppConnected(false);
          setWhatsAppStatusMessage('Unable to retrieve WhatsApp status.');
        }
      } catch (err) {
        console.error('Error loading WhatsApp status:', err);
        setWhatsAppConnected(false);
        setWhatsAppStatusMessage('Unable to retrieve WhatsApp status.');
      }
    }

    fetchWhatsAppStatus();
  }, []);

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

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setError('First name and last name are required');
      setIsSubmitting(false);
      return;
    }

    try {
      const shouldUseMultipart = Boolean(photoFile);
      const headers: Record<string, string> = {};
      let body: FormData | string;

      if (shouldUseMultipart) {
        const formData = new FormData();
        formData.append("lastName", trimmedLastName);
        formData.append("firstName", trimmedFirstName);
        formData.append("middleName", middleName.trim());
        formData.append("admissionNo", nextAdmissionNo);
        formData.append("classId", classId);
        formData.append("status", status);
        formData.append("admissionDate", admissionDate || new Date().toISOString().split("T")[0]);
        formData.append("gender", gender);
        formData.append("dateOfBirth", dateOfBirth);
        formData.append("studentEmail", studentEmail.trim());
        formData.append("studentPhone", studentPhone.trim());
        formData.append("address", address.trim());
        formData.append("bloodGroup", bloodGroup.trim());
        formData.append("genotype", genotype.trim());
        formData.append("medicalNotes", medicalNotes.trim());
        formData.append("previousSchool", previousSchool.trim());
        formData.append("previousClass", previousClass.trim());
        formData.append("guardianFirst", guardianFirst.trim());
        formData.append("guardianLast", guardianLast.trim());
        formData.append("guardianRelationship", guardianRelationship);
        formData.append("guardianEmail", guardianEmail.trim());
        formData.append("guardianPhone", guardianPhone.trim());
        formData.append("guardianAltPhone", guardianAltPhone.trim());
        formData.append("guardianOccupation", guardianOccupation.trim());

        if (photoFile) {
          formData.append("photo", photoFile);
        }

        body = formData;
      } else {
        const payload = {
          lastName: trimmedLastName,
          firstName: trimmedFirstName,
          middleName: middleName.trim() || null,
          admissionNo: nextAdmissionNo,
          classId: classId || null,
          status,
          admissionDate: admissionDate || new Date().toISOString().split("T")[0],
          gender,
          dateOfBirth: dateOfBirth || null,
          studentEmail: studentEmail.trim() || null,
          studentPhone: studentPhone.trim() || null,
          address: address.trim() || null,
          bloodGroup: bloodGroup.trim() || null,
          genotype: genotype.trim() || null,
          medicalNotes: medicalNotes.trim() || null,
          previousSchool: previousSchool.trim() || null,
          previousClass: previousClass.trim() || null,
          guardianFirst: guardianFirst.trim() || null,
          guardianLast: guardianLast.trim() || null,
          guardianRelationship,
          guardianEmail: guardianEmail.trim() || null,
          guardianPhone: guardianPhone.trim() || null,
          guardianAltPhone: guardianAltPhone.trim() || null,
          guardianOccupation: guardianOccupation.trim() || null,
        };

        body = JSON.stringify(payload);
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch('/api/admin/students', {
        method: "POST",
        credentials: 'include',
        headers,
        body,
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to create student");
      }

      router.push("/admin/students?created=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-16 pt-0">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm py-1.5">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add Student</h1>
            <p className="mt-0.5 text-sm text-slate-600 max-w-2xl">Quickly register a student — all fields visible on a single page.</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {whatsAppConnected !== null && (
              <div className="inline-flex items-center gap-3 rounded-full border px-4 py-2 shadow-sm transition-colors">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${whatsAppConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${whatsAppConnected ? 'text-foreground' : 'text-foreground'}`}>
                    {whatsAppConnected ? 'WhatsApp connected' : 'WhatsApp disconnected'}
                  </span>
                  <span className="text-xs text-muted">
                    {whatsAppConnected ? 'Ready to send school messages.' : 'Reconnect via settings.'}
                  </span>
                </div>
                <span className={`inline-flex h-6 min-w-[2.25rem] items-center justify-center rounded-full px-2 text-xs font-semibold ${whatsAppConnected ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                  {whatsAppConnected ? 'On' : 'Off'}
                </span>
              </div>
            )}
            <Button variant="secondary" href="/admin/students">
              Back to student list
            </Button>
            <Button type="submit" form="new-student-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save student"
              )}
            </Button>
          </div>
        </div>
      </div>

      <form id="new-student-form" onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Error Alert */}
        {error && (
          <div className="lg:col-span-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Left: photo card (sticky) */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm lg:sticky lg:top-28">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Profile photo</p>
                <p className="mt-1 text-sm text-slate-500">Upload a clear student portrait for the profile card.</p>
              </div>
              <div className="rounded-full bg-slate-100 p-2 text-slate-500">
                <Upload className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-slate-50 p-3 text-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Selected student photo" className="mx-auto h-40 w-40 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                  <span className="text-sm">No photo selected</span>
                </div>
              )}
            </div>

            <label className="mt-5 block text-sm font-semibold text-slate-800">
              Upload photo
              <input name="photo" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handlePhotoChange} className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:text-white" />
            </label>
            <p className="mt-3 text-xs leading-5 text-slate-500">JPG, PNG or WEBP. Keep the file under 4MB and use a square image for best layout.</p>

            <div className="mt-4 text-sm text-slate-600">
              <p className="mt-2">Admission number: <span className="font-semibold">{nextAdmissionNo}</span></p>
            </div>
          </div>
        </div>

        {/* Right: main form fields */}
        <div className="lg:col-span-2">
          {/* Top row: Admission details */}
          <div className="rounded-lg border border-slate-200 bg-white p-3 mb-3">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-semibold text-slate-800">
                Admission number
                <input name="admissionNo" defaultValue={nextAdmissionNo} readOnly className="mt-2 w-full rounded-2xl border border-border bg-slate-100 px-4 py-3 text-sm text-slate-600" />
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Class *
                <select name="classId" value={classId} onChange={(e) => setClassId(e.target.value)} required className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10">
                  <option value="">Select class</option>
                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}{item.arm ? ` ${item.arm}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Status
                <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Admission date
                <input name="admissionDate" type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>
            </div>
          </div>

          {/* Section 1: Student Information */}
          <div className="rounded-lg border border-slate-200 bg-white p-3 mb-3">
            <h3 className="text-lg font-semibold text-slate-900">Student information</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-semibold text-slate-800">
                Surname *
                <input name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-slate-800">
                First name *
                <input name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Middle name
                <input name="middleName" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Gender *
                <select name="gender" value={gender} onChange={(e) => setGender(e.target.value)} required className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Date of birth
                <input name="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Email
                <input name="studentEmail" type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="student@example.com" className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Phone number
                <input name="studentPhone" type="tel" value={studentPhone} onChange={(e) => setStudentPhone(e.target.value)} placeholder="+234..." className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-slate-800 xl:col-span-3">
                Address
                <textarea name="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>
            </div>
          </div>

          {/* Section 2: Parent / Guardian Information */}
          <div className="rounded-lg border border-slate-200 bg-white p-3 mb-3">
            <h3 className="text-lg font-semibold text-slate-900">Parent / Guardian information</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-semibold text-slate-800">
                First name
                <input name="guardianFirst" value={guardianFirst} onChange={(e) => setGuardianFirst(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Last name
                <input name="guardianLast" value={guardianLast} onChange={(e) => setGuardianLast(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Relationship *
                <select name="guardianRelationship" value={guardianRelationship} onChange={(e) => setGuardianRelationship(e.target.value)} required className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10">
                  <option value="Parent">Parent</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Phone number *
                <input name="guardianPhone" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} required placeholder="+234..." className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Alternative phone
                <input name="guardianAltPhone" value={guardianAltPhone} onChange={(e) => setGuardianAltPhone(e.target.value)} placeholder="Optional" className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Email
                <input name="guardianEmail" value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} type="email" placeholder="guardian@example.com" className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>

              <label className="text-sm font-semibold text-slate-800">
                Occupation
                <input name="guardianOccupation" value={guardianOccupation} onChange={(e) => setGuardianOccupation(e.target.value)} placeholder="Optional" className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
              </label>
            </div>
          </div>

          {/* Section 3: Medical Information (collapsible) */}
          <div className="rounded-lg border border-slate-200 bg-white p-0 mb-3">
            <button type="button" onClick={() => setMedicalOpen((v) => !v)} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition">
              <div className="flex items-center gap-3">
                <ChevronDown className={`h-5 w-5 text-slate-600 transition-transform ${medicalOpen ? 'rotate-180' : ''}`} />
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">Medical information</h4>
                  <p className="mt-1 text-sm text-slate-600">Optional medical details (expand to edit).</p>
                </div>
              </div>
            </button>

            {medicalOpen ? (
              <div className="border-t border-slate-200 p-3">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <label className="text-sm font-semibold text-slate-800">
                    Blood group
                    <input name="bloodGroup" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
                  </label>

                  <label className="text-sm font-semibold text-slate-800">
                    Genotype
                    <input name="genotype" value={genotype} onChange={(e) => setGenotype(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
                  </label>

                  <label className="text-sm font-semibold text-slate-800 xl:col-span-3">
                    Medical notes
                    <textarea name="medicalNotes" value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
                  </label>
                </div>
              </div>
            ) : null}
          </div>

          {/* Section 4: Previous School (collapsible) */}
          <div className="rounded-lg border border-slate-200 bg-white p-0 mb-3">
            <button type="button" onClick={() => setPreviousOpen((v) => !v)} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition">
              <div className="flex items-center gap-3">
                <ChevronDown className={`h-5 w-5 text-slate-600 transition-transform ${previousOpen ? 'rotate-180' : ''}`} />
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">Previous school</h4>
                  <p className="mt-1 text-sm text-slate-600">Optional previous school information.</p>
                </div>
              </div>
            </button>

            {previousOpen ? (
              <div className="border-t border-slate-200 p-4">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <label className="text-sm font-semibold text-slate-800">
                    Previous school
                    <input name="previousSchool" value={previousSchool} onChange={(e) => setPreviousSchool(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
                  </label>

                  <label className="text-sm font-semibold text-slate-800">
                    Previous class
                    <input name="previousClass" value={previousClass} onChange={(e) => setPreviousClass(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10" />
                  </label>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">All fields can be edited later from the student profile.</div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" href="/admin/students">Cancel</Button>
              <Button type="submit" form="new-student-form" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save student"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
