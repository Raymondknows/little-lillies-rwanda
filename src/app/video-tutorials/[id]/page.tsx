export async function generateMetadata(): Promise<any> {
  return {
    title: "Video Tutorial | SchoolBase",
    description: "Watch SchoolBase video tutorials",
  };
}

export default async function VideoTutorialPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Video Tutorial</h1>
      <p className="mt-2 text-sm text-muted">Video tutorial content is available from the backend API.</p>
    </div>
  );
}
