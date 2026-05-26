"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { courseId: number; courseTitle: string; lessonTitle: string }[];
}

const SUGGESTED_QUESTIONS = [
  "O que é Lucro Presumido e quando usar?",
  "Como funciona o eSocial na prática?",
  "Quais são os principais pontos da Reforma Tributária 2026?",
  "Como calcular IRPJ e CSLL no Lucro Real?",
  "O que é EFD REINF e quem precisa entregar?",
  "Explique o conceito de DFC — Demonstração dos Fluxos de Caixa",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: "#C9A849" }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function SourceBadge({ source }: { source: { courseId: number; courseTitle: string; lessonTitle: string } }) {
  return (
    <a
      href={`https://cefis.com.br/portal/cursos/${source.courseId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-all hover:opacity-80"
      style={{ background: "rgba(201,168,73,0.08)", color: "#C9A849", border: "1px solid rgba(201,168,73,0.2)" }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
      <span className="font-medium truncate max-w-[160px]">{source.courseTitle}</span>
    </a>
  );
}

function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2d5a9e 100%)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A849" strokeWidth="2">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
          </svg>
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={isUser
            ? { background: "#1B3A6B", color: "white", borderRadius: "18px 18px 4px 18px" }
            : { background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.9)", borderRadius: "18px 18px 18px 4px" }
          }
        >
          {message.content.split('\n').map((line, i) => (
            <span key={i}>{line}{i < message.content.split('\n').length - 1 && <br />}</span>
          ))}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((src, i) => (
              <SourceBadge key={i} source={src} />
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o Tutor IA do CEFIS, treinado com as transcrições reais das aulas da plataforma. Posso responder dúvidas sobre contabilidade, fiscal, trabalhista e muito mais.\n\nO que você quer aprender hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(question: string) {
    if (!question.trim() || loading) return;

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "Desculpe, não consegui processar sua pergunta.",
          sources: data.sources,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro ao conectar com o tutor. Tente novamente." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050505" }}>
      {/* Header */}
      <header className="shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(5,5,5,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "rgba(255,255,255,0.5)" }}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2d5a9e 100%)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A849" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-montserrat)" }}>Tutor IA</div>
                <div className="text-xs" style={{ color: "#C9A849" }}>CEFIS · Claude AI</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>446 aulas indexadas</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} isLast={i === messages.length - 1} />
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2d5a9e 100%)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A849" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                </svg>
              </div>
              <div className="rounded-2xl" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}>
                <TypingIndicator />
              </div>
            </motion.div>
          )}

          {/* Suggested questions (show only at start) */}
          {messages.length === 1 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="text-left text-xs px-3 py-2.5 rounded-xl transition-all hover:opacity-80 active:scale-95"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
                >
                  {q}
                </button>
              ))}
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(5,5,5,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-end rounded-2xl p-1" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre qualquer conteúdo CEFIS..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm outline-none px-3 py-2.5"
              style={{ color: "rgba(255,255,255,0.9)", maxHeight: 120, lineHeight: "1.5" }}
              disabled={loading}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: input.trim() && !loading ? "#1B3A6B" : "rgba(255,255,255,0.05)",
                color: input.trim() && !loading ? "white" : "rgba(255,255,255,0.2)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
              Respostas baseadas nas transcrições reais dos cursos CEFIS · Claude AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
