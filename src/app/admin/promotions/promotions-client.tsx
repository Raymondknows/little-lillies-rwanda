"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getBackendUrl } from "../../../lib/backend-url";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ErrorModal } from "../../../components/ui/error-modal";
import { GraduationCap, RefreshCw, Sparkles } from "lucide-react";

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

type PromotionDecisionState = {
  decision: string;
  toClassId: string;
  rationale: string;
};

type PromotionPreviewPupil = {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo?: string | null;
};

type PromotionPreviewData = {
  class: {
    name: string;
  };
  pupils: PromotionPreviewPupil[];
};

type PromotionHistoryRecord = {
  id: string;
  decidedAt: string;
  pupilName: string;
  fromClassName?: string | null;
  toClassName?: string | null;
  decision: string;
  decidedBy?: string | null;
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
  const getInitialAcademicYearId = () => academicYears.find((year) => year.isCurrent)?.id ?? academicYears[0]?.id ?? "";
  const getInitialClassId = () => classes[0]?.id ?? "";

  const [selectedAcademicYearId] = useState<string>(getInitialAcademicYearId);
  const [selectedClassId, setSelectedClassId] = useState<string>(getInitialClassId);
  const [previewData, setPreviewData] = useState<PromotionPreviewData | null>(null);
  const [decisions, setDecisions] = useState<Record<string, PromotionDecisionState>>({});
  const [selectedPupilIds, setSelectedPupilIds] = useState<string[]>([]);
  const [bulkDecision, setBulkDecision] = useState<string>("");
  const [bulkTargetClassId, setBulkTargetClassId] = useState<string>("");
  const [bulkRationale, setBulkRationale] = useState<string>("");
  const [isRationaleModalOpen, setIsRationaleModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<PromotionHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalDetails, setModalDetails] = useState<string | undefined>(undefined);

  const selectedYear = academicYears.find((year) => year.id === selectedAcademicYearId);
  const currentTermId = selectedYear?.terms?.[0]?.id ?? "";
  const classOptions = useMemo(() => classes || [], [classes]);

  const handlePreview = useCallback(async (classId?: string) => {
    const classIdToUse = classId ?? selectedClassId;

    if (!selectedAcademicYearId || !currentTermId || !classIdToUse) {
      setPreviewData(null);
      setDecisions({});
      setSelectedPupilIds([]);
      setError("Ensure the current session and class are selected before loading pupils.");
      return;
    }

    setLoading(true);
    setError(null);
    setModalOpen(false);
    setModalMessage('');
    setPreviewData(null);
    setDecisions({});
    setSelectedPupilIds([]);

    try {
      const backendUrl = getBackendUrl();
      const url = new URL(`${backendUrl}/api/admin/promotions/preview`);
      url.searchParams.set("academicYearId", selectedAcademicYearId);
      url.searchParams.set("termId", currentTermId);
      url.searchParams.set("classId", classIdToUse);

      const response = await fetch(url.toString(), {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to load promotion preview.");
      }

      const data = (await response.json()) as PromotionPreviewData;
      setPreviewData(data);
      setSelectedPupilIds(data.pupils.map((pupil) => pupil.id));
      setDecisions(
        Object.fromEntries(
          data.pupils.map((pupil) => [
            pupil.id,
            {
              decision: "",
              toClassId: "",
              rationale: "",
            },
          ])
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preview");
      setPreviewData(null);
      setDecisions({});
      setSelectedPupilIds([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAcademicYearId, currentTermId, selectedClassId]);

  const selectedPupilDecisions = useMemo(() => {
    if (!previewData) return [] as Array<{ id: string; decision: string; toClassId: string; rationale: string }>;
    return previewData.pupils
      .filter((pupil) => selectedPupilIds.includes(pupil.id))
      .map((pupil) => {
        const existingDecision = decisions[pupil.id];
        const decision = existingDecision?.decision || bulkDecision;
        const toClassId = existingDecision?.toClassId || (bulkDecision === "PROMOTED" || bulkDecision === "TRANSFERRED" ? bulkTargetClassId : "");
        const rationale = existingDecision?.rationale || bulkRationale;

        return {
          id: pupil.id,
          decision,
          toClassId,
          rationale,
        };
      })
      .filter((item: { decision?: string }) => item.decision && item.decision !== "") as Array<{
        id: string;
        decision: string;
        toClassId: string;
        rationale: string;
      }>;
  }, [previewData, decisions, selectedPupilIds, bulkDecision, bulkTargetClassId, bulkRationale]);

  const handleApply = async () => {
    if (!previewData) {
      setModalType('error');
      setModalTitle('Unable to apply promotions');
      setModalMessage('Load a promotion preview first.');
      setModalDetails(undefined);
      setModalOpen(true);
      return;
    }

    const dirtyDecisions = selectedPupilDecisions;
    if (dirtyDecisions.length === 0) {
      setModalType('error');
      setModalTitle('No actions selected');
      setModalMessage('Select at least one promotion action before applying.');
      setModalDetails(undefined);
      setModalOpen(true);
      return;
    }

    for (const decision of dirtyDecisions) {
      const action = decision.decision;
      const toClassId = decision.toClassId;
      if ((action === "PROMOTED" || action === "TRANSFERRED") && !toClassId) {
        setModalType('error');
        setModalTitle('Missing target class');
        setModalMessage('All promoted or transferred pupils must have a target class selected.');
        setModalDetails(undefined);
        setModalOpen(true);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setModalOpen(false);
    setModalMessage('');
    setModalDetails(undefined);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/promotions/apply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYearId: selectedAcademicYearId,
          termId: currentTermId,
          fromClassId: selectedClassId,
          decisions: dirtyDecisions.map((item) => ({
            pupilId: item.id,
            decision: item.decision,
            toClassId: item.toClassId || null,
            rationale: item.rationale || null,
          })),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to apply promotions");
      }

      const result = await response.json();
      setModalType('success');
      setModalTitle('Promotion decisions applied');
      setModalMessage(`Applied ${result.appliedCount || dirtyDecisions.length} promotion decisions successfully.`);
      setModalDetails(undefined);
      setModalOpen(true);
      setPreviewData(null);
      setDecisions({});
      setHistory([]);
      void fetchHistory();
    } catch (err) {
      setModalType('error');
      setModalTitle('Unable to apply promotions');
      setModalMessage(err instanceof Error ? err.message : "Promotion apply failed");
      setModalDetails(undefined);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = useCallback(async () => {
    if (!selectedAcademicYearId || !currentTermId) {
      setHistory([]);
      setHistoryError(null);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const backendUrl = getBackendUrl();
      const url = new URL(`${backendUrl}/api/admin/promotions/history`);
      url.searchParams.set("academicYearId", selectedAcademicYearId);
      url.searchParams.set("termId", currentTermId);
      if (selectedClassId) {
        url.searchParams.set("classId", selectedClassId);
      }

      const response = await fetch(url.toString(), {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to fetch promotion history");
      }

      const data = (await response.json()) as { records?: PromotionHistoryRecord[] };
      setHistory(data.records ?? []);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }, [selectedAcademicYearId, currentTermId, selectedClassId]);

  useEffect(() => {
    if (!selectedAcademicYearId || !currentTermId) {
      return;
    }

    void fetchHistory();
  }, [selectedAcademicYearId, currentTermId, selectedClassId, fetchHistory]);

  const currentSessionLabel = selectedYear?.name || "Current session";

  useEffect(() => {
    if (!selectedAcademicYearId || !currentTermId || !selectedClassId) {
      return;
    }

    void handlePreview(selectedClassId);
  }, [selectedAcademicYearId, currentTermId, selectedClassId, handlePreview]);

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Promotions</p>
            <h1 className="text-2xl font-bold text-foreground">Review and apply class promotions</h1>
            <p className="text-sm text-muted">Choose the class and review the loaded pupils automatically.</p>
          </div>
        </div>
      </div>


      {error && (
        <div className="rounded-lg border border-error/20 bg-error/10 p-4 text-sm text-error">{error}</div>
      )}
      <ErrorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        details={modalDetails}
        type={modalType}
        confirmLabel={modalType === 'success' ? 'Okay' : 'Review'}
        onSuccessAction={() => void handlePreview(selectedClassId)}
      />

      {previewData ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{previewData.class.name}</p>
                <p className="text-sm text-muted">{currentSessionLabel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="brand">{previewData.pupils.length} pupils</Badge>
                <Badge variant="secondary">{selectedPupilIds.length} selected</Badge>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(150px,200px)_minmax(150px,200px)_minmax(150px,200px)_minmax(160px,180px)] items-end">
              <label className="space-y-1 max-w-[220px]">
                <span className="block text-xs font-medium uppercase tracking-wide text-muted">Current class</span>
                <select
                  className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm max-w-[220px]"
                  value={selectedClassId}
                  onChange={(event) => {
                    const newClassId = event.target.value;
                    setSelectedClassId(newClassId);
                    void handlePreview(newClassId);
                  }}
                >
                  {classOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 max-w-[220px]">
                <span className="block text-xs font-medium uppercase tracking-wide text-muted">Target class</span>
                <select
                  className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm max-w-[220px]"
                  value={bulkTargetClassId}
                  onChange={(event) => setBulkTargetClassId(event.target.value)}
                >
                  <option value="">Select target class</option>
                  {classOptions.filter((item) => item.id !== selectedClassId).map((option) => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 max-w-[220px]">
                <span className="block text-xs font-medium uppercase tracking-wide text-muted">Bulk action</span>
                <select
                  className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm max-w-[220px]"
                  value={bulkDecision}
                  onChange={(event) => setBulkDecision(event.target.value)}
                >
                  {PROMOTION_DECISIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <div className="max-w-[180px]">
                <span className="block text-xs font-medium uppercase tracking-wide text-muted">Rationale</span>
                <button
                  type="button"
                  onClick={() => setIsRationaleModalOpen(true)}
                  className="text-sm font-semibold text-brand underline"
                >
                  {bulkRationale ? "Edit rationale" : "Add rationale"}
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted max-w-[220px]">{bulkRationale || "Optional note"}</p>

            {isRationaleModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Rationale</h2>
                      <p className="text-sm text-muted">Add a note for the bulk decision.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRationaleModalOpen(false)}
                      className="text-sm font-semibold text-muted transition hover:text-foreground"
                    >
                      Close
                    </button>
                  </div>

                  <textarea
                    rows={8}
                    value={bulkRationale}
                    onChange={(event) => setBulkRationale(event.target.value)}
                    placeholder="Type the rationale here..."
                    className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:bg-white"
                  />

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRationaleModalOpen(false)}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRationaleModalOpen(false)}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-[#0A66C2] bg-[#0A66C2] px-4 text-sm font-semibold text-white transition hover:bg-[#0858a8]"
                    >
                      Save rationale
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/70 bg-white p-3">
            <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-foreground">Select pupils</p>
                <p className="text-sm text-muted">Use the checkboxes to choose who should receive the bulk action.</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={previewData.pupils.length > 0 && selectedPupilIds.length === previewData.pupils.length}
                  onChange={() => {
                    if (!previewData) return;
                    setSelectedPupilIds((prev) =>
                      prev.length === previewData.pupils.length ? [] : previewData.pupils.map((pupil) => pupil.id)
                    );
                  }}
                  className="h-4 w-4 rounded border-border"
                />
                Select all
              </label>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              {previewData.pupils.map((pupil: PromotionPreviewPupil) => (
                <label
                  key={pupil.id}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${selectedPupilIds.includes(pupil.id) ? "border-[#0A66C2] bg-[#0A66C2]/5" : "border-border/70 bg-slate-50/70"}`}
                >
                  <span>
                    <span className="block font-medium text-foreground">{pupil.firstName} {pupil.lastName}</span>
                    <span className="block text-xs text-muted">Admn: {pupil.admissionNo || "N/A"}</span>
                  </span>
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
                </label>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
              <p className="text-sm text-muted">Ready to apply: {selectedPupilDecisions.length} pupil decisions</p>
              <Button
                type="button"
                variant="primary"
                onClick={handleApply}
                disabled={loading || selectedPupilDecisions.length === 0}
                className="h-9 rounded-lg border border-[#0A66C2] bg-[#0A66C2] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#0858a8]"
              >
                <GraduationCap className="h-4 w-4" />
                Apply selected actions
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-slate-50 p-5 text-sm text-muted">
          Load a class to begin reviewing promotion decisions.
        </div>
      )}

      <div className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              <h2 className="text-lg font-semibold text-foreground">Recent promotion history</h2>
            </div>
            <p className="text-sm text-muted">A compact view of what was approved for the current session.</p>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => void fetchHistory()}
            disabled={historyLoading || !selectedAcademicYearId || !currentTermId}
            className="h-9 rounded-lg border border-[#0A66C2] bg-[#0A66C2] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#0858a8]"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {historyError && <div className="mt-4 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">{historyError}</div>}

        {historyLoading ? (
          <p className="mt-4 text-sm text-muted">Loading history...</p>
        ) : history.length > 0 ? (
          <div className="mt-4 space-y-2">
            {history.map((record) => (
              <div key={record.id} className="flex flex-col gap-2 rounded-lg border border-border/70 bg-slate-50/70 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-foreground">{record.pupilName}</p>
                  <p className="text-sm text-muted">{new Date(record.decidedAt).toLocaleDateString()} · {record.fromClassName || "Unknown"} → {record.toClassName || "-"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{record.decision}</Badge>
                  <span className="text-sm text-muted">{record.decidedBy || "System"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">No promotion history loaded yet.</p>
        )}
      </div>
    </div>
  );
}
