import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

interface Lesson {
  num: string;
  title: string;
  duration: number;
  text: string;
}

interface Course {
  id: number;
  title: string;
  summary: string;
  lessons: Lesson[];
}

interface Corpus {
  [courseId: string]: Course;
}

let corpus: Corpus | null = null;

function loadCorpus(): Corpus {
  if (corpus) return corpus;
  try {
    const filePath = path.join(process.cwd(), "public", "data", "corpus.json");
    corpus = JSON.parse(readFileSync(filePath, "utf-8"));
    return corpus!;
  } catch {
    return {};
  }
}

function searchCorpus(query: string, corpus: Corpus): { course: Course; lesson: Lesson; score: number }[] {
  const queryWords = query.toLowerCase()
    .replace(/[^\w\sàáâãéêíóôõúç]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3);

  const results: { course: Course; lesson: Lesson; score: number }[] = [];

  for (const course of Object.values(corpus)) {
    for (const lesson of course.lessons) {
      const searchText = `${course.title} ${lesson.title} ${lesson.text}`.toLowerCase();
      let score = 0;

      for (const word of queryWords) {
        const count = (searchText.match(new RegExp(word, "g")) || []).length;
        score += count;
      }

      // Bonus for title matches
      const titleText = `${course.title} ${lesson.title}`.toLowerCase();
      for (const word of queryWords) {
        if (titleText.includes(word)) score += 5;
      }

      if (score > 0) {
        results.push({ course, lesson, score });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}

function buildContext(results: { course: Course; lesson: Lesson; score: number }[]): string {
  if (results.length === 0) return "";

  return results.map(({ course, lesson }) => `
### Curso: ${course.title}
**Aula: ${lesson.title}**
${lesson.text}
`).join("\n---\n");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const { question, history = [] } = await request.json();

  const corpusData = loadCorpus();
  const searchResults = searchCorpus(question, corpusData);
  const context = buildContext(searchResults);

  const systemPrompt = `Você é o Tutor IA do CEFIS, um assistente especializado em educação contábil e fiscal brasileira.

Você tem acesso às transcrições reais das aulas do CEFIS. Responda perguntas dos alunos com base no conteúdo real dos cursos.

${context ? `## Conteúdo relevante das aulas CEFIS encontrado:
${context}

## Instruções:
- Use as transcrições acima para embasar sua resposta
- Mencione o nome do curso e da aula quando relevante (ex: "No curso de Lucro Real, aula X...")
- Se a transcrição não cobrir a pergunta completamente, complemente com seu conhecimento de contabilidade/fiscal brasileiro
- Seja didático e objetivo
- Use exemplos práticos quando possível
- Responda em português brasileiro` : `## Instruções:
- Responda sobre contabilidade, fiscal e legislação brasileira
- Seja didático e objetivo
- Mencione que pode ter conteúdo específico do CEFIS se a pergunta for sobre cursos
- Use exemplos práticos
- Responda em português brasileiro`}`;

  const messages = [
    ...history.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: question },
  ];

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
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    const data = await res.json();
    const answer = data.content?.[0]?.text || "Não foi possível gerar resposta.";

    const sources = searchResults.slice(0, 3).map(({ course, lesson }) => ({
      courseId: course.id,
      courseTitle: course.title,
      lessonTitle: lesson.title,
    }));

    return NextResponse.json({ answer, sources });
  } catch (error) {
    console.error("Tutor API error:", error);
    return NextResponse.json({ error: "Erro ao processar pergunta" }, { status: 500 });
  }
}
