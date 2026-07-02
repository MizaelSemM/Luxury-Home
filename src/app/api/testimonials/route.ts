import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testimonialSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));
    const search = searchParams.get("search") || "";
    const minRating = Number(searchParams.get("minRating")) || 0;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { text: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minRating >= 1 && minRating <= 5) {
      where.rating = { gte: minRating };
    }

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.testimonial.count({ where }),
    ]);

    return NextResponse.json({
      data: testimonials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar depoimentos", message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const body = await request.json();
    const parsed = testimonialSchema.parse(body);

    const testimonial = await prisma.testimonial.create({
      data: {
        clientName: parsed.clientName,
        role: parsed.role,
        text: parsed.text,
        rating: parsed.rating,
        avatarUrl: parsed.avatarUrl,
      },
    });

    return NextResponse.json({ data: testimonial }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", message: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao criar depoimento", message: (error as Error).message },
      { status: 500 }
    );
  }
}
