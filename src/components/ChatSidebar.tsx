"use client";

import { useEffect, useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { ChatPageClient } from "@/components/ChatPageClient";
import { X } from "lucide-react";

export function ChatSidebar() {
  const { open, close } = useChat();
  const [glowing, setGlowing] = useState(false);

  useEffect(() => {
    if (open) {
      setGlowing(true);
      const timer = setTimeout(() => setGlowing(false), 2800);
      return () => clearTimeout(timer);
    }
    setGlowing(false);
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/10 transition-opacity"
          onClick={close}
        />
      )}

      {/* Animated gradient glow on screen edges */}
      <div
        className="pointer-events-none fixed inset-0 z-[65] transition-opacity"
        style={{
          opacity: glowing ? 1 : 0,
          transitionDuration: glowing ? "300ms" : "1200ms",
        }}
      >
        {/* Top edge */}
        <div
          className="absolute inset-x-0 top-0 h-[180px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(28,126,247,0.28) 0%, rgba(160,64,245,0.12) 35%, transparent 100%)",
            animation: glowing ? "edgePulse 2.8s ease-in-out" : "none",
          }}
        />
        {/* Right edge */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[240px]"
          style={{
            background:
              "linear-gradient(270deg, rgba(160,64,245,0.32) 0%, rgba(247,64,128,0.10) 35%, transparent 100%)",
            animation: glowing ? "edgePulse 2.8s ease-in-out" : "none",
          }}
        />
        {/* Bottom edge */}
        <div
          className="absolute inset-x-0 bottom-0 h-[150px]"
          style={{
            background:
              "linear-gradient(0deg, rgba(247,64,128,0.24) 0%, rgba(160,64,245,0.08) 35%, transparent 100%)",
            animation: glowing ? "edgePulse 2.8s ease-in-out" : "none",
          }}
        />
        {/* Left edge */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[180px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(28,126,247,0.22) 0%, rgba(160,64,245,0.06) 35%, transparent 100%)",
            animation: glowing ? "edgePulse 2.8s ease-in-out" : "none",
          }}
        />
        {/* Corner bloom: top-right */}
        <div
          className="absolute right-0 top-0 h-[300px] w-[300px]"
          style={{
            background:
              "radial-gradient(circle at 100% 0%, rgba(160,64,245,0.38) 0%, rgba(28,126,247,0.10) 45%, transparent 75%)",
            animation: glowing ? "edgePulse 2.8s ease-in-out" : "none",
          }}
        />
        {/* Corner bloom: bottom-right */}
        <div
          className="absolute right-0 bottom-0 h-[260px] w-[260px]"
          style={{
            background:
              "radial-gradient(circle at 100% 100%, rgba(247,64,128,0.30) 0%, rgba(160,64,245,0.08) 45%, transparent 75%)",
            animation: glowing ? "edgePulse 2.8s ease-in-out" : "none",
          }}
        />
        {/* Corner bloom: top-left */}
        <div
          className="absolute left-0 top-0 h-[240px] w-[240px]"
          style={{
            background:
              "radial-gradient(circle at 0% 0%, rgba(28,126,247,0.26) 0%, rgba(160,64,245,0.06) 45%, transparent 75%)",
            animation: glowing ? "edgePulse 2.8s ease-in-out" : "none",
          }}
        />
        {/* Corner bloom: bottom-left */}
        <div
          className="absolute left-0 bottom-0 h-[220px] w-[220px]"
          style={{
            background:
              "radial-gradient(circle at 0% 100%, rgba(247,64,128,0.20) 0%, rgba(28,126,247,0.05) 45%, transparent 75%)",
            animation: glowing ? "edgePulse 2.8s ease-in-out" : "none",
          }}
        />
      </div>

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-dvh flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          width: "min(420px, 100vw)",
          background: "var(--page-bg)",
          borderLeft: "1px solid rgba(0,0,0,0.08)",
          boxShadow: open ? "-8px 0 30px rgba(0,0,0,0.06)" : "none",
        }}
      >
        {/* Close bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <GeminiMark />
          <button
            type="button"
            onClick={close}
            className="rounded-full p-1.5 text-[color:var(--text-secondary)] transition-colors hover:bg-black/[0.06]"
            aria-label="Close chat"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Chat body */}
        <div className="flex-1 overflow-hidden">
          <ChatPageClient />
        </div>
      </aside>

    </>
  );
}

function GeminiMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
      <path
        d="M14 0C14 7.732 7.732 14 0 14c7.732 0 14 6.268 14 14 0-7.732 6.268-14 14-14C20.268 14 14 7.732 14 0z"
        fill="url(#gemini-sidebar)"
      />
      <defs>
        <linearGradient id="gemini-sidebar" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1C7EF7" />
          <stop offset="0.52" stopColor="#A040F5" />
          <stop offset="1" stopColor="#F74080" />
        </linearGradient>
      </defs>
    </svg>
  );
}
