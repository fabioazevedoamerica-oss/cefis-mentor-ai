"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface Course {
  id: number;
  title: string;
  duration: number; // seconds
  rating: number;
  lessons: number;
  category?: string;
  tag?: string;
  tagColor?: "gold" | "blue" | "green" | "purple";
}

interface CourseCardProps {
  course: Course;
  index?: number;
  compact?: boolean;
  tag?: string;
  tagColor?: "gold" | "blue" | "green" | "purple";
}

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating / 2);
  const half = (rating / 2) % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} width="12" height="12" viewBox="0 0 24 24" fill="#C9A849" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      {half && (
        <svg key="half" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A849" strokeWidth="1.5">
          <defs>
            <linearGradient id="half-star" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="#C9A849" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half-star)" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{(rating / 2).toFixed(1)}</span>
    </div>
  );
}

const tagStyles = {
  gold: { background: "rgba(201,168,73,0.12)", color: "#a8882e" },
  blue: { background: "rgba(27,58,107,0.08)", color: "#1B3A6B" },
  green: { background: "rgba(16,185,129,0.1)", color: "#047857" },
  purple: { background: "rgba(124,58,237,0.1)", color: "#6d28d9" },
};

export default function CourseCard({ course, index = 0, compact = false, tag: propTag, tagColor: propTagColor }: CourseCardProps) {
  const resolvedTag = propTag ?? course.tag;
  const resolvedTagColor = propTagColor ?? course.tagColor ?? "blue";
  const tagStyle = tagStyles[resolvedTagColor];
  const isQuickWin = course.duration > 0 && course.duration <= 3600;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        "card bg-white border border-gray-100 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 group",
        compact ? "p-4" : "p-5"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {(resolvedTag || isQuickWin) && (
            <div className="flex items-center gap-2 mb-2">
              {resolvedTag && (
                <span className="badge text-xs font-semibold" style={tagStyle}>
                  {resolvedTag}
                </span>
              )}
              {isQuickWin && !resolvedTag && (
                <span className="badge text-xs font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#047857" }}>
                  Quick Win
                </span>
              )}
            </div>
          )}
          <h3 className={clsx(
            "font-semibold text-cefis-blue leading-tight group-hover:text-blue-700 transition-colors line-clamp-2",
            compact ? "text-sm" : "text-base"
          )}
            style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
          >
            {course.title}
          </h3>
        </div>
        <a
          href={`https://cefis.com.br/portal/cursos/${course.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{ background: "rgba(27,58,107,0.06)", color: "#1B3A6B" }}
          aria-label="Abrir no CEFIS"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{formatDuration(course.duration)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span>{course.lessons} aulas</span>
        </div>
        {course.category && (
          <span className="text-xs text-gray-400 truncate">{course.category}</span>
        )}
      </div>

      {/* Rating + CTA row */}
      <div className="flex items-center justify-between">
        <StarRating rating={course.rating} />
        <a
          href={`https://cefis.com.br/portal/cursos/${course.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold flex items-center gap-1 transition-colors"
          style={{ color: "#1B3A6B" }}
        >
          Ver no CEFIS
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}

export { formatDuration };
