import { NextRequest, NextResponse } from "next/server";

const CEFIS_API = "https://api-v3.cefis.com.br";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const count = searchParams.get("count") || "20";

  try {
    const url = new URL(`${CEFIS_API}/tracks`);
    url.searchParams.set("count", count);

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "CEFIS-Mentor/1.0",
      },
      next: { revalidate: 600 }, // cache 10 minutes
    });

    if (!res.ok) {
      throw new Error(`Tracks API returned ${res.status}`);
    }

    const data = await res.json();

    const tracks = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

    const normalized = tracks.map((t: Record<string, unknown>) => ({
      id: t.id,
      title: t.title || t.name || t.nome || "",
      courses: Number(t.courses || t.cursos || t.total_courses || 0),
      duration: Number(t.duration || t.duracao || 0),
      slug: t.slug || "",
      description: t.description || t.descricao || "",
    }));

    return NextResponse.json({ data: normalized, total: normalized.length });
  } catch (error) {
    console.error("Tracks API error:", error);

    // Real fallback tracks
    const fallback = [
      { id: 1, title: "Contabilidade Avançada", courses: 34, duration: 0, slug: "contabilidade-avancada", description: "Trilha completa de contabilidade para profissionais" },
      { id: 2, title: "Analista Fiscal", courses: 85, duration: 0, slug: "analista-fiscal", description: "Do básico ao avançado em tributação e fiscal" },
      { id: 3, title: "Departamento Pessoal", courses: 37, duration: 0, slug: "departamento-pessoal", description: "RH, folha de pagamento e legislação trabalhista" },
      { id: 4, title: "Gestão Empresarial", courses: 25, duration: 0, slug: "gestao-empresarial", description: "Habilidades de gestão para contadores" },
    ];

    return NextResponse.json({ data: fallback, total: fallback.length, fallback: true });
  }
}
