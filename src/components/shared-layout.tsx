"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Sidebar from "@/components/sidebar";
import { usePathname } from "next/navigation";
import { Menu, X, FileText, Music, Play, Pause, ChevronDown, ChevronUp, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playCloseTone, playOpenTone } from "@/lib/sounds";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  section?: string;
};

export default function SharedLayout({
  children,
  navItems,
  school,
  session,
  setupProgress,
  logoHref = "/",
  logoutRedirectUrl = "/login",
}: {
  children: ReactNode;
  navItems: NavItem[];
  school?: { name?: string | null; city?: string | null; country?: string | null } | null;
  session?: { name?: string } | null;
  setupProgress?: number | null;
  logoHref?: string;
  logoutRedirectUrl?: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [noteModalPosition, setNoteModalPosition] = useState({ top: 120, left: 80 });
  const [isDraggingNotes, setIsDraggingNotes] = useState(false);
  const [adminSessionNotes, setAdminSessionNotes] = useState("");
  const [audioFileUrl, setAudioFileUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [pendingAutoPlay, setPendingAutoPlay] = useState(false);
  const [playerCollapsed, setPlayerCollapsed] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [playerVolume, setPlayerVolume] = useState(0.75);
  const [noteModalWidth, setNoteModalWidth] = useState(720);
  const [noteModalHeight, setNoteModalHeight] = useState(480);
  const [isResizingNotes, setIsResizingNotes] = useState(false);
  const [isVolumePopoverOpen, setIsVolumePopoverOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resizeStartRef = useRef<any>({ startX: 0, width: 720, startLeft: 0, startY: 0, height: 480, side: "right" });
  const volumeButtonRef = useRef<HTMLButtonElement | null>(null);
  const volumePopoverRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const DEFAULT_JINGLES = [
    { name: "SchoolBase Jingle 1", src: "/audio-jingles/SchoolBase%20_%20Simple%20On%20Your%20Screen.mp3" },
    { name: "SchoolBase Jingle 2", src: "/audio-jingles/SchoolBase%20_%20Simple%20On%20Your%20Screen%202.mp3" },
  ];

  const pathname = usePathname();
  const hideSidebar = pathname?.startsWith("/login");

  useEffect(() => {
    setAdminSessionNotes(window.sessionStorage.getItem("schoolbase-admin-session-notes") || "");
    setPlayerCollapsed(window.localStorage.getItem("admin-notes-player-collapsed") === "true");
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem("schoolbase-admin-session-notes", adminSessionNotes);
  }, [adminSessionNotes]);

  useEffect(() => {
    window.localStorage.setItem("admin-notes-player-collapsed", playerCollapsed ? "true" : "false");
  }, [playerCollapsed]);

  useEffect(() => {
    if (!isDraggingNotes) return;

    const handleMouseMove = (event: MouseEvent) => {
      setNoteModalPosition((current) => ({
        top: Math.max(16, event.clientY - dragOffsetRef.current.y),
        left: Math.max(16, event.clientX - dragOffsetRef.current.x),
      }));
    };

    const handleMouseUp = () => {
      setIsDraggingNotes(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingNotes]);

  useEffect(() => {
    if (!isResizingNotes) return;

    const handleResizeMove = (event: MouseEvent) => {
      const side = resizeStartRef.current.side || "right";
      const minWidth = 480;
      const maxWidth = 1024;

      if (side === "right") {
        const deltaX = event.clientX - resizeStartRef.current.startX;
        const newWidth = Math.min(Math.max(resizeStartRef.current.width + deltaX, minWidth), maxWidth);
        setNoteModalWidth(newWidth);
      } else if (side === "left") {
        const deltaX = event.clientX - resizeStartRef.current.startX;
        let proposedLeft = Math.max(16, resizeStartRef.current.startLeft + deltaX);
        // width should shrink/grow opposite the left movement
        let newWidth = resizeStartRef.current.width - (proposedLeft - resizeStartRef.current.startLeft);
        if (newWidth < minWidth) {
          newWidth = minWidth;
          proposedLeft = resizeStartRef.current.startLeft + (resizeStartRef.current.width - minWidth);
        } else if (newWidth > maxWidth) {
          newWidth = maxWidth;
          proposedLeft = resizeStartRef.current.startLeft + (resizeStartRef.current.width - maxWidth);
        }
        setNoteModalWidth(newWidth);
        setNoteModalPosition((current) => ({ ...current, left: Math.max(16, proposedLeft) }));
      } else if (side === "bottom") {
        const deltaY = event.clientY - resizeStartRef.current.startY;
        const minH = 240;
        const maxH = 1200;
        const newHeight = Math.min(Math.max(resizeStartRef.current.height + deltaY, minH), maxH);
        setNoteModalHeight(newHeight);
      } else if (side === "top") {
        const deltaY = event.clientY - resizeStartRef.current.startY;
        let proposedTop = Math.max(16, resizeStartRef.current.startTop + deltaY);
        let newHeight = resizeStartRef.current.height - (proposedTop - resizeStartRef.current.startTop);
        const minH = 240;
        const maxH = 1200;
        if (newHeight < minH) {
          newHeight = minH;
          proposedTop = resizeStartRef.current.startTop + (resizeStartRef.current.height - minH);
        } else if (newHeight > maxH) {
          newHeight = maxH;
          proposedTop = resizeStartRef.current.startTop + (resizeStartRef.current.height - maxH);
        }
        setNoteModalHeight(newHeight);
        setNoteModalPosition((current) => ({ ...current, top: Math.max(16, proposedTop) }));
      }
    };

    const handleResizeUp = () => {
      setIsResizingNotes(false);
    };

    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeUp);

    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeUp);
    };
  }, [isResizingNotes]);

  useEffect(() => {
    if (!isVolumePopoverOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        volumeButtonRef.current?.contains(event.target as Node) ||
        volumePopoverRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setIsVolumePopoverOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVolumePopoverOpen]);

  const handleNotesMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsDraggingNotes(true);
    dragOffsetRef.current = {
      x: event.clientX - noteModalPosition.left,
      y: event.clientY - noteModalPosition.top,
    };
  };

  const openNotesModal = () => {
    playOpenTone();
    // Ensure modal is visible on small viewports by clamping position
    const modalW = Math.min(noteModalWidth, (typeof window !== 'undefined' ? window.innerWidth - 32 : noteModalWidth));
    const modalH = Math.min(noteModalHeight, (typeof window !== 'undefined' ? window.innerHeight - 32 : noteModalHeight));
    const maxLeft = (typeof window !== 'undefined') ? Math.max(16, window.innerWidth - modalW - 16) : noteModalPosition.left;
    const maxTop = (typeof window !== 'undefined') ? Math.max(16, window.innerHeight - modalH - 16) : noteModalPosition.top;
    setNoteModalPosition((current) => ({
      top: Math.min(current.top, maxTop),
      left: Math.min(current.left, maxLeft),
    }));
    setIsNotesOpen(true);
  };

  const closeNotesModal = () => {
    playCloseTone();
    setIsNotesOpen(false);
  };

  const clearNotes = () => {
    setAdminSessionNotes("");
  };

  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAudioFileUrl(url);
    setAudioFileName(file.name);
    setIsAudioPlaying(false);
    setPendingAutoPlay(false);
    setAudioProgress(0);
  };

  const playDefaultJingle = (index: number) => {
    const jingle = DEFAULT_JINGLES[index];
    if (!jingle) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setAudioFileUrl(jingle.src);
    setAudioFileName(jingle.name);
    setPendingAutoPlay(true);
    setIsAudioPlaying(true);
    setAudioProgress(0);
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;

    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        setIsAudioPlaying(false);
      });
      setIsAudioPlaying(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration || 1;
    setAudioProgress(current / duration);
  };

  const handleAudioVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = Number(event.target.value);
    setPlayerVolume(volume);
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  const handlePlayerCollapseToggle = () => {
    setPlayerCollapsed((current) => !current);
  };

  useEffect(() => {
    if (!audioRef.current) return;

    const handleEnded = () => {
      setIsAudioPlaying(false);
    };

    audioRef.current.addEventListener("ended", handleEnded);
    return () => {
      audioRef.current?.removeEventListener("ended", handleEnded);
    };
  }, [audioFileUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = playerVolume;
    }
  }, [playerVolume]);

  useEffect(() => {
    if (!audioRef.current || !pendingAutoPlay) return;

    audioRef.current.play().catch(() => {
      setIsAudioPlaying(false);
    });
    setPendingAutoPlay(false);
  }, [audioFileUrl, pendingAutoPlay]);

  if (hideSidebar) {
    return (
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6 md:p-8 print:overflow-visible print:p-0">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        navItems={navItems}
        school={school}
        session={session}
        setupProgress={setupProgress}
        logoHref={logoHref}
        logoutRedirectUrl={logoutRedirectUrl}
      />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden print:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen w-56 transform bg-surface md:hidden print:hidden transition-transform duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          navItems={navItems}
          school={school}
          session={session}
          setupProgress={setupProgress}
          logoHref={logoHref}
          logoutRedirectUrl={logoutRedirectUrl}
          isMobile
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header */}
        <div className="border-b border-border bg-surface px-4 py-3 md:hidden flex items-center gap-2 print:hidden">
          <Button
            variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 h-auto w-auto"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <h1 className="text-sm font-semibold text-foreground">{school?.name}</h1>
        </div>

        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6 md:p-8 print:overflow-visible print:p-0">{children}</main>

        <button
          type="button"
          onClick={openNotesModal}
          className="fixed right-6 top-1/2 z-50 inline-flex items-center gap-2 rounded-full bg-[#0A66C2] px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-[#0952a4] transform -translate-y-1/2"
        >
          <FileText className="h-3.5 w-3.5" />
          Notes
        </button>

        {isNotesOpen ? (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <div
              className="absolute z-50 rounded-2xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(10,102,194,0.16)] pointer-events-auto flex flex-col"
              style={{
                  animation: `notes_modal_enter 320ms cubic-bezier(.2,.9,.2,1)`,
                  top: noteModalPosition.top,
                  left: noteModalPosition.left,
                  position: "fixed",
                  width: noteModalWidth,
                  height: noteModalHeight,
                  maxWidth: "calc(100vw - 32px)",
                  maxHeight: "calc(100vh - 32px)",
                }}
            >
              <style>{`
                @keyframes notes_modal_enter { from { transform: translateX(36px) scale(.98); opacity: 0 } to { transform: translateX(0) scale(1); opacity: 1 } }
                @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>
              <div
                className="relative flex cursor-grab items-center justify-between gap-3 rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-[#dbeafe] via-[#bfdbfe] to-[#eff6ff] px-6 py-5"
                onMouseDown={handleNotesMouseDown}
              >
                <div>
                  <p className="text-2xl font-bold text-foreground">Notes</p>
              
                  <p className="mt-1 text-sm text-slate-600">Keep notes and reminders visible while you work.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-800">
                  <span className="text-xs font-semibold text-slate-800">
                    {audioFileName || "Choose music"}
                  </span>
                  {DEFAULT_JINGLES.map((jingle, index) => (
                    <button
                      key={jingle.name}
                      type="button"
                      onClick={() => playDefaultJingle(index)}
                      className="flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/90 px-3 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:bg-white"
                      title={`Play ${jingle.name}`}
                      aria-label={`Play ${jingle.name}`}
                    >
                      J{index + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handlePlayerCollapseToggle}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
                    title={playerCollapsed ? "Show player" : "Hide player"}
                    aria-label={playerCollapsed ? "Show player" : "Hide player"}
                  >
                    {playerCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    ref={volumeButtonRef}
                    onClick={() => setIsVolumePopoverOpen((open) => !open)}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
                    title="Volume"
                    aria-label="Volume"
                  >
                    <Volume2 className="h-4 w-4 text-brand" />
                  </button>
                  {isVolumePopoverOpen ? (
                    <div
                      ref={volumePopoverRef}
                      className="absolute right-6 top-20 z-50 w-52 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                        <span>Volume</span>
                        <span>{Math.round(playerVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={playerVolume}
                        onChange={handleAudioVolumeChange}
                        className="mt-3 h-2 w-full cursor-pointer accent-brand"
                      />
                    </div>
                  ) : null}
                  <label
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
                    title="Select audio track"
                    aria-label="Select audio track"
                  >
                    <Music className="h-4 w-4 text-brand" />
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleAudioFileChange}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={toggleAudioPlayback}
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/90 text-brand shadow-sm transition hover:bg-white"
                    title={isAudioPlaying ? "Pause music" : "Play music"}
                    aria-label={isAudioPlaying ? "Pause music" : "Play music"}
                  >
                    {isAudioPlaying ? (
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{
                          backgroundImage:
                            "conic-gradient(from 0deg, rgba(10,102,194,0.75), rgba(245,193,37,0.75), rgba(56,189,248,0.75), rgba(245,193,37,0.55))",
                          boxShadow: "0 0 0 2px rgba(10,102,194,0.25), 0 0 18px rgba(245,193,37,0.18)",
                          animation: "spin 1.4s linear infinite",
                        }}
                      />
                    ) : null}
                    <span className="relative z-10">
                      {isAudioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={closeNotesModal}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-background transition-colors"
                    title="Close notes"
                    aria-label="Close notes"
                  >
                    ✕
                  </button>
                </div>
                <div className="pointer-events-none absolute inset-x-4 bottom-0 h-1 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-200"
                    style={{ width: `${audioProgress * 100}%` }}
                  />
                </div>
              </div>
              <div className="relative flex-1 flex flex-col space-y-4 px-5 py-5 overflow-auto">
                {/* audio element moved out of modal so playback persists when modal closes */}
                <textarea
                  value={adminSessionNotes}
                  onChange={(event) => setAdminSessionNotes(event.target.value)}
                  rows={10}
                  placeholder="Write your current tasks, reminders, or follow-up notes here..."
                  className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-4 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 flex-1 min-h-0"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
                  <span>{adminSessionNotes.length} character{adminSessionNotes.length === 1 ? "" : "s"}</span>
                  <button
                    type="button"
                    onClick={clearNotes}
                    className="rounded-lg border border-border bg-slate-100 px-4 py-2 text-xs font-medium text-foreground hover:bg-slate-200 transition"
                  >
                    Clear notes
                  </button>
                </div>
                <div
                  className="absolute left-0 top-14 bottom-14 w-3 -ml-1 cursor-ew-resize z-50"
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    setIsResizingNotes(true);
                    resizeStartRef.current = {
                      startX: event.clientX,
                      width: noteModalWidth,
                      startLeft: noteModalPosition.left,
                      startY: noteModalPosition.top,
                      height: noteModalHeight,
                      side: "left",
                    };
                  }}
                  title="Resize notes modal (left)"
                  aria-label="Resize notes modal (left)"
                />
                <div
                  className="absolute right-0 top-14 bottom-14 w-3 -mr-1 cursor-ew-resize z-50"
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    setIsResizingNotes(true);
                    resizeStartRef.current = {
                      startX: event.clientX,
                      width: noteModalWidth,
                      startLeft: noteModalPosition.left,
                      startY: noteModalPosition.top,
                      height: noteModalHeight,
                      side: "right",
                    };
                  }}
                  title="Resize notes modal (right)"
                  aria-label="Resize notes modal (right)"
                />
                <div
                  className="absolute left-14 right-14 top-0 h-3 -mt-1 cursor-row-resize z-50"
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    setIsResizingNotes(true);
                    resizeStartRef.current = {
                      startY: event.clientY,
                      height: noteModalHeight,
                      startTop: noteModalPosition.top,
                      startLeft: noteModalPosition.left,
                      side: "top",
                    };
                  }}
                  title="Resize notes modal (top)"
                  aria-label="Resize notes modal (top)"
                />
                <div
                  className="absolute left-14 right-14 bottom-0 h-3 -mb-1 cursor-row-resize z-50"
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    setIsResizingNotes(true);
                    resizeStartRef.current = {
                      startY: event.clientY,
                      height: noteModalHeight,
                      startTop: noteModalPosition.top,
                      startLeft: noteModalPosition.left,
                      side: "bottom",
                    };
                  }}
                  title="Resize notes modal (bottom)"
                  aria-label="Resize notes modal (bottom)"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <audio
        ref={audioRef}
        src={audioFileUrl ?? undefined}
        className="hidden"
        preload="metadata"
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={() => setIsAudioPlaying(false)}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            audioRef.current.volume = playerVolume;
            setAudioProgress(0);
          }
        }}
      />
    </div>
  );
}
