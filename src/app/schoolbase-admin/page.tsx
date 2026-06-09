export default async function OverviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="mt-1 text-muted">Platform dashboard and quick stats</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="text-sm font-medium text-muted">Active Schools</div>
          <div className="text-3xl font-bold mt-2">—</div>
          <div className="text-xs text-muted mt-2">Loading...</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="text-sm font-medium text-muted">Total Users</div>
          <div className="text-3xl font-bold mt-2">—</div>
          <div className="text-xs text-muted mt-2">Loading...</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="text-sm font-medium text-muted">Pending Setups</div>
          <div className="text-3xl font-bold mt-2">—</div>
          <div className="text-xs text-muted mt-2">Loading...</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="text-sm font-medium text-muted">Support Tickets</div>
          <div className="text-3xl font-bold mt-2">—</div>
          <div className="text-xs text-muted mt-2">Loading...</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a href="/schoolbase-admin/schools" className="inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors">
            View Schools
          </a>
          <a href="/schoolbase-admin/email-center" className="inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors">
            Send Email
          </a>
          <a href="/schoolbase-admin/support" className="inline-flex items-center justify-center px-4 py-3 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors">
            View Support
          </a>
        </div>
      </div>
    </div>
  );
}
