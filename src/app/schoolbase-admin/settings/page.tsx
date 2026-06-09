export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted">Platform admin settings and configuration</p>
      </div>

      <div className="space-y-4">
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Platform Name</label>
              <input type="text" defaultValue="SchoolBase" className="w-full px-3 py-2 border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Support Email</label>
              <input type="email" defaultValue="support@schoolbase.live" className="w-full px-3 py-2 border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Support Phone</label>
              <input type="tel" defaultValue="+234 903 136 8963" className="w-full px-3 py-2 border border-border rounded-lg" />
            </div>
          </div>
          <button className="mt-6 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover">Save Settings</button>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Security</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 hover:bg-muted rounded-lg">Change Password</button>
            <button className="w-full text-left px-4 py-2 hover:bg-muted rounded-lg">Two-Factor Authentication</button>
            <button className="w-full text-left px-4 py-2 hover:bg-muted rounded-lg">Session Management</button>
          </div>
        </div>
      </div>
    </div>
  );
}
