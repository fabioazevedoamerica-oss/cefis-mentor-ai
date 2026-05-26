"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import CourseCard, { formatDuration } from "../components/CourseCard";

interface Course {
  id: number;
  title: string;
  duration: number;
  rating: number;
  lessons: number;
  category: string;
}

interface Track {
  id: number;
  title: string;
  courses: number;
  duration: number;
  description?: string;
}

interface Plan {
  user: {
    name: string;
    area: string;
    goal: string;
    time: string;
    style?: string;
    level: string;
  };
  recommendedTrack: Track | null;
  courses: Course[];
  allTracks: Track[];
  weeklySchedule: Record<string, Course[]>;
  quickWins: Course[];
  gapAnalysis: {
    needToLearn: string[];
    alreadyKnows: string[];
  };
  aiInsights?: {
    mentorMessage: string;
    studyTips: string[];
    motivationalQuote: string;
  };
  meta: {
    lessonsPerDay: number;
    minutesPerDay: number;
    daysToComplete: number;
    weeksToComplete: number;
    totalCourses: number;
    styleDescription: string;
    generatedAt: string;
  };
}

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const DAY_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex"];

function StarRating({ rating }: { rating: number }) {
  const score = rating > 10 ? rating / 10 : rating;
  const full = Math.floor(score);
  const empty = 5 - full;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#C9A849" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-xs text-gray-400 ml-1 font-medium">{score.toFixed(1)}</span>
    </span>
  );
}

const goalLabels: Record<string, string> = {
  "Passar no CFC": "Exame CFC",
  "Especialização Fiscal": "Especialista Fiscal",
  "Carreira em DP": "Departamento Pessoal",
  "Crescimento Profissional": "Crescimento Profissional",
};

const areaColors: Record<string, { bg: string; text: string; border: string }> = {
  Contador: { bg: "#EBF4FF", text: "#1B3A6B", border: "#BFDBFE" },
  "Analista Fiscal": { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  "Departamento Pessoal": { bg: "#F5F3FF", text: "#5B21B6", border: "#DDD6FE" },
  Outro: { bg: "#FFF7ED", text: "#92400E", border: "#FED7AA" },
};

const styleIcons: Record<string, React.ReactNode> = {
  Visual: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Auditivo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  ),
  Leitura: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Prático: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
};

const defaultPlan: Plan = {
  user: { name: "Profissional", area: "Contador", goal: "Crescimento Profissional", time: "1h", level: "Intermediário" },
  recommendedTrack: { id: 1, title: "Contabilidade Avançada", courses: 34, duration: 0, description: "Trilha completa para contadores" },
  courses: [
    { id: 4510, title: "Contador estratégico", duration: 11540, rating: 9.92, lessons: 34, category: "Contabilidade" },
    { id: 4500, title: "Gestão Tributária Aplicada", duration: 3639, rating: 9.63, lessons: 9, category: "Fiscal" },
    { id: 4501, title: "Preparatório Prático – Exame do CFC", duration: 9376, rating: 9.66, lessons: 28, category: "CFC" },
    { id: 4556, title: "Comunicação Corporativa", duration: 11902, rating: 9.04, lessons: 51, category: "Habilidades" },
  ],
  allTracks: [],
  weeklySchedule: {
    Segunda: [{ id: 4510, title: "Contador estratégico", duration: 11540, rating: 9.92, lessons: 6, category: "Contabilidade" }],
    Terça: [{ id: 4500, title: "Gestão Tributária Aplicada", duration: 3639, rating: 9.63, lessons: 6, category: "Fiscal" }],
    Quarta: [{ id: 4501, title: "Preparatório – Exame do CFC", duration: 9376, rating: 9.66, lessons: 6, category: "CFC" }],
    Quinta: [{ id: 4510, title: "Contador estratégico", duration: 11540, rating: 9.92, lessons: 6, category: "Contabilidade" }],
    Sexta: [{ id: 4556, title: "Comunicação Corporativa", duration: 11902, rating: 9.04, lessons: 6, category: "Habilidades" }],
  },
  quickWins: [
    { id: 4500, title: "Gestão Tributária Aplicada", duration: 3639, rating: 9.63, lessons: 9, category: "Fiscal" },
  ],
  gapAnalysis: {
    needToLearn: ["IFRS e CPC", "Contabilidade de Custos Avançada", "Auditoria e Controle Interno"],
    alreadyKnows: ["Fundamentos de Contabilidade", "Plano de Contas Básico", "Balancete"],
  },
  meta: {
    lessonsPerDay: 6,
    minutesPerDay: 60,
    daysToComplete: 30,
    weeksToComplete: 6,
    totalCourses: 4,
    styleDescription: "Você aprende melhor fazendo. Priorize exercícios práticos.",
    generatedAt: new Date().toISOString(),
  },
};

export default function PlanoPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [user, setUser] = useState<Plan["user"] | null>(null);
  const [activeDay, setActiveDay] = useState<string>("Segunda");
  const [activeTab, setActiveTab] = useState<"cursos" | "semana" | "gaps">("cursos");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedPlan = sessionStorage.getItem("cefis_plan");
    const storedUser = sessionStorage.getItem("cefis_user");

    if (storedPlan) {
      try {
        setPlan(JSON.parse(storedPlan));
      } catch {
        setPlan(defaultPlan);
      }
    } else {
      setPlan(defaultPlan);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // ignore
      }
    }
  }, []);

  if (!mounted || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F9FA" }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-cefis-blue mx-auto mb-4"
          />
          <p className="text-gray-400 text-sm">Carregando seu plano...</p>
        </div>
      </div>
    );
  }

  const displayUser = user || plan.user;
  const areaColor = areaColors[displayUser.area] || areaColors["Outro"];
  const currentStyle = displayUser.style || "Prático";

  const daySchedule = plan.weeklySchedule?.[activeDay] || [];

  return (
    <div className="min-h-screen" style={{ background: "#F8F9FA" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/60" style={{ background: "rgba(15,31,61,0.97)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9A849 0%, #e0c06e 100%)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F1F3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
              CEFIS <span style={{ color: "#C9A849" }}>Mentor</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 text-white/40 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Plano gerado com IA
            </span>
            <Link href="/onboarding" className="btn-primary text-xs px-4 py-2">
              Refazer perfil
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl mb-8 p-6 sm:p-8 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0F1F3D 0%, #1B3A6B 60%, #254d8f 100%)" }}
        >
          {/* BG decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/3 translate-x-1/3" style={{ background: "radial-gradient(circle, #C9A849, transparent)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5 translate-y-1/2 -translate-x-1/4" style={{ background: "radial-gradient(circle, #C9A849, transparent)" }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="badge text-xs font-bold" style={{ background: "rgba(201,168,73,0.2)", color: "#C9A849" }}>
                  Plano Personalizado com IA
                </span>
                <span className="badge text-xs" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                  {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                Olá, <span style={{ color: "#C9A849" }}>{displayUser.name}</span>!
              </h1>
              <p className="text-white/60 text-sm sm:text-base max-w-lg">
                Seu plano de estudos personalizado está pronto. Baseado no seu perfil de{" "}
                <strong className="text-white/80">{displayUser.area}</strong>, com foco em{" "}
                <strong className="text-white/80">{goalLabels[displayUser.goal] || displayUser.goal}</strong>.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 sm:gap-6 shrink-0">
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: "#C9A849", fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                  {plan.meta.weeksToComplete}
                </div>
                <div className="text-xs text-white/40">semanas</div>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: "#C9A849", fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                  {plan.meta.minutesPerDay}
                </div>
                <div className="text-xs text-white/40">min/dia</div>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: "#C9A849", fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                  {plan.meta.totalCourses}+
                </div>
                <div className="text-xs text-white/40">cursos</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Mentor Message */}
        {plan.aiInsights?.mentorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl mb-6 p-5 sm:p-6 border"
            style={{ background: "linear-gradient(135deg, rgba(201,168,73,0.08) 0%, rgba(27,58,107,0.06) 100%)", borderColor: "rgba(201,168,73,0.25)" }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #C9A849, #e0c06e)" }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.09a2 2 0 01-1.079 0L12 21l-1.31.39a2 2 0 01-1.079 0l-.347-.09a5 5 0 010-9.9z" /></svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#C9A849" }}>Seu Mentor IA</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,73,0.15)", color: "#C9A849" }}>Claude AI</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">{plan.aiInsights.mentorMessage}</p>
                {plan.aiInsights.studyTips?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {plan.aiInsights.studyTips.map((tip, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-full border" style={{ background: "rgba(27,58,107,0.06)", borderColor: "rgba(27,58,107,0.15)", color: "#1B3A6B" }}>
                        {tip}
                      </span>
                    ))}
                  </div>
                )}
                {plan.aiInsights.motivationalQuote && (
                  <p className="mt-3 text-sm italic font-medium" style={{ color: "#1B3A6B" }}>"{plan.aiInsights.motivationalQuote}"</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN — Profile + Gap */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            {/* Profile DNA Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="card p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A849" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <h2 className="font-bold text-cefis-blue text-sm" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                  Seu DNA de Aprendizado
                </h2>
              </div>

              <div className="space-y-3">
                <ProfileRow label="Área" value={displayUser.area} color={areaColor} />
                <ProfileRow label="Objetivo" value={goalLabels[displayUser.goal] || displayUser.goal} />
                <ProfileRow label="Tempo/dia" value={`${plan.meta.minutesPerDay} minutos`} />
                <ProfileRow label="Nível" value={displayUser.level} />
              </div>

              {/* Learning style badge */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #254d8f 100%)" }}>
                    {styleIcons[currentStyle] || styleIcons["Prático"]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-cefis-blue" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                      Perfil {currentStyle}
                    </div>
                    <div className="text-xs text-gray-400">Estilo de aprendizado</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{plan.meta.styleDescription}</p>
              </div>
            </motion.div>

            {/* Recommended Track */}
            {plan.recommendedTrack && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="card overflow-hidden"
              >
                <div className="px-6 pt-5 pb-3">
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A849" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    <h2 className="font-bold text-cefis-blue text-sm" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                      Trilha Recomendada
                    </h2>
                  </div>
                  <div className="rounded-xl p-4 mb-4" style={{ background: "linear-gradient(135deg, #0F1F3D 0%, #1B3A6B 100%)" }}>
                    <div className="text-xs text-white/50 mb-1">Trilha principal</div>
                    <div className="text-base font-bold text-white mb-1" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                      {plan.recommendedTrack.title}
                    </div>
                    {plan.recommendedTrack.description && (
                      <div className="text-xs text-white/40">{plan.recommendedTrack.description}</div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-lg font-black text-cefis-blue" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                        {plan.recommendedTrack.courses}
                      </div>
                      <div className="text-xs text-gray-400">cursos</div>
                    </div>
                    <div className="w-px bg-gray-100" />
                    <div className="text-center">
                      <div className="text-lg font-black text-cefis-blue" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                        {plan.meta.weeksToComplete}
                      </div>
                      <div className="text-xs text-gray-400">semanas est.</div>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-5">
                  <a
                    href={`https://cefis.com.br/trilhas`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold transition-all border"
                    style={{ borderColor: "rgba(27,58,107,0.2)", color: "#1B3A6B" }}
                  >
                    Ver trilha no CEFIS
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </motion.div>
            )}

            {/* Gap Analysis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="card p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A849" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
                <h2 className="font-bold text-cefis-blue text-sm" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                  Diagnóstico de Gap
                </h2>
              </div>

              {plan.gapAnalysis.alreadyKnows.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#ECFDF5" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold" style={{ color: "#047857" }}>Ja domina</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.gapAnalysis.alreadyKnows.map((item) => (
                      <span key={item} className="badge text-xs" style={{ background: "#ECFDF5", color: "#065F46" }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#FEF3C7" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold" style={{ color: "#92400E" }}>Precisa aprender</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {plan.gapAnalysis.needToLearn.map((item) => (
                    <span key={item} className="badge text-xs" style={{ background: "#FEF3C7", color: "#92400E" }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN — Main content */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-1.5 flex gap-1"
            >
              {[
                { id: "cursos", label: "Cursos Recomendados" },
                { id: "semana", label: "Agenda Semanal" },
                { id: "gaps", label: "Quick Wins" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className="flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={
                    activeTab === tab.id
                      ? {
                          background: "linear-gradient(135deg, #0F1F3D 0%, #1B3A6B 100%)",
                          color: "white",
                        }
                      : {
                          color: "#6b7280",
                          background: "transparent",
                        }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              {/* TAB: Cursos */}
              {activeTab === "cursos" && (
                <motion.div
                  key="cursos"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="section-title text-lg">
                      {plan.courses.length} cursos selecionados para você
                    </h2>
                    <span className="badge text-xs" style={{ background: "rgba(27,58,107,0.08)", color: "#1B3A6B" }}>
                      Baseados no seu perfil
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {plan.courses.map((course, i) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        index={i}
                        tag={course.category || undefined}
                        tagColor="blue"
                      />
                    ))}
                  </div>
                  {plan.courses.length === 0 && (
                    <div className="card p-10 text-center text-gray-400">
                      <p className="text-sm">Nenhum curso encontrado para o seu perfil.</p>
                      <Link href="/onboarding" className="btn-primary mt-4 inline-flex">Refazer diagnóstico</Link>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB: Semana */}
              {activeTab === "semana" && (
                <motion.div
                  key="semana"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="section-title text-lg">Sua Semana de Estudos</h2>
                    <span className="badge text-xs" style={{ background: "rgba(201,168,73,0.12)", color: "#a8882e" }}>
                      {plan.meta.lessonsPerDay} aulas/dia
                    </span>
                  </div>

                  {/* Day selector */}
                  <div className="card p-2 flex gap-2">
                    {DAYS.map((day, i) => {
                      const hasCourses = (plan.weeklySchedule?.[day] || []).length > 0;
                      return (
                        <button
                          key={day}
                          onClick={() => setActiveDay(day)}
                          className="flex-1 rounded-xl py-3 text-center transition-all duration-200"
                          style={
                            activeDay === day
                              ? { background: "linear-gradient(135deg, #1B3A6B 0%, #254d8f 100%)", color: "white" }
                              : { background: hasCourses ? "rgba(27,58,107,0.04)" : "transparent", color: "#6b7280" }
                          }
                        >
                          <div className="text-xs font-bold">{DAY_SHORT[i]}</div>
                          {hasCourses && (
                            <div
                              className="w-1.5 h-1.5 rounded-full mx-auto mt-1"
                              style={{ background: activeDay === day ? "#C9A849" : "#1B3A6B", opacity: activeDay === day ? 1 : 0.4 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Day content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeDay}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-cefis-blue" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                          {activeDay}-feira
                        </h3>
                        <span className="text-xs text-gray-400">
                          {daySchedule.length} curso{daySchedule.length !== 1 ? "s" : ""} · ~{plan.meta.minutesPerDay}min
                        </span>
                      </div>

                      {daySchedule.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {daySchedule.map((course, i) => (
                            <motion.div
                              key={`${course.id}-${i}`}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className="card p-4 flex items-center gap-4"
                            >
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                                style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #254d8f 100%)", fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
                              >
                                {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-cefis-blue text-sm truncate" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                                  {course.title}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-gray-400">{course.lessons} aulas</span>
                                  <span className="text-xs text-gray-400">{formatDuration(course.duration)}</span>
                                  <StarRating rating={course.rating} />
                                </div>
                              </div>
                              <a
                                href={`https://cefis.com.br/cursos/${course.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                                style={{ borderColor: "rgba(27,58,107,0.2)", color: "#1B3A6B" }}
                              >
                                Acessar
                              </a>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="card p-8 text-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(27,58,107,0.06)" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B3A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          </div>
                          <p className="text-gray-400 text-sm">Dia livre — aproveite para revisar os conteúdos da semana.</p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}

              {/* TAB: Quick Wins */}
              {activeTab === "gaps" && (
                <motion.div
                  key="gaps"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="section-title text-lg">Quick Wins</h2>
                      <span className="badge text-xs" style={{ background: "#ECFDF5", color: "#047857" }}>
                        menos de 1h
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Cursos de alto impacto e curta duração — perfeitos para os dias mais corridos.
                    </p>
                  </div>

                  {plan.quickWins.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {plan.quickWins.map((course, i) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          index={i}
                          tag="Quick Win"
                          tagColor="green"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="card p-8 text-center text-gray-400 text-sm">
                      Nenhum Quick Win disponível para seu perfil no momento.
                    </div>
                  )}

                  {/* All tracks */}
                  {plan.allTracks && plan.allTracks.length > 0 && (
                    <div className="mt-2">
                      <h3 className="font-bold text-cefis-blue mb-4 text-sm" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                        Outras trilhas disponíveis
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {plan.allTracks.map((track, i) => (
                          <motion.div
                            key={track.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="card p-4 flex items-center gap-3"
                          >
                            <div
                              className="w-9 h-9 rounded-xl flex-shrink-0"
                              style={{
                                background: `hsl(${(i * 60) + 220}, 70%, 45%)`,
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-cefis-blue text-sm truncate" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                                {track.title}
                              </div>
                              <div className="text-xs text-gray-400">{track.courses} cursos</div>
                            </div>
                            <a
                              href="https://cefis.com.br/trilhas"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-cefis-blue flex items-center gap-0.5 hover:underline flex-shrink-0"
                            >
                              Ver
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </a>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA to CEFIS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="card p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ border: "1.5px solid rgba(201,168,73,0.3)", background: "linear-gradient(135deg, #fffdf4 0%, #fffbe8 100%)" }}
            >
              <div>
                <div className="font-bold text-cefis-blue text-sm mb-1" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                  Pronto para começar?
                </div>
                <p className="text-xs text-gray-500">
                  Acesse a plataforma CEFIS e inicie seu primeiro curso agora mesmo.
                </p>
              </div>
              <a
                href="https://cefis.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm px-6 py-3 whitespace-nowrap"
              >
                Acessar CEFIS
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfileRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: { bg: string; text: string; border: string };
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-400">{label}</span>
      {color ? (
        <span
          className="badge text-xs font-semibold"
          style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}
        >
          {value}
        </span>
      ) : (
        <span className="text-xs font-semibold text-cefis-blue">{value}</span>
      )}
    </div>
  );
}
