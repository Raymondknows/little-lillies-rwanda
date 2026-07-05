"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getBackendUrl } from "../../../lib/backend-url";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

type Term = {
  id: string;
  name: string;
};

type AcademicYear = {
  id: string;
  name: string;
  isCurrent?: boolean;
  terms?: Term[];
};

type ClassOption = {
  id: string;
  name: string;
};

type PromotionDecision = {
  decision: string;
  toClassId: string;
  rationale: string;
};

const PROMOTION_DECISIONS = [
  { value: "", label: "Select action" },
  { value: "PROMOTED", label: "Promoted" },
  { value: "REPEATED", label: "Repeated" },
  { value: "TRANSFERRED", label: "Transferred" },
  { value: "GRADUATED", label: "Graduated" },
];

export default function PromotionsPageClient({
  academicYears,
  classes,
}: {
  academicYears: AcademicYear[];
  classes: ClassOption[];
}) {
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  useEffect(() => {
    if (academicYears.length === 0) return;

    const defaultYear = academicYears.find((year) => year.isCurrent) || academicYears[0];
    setSelectedAcademicYearId((prev) => prev || defaultYear.id);
    setSelectedTermId((prev) => prev || defaultYear.terms?.[0]?.id || "");
  }, [academicYears]);

  useEffect(() => {
    if (classes.length === 0) return;
    setSelectedClassId((prev) => prev || classes[0].id);
  }, [classes]);

  useEffect(() => {
    if (!selectedAcademicYearId || academicYears.length === 0) return;

    const selectedYear = academicYears.find((year) => year.id === selectedAcademicYearId);
    if (!selectedYear) return;

    if (!selectedTermId || !selectedYear.terms?.some((term) => term.id === selectedTermId)) {
      setSelectedTermId(selectedYear.terms?.[0]?.id || "");
    }
  }, [selectedAcademicYearId, academicYears, selectedTermId]);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [decisions, setDecisions] = useState<Record<string, { decision: string; toClassId: string; rationale: string }>>({});
  const [selectedPupilIds, setSelectedPupilIds] = useState<string[]>([]);
  const [bulkDecision, setBulkDecision] = useState<string>("");
  const [bulkTargetClassId, setBulkTargetClassId] = useState<string>("");
  const [bulkRationale, setBulkRationale] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedYear = academicYears.find((year) => year.id === selectedAcademicYearId);
  const termOptions = selectedYear?.terms || [];

  const classOptions = useMemo(() => classes || [], [classes]);

  useEffect(() => {
    if (!previewData) {
      setSelectedPupilIds([]);
      return;
    }

    setSelectedPupilIds(previewData.pupils.map((pupil: any) => pupil.id));
  }, [previewData]);

  const handlePreview = useCallback(async () => {
    if (!selectedAcademicYearId || !selectedTermId || !selectedClassId) {
      setPreviewData(null);
      setDecisions({});
      setSelectedPupilIds([]);
      setError('Select academic year, term and class before previewing promotions.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setPreviewData(null);
    setDecisions({});
    setSelectedPupilIds([]);

    try {
      const backendUrl = getBackendUrl();
      const url = new URL(`${backendUrl}/api/admin/promotions/preview`);
      url.searchParams.set('academicYearId', selectedAcademicYearId);
      url.searchParams.set('termId', selectedTermId);
      url.searchParams.set('classId', selectedClassId);

      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Failed to load promotion preview.');
      }

      const data = await response.json();
      setPreviewData(data);
      setDecisions(
        Object.fromEntries(
          data.pupils.map((pupil: any) => [
            pupil.id,
            {
              decision: "",
              toClassId: "",
              rationale: "",
            },
          ])
        )
      );
      setSuccessMessage('Promotion preview loaded. Choose actions for each pupil.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
      setPreviewData(null);
      setDecisions({});
      setSelectedPupilIds([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAcademicYearId, selectedTermId, selectedClassId]);

  const handleDecisionChange = (pupilId: string, field: 'decision' | 'toClassId' | 'rationale', value: string) => {
    setDecisions((prev) => ({
      ...prev,
      [pupilId]: {
        ...prev[pupilId],
        [field]: value,
        ...(field === 'decision' && value !== 'PROMOTED' && value !== 'TRANSFERRED' ? { toClassId: '' } : {}),
      },
    }));
  };

  useEffect(() => {
    if (!selectedAcademicYearId || !selectedTermId || !selectedClassId) {
      setPreviewData(null);
      setDecisions({});
      setSelectedPupilIds([]);
      return;
    }

    void handlePreview();
  }, [selectedAcademicYearId, selectedTermId, selectedClassId, handlePreview]);

  const selectedPupilDecisions = useMemo(() => {
    if (!previewData) return [] as Array<{ id: string; decision: string; toClassId: string; rationale: string }>;
    return previewData.pupils
      .filter((pupil: any) => selectedPupilIds.includes(pupil.id))
      .map((pupil: any) => ({ id: pupil.id, decision: decisions[pupil.id]?.decision, toClassId: decisions[pupil.id]?.toClassId, rationale: decisions[pupil.id]?.rationale }))
      .filter((item: { decision?: string }) => item.decision && item.decision !== "") as Array<{ id: string; decision: string; toClassId: string; rationale: string }>;
  }, [previewData, decisions, selectedPupilIds]);

  const applyBulkDecision = () => {
    if (!previewData) {
      setError('Load a promotion preview first.');
      return;
    }

    if (!bulkDecision) {
      setError('Choose a bulk action before applying it to the class.');
      return;
    }

    if (selectedPupilIds.length === 0) {
      setError('Select at least one pupil before applying a bulk action.');
      return;
    }

    if ((bulkDecision === 'PROMOTED' || bulkDecision === 'TRANSFERRED') && !bulkTargetClassId) {
      setError('Select a target class for promoted or transferred pupils.');
      return;
    }

    setError(null);
    setSuccessMessage(null);

    const nextDecisions = Object.fromEntries(
      previewData.pupils
        .filter((pupil: any) => selectedPupilIds.includes(pupil.id))
        .map((pupil: any) => [
          pupil.id,
          {
            decision: bulkDecision,
            toClassId: bulkDecision === 'PROMOTED' || bulkDecision === 'TRANSFERRED' ? bulkTargetClassId : '',
            rationale: bulkRationale,
          },
        ])
    );

    setDecisions((prev) => ({ ...prev, ...nextDecisions }));
    setSuccessMessage(`Applied the bulk action to ${selectedPupilIds.length} selected pupils.`);
  };

  const handleApply = async () => {
    if (!previewData) {
      setError('Load a promotion preview first.');
      return;
    }

    const dirtyDecisions = selectedPupilDecisions;
    if (dirtyDecisions.length === 0) {
      setError('Select at least one promotion action before applying.');
      return;
    }

    for (const decision of dirtyDecisions) {
      const action = decision.decision;
      const toClassId = decision.toClassId;
      if ((action === 'PROMOTED' || action === 'TRANSFERRED') && !toClassId) {
        setError('All promoted or transferred pupils must have a target class selected.');
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/promotions/apply`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academicYearId: selectedAcademicYearId,
          termId: selectedTermId,
          fromClassId: selectedClassId,
          decisions: dirtyDecisions.map((item: any) => ({
            pupilId: item.id,
            decision: item.decision,
            toClassId: item.toClassId || null,
            rationale: item.rationale || null,
          })),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Failed to apply promotions');
      }

      const result = await response.json();
      setSuccessMessage(`Applied ${result.appliedCount || dirtyDecisions.length} promotion decisions successfully.`);
      setPreviewData(null);
      setDecisions({});
      setHistory([]);
      void fetchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Promotion apply failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!selectedAcademicYearId || !selectedTermId) {
      setHistory([]);
      setHistoryError(null);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const backendUrl = getBackendUrl();
      const url = new URL(`${backendUrl}/api/admin/promotions/history`);
      url.searchParams.set('academicYearId', selectedAcademicYearId);
      url.searchParams.set('termId', selectedTermId);
      if (selectedClassId) {
        url.searchParams.set('classId', selectedClassId);
      }

      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Failed to fetch promotion history');
      }

      const data = await response.json();
      setHistory(data.records || []);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedAcademicYearId || !selectedTermId) {
      return;
    }

    void fetchHistory();
  }, [selectedAcademicYearId, selectedTermId, selectedClassId]);

  const currentTermLabel = termOptions.find((term: Term) => term.id === selectedTermId)?.name || 'Term';
  const currentYearLabel = selectedYear?.name || 'Academic Year';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-brand">Student Promotion</p>
          <h1 className="text-2xl font-bold">Preview and apply class promotions</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handlePreview} disabled={loading || !selectedClassId || !selectedTermId || !selectedAcademicYearId}>
            Preview promotions
          </Button>
          <Button variant="primary" onClick={handleApply} disabled={loading || !previewData || selectedPupilDecisions.length === 0}>
            Apply decisions
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="block text-sm font-medium">Academic year</span>
          <select
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            value={selectedAcademicYearId}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedAcademicYearId(value);
              const year = academicYears.find((year) => year.id === value);
              setSelectedTermId(year?.terms?.[0]?.id || "");
            }}
          >
            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>{year.name}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="block text-sm font-medium">Term</span>
          <select
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            value={selectedTermId}
            onChange={(event) => setSelectedTermId(event.target.value)}
          >
            {termOptions.map((term: Term) => (
              <option key={term.id} value={term.id}>{term.name}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="block text-sm font-medium">Class</span>
          <select
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            value={selectedClassId}
            onChange={(event) => setSelectedClassId(event.target.value)}
          >
            {classOptions.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-error/20 bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg border border-success/20 bg-success/10 p-4 text-sm text-success">
          {successMessage}
        </div>
      )}

      {previewData ? (
        <section className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Preview for</p>
              <p className="text-lg font-semibold">{previewData.class.name}</p>
              <p className="text-sm text-muted">{currentYearLabel} · {currentTermLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="brand">{previewData.pupils.length} pupils</Badge>
              <Badge variant="secondary">{classOptions.find((item) => item.id === selectedClassId)?.name || 'Selected class'}</Badge>
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-background/40 p-3">
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold">Bulk action for this class</p>
                <p className="text-xs text-muted">Apply one decision to every pupil in the current preview.</p>
              </div>
              <Button variant="secondary" onClick={applyBulkDecision} disabled={loading || !previewData}>
                Apply to selected pupils
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1.4fr]">
              <label className="space-y-1">
                <span className="block text-xs font-medium uppercase tracking-wide text-muted">Action</span>
                <select
                  className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
                  value={bulkDecision}
                  onChange={(event) => setBulkDecision(event.target.value)}
                >
                  {PROMOTION_DECISIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="block text-xs font-medium uppercase tracking-wide text-muted">Target class</span>
                <select
                  className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
                  value={bulkTargetClassId}
                  onChange={(event) => setBulkTargetClassId(event.target.value)}
                  disabled={bulkDecision !== 'PROMOTED' && bulkDecision !== 'TRANSFERRED'}
                >
                  <option value="">Select target class</option>
                  {classOptions.filter((item) => item.id !== selectedClassId).map((option) => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="block text-xs font-medium uppercase tracking-wide text-muted">Rationale</span>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
                  value={bulkRationale}
                  onChange={(event) => setBulkRationale(event.target.value)}
                  placeholder="Optional rationale"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-background/40">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">
                    <input
                      type="checkbox"
                      checked={previewData?.pupils.length > 0 && selectedPupilIds.length === previewData.pupils.length}
                      onChange={() => {
                        if (!previewData) return;
                        setSelectedPupilIds((prev) =>
                          prev.length === previewData.pupils.length
                            ? []
                            : previewData.pupils.map((pupil: any) => pupil.id)
                        );
                      }}
                      className="h-4 w-4 rounded border-border"
                    />
                  </th>
                  <th className="px-3 py-2 font-medium">Pupil</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                  <th className="px-3 py-2 font-medium">Target Class</th>
                  <th className="px-3 py-2 font-medium">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {previewData.pupils.map((pupil: any, index: number) => {
                  const state = decisions[pupil.id] || { decision: '', toClassId: '', rationale: '' };
                  const showClassSelect = state.decision === 'PROMOTED' || state.decision === 'TRANSFERRED';
                  return (
                    <tr
                      key={pupil.id}
                      className={`border-t border-border transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'} hover:bg-slate-100/70`}
                    >
                      <td className="px-3 py-2 align-top">
                        <input
                          type="checkbox"
                          checked={selectedPupilIds.includes(pupil.id)}
                          onChange={() => {
                            setSelectedPupilIds((prev) =>
                              prev.includes(pupil.id) ? prev.filter((id) => id !== pupil.id) : [...prev, pupil.id]
                            );
                          }}
                          className="h-4 w-4 rounded border-border"
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="font-semibold">{pupil.firstName} {pupil.lastName}</div>
                        <div className="text-xs text-muted">Admn: {pupil.admissionNo || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <select
                          className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
                          value={state.decision}
                          onChange={(event) => handleDecisionChange(pupil.id, 'decision', event.target.value)}
                        >
                          {PROMOTION_DECISIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 align-top">
                        {showClassSelect ? (
                          <select
                            className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
                            value={state.toClassId}
                            onChange={(event) => handleDecisionChange(pupil.id, 'toClassId', event.target.value)}
                          >
                            <option value="">Select target class</option>
                            {classOptions.filter((item) => item.id !== selectedClassId).map((option) => (
                              <option key={option.id} value={option.id}>{option.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-muted">Only for promoted/transferred</span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <textarea
                          rows={1}
                          className="min-h-[34px] w-full rounded-lg border border-border bg-white px-2 py-1 text-sm"
                          value={state.rationale}
                          onChange={(event) => handleDecisionChange(pupil.id, 'rationale', event.target.value)}
                          placeholder="Optional rationale"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-2">
            <p className="text-sm text-muted">Selected actions: {selectedPupilDecisions.length}</p>
            <Button variant="primary" onClick={handleApply} disabled={loading || selectedPupilDecisions.length === 0}>
              Apply selected actions
            </Button>
          </div>
        </section>
      ) : (
        <div className="rounded-xl border border-border/70 bg-surface p-4 text-sm text-muted">
          Use the preview button to load students for the selected class and term.
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Promotion history</h2>
            <p className="text-sm text-muted">View historical promotion records for the selected year and term.</p>
          </div>
          <Button variant="secondary" onClick={fetchHistory} disabled={historyLoading || !selectedAcademicYearId || !selectedTermId}>
            Refresh history
          </Button>
        </div>

        {historyError && (
          <div className="mt-4 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
            {historyError}
          </div>
        )}

        {historyLoading ? (
          <p className="mt-4 text-sm text-muted">Loading history...</p>
        ) : history.length > 0 ? (
          <>
            <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface mb-6 hidden sm:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-background text-muted">
                  <tr>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Pupil</th>
                    <th className="px-4 py-2 font-medium">From</th>
                    <th className="px-4 py-2 font-medium">To</th>
                    <th className="px-4 py-2 font-medium">Decision</th>
                    <th className="px-4 py-2 font-medium">By</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr key={record.id} className="border-t border-border hover:bg-background/50 transition-colors">
                      <td className="px-4 py-2 text-foreground">{new Date(record.decidedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-foreground">{record.pupilName}</td>
                      <td className="px-4 py-2 text-foreground">{record.fromClassName || 'Unknown'}</td>
                      <td className="px-4 py-2 text-foreground">{record.toClassName || '-'}</td>
                      <td className="px-4 py-2"><Badge variant="secondary">{record.decision}</Badge></td>
                      <td className="px-4 py-2 text-muted">{record.decidedBy || 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-3 sm:hidden">
              {history.map((record) => (
                <div key={record.id} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{record.pupilName}</p>
                      <p className="text-sm text-muted">{new Date(record.decidedAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="secondary">{record.decision}</Badge>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted">
                    <p><span className="font-medium text-foreground">From:</span> {record.fromClassName || 'Unknown'}</p>
                    <p><span className="font-medium text-foreground">To:</span> {record.toClassName || '-'}</p>
                    <p><span className="font-medium text-foreground">By:</span> {record.decidedBy || 'System'}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">No promotion history loaded yet.</p>
        )}
      </div>
    </div>
  );
}
