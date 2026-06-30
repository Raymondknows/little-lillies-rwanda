"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, QrCode, Send, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";

interface SessionStatus {
  status?: string;
  statusMessage?: string;
  qr?: string;
  phoneNumber?: string;
  pairingCode?: string;
  pairingMethod?: string;
  lastError?: string;
  debugLog?: string[];
  debugInfo?: Record<string, unknown>;
}

const configuredWhatsAppTargets = ['+250793225342', '+2349031368963'];

export default function WhatsAppBaileysPage() {
  const [session, setSession] = useState<SessionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRunningDebug, setIsRunningDebug] = useState(false);
  const [message, setMessage] = useState("SchoolBase Baileys test message");
  const [phoneNumber, setPhoneNumber] = useState("+2349088559072");
  const [pairingPhoneNumber, setPairingPhoneNumber] = useState("2349088559072");
  const [usePairingCode, setUsePairingCode] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  const isStreamErrorRetrying = debugInfo?.streamErrorRetrying === true;
  const streamErrorReconnectAttempts = typeof debugInfo?.streamErrorReconnectAttempts === 'number' ? debugInfo.streamErrorReconnectAttempts : 0;
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  useEffect(() => {
    void fetchStatus(true);
  }, []);

  // Poll status while a QR is active or while connecting to keep the UI updated
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (session?.status === 'qr' || session?.status === 'connecting' || isConnecting || isRunningDebug) {
      timer = setInterval(() => {
        void fetchStatus(false);
      }, 1500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [session?.status, isConnecting]);

  const syncSession = (nextSession: SessionStatus | null) => {
    setSession(nextSession);
    setDebugLog(nextSession?.debugLog || []);
    setDebugInfo(nextSession?.debugInfo || null);
  };

  const fetchStatus = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const response = await fetch('/api/admin/whatsapp-baileys/status', { credentials: 'include' });
      if (!response.ok) {
        if (showLoading) {
          setActionMessage('Unable to load Baileys WhatsApp status.');
        }
        return;
      }
      const data = await response.json();
      syncSession(data.session || null);
    } catch (error) {
      console.error('Status fetch error:', error);
      if (showLoading) {
        setActionMessage('Unable to load Baileys WhatsApp status.');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleConnect = async () => {
    setActionMessage(null);
    if (usePairingCode && !pairingPhoneNumber.trim()) {
      setActionMessage('Enter the WhatsApp phone number for pairing code mode.');
      return;
    }
    setIsConnecting(true);
    try {
      const response = await fetch('/api/admin/whatsapp-baileys/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber: pairingPhoneNumber.trim(), usePairingCode }),
      });
      const data = await response.json();
      if (response.ok) {
        syncSession(data.session || null);
        setActionMessage(usePairingCode ? 'Connection requested. Enter the pairing code in WhatsApp.' : 'Connection requested. Scan the QR code if shown.');
      } else {
        setActionMessage(data.error || 'Failed to start Baileys connection.');
      }
    } catch (error) {
      console.error('Connect error:', error);
      setActionMessage('Unable to connect Baileys WhatsApp.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setActionMessage(null);
    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/admin/whatsapp-baileys/disconnect', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        syncSession(data.session || null);
        setActionMessage('Baileys session disconnected.');
      } else {
        setActionMessage(data.error || 'Failed to disconnect Baileys session.');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      setActionMessage('Unable to disconnect Baileys WhatsApp.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const sendMessageToRecipients = async (recipients: string[]) => {
    if (!recipients.length) {
      setActionMessage('Enter at least one phone number first.');
      return;
    }

    setIsSending(true);
    setActionMessage(null);
    try {
      const response = await fetch('/api/admin/whatsapp-baileys/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phoneNumbers: recipients, message: message.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setActionMessage(`Test message sent successfully to ${recipients.join(', ')}.`);
      } else {
        setActionMessage(data.error || 'Failed to send Baileys test message.');
      }
    } catch (error) {
      console.error('Send test error:', error);
      setActionMessage('Unable to send Baileys test message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTest = async () => {
    if (!phoneNumber.trim()) {
      setActionMessage('Enter a phone number first.');
      return;
    }

    await sendMessageToRecipients([phoneNumber.trim()]);
  };

  const handleSendConfiguredTargets = async () => {
    await sendMessageToRecipients(configuredWhatsAppTargets);
  };

  const handleRunDebug = async () => {
    setActionMessage(null);
    setIsRunningDebug(true);
    try {
      const response = await fetch('/api/admin/whatsapp-baileys/debug', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setDebugLog(data.result?.events || []);
        setDebugInfo(data.result || null);
        setActionMessage(data.result?.summary || 'Debug probe completed.');
      } else {
        setActionMessage(data.error || 'Failed to run Baileys debug probe.');
      }
    } catch (error) {
      console.error('Debug probe error:', error);
      setActionMessage('Unable to run Baileys debug probe.');
    } finally {
      setIsRunningDebug(false);
    }
  };

  const isConnected = session?.status === 'connected';
  const badgeLabel = isConnected
    ? 'Connected'
    : session?.status === 'qr'
      ? 'Waiting for scan'
      : session?.status === 'connecting'
        ? 'Connecting'
        : session?.status === 'error'
          ? 'Error'
          : 'Disconnected';

  const handleCopyPairingCode = async () => {
    if (!session?.pairingCode) return;
    try {
      await navigator.clipboard.writeText(session.pairingCode);
      setIsCodeCopied(true);
      setActionMessage('Pairing code copied. Paste it into WhatsApp on your phone.');
      window.setTimeout(() => setIsCodeCopied(false), 2000);
    } catch {
      setActionMessage('Unable to copy the pairing code automatically. Please copy it manually.');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" className="h-10 w-10 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">WhatsApp</p>
          <h1 className="text-3xl font-bold">Baileys WhatsApp</h1>
        </div>
      </div>

      <div className="rounded-xl border border-border p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Status</p>
            <p className="mt-2 text-lg font-medium">{session?.status || 'unknown'}</p>
            <p className="text-sm text-muted mt-1">{session?.statusMessage || 'No status available.'}</p>
            {isStreamErrorRetrying && (
              <p className="text-sm font-medium text-amber-600 mt-2">Retrying after stream error ({streamErrorReconnectAttempts})</p>
            )}
            {session?.phoneNumber && <p className="text-xs text-muted mt-1">Phone: {session.phoneNumber}</p>}
            {session?.pairingCode && <p className="text-xs text-muted mt-1">Pairing code: {session.pairingCode}</p>}
          </div>
          <div>
            <Badge variant={isConnected ? 'success' : 'secondary'}>{badgeLabel}</Badge>
          </div>
        </div>

        {session?.qr && (
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Scan QR Code</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(session.qr)}`}
              alt="WhatsApp QR Code"
              className="rounded-lg border border-border"
            />
          </div>
        )}

        {session?.pairingCode && (
          <div className="mt-6 rounded-lg border border-brand/30 bg-brand/5 p-4">
            <p className="text-sm font-semibold">Pairing code</p>
            <p className="mt-2 text-sm text-muted">
              Open WhatsApp on your phone, go to Linked devices, select Link a device, and enter this code.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-2xl font-semibold tracking-[0.3em]">
                {session.pairingCode}
              </div>
              <Button onClick={handleCopyPairingCode} variant="outline">
                {isCodeCopied ? 'Copied' : 'Copy code'}
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted">
              If WhatsApp says it could not link the device, wait a few seconds and try again; the pairing flow will retry automatically.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Connection method</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={!usePairingCode} onChange={() => setUsePairingCode(false)} />
                Use QR code
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={usePairingCode} onChange={() => setUsePairingCode(true)} />
                Use pairing code
              </label>
            </div>
          </div>
          {usePairingCode && (
            <div>
              <label className="block text-sm font-medium mb-2">Phone number for pairing</label>
              <input
                value={pairingPhoneNumber}
                onChange={(e) => setPairingPhoneNumber(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2"
                placeholder="2348012345678"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? 'Connecting…' : 'Connect'}
            </Button>
          <Button onClick={handleDisconnect} disabled={isDisconnecting || !isConnected} variant="secondary">
            {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
          </Button>
            <Button onClick={() => void fetchStatus(true)} disabled={loading} variant="outline">
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Debug Trace</h2>
          <Button onClick={handleRunDebug} disabled={isRunningDebug} variant="outline">
            {isRunningDebug ? 'Running…' : 'Run Deep Debug Probe'}
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted">This shows the latest Baileys connection events and failures so the QR issue can be diagnosed directly.</p>
        {debugLog.length > 0 ? (
          <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-border bg-background p-3 text-xs font-mono">
            {debugLog.map((entry, index) => (
              <div key={`${entry}-${index}`} className="whitespace-pre-wrap break-all">
                {entry}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">No debug events yet. Click “Run Debug Probe” to capture them.</p>
        )}
        {debugInfo && (
          <pre className="mt-4 max-h-48 overflow-auto rounded-lg border border-border bg-background p-3 text-xs">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}
      </div>

      <div className="rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-3">Send Test Message</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone number</label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2"
              placeholder="+2348012345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border px-3 py-2"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSendTest} disabled={isSending || !isConnected}>
              {isSending ? 'Sending…' : 'Send Test Message'}
            </Button>
            <Button onClick={() => void handleSendConfiguredTargets()} disabled={isSending || !isConnected} variant="outline">
              {isSending ? 'Sending…' : 'Send to configured numbers'}
            </Button>
          </div>
          <p className="text-sm text-muted">Configured targets: {configuredWhatsAppTargets.join(', ')}</p>
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-lg border border-border bg-background p-4 text-sm">
          {actionMessage}
        </div>
      )}
    </div>
  );
}
