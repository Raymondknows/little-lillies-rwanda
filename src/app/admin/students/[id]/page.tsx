import StudentViewClient from "./student-view-client";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentViewClient studentId={id} />;
}
