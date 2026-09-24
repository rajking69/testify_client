"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sparkles,
  Bot,
  Send,
  X,
  Loader2,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { apiClient } from "@/lib/apiClient";

export interface ChatMessage {
  id: string;
  sender: "user" | "gekko";
  text: string;
  timestamp: string;
}

export function GekkoChatWidget() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const user = session?.user;
  const userRole = (user as { role?: string })?.role || "student";

  // Prevent SSR theme hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = activeTheme === "dark";

  // Check if student is currently taking a live active exam or on an active exam page
  const isLiveExam = Boolean(
    pathname &&
      (pathname.startsWith("/exam/") ||
        pathname.startsWith("/practice/") ||
        pathname.includes("/take") ||
        pathname.includes("/live-exam") ||
        pathname.includes("/attempt"))
  );

  // Auto-scroll to bottom of message list
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading, streamingId]);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "gekko",
          text: `Hi ${user?.name || "there"}! I'm **Gekko**, Testify's AI Study Assistant. I can help you with exams, questions, study topics, and using Testify.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [user?.name, messages.length]);

  // RESTRICTION: Hide Gekko completely for guests and during live active exams
  if (!mounted || !user || isLiveExam || (userRole !== "student" && userRole !== "teacher" && userRole !== "admin")) {
    return null;
  }

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    if (isLiveExam) {
      return;
    }

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage("");
    setIsLoading(true);

    // Deduplication: abort any previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Create streaming placeholder for progressive rendering
    const gekkoId = `gekko-${Date.now()}`;
    const placeholder: ChatMessage = {
      id: gekkoId,
      sender: "gekko",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, placeholder]);
    setStreamingId(gekkoId);

    try {
      const history = messages.slice(-10).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const pageContext = pathname?.includes("teacher")
        ? "teacher-dashboard"
        : pathname?.includes("admin")
        ? "admin-dashboard"
        : "student-dashboard";

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({
          message: textToSend,
          context: { page: pageContext, isLiveExam },
          history,
          stream: true,
        }),
      });

      // Handle non-streaming fallback (server may still return JSON if stream not supported)
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        let errData: any = {};
        try { errData = await res.json(); } catch {}
        throw { status: res.status, ...errData, message: errData.message || `Request failed ${res.status}` };
      }

      if (contentType.includes("application/json")) {
        const data = await res.json();
        const finalText = data?.data?.message || "";
        setMessages((prev) => prev.map((m) => m.id === gekkoId ? { ...m, text: finalText } : m));
        return;
      }

      // SSE streaming
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream body");
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";
        for (const block of lines) {
          const line = block.trim();
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.slice(5).trim();
          try {
            const evt = JSON.parse(jsonStr);
            if (evt.chunk) {
              accumulated += evt.chunk;
              setMessages((prev) => prev.map((m) => m.id === gekkoId ? { ...m, text: accumulated } : m));
            } else if (evt.error) {
              throw evt.error;
            } else if (evt.done) {
              // stream complete
            }
          } catch (e: any) {
            if (e?.chunk) continue;
            // if parse error for done event, ignore
            if (jsonStr.includes('"done"')) continue;
          }
        }
      }
      // If server sent completion with empty remaining buffer, handle last event
      if (buffer.trim().startsWith("data:")) {
        try {
          const evt = JSON.parse(buffer.trim().slice(5).trim());
          if (evt.chunk) {
            accumulated += evt.chunk;
            setMessages((prev) => prev.map((m) => m.id === gekkoId ? { ...m, text: accumulated } : m));
          }
        } catch {}
      }
      if (!accumulated) {
        // No chunk from SSE — backend likely sent friendly message as final chunk (now fixed server-side).
        // If still empty, let outer catch trigger non-stream fallback without noisy stack.
        throw { code: "EMPTY_STREAM", message: "Empty stream response" };
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      if (err?.code !== "EMPTY_STREAM") console.error("[Gekko AI UI Error]:", err);
      const isExamBlocked =
        err?.status === 403 ||
        err?.code === "ACTIVE_EXAM_RESTRICTION" ||
        err?.response?.data?.code === "ACTIVE_EXAM_RESTRICTION" ||
        err?.message?.includes("prohibited during an active examination") ||
        err?.message?.includes("unavailable while an exam");

      // If we already streamed partial content, keep it and append notice instead of replacing
      const hasPartial = (() => {
        let found = "";
        setMessages((prev) => { const m = prev.find((x) => x.id === gekkoId); if (m) found = m.text; return prev; });
        return found.length > 40;
      })();

      // Check if placeholder already has meaningful content -> graceful interruption
      // Don't append duplicate full answer; just keep partial and show retry hint
      if (hasPartial) {
        setMessages((prev) => prev.map((m) => m.id === gekkoId ? { ...m, text: m.text + "\n\n*Response was interrupted. Please try again if needed.*" } : m));
      } else {
        // No meaningful content streamed -> try non-streaming fallback once
        try {
          if (!isExamBlocked) {
            const history2 = messages.slice(-10).map((m) => ({ sender: m.sender, text: m.text }));
            const pageContext2 = pathname?.includes("teacher") ? "teacher-dashboard" : pathname?.includes("admin") ? "admin-dashboard" : "student-dashboard";
            const res2 = await apiClient.post("/ai/chat", {
              message: textToSend,
              context: { page: pageContext2, isLiveExam },
              history: history2,
            });
            if (res2 && res2.success && res2.data?.message) {
              setMessages((prev) => prev.map((m) => m.id === gekkoId ? { ...m, text: res2.data.message } : m));
              return;
            }
          }
        } catch {}
        const errorText = isExamBlocked
          ? "🚫 Gekko AI is strictly prohibited during an active examination."
          : err?.code === "AI_RATE_LIMIT" || err?.message?.includes("Too many")
          ? "You're sending messages too quickly. Please wait a moment."
          : "Sorry, Gekko is temporarily unavailable. Please try again in a moment.";
        setMessages((prev) => prev.map((m) => m.id === gekkoId ? { ...m, text: errorText } : m));
      }
    } finally {
      setIsLoading(false);
      setStreamingId(null);
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSuggestedPrompts = () => {
    if (userRole === "teacher") {
      return [
        "How do I create an automated MCQ exam?",
        "Tips for setting anti-cheating rules",
        "How does Testify AI grading work?",
      ];
    }
    return [
      "How can I prepare for my upcoming exam?",
      "Explain how practice tests work",
      "How do I view my performance stats?",
    ];
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end font-sans select-none">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border ${
            isDark
              ? "bg-slate-900/90 text-white border-slate-700/60 hover:border-cyan-400/80 shadow-cyan-950/20"
              : "bg-white/95 text-slate-800 border-slate-200/90 hover:border-[#0092E3] shadow-slate-900/10 backdrop-blur-md"
          }`}
          title="Chat with Gekko AI Study Assistant"
        >
          <div className="relative flex items-center justify-center">
            <img
              src="/images/Previsao-para-o-Mercado-de-Chatbot-Online.webp"
              alt="Gekko AI"
              className={`h-7 w-7 rounded-full object-cover ring-2 transition-all ${
                isDark
                  ? "ring-cyan-400/40 group-hover:ring-cyan-400"
                  : "ring-[#0092E3]/40 group-hover:ring-[#0092E3]"
              }`}
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isDark ? "bg-cyan-400" : "bg-[#0092E3]"}`}></span>
              <span className={`relative inline-flex h-2 w-2 rounded-full ${isDark ? "bg-cyan-400" : "bg-[#0092E3]"}`}></span>
            </span>
          </div>

          <span className={`text-xs font-bold font-display tracking-tight transition-colors pr-0.5 ${
            isDark ? "text-slate-100 group-hover:text-cyan-300" : "text-slate-800 group-hover:text-[#0092E3]"
          }`}>
            Gekko
          </span>
        </button>
      )}

      {/* Main Chat Panel Container */}
      {isOpen && (
        <div
          className={`flex flex-col rounded-2xl shadow-2xl border transition-all duration-300 overflow-hidden ${
            isMinimized
              ? "w-80 h-14"
              : "w-[92vw] sm:w-[380px] h-[520px] max-h-[85vh]"
          } ${
            isDark
              ? "bg-[#0B132B]/95 text-slate-100 border-slate-800/90 shadow-cyan-950/30 backdrop-blur-xl"
              : "bg-white/95 text-slate-900 border-slate-200/90 shadow-slate-900/15 backdrop-blur-xl"
          }`}
        >
          {/* Header Bar */}
          <div
            className={`flex items-center justify-between px-4 py-3 shrink-0 border-b ${
              isDark
                ? "border-slate-800/80 bg-slate-900/80"
                : "border-slate-100 bg-slate-50/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/images/Previsao-para-o-Mercado-de-Chatbot-Online.webp"
                  alt="Gekko Avatar"
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-cyan-400/50"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold font-display tracking-tight text-slate-900 dark:text-slate-100">
                    Gekko
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 dark:bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-600 dark:text-cyan-300 font-mono">
                    <Sparkles className="h-2.5 w-2.5" /> AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Study Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded-lg p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isMinimized ? "Expand Chat" : "Minimize Chat"}
              >
                {isMinimized ? (
                  <Maximize2 className="h-3.5 w-3.5" />
                ) : (
                  <Minimize2 className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Expanded Chat Body */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-amber-400 to-cyan-400 flex items-center justify-center text-[#0B1528] shrink-0 mt-0.5 shadow-2xs font-extrabold">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed space-y-1.5 ${
                          isUser
                            ? "bg-[#0092E3] text-white rounded-br-2xs shadow-md"
                            : isDark
                            ? "bg-slate-900/90 text-slate-100 rounded-bl-2xs border border-slate-800 shadow-2xs"
                            : "bg-slate-100 text-slate-800 rounded-bl-2xs border border-slate-200/80 shadow-2xs"
                        }`}
                      >
                        <div className="whitespace-pre-wrap font-sans break-words text-[11.5px]">
                          {msg.text.split("\n").map((paragraph, pIdx) => {
                            if (!paragraph) return <div key={pIdx} className="h-1.5" />;
                            const parts = paragraph.split(/(\*{2}.*?\*{2})/g);
                            return (
                              <p key={pIdx} className="mb-1 last:mb-0">
                                {parts.map((part, partIdx) => {
                                  if (part.startsWith("**") && part.endsWith("**")) {
                                    return (
                                      <strong key={partIdx} className="font-bold">
                                        {part.slice(2, -2)}
                                      </strong>
                                    );
                                  }
                                  return part;
                                })}
                              </p>
                            );
                          })}
                        </div>
                        <span
                          className={`text-[9.5px] block text-right font-mono ${
                            isUser
                              ? "text-blue-100/70"
                              : isDark
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Thinking Indicator - only before first chunk arrives */}
                {isLoading && streamingId && messages.find((m) => m.id === streamingId)?.text === "" && (
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-amber-400 to-cyan-400 flex items-center justify-center text-[#0B1528] shrink-0 font-extrabold shadow-2xs">
                      <Loader2 className="h-4 w-4 animate-spin text-[#0B1528]" />
                    </div>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl border text-[11px] font-medium italic flex items-center gap-2 ${
                        isDark
                          ? "bg-slate-900 border-slate-800 text-slate-300"
                          : "bg-slate-100 border-slate-200/80 text-slate-600"
                      }`}
                    >
                      <span>Gekko is thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Suggested Prompt Chips */}
              {messages.length <= 2 && (
                <div
                  className={`px-4 py-2 border-t space-y-1.5 ${
                    isDark
                      ? "border-slate-800/60 bg-slate-950/40"
                      : "border-slate-100 bg-slate-50/50"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-display">
                    Suggested Topics:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {getSuggestedPrompts().map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full border transition-colors shadow-2xs cursor-pointer truncate max-w-full ${
                          isDark
                            ? "bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-400 hover:text-cyan-400"
                            : "bg-white text-slate-700 border-slate-200 hover:border-[#0092E3] hover:text-[#0092E3]"
                        }`}
                      >
                        💡 {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div
                className={`p-3 border-t shrink-0 ${
                  isDark
                    ? "border-slate-800/80 bg-[#070D18]"
                    : "border-slate-100 bg-white"
                }`}
              >
                <div className="relative flex items-center gap-2">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="Ask Gekko about Testify or your studies..."
                    rows={1}
                    className={`w-full resize-none rounded-2xl border px-3.5 py-2.5 pr-10 text-xs focus:outline-none transition-all disabled:opacity-60 ${
                      isDark
                        ? "border-slate-800 bg-slate-900/60 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                        : "border-slate-200/80 bg-slate-50/60 text-slate-800 placeholder:text-slate-400 focus:border-[#0092E3] focus:ring-1 focus:ring-[#0092E3]"
                    }`}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputMessage.trim()}
                    className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-xl bg-[#0092E3] text-white hover:bg-[#007AC9] transition-all disabled:opacity-40 disabled:hover:bg-[#0092E3] cursor-pointer shadow-sm"
                    title="Send message to Gekko"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-1 flex items-center justify-between px-1 text-[9.5px] text-slate-400">
                  <span>Press Enter to send, Shift+Enter for newline</span>
                  <span className="font-mono">Gekko AI 3.8</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
