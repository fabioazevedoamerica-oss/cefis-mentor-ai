"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Quiz {
  courseTitle: string;
  questions: Question[];
}

interface Course {
  id: string;
  title: string;
  lessons: number;
}

const LETTERS = ["A", "B", "C", "D"];

export default function QuizPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/quiz").then(r => r.json()).then(d => setCourses(d.courses || []));
  }, []);

  async function generateQuiz() {
    setLoading(true);
    setQuiz(null);
    setAnswers([]);
    setSubmitted(false);
    setCurrent(0);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourse }),
      });
      const data = await res.json();
      setQuiz(data);
    } catch {
      alert("Erro ao gerar quiz. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(qIdx: number, optIdx: number) {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[qIdx] = optIdx;
    setAnswers(newAnswers);
  }

  function submit() {
    if (answers.length < (quiz?.questions.length || 0)) return;
    setSubmitted(true);
  }

  const score = submitted ? quiz?.questions.filter((q, i) => answers[i] === q.correct).length ?? 0 : 0;

  return (
    <div className="min-h-screen" style={{ background: "#050505", color: "white" }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(5,5,5,0.95)" }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="opacity-40 hover:opacity-100 transition-opacity">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9A849, #f0ca5e)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#050505" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ fontFamily: "var(--font-montserrat)" }}>Quiz IA</div>
                <div className="text-xs" style={{ color: "#C9A849" }}>CEFIS · Claude AI</div>
              </div>
            </div>
          </div>
          <Link href="/tutor" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: "rgba(201,168,73,0.3)", color: "#C9A849" }}>
            Tutor IA →
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {!quiz && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border" style={{ borderColor: "rgba(201,168,73,0.25)", background: "rgba(201,168,73,0.06)", color: "#C9A849" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#C9A849" }} />
                Baseado em transcrições reais
              </div>
              <h1 className="font-black text-4xl mb-3" style={{ fontFamily: "var(--font-montserrat)", letterSpacing: "-0.02em" }}>
                Quiz de <span style={{ color: "#C9A849" }}>Fixação</span>
              </h1>
              <p className="text-white/40 max-w-sm mx-auto">
                Questões geradas pelo Claude AI com base nas aulas reais da CEFIS. Teste seus conhecimentos.
              </p>
            </div>

            <div className="rounded-2xl p-6 mb-6 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
              <label className="block text-sm font-semibold text-white/60 mb-3">Escolha o curso:</label>
              <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto">
                {courses.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourse(c.id)}
                    className="text-left px-4 py-3 rounded-xl transition-all text-sm"
                    style={{
                      background: selectedCourse === c.id ? "rgba(201,168,73,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selectedCourse === c.id ? "rgba(201,168,73,0.4)" : "rgba(255,255,255,0.06)"}`,
                      color: selectedCourse === c.id ? "#C9A849" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    <span className="font-semibold">{c.title}</span>
                    <span className="text-xs ml-2 opacity-40">{c.lessons} aulas</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateQuiz}
              disabled={!selectedCourse}
              className="w-full py-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: selectedCourse ? "linear-gradient(135deg, #C9A849, #f0ca5e)" : "rgba(255,255,255,0.1)", color: selectedCourse ? "#050505" : "rgba(255,255,255,0.3)" }}
            >
              Gerar 5 Questões com IA
            </button>
          </motion.div>
        )}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9A849, #f0ca5e)" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#050505" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              </motion.div>
            </div>
            <p className="font-bold text-white mb-2">Gerando questões com Claude AI...</p>
            <p className="text-white/30 text-sm">Analisando transcrições do curso</p>
          </motion.div>
        )}

        {quiz && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#C9A849" }}>Quiz · {quiz.courseTitle}</div>
                <h2 className="font-black text-2xl" style={{ fontFamily: "var(--font-montserrat)" }}>
                  {submitted ? `Resultado: ${score}/5` : `Questão ${current + 1} de ${quiz.questions.length}`}
                </h2>
              </div>
              {!submitted && (
                <div className="flex gap-1">
                  {quiz.questions.map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)} className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                      style={{ background: answers[i] !== undefined ? "rgba(201,168,73,0.2)" : i === current ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)", color: answers[i] !== undefined ? "#C9A849" : "rgba(255,255,255,0.4)", border: `1px solid ${i === current ? "rgba(255,255,255,0.2)" : "transparent"}` }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {submitted ? (
              <div className="space-y-4">
                <div className="text-center p-8 rounded-2xl mb-6" style={{ background: score >= 4 ? "rgba(34,197,94,0.08)" : score >= 3 ? "rgba(201,168,73,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${score >= 4 ? "rgba(34,197,94,0.2)" : score >= 3 ? "rgba(201,168,73,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                  <div className="text-5xl font-black mb-2" style={{ fontFamily: "var(--font-montserrat)", color: score >= 4 ? "#22c55e" : score >= 3 ? "#C9A849" : "#ef4444" }}>{score}/5</div>
                  <div className="text-white/60 text-sm">{score === 5 ? "Perfeito!" : score >= 4 ? "Excelente!" : score >= 3 ? "Bom trabalho!" : "Continue estudando!"}</div>
                </div>

                {quiz.questions.map((q, i) => (
                  <div key={i} className="rounded-xl p-5 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="text-sm font-semibold text-white mb-3">{i + 1}. {q.question}</div>
                    <div className="space-y-2 mb-3">
                      {q.options.map((opt, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{
                          background: j === q.correct ? "rgba(34,197,94,0.1)" : j === answers[i] && j !== q.correct ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${j === q.correct ? "rgba(34,197,94,0.3)" : j === answers[i] && j !== q.correct ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.04)"}`,
                          color: j === q.correct ? "#22c55e" : j === answers[i] && j !== q.correct ? "#ef4444" : "rgba(255,255,255,0.5)",
                        }}>
                          <span className="font-bold w-4">{LETTERS[j]}</span>
                          <span>{opt}</span>
                          {j === q.correct && <span className="ml-auto">✓</span>}
                          {j === answers[i] && j !== q.correct && <span className="ml-auto">✗</span>}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs p-3 rounded-lg" style={{ background: "rgba(201,168,73,0.06)", color: "rgba(255,255,255,0.5)", borderLeft: "2px solid rgba(201,168,73,0.3)" }}>
                      {q.explanation}
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-4">
                  <button onClick={generateQuiz} className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #C9A849, #f0ca5e)", color: "#050505" }}>
                    Novo Quiz
                  </button>
                  <Link href="/tutor" className="flex-1 py-3 rounded-xl font-bold text-sm text-center transition-all hover:opacity-80 border" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                    Perguntar ao Tutor
                  </Link>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <div className="rounded-2xl p-6 mb-4 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                    <p className="font-semibold text-white leading-relaxed">{quiz.questions[current].question}</p>
                  </div>
                  <div className="space-y-2 mb-6">
                    {quiz.questions[current].options.map((opt, j) => (
                      <button
                        key={j}
                        onClick={() => selectAnswer(current, j)}
                        className="w-full flex items-center gap-3 text-sm px-4 py-3.5 rounded-xl text-left transition-all"
                        style={{
                          background: answers[current] === j ? "rgba(201,168,73,0.12)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${answers[current] === j ? "rgba(201,168,73,0.4)" : "rgba(255,255,255,0.06)"}`,
                          color: answers[current] === j ? "#C9A849" : "rgba(255,255,255,0.7)",
                        }}
                      >
                        <span className="font-black w-5 shrink-0" style={{ color: answers[current] === j ? "#C9A849" : "rgba(255,255,255,0.3)" }}>{LETTERS[j]}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {current > 0 && (
                      <button onClick={() => setCurrent(c => c - 1)} className="px-5 py-3 rounded-xl text-sm font-semibold border transition-all hover:opacity-80" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
                        ← Anterior
                      </button>
                    )}
                    {current < quiz.questions.length - 1 ? (
                      <button onClick={() => setCurrent(c => c + 1)} disabled={answers[current] === undefined} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-30" style={{ background: "rgba(255,255,255,0.08)", color: "white" }}>
                        Próxima →
                      </button>
                    ) : (
                      <button onClick={submit} disabled={answers.filter(a => a !== undefined).length < quiz.questions.length} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-30" style={{ background: "linear-gradient(135deg, #C9A849, #f0ca5e)", color: "#050505" }}>
                        Ver Resultado
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
