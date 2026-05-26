import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

interface Lesson {
  num: string;
  title: string;
  text: string;
}

interface Course {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface Corpus {
  [courseId: string]: Course;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

let corpus: Corpus | null = null;

function loadCorpus(): Corpus {
  if (corpus) return corpus;
  const filePath = path.join(process.cwd(), "public", "data", "corpus.json");
  corpus = JSON.parse(readFileSync(filePath, "utf-8"));
  return corpus!;
}

function getRandomLessons(courseId: string, count = 3): Lesson[] {
  const c = loadCorpus();
  const course = c[courseId];
  if (!course) return [];
  const lessons = course.lessons.filter(l => l.text.length > 200);
  const shuffled = lessons.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No API key" }, { status: 500 });

  const { courseId, topic } = await request.json();

  const corpus = loadCorpus();

  let context = "";
  let courseTitle = topic || "Contabilidade";

  if (courseId && corpus[courseId]) {
    const course = corpus[courseId];
    courseTitle = course.title;
    const lessons = getRandomLessons(courseId, 3);
    context = lessons.map(l => `Aula "${l.title}":\n${l.text}`).join("\n\n---\n\n");
  } else {
    // Use first available course
    const first = Object.values(corpus)[0];
    courseTitle = first.title;
    const lessons = first.lessons.slice(0, 3);
    context = lessons.map(l => `Aula "${l.title}":\n${l.text}`).join("\n\n---\n\n");
  }

  const prompt = `Você é um professor especializado em educação contábil e fiscal brasileira do CEFIS.

Com base no seguinte conteúdo de aulas do curso "${courseTitle}":

${context}

Crie exatamente 5 questões de múltipla escolha para testar o aprendizado. Cada questão deve:
- Ser baseada diretamente no conteúdo fornecido
- Ter 4 alternativas (A, B, C, D) com apenas uma correta
- Incluir uma explicação breve da resposta correta

Responda SOMENTE em JSON válido neste formato exato:
{
  "courseTitle": "${courseTitle}",
  "questions": [
    {
      "question": "texto da pergunta",
      "options": ["alternativa A", "alternativa B", "alternativa C", "alternativa D"],
      "correct": 0,
      "explanation": "Por que esta é a resposta correta..."
    }
  ]
}

O campo "correct" deve ser o índice (0-3) da alternativa correta.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "{}";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    const quiz = JSON.parse(match[0]);
    return NextResponse.json(quiz);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao gerar quiz" }, { status: 500 });
  }
}

export async function GET() {
  const corpus = loadCorpus();
  const courses = Object.entries(corpus).map(([id, c]) => ({
    id,
    title: c.title,
    lessons: c.lessons.length,
  }));
  return NextResponse.json({ courses });
}
