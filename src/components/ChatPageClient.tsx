"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useEvents } from "@/contexts/EventsContext";
import { useFilter } from "@/contexts/FilterContext";
import { usePro } from "@/contexts/ProContext";
import { filterEventsByTimeRange } from "@/lib/calculations/filter-events";
import { filterHiddenEvents } from "@/lib/calculations/filter-hidden";
import { buildDashboardPayload } from "@/lib/build-dashboard-payload";
import { type AIPersonaMode } from "@/lib/ai-personas";
import { Send, Zap, Loader2, Trash2 } from "lucide-react";

type AiMode = AIPersonaMode;

const MODE_LABELS: Record<AiMode, string> = {
  assistant: "Helpful Assistant",
  supercomputer: "Supercomputer",
  startup_roaster: "Startup Roaster",
  nepo_baby: "Nepo Baby",
};

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
}

type MdToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string }
  | { type: "br" };

function tokenizeMarkdownInline(input: string): MdToken[] {
  const tokens: MdToken[] = [];
  let i = 0;

  const pushText = (value: string) => {
    if (!value) return;
    tokens.push({ type: "text", value });
  };

  while (i < input.length) {
    const ch = input[i];

    if (ch === "\n") {
      tokens.push({ type: "br" });
      i += 1;
      continue;
    }

    if (input.startsWith("**", i)) {
      const end = input.indexOf("**", i + 2);
      if (end !== -1) {
        const inner = input.slice(i + 2, end);
        tokens.push({ type: "bold", value: inner });
        i = end + 2;
        continue;
      }
    }

    if (ch === "*") {
      const end = input.indexOf("*", i + 1);
      if (end !== -1) {
        const inner = input.slice(i + 1, end);
        tokens.push({ type: "italic", value: inner });
        i = end + 1;
        continue;
      }
    }

    if (ch === "`") {
      const end = input.indexOf("`", i + 1);
      if (end !== -1) {
        const inner = input.slice(i + 1, end);
        tokens.push({ type: "code", value: inner });
        i = end + 1;
        continue;
      }
    }

    const nextSpecial = (() => {
      const candidates = [
        input.indexOf("\n", i),
        input.indexOf("**", i),
        input.indexOf("*", i),
        input.indexOf("`", i),
      ].filter((v) => v !== -1);
      return candidates.length ? Math.min(...candidates) : -1;
    })();

    if (nextSpecial === -1) {
      pushText(input.slice(i));
      break;
    }

    if (nextSpecial === i) {
      pushText(input[i]);
      i += 1;
      continue;
    }

    pushText(input.slice(i, nextSpecial));
    i = nextSpecial;
  }

  return tokens;
}

function ChatMarkdown({ text }: { text: string }) {
  const tokens = tokenizeMarkdownInline(text);
  return (
    <>
      {tokens.map((t, idx) => {
        if (t.type === "br") return <br key={idx} />;
        if (t.type === "bold") return <strong key={idx}>{t.value}</strong>;
        if (t.type === "italic") return <em key={idx}>{t.value}</em>;
        if (t.type === "code") {
          return (
            <code
              key={idx}
              className="rounded-md px-1 py-0.5"
              style={{
                background: "rgba(0,0,0,0.06)",
                fontSize: "0.95em",
              }}
            >
              {t.value}
            </code>
          );
        }
        return <span key={idx}>{t.value}</span>;
      })}
    </>
  );
}

export function ChatPageClient() {
  const { events } = useEvents();
  const {
    selectedFilter,
    currentYear,
    currentMonth,
    minDate,
    maxDate,
  } = useFilter();
  const { isPro, billingRates } = usePro();

  const [mode, setMode] = useState<AiMode>("assistant");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const clearChat = useCallback(() => {
    setMessages([]);
    setInput("");
    setLoading(false);
  }, []);

  useEffect(() => {
    clearChat();
  }, [mode, clearChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const getPayload = useCallback(() => {
    const timeFiltered = filterEventsByTimeRange(
      events,
      selectedFilter,
      currentYear,
      currentMonth,
      minDate,
      maxDate
    );
    const filtered = filterHiddenEvents(timeFiltered);
    return buildDashboardPayload(
      filtered,
      selectedFilter,
      isPro,
      billingRates
    );
  }, [events, selectedFilter, currentYear, currentMonth, minDate, maxDate, isPro, billingRates]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text: text.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          text: m.text,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            dashboardPayload: getPayload(),
            mode,
            history,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Request failed");
        }

        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "model",
          text: data.text,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: unknown) {
        const errText =
          err instanceof Error ? err.message : "Something went wrong";
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "model", text: `Error: ${errText}` },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, getPayload, mode]
  );

  const handleAnalyze = useCallback(() => {
    const prompt =
      mode === "assistant"
        ? "Analyze my dashboard and give me actionable advice."
        : "Review my dashboard data and roast the waste using the numbers.";
    sendMessage(prompt);
  }, [mode, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-1">
        <h2 className="text-[20px] font-semibold text-[color:var(--text-primary)]">
          Gemini
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={clearChat}
            className="rounded-full p-2 text-[color:var(--text-secondary)] transition-colors hover:bg-black/[0.06]"
            aria-label="Clear chat"
            title="Clear chat"
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
          <div className="flex items-center gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as AiMode)}
              className="h-9 rounded-full bg-black/[0.04] px-3 text-[14px] font-semibold text-[color:var(--text-primary)] outline-none ring-1 ring-black/5 focus:bg-white"
              aria-label="Select AI persona"
            >
              {Object.entries(MODE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pb-3"
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 && !loading ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
            <div
              className="rounded-2xl p-3"
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))" }}
            >
              <Zap size={28} strokeWidth={1.5} style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[color:var(--text-primary)]">
                {mode === "assistant"
                  ? "Coach mode is ready."
                  : `${MODE_LABELS[mode]} is loaded.`}
              </p>
              <p className="mt-1 text-[14px] text-[color:var(--text-secondary)]">
                {mode === "assistant"
                  ? "Get a quick insight and a next step."
                  : "You will get numbers and disrespect."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              className="rounded-full px-4 py-1.5 text-[14px] font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "var(--primary)" }}
            >
              Analyze Dashboard
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "text-white"
                      : "text-[color:var(--text-primary)]"
                  }`}
                  style={
                    msg.role === "user"
                      ? { background: "var(--primary)" }
                      : {
                          background: "rgba(255,255,255,0.6)",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                          border: "1px solid rgba(0,0,0,0.04)",
                        }
                  }
                >
                  <ChatMarkdown text={msg.text} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-[15px] text-[color:var(--text-secondary)]"
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <Loader2 size={14} className="animate-spin" />
                  {mode === "assistant" ? "Thinking..." : "Preparing your roast..."}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2 border-t border-black/[0.06] px-4 py-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "assistant"
              ? "Ask about your productivity..."
              : "Ask for a brutal roast..."
          }
          rows={1}
          className="flex-1 resize-none bg-transparent text-[15px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]/60 outline-none"
          style={{ maxHeight: "80px" }}
        />
        <button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-30"
          style={{ background: "var(--primary)" }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
