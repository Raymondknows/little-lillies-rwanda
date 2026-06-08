import { redirect } from "next/navigation";

export default async function TeachingPage() {
  // Redirect to dashboard - teaching content is available through class/subjects/assessments
  redirect("/teacher");
}
