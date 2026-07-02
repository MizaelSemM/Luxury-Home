import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";

let adminPasswordHash: string | null = null;

async function getAdminHash(): Promise<string | null> {
  if (adminPasswordHash) return adminPasswordHash;

  const plainPassword = process.env.ADMIN_PASSWORD;
  if (!plainPassword) return null;

  adminPasswordHash = await bcrypt.hash(plainPassword, 12);
  return adminPasswordHash;
}

export async function verifyAdminPassword(
  password: string
): Promise<boolean> {
  const hash = await getAdminHash();
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return jwt.sign({ role: "admin", timestamp: Date.now() }, JWT_SECRET, {
    expiresIn: "24h",
  });
}

export function verifyToken(token: string): { role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { role: string };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const token =
    request.cookies.get("admin_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  return token || null;
}

export function requireAdmin(
  request: NextRequest
): { authenticated: boolean; response?: Response } {
  const token = getTokenFromRequest(request);
  if (!token) {
    return {
      authenticated: false,
      response: Response.json(
        { error: "Não autorizado", message: "Autenticação necessária" },
        { status: 401 }
      ),
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      authenticated: false,
      response: Response.json(
        { error: "Não autorizado", message: "Token inválido ou expirado" },
        { status: 401 }
      ),
    };
  }

  return { authenticated: true };
}
