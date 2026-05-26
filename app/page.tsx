"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import VideoModal from "./components/VideoModal";

const HERO_VIDEO = "/hero.mp4";

const LIVE_COURSES = [
  { id: 4510, title: "Contador Estratégico", rating: 9.92, lessons: 34, tag: "Contabilidade", banner: "https://s3.cefis.cloud/cefiscdn/uploads-v3/3f1486e4-e768-4ff9-af5f-08c25b79b53f-thumbnail.png", videoUrl: "https://cdn2.cefis.com.br/vod/30ad9d25-14af-4a90-8975-bafd45a5e502/720.mp4", lessonTitle: "Apresentação" },
  { id: 4552, title: "Saldo credor de PIS/COFINS", rating: 9.47, lessons: 20, tag: "Fiscal", banner: "https://s3.cefis.cloud/cefiscdn/uploads-v3/606ca82c-3086-477a-9fa3-2b473fa8f8e9-thumbnail.png", videoUrl: "https://cdn2.cefis.com.br/vod/299aad09-7221-4097-b03b-b7ad4b13f90f/720.mp4", lessonTitle: "Apresentação" },
  { id: 4547, title: "ECF 2026", rating: 9.51, lessons: 55, tag: "SPED", banner: "https://s3.cefis.cloud/cefiscdn/uploads-v3/b28f2d03-e894-47f7-91f3-2d014eb35b31-thumbnail.png", videoUrl: "https://cdn2.cefis.com.br/vod/3fe5e84f-d47b-4ce3-ae96-3eb11a7cbcc3/720.mp4", lessonTitle: "Introdução" },
  { id: 4517, title: "ECD 2026", rating: 9.61, lessons: 48, tag: "SPED", banner: "https://s3.cefis.cloud/cefiscdn/uploads-v3/5992f4d5-9cf5-44f0-9cc6-8f1af01d3d4a-thumbnail.png", videoUrl: "https://cdn2.cefis.com.br/vod/0dff9741-a6b2-4ea7-928b-62e5a19f3b38/720.mp4", lessonTitle: "Apresentação" },
  { id: 4511, title: "Imposto de Transmissão de Bens Imóveis", rating: 9.56, lessons: 22, tag: "Tributário", banner: "https://s3.cefis.cloud/cefiscdn/uploads-v3/84d767dd-1ffe-4452-a3ec-e3e9e1b73e71-thumbnail.png", videoUrl: "https://cdn2.cefis.com.br/vod/606eaf8e-c6e5-4d69-a979-03160cd45cae/720.mp4", lessonTitle: "Apresentação" },
  { id: 4556, title: "Comunicação Corporativa", rating: 9.04, lessons: 51, tag: "Habilidades", banner: "https://s3.cefis.cloud/cefiscdn/uploads-v3/a391a14a-61ab-4048-af26-bd41a15c3ddf-thumbnail.png", videoUrl: "https://cdn2.cefis.com.br/vod/aafbde7f-04c6-40fa-a93f-11c392b29e6a/720.mp4", lessonTitle: "Introdução" },
  { id: 4516, title: "Teorias do Comércio Internacional", rating: 9.30, lessons: 18, tag: "Internacional", banner: "https://s3.cefis.cloud/cefiscdn/uploads-v3/a709f6be-d031-422f-ab03-3e07ef87f0f0-thumbnail.png", videoUrl: "https://cdn2.cefis.com.br/vod/b2b9fe49-84e8-438d-bcf8-513924eb01c3/720.mp4", lessonTitle: "Apresentação" },
  { id: 4501, title: "Preparatório Exame do CFC", rating: 9.66, lessons: 28, tag: "CFC", banner: "https://s3.cefis.cloud/cefiscdn/uploads-v3/a391a14a-61ab-4048-af26-bd41a15c3ddf-thumbnail.png", videoUrl: "https://cdn2.cefis.com.br/vod/e0873a3d-1315-4488-886b-08bc505fcb44/720.mp4", lessonTitle: "Apresentação" },
];

const TICKER_ITEMS = [
  "476 Cursos Reais", "Claude AI Integrado", "6 Trilhas Profissionais",
  "Diagnóstico Instantâneo", "Plano Personalizado", "Reforma Tributária 2026",
  "Nota Média 9.6", "IA que entende sua carreira",
];

const AREAS = ["Contador", "Analista Fiscal", "Departamento Pessoal", "Outro"];

type LiveCourse = typeof LIVE_COURSES[number];

interface VideoState {
  url: string;
  title: string;
  lesson: string;
  courseId: number;
}

function Ticker() {
  return (
    <div className="relative overflow-hidden py-3 border-y" style={{ borderColor: "rgba(201,168,73,0.2)", background: "rgba(201,168,73,0.04)" }}>
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="flex gap-0 whitespace-nowrap"
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-6 text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(201,168,73,0.7)" }}>
            {item}
            <span style={{ color: "rgba(201,168,73,0.3)" }}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function LiveCoursesRail({ onPlay }: { onPlay: (v: VideoState) => void }) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10" style={{ background: "linear-gradient(to right, #050505, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10" style={{ background: "linear-gradient(to left, #050505, transparent)" }} />
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex gap-4 py-2"
        style={{ width: "max-content" }}
      >
        {[...LIVE_COURSES, ...LIVE_COURSES].map((c, i) => (
          <button
            key={i}
            onClick={() => onPlay({ url: c.videoUrl, title: c.title, lesson: c.lessonTitle, courseId: c.id })}
            className="relative rounded-xl overflow-hidden shrink-0 border group cursor-pointer text-left"
            style={{ width: 220, height: 130, borderColor: "rgba(255,255,255,0.06)", background: "#111" }}
          >
            <Image
              src={c.banner}
              alt={c.title}
              fill
              className="object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500"
              sizes="220px"
              unoptimized
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)" }} />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(201,168,73,0.9)", backdropFilter: "blur(4px)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#050505"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="text-xs font-bold text-white leading-tight mb-1 line-clamp-2">{c.title}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black" style={{ color: "#C9A849" }}>★ {c.rating}</span>
                <span className="text-xs text-white/30">{c.lessons} aulas</span>
              </div>
            </div>
            <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(201,168,73,0.2)", color: "#C9A849" }}>{c.tag}</div>
          </button>
        ))}
      </motion.div>
    </div>
  );
}

function QuickDemo() {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [shown, setShown] = useState(false);

  const canShow = name.length >= 2 && area;

  useEffect(() => {
    if (canShow) {
      const t = setTimeout(() => setShown(true), 400);
      return () => clearTimeout(t);
    } else {
      setShown(false);
    }
  }, [canShow]);

  const plans: Record<string, { track: string; courses: typeof LIVE_COURSES; weeks: number }> = {
    "Contador": {
      track: "Contabilidade Avançada",
      courses: LIVE_COURSES.filter(c => ["Contabilidade", "CFC"].includes(c.tag)).slice(0, 3),
      weeks: 8,
    },
    "Analista Fiscal": {
      track: "Analista Fiscal",
      courses: LIVE_COURSES.filter(c => ["Fiscal", "SPED", "Tributário"].includes(c.tag)).slice(0, 3),
      weeks: 10,
    },
    "Departamento Pessoal": {
      track: "Departamento Pessoal",
      courses: LIVE_COURSES.filter(c => ["Habilidades"].includes(c.tag)).slice(0, 2),
      weeks: 6,
    },
    "Outro": {
      track: "Gestão Empresarial",
      courses: LIVE_COURSES.filter(c => ["Habilidades", "Internacional"].includes(c.tag)).slice(0, 3),
      weeks: 5,
    },
  };

  const plan = area ? plans[area] : null;

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
      <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ background: "#C9A849" }} />
          <span className="text-xs font-bold tracking-widest uppercase text-white/40">Preview do seu plano</span>
        </div>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Seu nome..."
            className="flex-1 rounded-lg px-4 py-3 text-sm font-medium text-white placeholder-white/20 outline-none focus:ring-1 transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
          <select
            value={area}
            onChange={e => setArea(e.target.value)}
            className="rounded-lg px-3 py-3 text-sm font-medium outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: area ? "white" : "rgba(255,255,255,0.25)", minWidth: 140 }}
          >
            <option value="">Área...</option>
            {AREAS.map(a => <option key={a} value={a} style={{ background: "#111", color: "white" }}>{a}</option>)}
          </select>
        </div>
      </div>

      <AnimatePresence>
        {shown && plan ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #C9A849, #f0ca5e)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.09a2 2 0 01-1.079 0L12 21l-1.31.39a2 2 0 01-1.079 0l-.347-.09a5 5 0 010-9.9z" /></svg>
                </div>
                <p className="text-sm text-white/70">
                  <span className="text-white font-bold">{name}</span>, sua trilha é{" "}
                  <span style={{ color: "#C9A849" }} className="font-bold">{plan.track}</span>
                </p>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {plan.courses.slice(0, 3).map((c: LiveCourse) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="relative w-10 h-7 rounded overflow-hidden shrink-0">
                      <Image src={c.banner} alt={c.title} fill className="object-cover" sizes="40px" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white font-medium truncate">{c.title}</div>
                      <div className="text-xs text-white/30">{c.lessons} aulas</div>
                    </div>
                    <div className="text-xs font-black shrink-0" style={{ color: "#C9A849" }}>★ {c.rating}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg mb-4" style={{ background: "rgba(201,168,73,0.08)", border: "1px solid rgba(201,168,73,0.2)" }}>
                <span className="text-xs text-white/50">Conclusão estimada</span>
                <span className="text-sm font-black" style={{ color: "#C9A849" }}>{plan.weeks} semanas</span>
              </div>
              <Link href="/onboarding" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95" style={{ background: "linear-gradient(135deg, #C9A849, #f0ca5e)", color: "#0a0a0a" }}>
                Ver plano completo com IA
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.div>
        ) : !shown && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 text-center text-white/20 text-sm py-10">
            Digite seu nome e área para ver um preview
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const videoOpacity = useTransform(scrollYProgress, [0, 0.6], [0.3, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const [activeVideo, setActiveVideo] = useState<VideoState | null>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <div style={{ background: "#050505", color: "#fff", minHeight: "100vh", fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <VideoModal
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        videoUrl={activeVideo?.url || ""}
        courseTitle={activeVideo?.title || ""}
        lessonTitle={activeVideo?.lesson}
        courseId={activeVideo?.courseId}
      />

      {/* ─── NAV ─── */}
      <header className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(5,5,5,0.8)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9A849, #f0ca5e)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span className="font-black text-white text-sm tracking-tighter" style={{ fontFamily: "var(--font-montserrat)" }}>
              CEFIS<span style={{ color: "#C9A849" }}>·</span>MENTOR
            </span>
          </div>
          <Ticker />
          <div className="hidden md:flex items-center gap-2">
            <Link href="/tutor" className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-3 py-2 rounded-lg transition-all hover:bg-white/5 border" style={{ borderColor: "rgba(201,168,73,0.3)", color: "#C9A849" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
              </svg>
              Tutor
            </Link>
            <Link href="/quiz" className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-3 py-2 rounded-lg transition-all hover:bg-white/5 border" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Quiz
            </Link>
            <Link href="/onboarding" className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-lg transition-all hover:scale-105 active:scale-95" style={{ background: "linear-gradient(135deg, #C9A849, #f0ca5e)", color: "#050505" }}>
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ minHeight: "100vh", paddingTop: "56px" }}>

        {/* Video */}
        <motion.video
          ref={videoRef}
          src={HERO_VIDEO}
          autoPlay muted loop playsInline
          onCanPlay={() => setVideoReady(true)}
          style={{ opacity: videoReady ? videoOpacity : 0 }}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlays */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.7) 50%, rgba(5,5,5,0.92) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(201,168,73,0.07) 0%, transparent 55%)" }} />

        {/* Split layout */}
        <motion.div
          style={{ y: contentY }}
          className="relative z-10 max-w-7xl mx-auto px-6 min-h-[calc(100vh-56px)] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20"
        >
          {/* LEFT — editorial headline */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border" style={{ borderColor: "rgba(201,168,73,0.25)", background: "rgba(201,168,73,0.06)", color: "#C9A849" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C9A849" }} />
                IA + CEFIS · Hackathon 2026
              </div>

              <h1 style={{ fontFamily: "var(--font-montserrat)", letterSpacing: "-0.04em", lineHeight: "0.88", fontSize: "clamp(3.5rem, 7vw, 6.5rem)" }} className="font-black mb-8">
                <span className="block text-white">A CARREIRA</span>
                <span className="block" style={{
                  background: "linear-gradient(90deg, #C9A849 0%, #f0ca5e 40%, #C9A849 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>CONTÁBIL</span>
                <span className="block text-white">QUE VOCÊ</span>
                <span className="block text-white/30">MERECE.</span>
              </h1>

              <p className="text-white/45 mb-10 max-w-md leading-relaxed" style={{ fontSize: "1.1rem" }}>
                Em 2 minutos, diagnóstico real de gaps + plano semanal com cursos verdadeiros da CEFIS — gerado pelo Claude AI. Sem atalhos. Sem genérico.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link href="/onboarding" className="group flex items-center gap-3 font-bold px-7 py-4 rounded-xl transition-all hover:scale-105 active:scale-95" style={{ background: "linear-gradient(135deg, #C9A849, #f0ca5e)", color: "#050505", boxShadow: "0 8px 32px rgba(201,168,73,0.3)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Criar Meu Plano — Grátis
                </Link>
                <Link href="/tutor" className="flex items-center gap-2 font-semibold px-6 py-4 rounded-xl border transition-all hover:bg-white/5 text-sm" style={{ borderColor: "rgba(201,168,73,0.25)", color: "#C9A849" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                  </svg>
                  Tutor IA
                </Link>
              </div>

              {/* Inline stats */}
              <div className="flex flex-wrap gap-6">
                {[["476+", "cursos reais"], ["9.92", "nota máxima"], ["2 min", "para seu plano"]].map(([v, l]) => (
                  <div key={l}>
                    <div className="font-black text-2xl" style={{ fontFamily: "var(--font-montserrat)", color: "#C9A849" }}>{v}</div>
                    <div className="text-xs text-white/30 uppercase tracking-wide font-medium">{l}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT — interactive quick demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
              <span className="text-xs font-bold tracking-widest uppercase text-white/30">Preview interativo — ao vivo</span>
            </div>
            <QuickDemo />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── CURSOS AO VIVO ─── */}
      <section id="ao-vivo" className="py-20 overflow-hidden" style={{ background: "#050505" }}>
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
                <span className="text-xs font-bold tracking-widest uppercase text-white/30">API CEFIS · Atualizado em tempo real</span>
              </div>
              <h2 className="font-black text-white text-2xl" style={{ fontFamily: "var(--font-montserrat)", letterSpacing: "-0.02em" }}>
                Cursos reais da plataforma
              </h2>
            </div>
            <Link href="/onboarding" className="hidden sm:flex text-xs font-bold tracking-wide px-4 py-2.5 rounded-lg transition-all hover:scale-105" style={{ background: "rgba(201,168,73,0.1)", color: "#C9A849", border: "1px solid rgba(201,168,73,0.2)" }}>
              Ver todos →
            </Link>
          </div>
        </div>
        <LiveCoursesRail onPlay={setActiveVideo} />
      </section>

      {/* ─── BENTO GRID ─── */}
      <section className="py-24" style={{ background: "#080808" }}>
        <div className="max-w-7xl mx-auto px-6">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="text-xs font-bold tracking-widest uppercase mb-3 px-3 py-1 rounded-full inline-block" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }}>
              O que ninguém tem
            </div>
            <h2 className="font-black text-white" style={{ fontFamily: "var(--font-montserrat)", fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
              Infraestrutura de IA
              <br />
              <span style={{ color: "#C9A849" }}>para sua carreira.</span>
            </h2>
          </motion.div>

          {/* Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">

            {/* Card 1 — tall, AI Mentor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}
              className="md:row-span-2 rounded-2xl p-8 flex flex-col justify-between border group hover:border-[#C9A849]/20 transition-colors"
              style={{ background: "rgba(201,168,73,0.04)", borderColor: "rgba(201,168,73,0.12)", minHeight: 340 }}
            >
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, #C9A849, #f0ca5e)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#050505" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.09a2 2 0 01-1.079 0L12 21l-1.31.39a2 2 0 01-1.079 0l-.347-.09a5 5 0 010-9.9z" />
                  </svg>
                </div>
                <h3 className="font-black text-white text-xl mb-3" style={{ fontFamily: "var(--font-montserrat)" }}>Mentor IA · Claude</h3>
                <p className="text-white/45 text-sm leading-relaxed">
                  Não é um chatbot. É o Claude AI da Anthropic analisando seu perfil real e gerando mensagens, dicas e motivação personalizadas. Por nome. Por objetivo. Por área.
                </p>
              </div>
              <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(201,168,73,0.08)", border: "1px solid rgba(201,168,73,0.15)" }}>
                <div className="text-xs text-white/40 mb-1 font-medium">Exemplo gerado pela IA:</div>
                <p className="text-sm text-white/70 italic">"Sua base em contabilidade básica já é sólida. O próximo passo para o CFC é dominar as demonstrações contábeis avançadas — comece pelo Contador Estratégico."</p>
              </div>
            </motion.div>

            {/* Card 2 — diagnóstico */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-7 border group hover:border-white/10 transition-colors"
              style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(79,168,255,0.1)", border: "1px solid rgba(79,168,255,0.2)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4FA8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>Diagnóstico de Gaps</h3>
                  <p className="text-white/40 text-sm">Sabe o que você ainda não sabe.</p>
                </div>
              </div>
              <div className="space-y-2">
                {["ICMS Avançado e ST", "EFD Contribuições", "Planejamento Tributário"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-white/50 py-1.5 px-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#4FA8FF" }} />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Card 3 — stat */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="rounded-2xl p-7 border flex flex-col items-center justify-center text-center"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="font-black text-7xl mb-2 leading-none" style={{ fontFamily: "var(--font-montserrat)", color: "#C9A849" }}>476</div>
              <div className="text-white/50 text-sm font-medium uppercase tracking-widest">Cursos da CEFIS</div>
              <div className="mt-4 text-xs text-white/25">integrados via API oficial em tempo real</div>
            </motion.div>

            {/* Card 4 — Tutor IA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="rounded-2xl p-7 border group hover:border-[#C9A849]/20 transition-colors cursor-pointer relative overflow-hidden"
              style={{ background: "rgba(27,58,107,0.08)", borderColor: "rgba(27,58,107,0.25)" }}
            >
              <Link href="/tutor" className="absolute inset-0 z-10" />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2d5a9e 100%)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A849" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-white mb-2" style={{ fontFamily: "var(--font-montserrat)" }}>Tutor IA · Q&A ao Vivo</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-4">Pergunte sobre qualquer conteúdo CEFIS. Respostas baseadas em 446 aulas reais indexadas — não em respostas genéricas.</p>
              <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: "#C9A849" }}>
                Abrir chat
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </motion.div>

            {/* Card 5 — plano semanal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="rounded-2xl p-7 border group hover:border-white/10 transition-colors"
              style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.06)" }}
            >
              <h3 className="font-bold text-white mb-5" style={{ fontFamily: "var(--font-montserrat)" }}>Plano Semanal Gerado</h3>
              <div className="grid grid-cols-5 gap-2">
                {["Seg", "Ter", "Qua", "Qui", "Sex"].map((day, i) => (
                  <div key={day} className="rounded-lg p-3 text-center" style={{ background: i === 0 ? "rgba(201,168,73,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${i === 0 ? "rgba(201,168,73,0.25)" : "rgba(255,255,255,0.05)"}` }}>
                    <div className="text-xs font-bold mb-2" style={{ color: i === 0 ? "#C9A849" : "rgba(255,255,255,0.3)", fontFamily: "var(--font-montserrat)" }}>{day}</div>
                    <div className="text-xs text-white/40 leading-tight">{["ECF 2026", "ECD 2026", "Planej. Trib.", "ICMS Avançado", "Revisão"][i]}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-white/25">Adaptado ao tempo disponível por dia — de 10min a 2h+</div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-32 overflow-hidden" style={{ background: "#050505" }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(201,168,73,0.1) 0%, transparent 55%)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-32" style={{ background: "linear-gradient(to bottom, transparent, rgba(201,168,73,0.4))" }} />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-block text-xs font-bold tracking-widest uppercase mb-8 px-3 py-1 rounded-full" style={{ background: "rgba(201,168,73,0.1)", color: "#C9A849" }}>
              Grátis · Pronto em 2 minutos
            </div>
            <h2 className="font-black text-white leading-none mb-6" style={{ fontFamily: "var(--font-montserrat)", fontSize: "clamp(3rem, 8vw, 6rem)", letterSpacing: "-0.04em" }}>
              Comece<br /><span style={{ color: "#C9A849" }}>agora.</span>
            </h2>
            <p className="text-white/35 text-lg mb-12 max-w-sm mx-auto">
              5 perguntas. IA real. Plano executável com cursos reais da CEFIS.
            </p>
            <Link href="/onboarding" className="inline-flex items-center gap-3 font-bold px-10 py-5 rounded-2xl text-base transition-all hover:scale-105 active:scale-95" style={{ background: "linear-gradient(135deg, #C9A849, #f0ca5e)", color: "#050505", boxShadow: "0 0 80px rgba(201,168,73,0.2)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Criar Meu Plano com IA
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-6 border-t" style={{ background: "#030303", borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-black tracking-widest text-white/20" style={{ fontFamily: "var(--font-montserrat)" }}>CEFIS·MENTOR</span>
          <span className="text-xs text-white/15">Hackathon CEFIS 2026 · Powered by Claude AI × Next.js × Vercel</span>
          <a href="https://cefis.com.br" target="_blank" rel="noopener noreferrer" className="text-xs text-white/15 hover:text-white/40 transition-colors">cefis.com.br ↗</a>
        </div>
      </footer>
    </div>
  );
}
