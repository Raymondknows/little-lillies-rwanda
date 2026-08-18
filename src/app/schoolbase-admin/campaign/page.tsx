"use client";

import { useMemo, useState } from "react";
import AdminPageShell from "@/components/admin-page-shell";
import { ErrorModal } from "@/components/ui/error-modal";
import { sendDirectCampaignEmailAction } from "@/app/schoolbase-admin/actions";

const MAX_RECIPIENTS = 100;

const TEMPLATES: Record<string, { label: string; subject: string; body: string }> = {
  CONSULTANT_PARTNERSHIP: {
    label: "Consultant partnership outreach",
    subject: "Partnership Opportunity — Earn Referral Commission with Little Lillies School",
    body: "Dear [Consultant's Name],\n\nI hope this email finds you well.\n\nMy name is Busayo Ashade, and I work with Little Lillies School, a modern school management platform built for schools across West Africa. Little Lillies School brings fee collection, WhatsApp/SMS parent communication, results management, attendance tracking, student records, and school websites into one simple, secure platform.\n\nGiven your work advising schools across Nigeria, I am reaching out to explore a partnership opportunity. We would love for you to introduce Little Lillies School to schools in your network, and as a thank-you for every successful referral, you would earn [X]% commission on schools that subscribe through you.\n\nWhat schools can achieve with Little Lillies School:\n• Fee collection with automated WhatsApp/SMS reminders to parents\n• One-click assessment entry, results processing, and secure result release\n• Automatic attendance alerts to parents and staff\n• A built-in school website with branding, no separate website subscription required\n• Centralized student records, admissions, class and subject management\n• Professional report cards, parent portal access, and streamlined communication\n• Rapid onboarding and full setup support, typically within 48 hours\n\nCurrent pricing for schools:\n• Starter: ₦60,000 per term for small and growing schools\n• Growth: ₦85,000 per term for broader school operations\n• Custom pricing from ₦150,000 per term for school groups and larger institutions\n\nLittle Lillies School is designed to help schools reduce administrative work, improve parent engagement, and create a more professional day-to-day experience. I would welcome the opportunity to discuss this partnership further and answer any questions you may have. Would you be available for a short call this week?",
  },
  SCHOOL_PARTNERSHIP_INTRODUCTION: {
    label: "School partnership introduction",
    subject: "A practical digital platform for more efficient school operations",
    body: "Dear [School Administrator's Name],\n\nI hope this email finds you well.\n\nI am reaching out on behalf of Little Lillies School, a modern school management platform designed to help schools manage admissions, student records, fees, attendance, results, reports, parent communication, and online presence from one secure system.\n\nLittle Lillies School helps schools:\n• Collect fees, invoice parents, and send automated WhatsApp/SMS reminders\n• Track attendance and notify parents with timely alerts\n• Process assessments, generate report cards, and release results securely\n• Manage classes, subjects, teachers, academic terms, and promotions\n• Give parents access to fees, announcements, results, and communications through the Parent Portal\n• Launch a professional built-in school website without a separate subscription\n• Provide guided onboarding and setup support, typically within 48 hours\n\nCurrent pricing for schools:\n• Starter: ₦60,000 per term\n• Growth: ₦85,000 per term\n• Custom pricing from ₦150,000 per term for school groups\n\nIf your school is looking to reduce manual work, improve fee collection, and strengthen communication, we would be pleased to arrange a short demo tailored to your needs. Please reply to this email or contact us on WhatsApp at +234 903 136 8963.",
  },
  PARTNERSHIP_FOLLOW_UP: {
    label: "Partnership follow-up",
    subject: "Following up: Little Lillies School partnership opportunity",
    body: "Dear [Consultant's Name],\n\nI wanted to follow up on my earlier message about a potential partnership with Little Lillies School.\n\nWe are building relationships with consultants and education professionals who support schools and can help them adopt practical technology for admissions, student records, fees, attendance, results, report cards, parent communication, and school websites.\n\nThrough this partnership, you can recommend a credible platform to schools in your network and earn [X]% commission for each successful referral that subscribes through you. Little Lillies School supports the process with product demonstrations, onboarding guidance, implementation assistance, and responsive support.\n\nOur current term pricing is:\n• Starter: ₦60,000\n• Growth: ₦85,000\n• School groups: custom pricing from ₦150,000\n\nIf this is relevant to your work, I would be glad to arrange a brief call to explain the referral process and answer your questions. Would you be available for a short conversation this week?",
  },
};

function parseRecipients(value: string) {
  const entries = value.split(/[\s,;]+/).map((entry) => entry.trim().toLowerCase()).filter(Boolean);
  return Array.from(new Set(entries));
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function CampaignPage() {
  const [templateKey, setTemplateKey] = useState("CONSULTANT_PARTNERSHIP");
  const [recipientsText, setRecipientsText] = useState("");
  const [subject, setSubject] = useState(TEMPLATES.CONSULTANT_PARTNERSHIP.subject);
  const [body, setBody] = useState(TEMPLATES.CONSULTANT_PARTNERSHIP.body);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [result, setResult] = useState<{ sent: string[]; failed: { email: string; error: string }[] } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingSendPayload, setPendingSendPayload] = useState<null | {
    recipients: string[];
    emailType: string;
    subject: string;
    body: string;
  }>(null);

  const recipients = useMemo(() => parseRecipients(recipientsText), [recipientsText]);
  const validRecipients = useMemo(() => recipients.filter(isValidEmail), [recipients]);
  const invalidRecipients = useMemo(() => recipients.filter((email) => !isValidEmail(email)), [recipients]);

  const chooseTemplate = (key: string) => {
    const template = TEMPLATES[key];
    setTemplateKey(key);
    setSubject(template.subject);
    setBody(template.body);
    setNotice(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    setResult(null);

    if (!recipients.length) return setNotice({ type: "error", text: "Enter at least one recipient email address." });
    if (invalidRecipients.length) return setNotice({ type: "error", text: `Fix invalid email address(es): ${invalidRecipients.join(", ")}` });
    if (validRecipients.length > MAX_RECIPIENTS) return setNotice({ type: "error", text: `A campaign can contain at most ${MAX_RECIPIENTS} recipients.` });
    if (!subject.trim() || !body.trim()) return setNotice({ type: "error", text: "Subject and message are required." });

    setPendingSendPayload({
      recipients: validRecipients,
      emailType: templateKey,
      subject: subject.trim(),
      body: body.trim(),
    });
    setConfirmOpen(true);
  };

  const handleConfirmSend = async () => {
    if (!pendingSendPayload) return;

    setConfirmOpen(false);
    setSending(true);

    try {
      const response = await sendDirectCampaignEmailAction(pendingSendPayload);
      setResult({ sent: response.sent || [], failed: response.failed || [] });
      const successText = `Campaign complete: ${response.sentCount} sent, ${response.failedCount} failed.`;

      if (response.failedCount === 0) {
        setSuccessMessage(successText);
        setSuccessOpen(true);
      } else {
        setNotice({ type: "error", text: successText });
      }
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Failed to send campaign." });
    } finally {
      setSending(false);
      setPendingSendPayload(null);
    }
  };

  return (
    <AdminPageShell title="Campaign" subtitle="Send a Little Lillies School campaign to contacts without saving them as school records.">
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl bg-surface p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">Campaign composer</span>
            <h2 className="mt-3 text-xl font-semibold text-foreground">Send to direct contacts</h2>
            <p className="mt-1 text-sm text-muted">Enter comma-separated, space-separated, or line-separated addresses. Recipients are sent individually for privacy.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="campaign-recipients">Recipients</label>
              <textarea id="campaign-recipients" value={recipientsText} onChange={(event) => setRecipientsText(event.target.value)} rows={4} placeholder="contact-one@example.com, contact-two@example.com" className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                <span>{validRecipients.length} valid</span><span>{invalidRecipients.length} invalid</span><span>{recipients.length}/{MAX_RECIPIENTS} total</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="campaign-template">Template</label>
              <select id="campaign-template" value={templateKey} onChange={(event) => chooseTemplate(event.target.value)} className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand">
                {Object.entries(TEMPLATES).map(([key, template]) => <option key={key} value={key}>{template.label}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="campaign-subject">Subject</label>
              <input id="campaign-subject" value={subject} onChange={(event) => setSubject(event.target.value)} className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="campaign-message">Message</label>
              <textarea id="campaign-message" value={body} onChange={(event) => setBody(event.target.value)} rows={14} className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm leading-6 outline-none focus:border-brand" />
            </div>

            {notice && <div className={`rounded-xl border px-3 py-2.5 text-sm ${notice.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>{notice.text}</div>}
            <button type="submit" disabled={sending} className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60">{sending ? "Sending campaign…" : "Send campaign"}</button>
          </form>

          <ErrorModal
            isOpen={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title="Confirm campaign send"
            message={`This campaign will be sent to ${validRecipients.length} recipient(s). Each recipient will get a private message.`}
            type="success"
            confirmLabel="Send now"
            onSuccessAction={handleConfirmSend}
          />

          <ErrorModal
            isOpen={successOpen}
            onClose={() => setSuccessOpen(false)}
            title="Campaign sent"
            message={successMessage}
            type="success"
            confirmLabel="Done"
          />
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl bg-surface p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">Campaign summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted">Recipients</dt><dd className="font-semibold text-foreground">{validRecipients.length}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Template</dt><dd className="max-w-[12rem] text-right font-semibold text-foreground">{TEMPLATES[templateKey].label}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Database records</dt><dd className="font-semibold text-green-700">Not required</dd></div>
            </dl>
          </section>
          <section className="rounded-2xl bg-surface p-4 text-sm text-muted shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">Sending rules</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5"><li>Maximum {MAX_RECIPIENTS} recipients per campaign.</li><li>Duplicate addresses are removed automatically.</li><li>Each recipient receives a private individual email.</li><li>Campaign activity is logged without requiring a school record.</li></ul>
          </section>
          {result && <section className="rounded-2xl bg-surface p-4 text-sm shadow-sm sm:p-6"><h2 className="text-lg font-semibold text-foreground">Last campaign result</h2><p className="mt-2 text-green-700">Sent: {result.sent.length}</p>{result.failed.length > 0 && <div className="mt-2 text-red-700"><p>Failed: {result.failed.length}</p><ul className="mt-1 list-disc pl-5">{result.failed.map((item) => <li key={item.email}>{item.email}: {item.error}</li>)}</ul></div>}</section>}
        </aside>
      </div>
    </AdminPageShell>
  );
}
