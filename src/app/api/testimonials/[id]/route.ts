import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testimonialSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: params.id },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Não encontrado", message: "Depoimento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: testimonial });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar depoimento", message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const body = await request.json();
    const parsed = testimonialSchema.parse(body);

    const testimonial = await prisma.testimonial.update({
      where: { id: params.id },
      data: {
        clientName: parsed.clientName,
        role: parsed.role,
        text: parsed.text,
        rating: parsed.rating,
        avatarUrl: parsed.avatarUrl,
      },
    });

    return NextResponse.json({ data: testimonial });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", message: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao atualizar depoimento", message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    await prisma.testimonial.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      data: { message: "Depoimento excluído com sucesso" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao excluir depoimento", message: (error as Error).message },
      { status: 500 }
    );
  }
}
