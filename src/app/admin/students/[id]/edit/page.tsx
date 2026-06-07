import StudentEditClient from "./student-edit-client";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentEditClient studentId={id} />;
}