"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings || {});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const keys = Object.keys(settings);

  function changeKey(oldKey: string, newKey: string) {
    if (oldKey === newKey) return;
    const next = { ...settings };
    next[newKey] = next[oldKey];
    delete next[oldKey];
    setSettings(next);
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage(null);
        try {
          const response = await fetch("/schoolbase-admin/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ settings }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || "Save failed");
          setMessage("Settings saved.");
        } catch (err) {
          setMessage(err instanceof Error ? err.message : String(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      {message ? <div className="mb-4 rounded-2xl border border-border px-4 py-3 text-sm text-foreground bg-brand/5">{message}</div> : null}

      <div className="space-y-4">
        {keys.map((key) => (
          <div key={key} className="grid grid-cols-12 gap-3 items-center">
            <input
              value={key}
              onChange={(e) => changeKey(key, e.target.value)}
              className="col-span-4 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
            <input
              value={settings[key]}
              onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
              className="col-span-7 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
            <button
              type="button"
              className="col-span-1 text-sm text-foreground"
              onClick={() => setSettings((s) => { const n = { ...s }; delete n[key]; return n; })}
              disabled={busy}
            >
              Remove
            </button>
          </div>
        ))}

        <div className="grid grid-cols-12 gap-3">
          <input id="newKey" placeholder="new_key" className="col-span-4 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
          <input id="newValue" placeholder="value" className="col-span-7 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
          <button
            type="button"
            className="col-span-1 text-sm text-foreground"
            onClick={() => {
              const keyEl = document.getElementById("newKey") as HTMLInputElement | null;
              const valEl = document.getElementById("newValue") as HTMLInputElement | null;
              if (!keyEl || !valEl) return;
              const key = keyEl.value.trim();
              if (!key) return;
              setSettings((s) => ({ ...s, [key]: valEl.value }));
              keyEl.value = "";
              valEl.value = "";
            }}
            disabled={busy}
          >
            Add
          </button>
        </div>

        <div className="pt-4">
          <Button type="submit" variant="primary" disabled={busy}>Save settings</Button>
        </div>
      </div>
    </form>
  );
}
