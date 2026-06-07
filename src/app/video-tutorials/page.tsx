import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Video Tutorials | SchoolBase",
  description: "SchoolBase video tutorials",
};

export default async function VideoTutorialsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Video Tutorials</h1>
      <p className="mt-2 text-sm text-muted">Video tutorial content is available from the backend API.</p>
    </div>
  );
}
