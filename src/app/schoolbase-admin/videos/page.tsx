export default async function Page({ params }: { params?: Record<string, string> }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">SchoolBase admin page</h1>
      <p className="mt-2 text-sm text-muted">This page is stubbed and uses backend APIs for data.</p>
    </div>
  );
}
