"use client";

import React, { useEffect, useState } from 'react';
import AdminPageShell from '@/components/admin-page-shell';
import { playOpenTone, playCloseTone } from '@/lib/sounds';
import { CheckCircle } from 'lucide-react';

export default function PendingSignupsPage() {
  const [signups, setSignups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<any | null>(null);

  async function fetchSignups() {
    setLoading(true);
    try {
      const res = await fetch('/schoolbase-admin/api/signups/pending', { credentials: 'include' });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        setSignups(data.signups || []);
      } catch (jsonErr) {
        console.error('Pending signups API returned non-JSON response:', text.slice(0, 500));
        alert('Failed to load pending signups (non-JSON response). Ensure you are logged in as a platform admin.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load pending signups. Check console for details.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSignups(); }, []);

  function openApproveModal(signup: any) {
    setApproveTarget(signup);
    setApproveModalOpen(true);
    try { playOpenTone(); } catch {};
  }

  function closeApproveModal() {
    try { playCloseTone(); } catch {}
    setApproveModalOpen(false);
    setApproveTarget(null);
  }

  async function confirmApprove() {
    if (!approveTarget) return;
    setBusyId(approveTarget.id);
    try {
      const res = await fetch('/schoolbase-admin/api/signups/approve', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: approveTarget.email }),
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (!res.ok) throw new Error(data?.message || 'Approve failed');
      } catch (e) {
        throw new Error(text || 'Approve failed');
      }
      await fetchSignups();
      closeApproveModal();
    } catch (err: any) {
      console.error('Approve error', err);
      alert(err?.message || 'Failed to approve signup');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AdminPageShell title="Pending Signups" subtitle="List of signup requests awaiting verification and approval">
        <div className="px-0.5 py-1.5 sm:px-1 sm:py-2">
        {loading ? (
          <div className="text-center py-8 text-muted">Loading pending signups...</div>
        ) : signups.length === 0 ? (
          <div className="text-center py-8 text-muted">No pending signups found.</div>
        ) : (
          <div className="space-y-3">
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="px-4 py-3">School</th>
                    <th className="px-4 py-3">Admin</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Requested</th>
                    <th className="px-4 py-3">Expires</th>
                    <th className="px-4 py-3">Attempts</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.map((s) => (
                    <tr key={s.id} className={`border-t border-border ${s.isExpired ? 'bg-red-50/40' : 'hover:bg-background'}`}>
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold">{s.schoolName}</div>
                        <div className="text-xs text-muted">{s.slug}</div>
                      </td>
                      <td className="px-4 py-3 align-top">{s.adminName}</td>
                      <td className="px-4 py-3 align-top">{s.email}</td>
                      <td className="px-4 py-3 align-top">{s.country}</td>
                      <td className="px-4 py-3 align-top">{new Date(s.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <span>{new Date(s.expiresAt).toLocaleString()}</span>
                          {s.isExpired && <span className="text-xs font-semibold uppercase text-red-700">Expired</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">{s.attempts}</td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <button
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold bg-white text-brand border border-brand ${busyId === s.id ? 'opacity-60 pointer-events-none' : ''}`}
                            onClick={() => openApproveModal(s)}
                          >
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 sm:hidden">
              {signups.map((s) => (
                <div
                  key={s.id}
                  className={`rounded-3xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md ${s.isExpired ? 'ring-1 ring-red-200' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{s.schoolName}</p>
                      <p className="mt-1 text-xs text-muted">{s.slug}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${s.isExpired ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                      {s.isExpired ? 'Expired' : 'Pending'}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Admin</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{s.adminName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Email</p>
                      <p className="mt-1 break-all text-sm text-foreground">{s.email}</p>
                    </div>
                    <div className="grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">Country</p>
                        <p className="mt-1 text-sm text-foreground">{s.country}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">Attempts</p>
                        <p className="mt-1 text-sm text-foreground">{s.attempts}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">Requested</p>
                        <p className="mt-1 text-sm text-foreground">{new Date(s.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">Expires</p>
                        <p className="mt-1 text-sm text-foreground">{new Date(s.expiresAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <button
                      className={`inline-flex cursor-pointer items-center justify-center rounded-xl border border-brand bg-white px-4 py-2 text-sm font-semibold text-brand transition ${busyId === s.id ? 'opacity-60 pointer-events-none' : 'hover:bg-brand/5'}`}
                      onClick={() => openApproveModal(s)}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </AdminPageShell>

      <PendingSignupApproveModal
        open={approveModalOpen}
        signup={approveTarget}
        onClose={closeApproveModal}
        onConfirm={confirmApprove}
        busy={busyId === approveTarget?.id}
      />
    </>
  );
}

// Approve confirmation modal (rendered at end so it overlays)
export function PendingSignupApproveModal({ open, signup, onClose, onConfirm, busy }: { open: boolean; signup: any | null; onClose: () => void; onConfirm: () => void; busy?: boolean }) {
  if (!open || !signup) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <style>{`
        @keyframes approve_modal_enter { from { transform: translateX(36px) scale(.98); opacity: 0 } to { transform: translateX(0) scale(1); opacity: 1 } }
        @keyframes approve_modal_exit  { from { transform: translateX(0) scale(1); opacity: 1 } to { transform: translateX(36px) scale(.98); opacity: 0 } }
      `}</style>

      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(10,102,194,0.12)]"
        style={{ animation: `approve_modal_enter 320ms cubic-bezier(.2,.9,.2,1)` }}
      >
        <div className="border-b border-slate-100 px-6 py-5" style={{ background: "linear-gradient(90deg, rgba(10,102,194,0.12), rgba(10,102,194,0.04))" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/70 bg-blue-100 shadow-sm">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Approve signup</h2>
                <p className="mt-1 text-sm text-muted">Create the school and admin account for this signup.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { playCloseTone(); onClose(); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-background transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-slate-700">
            You are about to approve the signup for <strong>“{signup.schoolName}”</strong> with admin <strong>{signup.adminName}</strong> ({signup.email}).
          </p>
        </div>

        <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 disabled:opacity-50 text-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: '#0A66C2' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#0858a8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0A66C2')}
          >
            {busy ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Approving...
              </>
            ) : (
              <>Confirm Approval</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
