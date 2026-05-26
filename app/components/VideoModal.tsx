"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  courseTitle: string;
  lessonTitle?: string;
  courseId?: number;
}

export default function VideoModal({ isOpen, onClose, videoUrl, courseTitle, lessonTitle, courseId }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) {
      videoRef.current?.pause();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-3xl rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.1)", background: "#0a0a0a" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div>
                <div className="text-xs font-bold tracking-widest uppercase mb-0.5" style={{ color: "#C9A849" }}>
                  Preview · Aula Introdutória
                </div>
                <div className="font-bold text-white text-sm">{courseTitle}</div>
                {lessonTitle && <div className="text-xs text-white/40 mt-0.5">{lessonTitle}</div>}
              </div>
              <div className="flex items-center gap-3">
                {courseId && (
                  <a
                    href={`https://cefis.com.br/portal/cursos/${courseId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: "rgba(201,168,73,0.12)", color: "#C9A849", border: "1px solid rgba(201,168,73,0.25)" }}
                  >
                    Ver curso completo →
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Video */}
            <div className="relative" style={{ aspectRatio: "16/9", background: "#000" }}>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                style={{ maxHeight: "60vh" }}
              />
            </div>

            {/* Footer */}
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-xs text-white/30">Conteúdo real da plataforma CEFIS</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
                <span className="text-xs text-white/30">cdn2.cefis.com.br</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
