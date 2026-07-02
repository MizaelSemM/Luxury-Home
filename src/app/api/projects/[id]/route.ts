import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Não encontrado", message: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar projeto", message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAdmin(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const body = await request.json();
    const parsed = projectSchema.parse(body);

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        title: parsed.title,
        description: parsed.description,
        location: parsed.location,
        squareMeters: parsed.squareMeters,
        imagesUrl: parsed.imagesUrl,
        highlight: parsed.highlight,
      },
    });

    return NextResponse.json({ data: project });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", message: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao atualizar projeto", message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAdmin(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: { message: "Projeto excluído com sucesso" } });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao excluir projeto", message: (error as Error).message },
      { status: 500 }
    );
  }
}
