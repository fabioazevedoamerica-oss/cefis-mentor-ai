"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressBar from "../components/ProgressBar";

type Area = "Contador" | "Analista Fiscal" | "Departamento Pessoal" | "Outro";
type Goal = "Passar no CFC" | "Especialização Fiscal" | "Carreira em DP" | "Crescimento Profissional";
type TimePerDay = "10min" | "30min" | "1h" | "2h+";
type Style = "Visual" | "Auditivo" | "Leitura" | "Prático";
type Level = "Iniciante" | "Intermediário" | "Avançado";

interface OnboardingData {
  name: string;
  area: Area | "";
  goal: Goal | "";
  time: TimePerDay | "";
  style: Style | "";
  level: Level | "";
}

const TOTAL_STEPS = 5;

interface Step {
  id: number;
  field: keyof OnboardingData;
  question: string;
  sub?: string;
  type: "text" | "options";
  options?: { value: string; label: string; icon?: React.ReactNode; desc?: string }[];
}

const steps: Step[] = [
  {
    id: 1,
    field: "name",
    question: "Olá! Qual é o seu nome?",
    sub: "Vou personalizar sua experiência a partir daí.",
    type: "text",
  },
  {
    id: 2,
    field: "area",
    question: "Qual área profissional você atua ou deseja atuar?",
    sub: "Isso me ajuda a selecionar os cursos mais relevantes para você.",
    type: "options",
    options: [
      {
        value: "Contador",
        label: "Contador",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        ),
        desc: "Contabilidade geral e gestão financeira",
      },
      {
        value: "Analista Fiscal",
        label: "Analista Fiscal",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        ),
        desc: "Tributação, impostos e obrigações fiscais",
      },
      {
        value: "Departamento Pessoal",
        label: "Departamento Pessoal",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        desc: "RH, folha de pagamento e legislação trabalhista",
      },
      {
        value: "Outro",
        label: "Outro",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ),
        desc: "Quero explorar diferentes áreas",
      },
    ],
  },
  {
    id: 3,
    field: "goal",
    question: "Qual é o seu principal objetivo profissional?",
    sub: "Vou focar seu plano de estudos nesse objetivo específico.",
    type: "options",
    options: [
      {
        value: "Passar no CFC",
        label: "Passar no Exame CFC",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
        ),
        desc: "Conquistar o registro profissional de contador",
      },
      {
        value: "Especialização Fiscal",
        label: "Especialização Fiscal",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ),
        desc: "Dominar ICMS, IPI, ISS e obrigações acessórias",
      },
      {
        value: "Carreira em DP",
        label: "Carreira em DP",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <polyline points="16 11 18 13 22 9" />
          </svg>
        ),
        desc: "Atuar com folha de pagamento e gestão de pessoas",
      },
      {
        value: "Crescimento Profissional",
        label: "Crescimento Geral",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        ),
        desc: "Ampliar conhecimentos em múltiplas áreas",
      },
    ],
  },
  {
    id: 4,
    field: "time",
    question: "Quantos minutos por dia você tem para estudar?",
    sub: "Serei realista e criarei um plano que caiba na sua rotina.",
    type: "options",
    options: [
      {
        value: "10min",
        label: "10 minutos",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
        desc: "Pouco tempo, mas consistente",
      },
      {
        value: "30min",
        label: "30 minutos",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
        desc: "Progresso sólido semana a semana",
      },
      {
        value: "1h",
        label: "1 hora",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
        desc: "Ritmo acelerado de aprendizado",
      },
      {
        value: "2h+",
        label: "2 horas ou mais",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        ),
        desc: "Imersão total — máximo progresso",
      },
    ],
  },
  {
    id: 5,
    field: "level",
    question: "Qual é seu nível atual de conhecimento?",
    sub: "Vou calibrar as recomendações para o seu ponto de partida.",
    type: "options",
    options: [
      {
        value: "Iniciante",
        label: "Iniciante",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ),
        desc: "Estou começando agora nessa área",
      },
      {
        value: "Intermediário",
        label: "Intermediário",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
        desc: "Tenho alguma experiência na área",
      },
      {
        value: "Avançado",
        label: "Avançado",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
        desc: "Tenho sólida experiência profissional",
      },
    ],
  },
];

const tutorMessages: Record<number, string[]> = {
  1: ["Olá! Sou o CEFIS Mentor, seu tutor de IA personalizado.", "Para criar o seu plano de estudos ideal, preciso te conhecer melhor. Vamos começar pelo básico:"],
  2: ["Ótimo, {name}! Agora vou entender melhor seu contexto profissional.", "Isso me ajuda a selecionar os cursos mais relevantes para você:"],
  3: ["Excelente! Com base na sua área, vou focar em conteúdos direcionados.", "Me conta qual é o seu principal objetivo agora:"],
  4: ["Perfeito! Já estou montando seu perfil de aprendizado.", "Para criar um plano realista, preciso saber quanto tempo você tem disponível:"],
  5: ["Quase lá! Uma última pergunta importante:", "Qual é o seu nível atual de conhecimento na área?"],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    area: "",
    goal: "",
    time: "",
    style: "",
    level: "",
  });
  const [nameInput, setNameInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [direction, setDirection] = useState(1);

  const currentStep = steps[step - 1];
  const messages = tutorMessages[step] || [];
  const displayMessages = messages.map((m) => m.replace("{name}", data.name || ""));

  useEffect(() => {
    setShowTutor(false);
    setShowInput(false);
    const t1 = setTimeout(() => setShowTutor(true), 100);
    const t2 = setTimeout(() => setShowInput(true), messages.length * 500 + 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [step, messages.length]);

  function handleSelect(value: string) {
    const field = currentStep.field;
    setData((prev) => ({ ...prev, [field]: value }));
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setTimeout(() => setStep((s) => s + 1), 200);
    } else {
      handleSubmit({ ...data, [field]: value });
    }
  }

  function handleNameSubmit() {
    if (!nameInput.trim()) return;
    setData((prev) => ({ ...prev, name: nameInput.trim() }));
    setDirection(1);
    setTimeout(() => setStep((s) => s + 1), 200);
  }

  async function handleSubmit(finalData: OnboardingData) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/plano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
      if (!res.ok) throw new Error("API error");
      const plan = await res.json();
      sessionStorage.setItem("cefis_plan", JSON.stringify(plan));
      sessionStorage.setItem("cefis_user", JSON.stringify(finalData));
      router.push("/plano");
    } catch {
      // Fallback: store user data and go to plan
      sessionStorage.setItem("cefis_user", JSON.stringify(finalData));
      router.push("/plano");
    }
  }

  const slideVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (d: number) => ({
      x: d > 0 ? -40 : 40,
      opacity: 0,
      transition: { duration: 0.25 },
    }),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "linear-gradient(135deg, #0F1F3D 0%, #1B3A6B 100%)" }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-14 h-14 rounded-full border-4 border-white/20 border-t-yellow-400 mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
            Criando seu plano personalizado...
          </h2>
          <p className="text-white/50 text-sm">Nossa IA está analisando seu perfil e selecionando os melhores cursos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0F1F3D 0%, #1B3A6B 60%, #254d8f 100%)" }}>
      {/* Header */}
      <header className="px-6 pt-6 pb-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9A849 0%, #e0c06e 100%)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0F1F3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white/80" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
              CEFIS Mentor
            </span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto">
          <ProgressBar current={step} total={TOTAL_STEPS} />
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 flex flex-col justify-end max-w-2xl mx-auto w-full px-6 pb-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col gap-4"
          >
            {/* Tutor messages */}
            {showTutor && (
              <div className="flex flex-col gap-3">
                {/* Avatar */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #C9A849 0%, #e0c06e 100%)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F1F3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="5" />
                      <path d="M3 21v-1a9 9 0 0 1 9-9v0a9 9 0 0 1 9 9v1" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-semibold" style={{ color: "#C9A849" }}>CEFIS Mentor</span>
                    <span className="text-xs text-white/30 ml-2">Tutor de IA</span>
                  </div>
                </div>

                {displayMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="self-start max-w-sm rounded-2xl rounded-tl-sm px-5 py-3 text-sm leading-relaxed text-white"
                    style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
                  >
                    {msg}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Input area */}
            <AnimatePresence>
              {showInput && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4"
                >
                  {currentStep.type === "text" ? (
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <input
                          autoFocus
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                          placeholder="Digite seu nome..."
                          className="w-full px-5 py-4 rounded-2xl text-white placeholder-white/30 text-base font-medium outline-none transition-all"
                          style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "1.5px solid rgba(255,255,255,0.15)",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A849")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
                        />
                      </div>
                      <button
                        onClick={handleNameSubmit}
                        disabled={!nameInput.trim()}
                        className="btn-primary self-end px-8 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Continuar
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentStep.options?.map((opt, i) => (
                        <motion.button
                          key={opt.value}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08, duration: 0.35 }}
                          onClick={() => handleSelect(opt.value)}
                          className="flex items-start gap-3 p-4 rounded-2xl text-left transition-all duration-200 group border"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            borderColor: "rgba(255,255,255,0.1)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(201,168,73,0.15)";
                            e.currentTarget.style.borderColor = "rgba(201,168,73,0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                          }}
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 text-white/60 group-hover:text-yellow-300 transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                            {opt.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm mb-0.5" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                              {opt.label}
                            </div>
                            {opt.desc && (
                              <div className="text-xs text-white/40">{opt.desc}</div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
