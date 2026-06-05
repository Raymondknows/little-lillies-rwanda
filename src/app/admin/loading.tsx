export default function AdminLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="h-10 w-10 animate-pulse rounded-full bg-white ring-1 ring-border" />
        <p className="text-sm text-muted">Loading…</p>
      </div>
    </div>
  );
}
