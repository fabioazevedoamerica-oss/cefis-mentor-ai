import { NextRequest, NextResponse } from "next/server";

const CEFIS_API = "https://api-v3.cefis.com.br";

interface UserProfile {
  name: string;
  area: string;
  goal: string;
  time: string;
  style: string;
  level: string;
}

interface Course {
  id: number;
  title: string;
  duration: number;
  rating: number;
  lessons: number;
  category: string;
  slug?: string;
}

interface Track {
  id: number;
  title: string;
  courses: number;
  duration: number;
  slug?: string;
  description?: string;
}

// Lessons per day based on time available
const TIME_TO_LESSONS: Record<string, number> = {
  "10min": 1,
  "30min": 3,
  "1h": 6,
  "2h+": 12,
};

// Minutes per day
const TIME_TO_MINUTES: Record<string, number> = {
  "10min": 10,
  "30min": 30,
  "1h": 60,
  "2h+": 120,
};

// Which track to prioritize per goal
const GOAL_TO_TRACK: Record<string, string[]> = {
  "Passar no CFC": ["Contabilidade Avançada", "CFC", "Preparatório"],
  "Especialização Fiscal": ["Analista Fiscal", "Fiscal", "Tributação"],
  "Carreira em DP": ["Departamento Pessoal", "DP", "Pessoal"],
  "Crescimento Profissional": ["Gestão", "Empresarial", "Liderança", "Comunicação"],
};

// Gap analysis per level and area
const GAP_ANALYSIS: Record<string, Record<string, { needToLearn: string[]; alreadyKnows: string[] }>> = {
  Iniciante: {
    Contador: {
      needToLearn: ["Fundamentos de Contabilidade", "Demonstrações Contábeis", "Plano de Contas", "Legislação Contábil"],
      alreadyKnows: [],
    },
    "Analista Fiscal": {
      needToLearn: ["Fundamentos Tributários", "ICMS Básico", "IPI e PIS/COFINS", "Obrigações Acessórias", "SPED Fiscal"],
      alreadyKnows: [],
    },
    "Departamento Pessoal": {
      needToLearn: ["CLT e Legislação Trabalhista", "Folha de Pagamento", "eSocial", "FGTS e INSS", "Férias e 13º Salário"],
      alreadyKnows: [],
    },
    Outro: {
      needToLearn: ["Gestão Empresarial", "Comunicação Corporativa", "Excel Avançado", "Análise de Dados"],
      alreadyKnows: [],
    },
  },
  Intermediário: {
    Contador: {
      needToLearn: ["IFRS e CPC", "Contabilidade de Custos Avançada", "Auditoria e Controle Interno"],
      alreadyKnows: ["Fundamentos de Contabilidade", "Plano de Contas Básico", "Balancete"],
    },
    "Analista Fiscal": {
      needToLearn: ["ICMS Avançado e Substituição Tributária", "EFD Contribuições", "Planejamento Tributário"],
      alreadyKnows: ["Conceitos Tributários Básicos", "Declarações Simples", "CNPJ e Regime Tributário"],
    },
    "Departamento Pessoal": {
      needToLearn: ["eSocial Avançado", "Perícias Trabalhistas", "Gestão de Benefícios"],
      alreadyKnows: ["CLT Básica", "Folha de Pagamento Simples", "Admissão e Demissão"],
    },
    Outro: {
      needToLearn: ["Liderança e Gestão de Equipes", "Finanças Corporativas", "Estratégia Empresarial"],
      alreadyKnows: ["Conceitos de Gestão", "Comunicação Básica"],
    },
  },
  Avançado: {
    Contador: {
      needToLearn: ["Contabilidade Internacional (IFRS 17)", "Governança Corporativa", "Controller Estratégico"],
      alreadyKnows: ["Contabilidade Geral", "IFRS e CPC", "Auditoria", "Análise das DFs"],
    },
    "Analista Fiscal": {
      needToLearn: ["Tributação Internacional", "Transfer Pricing", "Planejamento Tributário Complexo"],
      alreadyKnows: ["ICMS e Substituição", "IPI/PIS/COFINS", "SPED Completo", "Obrigações Acessórias"],
    },
    "Departamento Pessoal": {
      needToLearn: ["People Analytics", "Remuneração Estratégica", "Gestão de Clima e Cultura"],
      alreadyKnows: ["eSocial Completo", "Folha de Pagamento Complexa", "Legislação Trabalhista Completa"],
    },
    Outro: {
      needToLearn: ["CEO Skills", "Inovação e Transformação Digital", "M&A e Valuation"],
      alreadyKnows: ["Gestão de Equipes", "Estratégia", "Liderança", "Finanças"],
    },
  },
};

// Weekly schedule days
const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

function pickTrack(tracks: Track[], goal: string): Track | null {
  const keywords = GOAL_TO_TRACK[goal] || [];

  // Find best matching track
  for (const kw of keywords) {
    const found = tracks.find((t) =>
      t.title.toLowerCase().includes(kw.toLowerCase())
    );
    if (found) return found;
  }

  return tracks[0] || null;
}

function buildWeeklySchedule(courses: Course[], lessonsPerDay: number): Record<string, Course[]> {
  const schedule: Record<string, Course[]> = {};
  let courseIndex = 0;

  for (const day of DAYS) {
    const dayCourses: Course[] = [];
    let lessonsAssigned = 0;

    while (lessonsAssigned < lessonsPerDay && courseIndex < courses.length) {
      const course = courses[courseIndex];
      const courseLessons = Math.min(course.lessons, lessonsPerDay - lessonsAssigned);
      dayCourses.push({ ...course, lessons: courseLessons });
      lessonsAssigned += courseLessons;
      if (lessonsAssigned >= course.lessons) {
        courseIndex++;
      } else {
        break;
      }
    }

    schedule[day] = dayCourses;
  }

  return schedule;
}

async function fetchCourses(count = 50): Promise<Course[]> {
  try {
    const res = await fetch(`${CEFIS_API}/courses?count=${count}`, {
      headers: { Accept: "application/json", "User-Agent": "CEFIS-Mentor/1.0" },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return raw.map((c: Record<string, unknown>) => ({
      id: Number(c.id),
      title: String(c.title || c.name || ""),
      duration: Number(c.duration || 0),
      rating: Number(c.averageRating || c.rating || 0),
      lessons: Number(c.lessonCount || c.lessons || 0),
      category: String(c.keywords || "").split(";")[0] || "",
      slug: String(c.slug || ""),
      banner: String(c.banner || ""),
    }));
  } catch {
    return [
      { id: 4556, title: "Comunicação Corporativa", duration: 11902, rating: 9.04, lessons: 51, category: "Habilidades" },
      { id: 4510, title: "Contador estratégico", duration: 11540, rating: 9.92, lessons: 34, category: "Contabilidade" },
      { id: 4500, title: "Gestão Tributária Aplicada", duration: 3639, rating: 9.63, lessons: 9, category: "Fiscal" },
      { id: 4501, title: "Preparatório Prático – Exame do CFC", duration: 9376, rating: 9.66, lessons: 28, category: "CFC" },
    ];
  }
}

async function fetchTracks(): Promise<Track[]> {
  try {
    const res = await fetch(`${CEFIS_API}/tracks?count=20`, {
      headers: { Accept: "application/json", "User-Agent": "CEFIS-Mentor/1.0" },
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return raw.map((t: Record<string, unknown>) => ({
      id: Number(t.id),
      title: String(t.title || t.name || t.nome || ""),
      courses: Number(t.courses || t.cursos || t.total_courses || 0),
      duration: Number(t.duration || t.duracao || 0),
      slug: String(t.slug || ""),
      description: String(t.description || t.descricao || ""),
    }));
  } catch {
    return [
      { id: 1, title: "Contabilidade Avançada", courses: 34, duration: 0, slug: "contabilidade-avancada", description: "Trilha completa de contabilidade para profissionais" },
      { id: 2, title: "Analista Fiscal", courses: 85, duration: 0, slug: "analista-fiscal", description: "Do básico ao avançado em tributação e fiscal" },
      { id: 3, title: "Departamento Pessoal", courses: 37, duration: 0, slug: "departamento-pessoal", description: "RH, folha de pagamento e legislação trabalhista" },
      { id: 4, title: "Gestão Empresarial", courses: 25, duration: 0, slug: "gestao-empresarial", description: "Habilidades de gestão para contadores" },
    ];
  }
}

async function generateAIInsights(profile: UserProfile, gapData: { needToLearn: string[]; alreadyKnows: string[] }): Promise<{ mentorMessage: string; studyTips: string[]; motivationalQuote: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { mentorMessage: "", studyTips: [], motivationalQuote: "" };

  try {
    const prompt = `Você é um mentor especialista em educação contábil e fiscal brasileira da plataforma CEFIS.

Perfil do aluno:
- Nome: ${profile.name}
- Área: ${profile.area}
- Objetivo: ${profile.goal}
- Tempo disponível por dia: ${profile.time}
- Estilo de aprendizado: ${profile.style}
- Nível atual: ${profile.level}
- Já sabe: ${gapData.alreadyKnows.join(", ") || "está começando do zero"}
- Precisa aprender: ${gapData.needToLearn.slice(0, 4).join(", ")}

Responda em JSON válido com exatamente estas 3 chaves:
{
  "mentorMessage": "Mensagem personalizada de boas-vindas e motivação para ${profile.name}, 2-3 frases, mencione o objetivo específico e o que ele já sabe",
  "studyTips": ["dica específica 1 para ${profile.style}", "dica específica 2 para ${profile.area}", "dica específica 3 para ${profile.goal}"],
  "motivationalQuote": "Uma frase motivacional curta e poderosa sobre a jornada de ${profile.name} para ${profile.goal}"
}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) return { mentorMessage: "", studyTips: [], motivationalQuote: "" };
    const data = await res.json();
    const text = data.content?.[0]?.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { mentorMessage: "", studyTips: [], motivationalQuote: "" };
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { mentorMessage: "", studyTips: [], motivationalQuote: "" };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: UserProfile = await request.json();
    const { name, area, goal, time, level } = body;

    // Fetch data in parallel
    const [allCourses, tracks] = await Promise.all([
      fetchCourses(50),
      fetchTracks(),
    ]);

    // Pick the recommended track
    const recommendedTrack = pickTrack(tracks, goal);

    // Filter courses relevant to user goal
    const goalKeywords = GOAL_TO_TRACK[goal] || [];
    const areaKeywords = [area, ...(goal === "Passar no CFC" ? ["CFC", "Preparatório", "Contábil"] : [])];

    let relevantCourses = allCourses.filter((c) => {
      const text = `${c.title} ${c.category}`.toLowerCase();
      return (
        goalKeywords.some((kw) => text.includes(kw.toLowerCase())) ||
        areaKeywords.some((kw) => kw && text.includes(kw.toLowerCase()))
      );
    });

    // If not enough matches, add top-rated courses
    if (relevantCourses.length < 5) {
      const extras = allCourses
        .filter((c) => !relevantCourses.find((r) => r.id === c.id))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10 - relevantCourses.length);
      relevantCourses = [...relevantCourses, ...extras];
    }

    // Sort: level filter
    if (level === "Iniciante") {
      relevantCourses = relevantCourses.sort((a, b) => a.duration - b.duration);
    } else if (level === "Avançado") {
      relevantCourses = relevantCourses.sort((a, b) => b.rating - a.rating);
    } else {
      relevantCourses = relevantCourses.sort((a, b) => b.rating - a.rating);
    }

    // Quick wins: courses under 3600s (1 hour)
    const quickWins = allCourses
      .filter((c) => c.duration > 0 && c.duration <= 3600 && c.rating >= 8)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    // Weekly schedule
    const lessonsPerDay = TIME_TO_LESSONS[time] || 3;
    const minutesPerDay = TIME_TO_MINUTES[time] || 30;
    const weeklySchedule = buildWeeklySchedule(relevantCourses.slice(0, 20), lessonsPerDay);

    // Gap analysis
    const gapData = GAP_ANALYSIS[level]?.[area] || GAP_ANALYSIS["Iniciante"]["Outro"];

    // AI-generated insights (Claude Haiku)
    const aiInsights = await generateAIInsights(body, gapData);

    // Estimate completion
    const totalDuration = relevantCourses.slice(0, 15).reduce((acc, c) => acc + c.duration, 0);
    const daysToComplete = Math.ceil(totalDuration / 60 / minutesPerDay);
    const weeksToComplete = Math.ceil(daysToComplete / 5);

    // Style description
    const styleDescriptions: Record<string, string> = {
      Visual: "Você aprende melhor com diagramas, esquemas visuais e infográficos. Foque nos cursos com slides detalhados.",
      Auditivo: "Você absorve conteúdo ouvindo. Priorize aulas em vídeo e podcasts de revisão.",
      Leitura: "Você retém melhor lendo. Complemente as aulas com os materiais de apoio e PDFs.",
      Prático: "Você aprende fazendo. Priorize exercícios práticos e simulados logo após cada módulo.",
    };

    const plan = {
      user: { name, area, goal, time, level },
      recommendedTrack: recommendedTrack
        ? {
            id: recommendedTrack.id,
            title: recommendedTrack.title,
            courses: recommendedTrack.courses,
            duration: recommendedTrack.duration,
            description: recommendedTrack.description,
          }
        : null,
      courses: relevantCourses.slice(0, 12),
      allTracks: tracks.slice(0, 6),
      weeklySchedule,
      quickWins,
      gapAnalysis: gapData,
      aiInsights,
      meta: {
        lessonsPerDay,
        minutesPerDay,
        daysToComplete,
        weeksToComplete,
        totalCourses: relevantCourses.length,
        styleDescription: styleDescriptions[body.style] || styleDescriptions["Prático"],
        generatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Plano API error:", error);
    return NextResponse.json({ error: "Erro ao gerar plano" }, { status: 500 });
  }
}
