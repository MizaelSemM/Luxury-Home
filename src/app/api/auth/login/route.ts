import { NextResponse } from "next/server";
import { generateToken, verifyAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Dados inválidos", message: "Senha é obrigatória" },
        { status: 400 }
      );
    }

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          error: "Erro de configuração",
          message: "Senha de administrador não configurada",
        },
        { status: 500 }
      );
    }

    const isValid = await verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Não autorizado", message: "Senha incorreta" },
        { status: 401 }
      );
    }

    const token = generateToken();

    const response = NextResponse.json({
      data: { message: "Autenticado com sucesso" },
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno", message: (error as Error).message },
      { status: 500 }
    );
  }
}
