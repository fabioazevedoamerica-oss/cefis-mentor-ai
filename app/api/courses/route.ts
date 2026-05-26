import { NextRequest, NextResponse } from "next/server";

const CEFIS_API = "https://api-v3.cefis.com.br";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const count = searchParams.get("count") || "50";

  try {
    const url = new URL(`${CEFIS_API}/courses`);
    url.searchParams.set("count", count);
    if (search) url.searchParams.set("search", search);

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "CEFIS-Mentor/1.0",
      },
      next: { revalidate: 300 }, // cache for 5 minutes
    });

    if (!res.ok) {
      throw new Error(`CEFIS API returned ${res.status}`);
    }

    const data = await res.json();

    // Normalize and filter courses
    const courses = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

    const normalized = courses.map((c: Record<string, unknown>) => {
      const teacher = c.teacher as Record<string, unknown> | undefined;
      const trailer = c.trailer as Record<string, unknown> | undefined;
      const sources = trailer?.streamSources as Array<Record<string, unknown>> | undefined;
      const videoHD = sources?.find((s) => s.quality === "hd" && String(s.link_secure).endsWith("720.mp4"));
      return {
        id: c.id,
        title: c.title || c.name || "",
        duration: Number(c.duration || 0),
        rating: Number(c.averageRating || c.rating || 0),
        lessons: Number(c.lessonCount || c.lessons || 0),
        category: String(c.keywords || "").split(";")[0] || "",
        slug: c.slug || "",
        banner: c.banner || "",
        teacher: teacher?.name || "",
        videoUrl: videoHD?.link_secure || "",
      };
    });

    const filtered = search
      ? normalized.filter(
          (c: { title: string; category: string }) =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.category.toLowerCase().includes(search.toLowerCase())
        )
      : normalized;

    return NextResponse.json({ data: filtered, total: filtered.length });
  } catch (error) {
    console.error("Courses API error:", error);

    // Return real fallback data
    const fallback = [
      { id: 4556, title: "Comunicação Corporativa", duration: 11902, rating: 9.04, lessons: 51, category: "Habilidades" },
      { id: 4510, title: "Contador estratégico", duration: 11540, rating: 9.92, lessons: 34, category: "Contabilidade" },
      { id: 4500, title: "Gestão Tributária Aplicada", duration: 3639, rating: 9.63, lessons: 9, category: "Fiscal" },
      { id: 4501, title: "Preparatório Prático – Exame do CFC", duration: 9376, rating: 9.66, lessons: 28, category: "CFC" },
    ];

    return NextResponse.json({ data: fallback, total: fallback.length, fallback: true });
  }
}
