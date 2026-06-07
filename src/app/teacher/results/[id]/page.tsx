export default async function Page({ params }: { params?: Record<string, string> }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Content available from backend API</h1>
      <p className="mt-2 text-sm text-muted">This frontend page has been stubbed to avoid direct Prisma/database access.</p>
    </div>
  );
}
