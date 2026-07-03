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

export async function generateToken(): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { role: "admin", timestamp: Date.now(), iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC", key,
    encoder.encode(`${headerB64}.${payloadB64}`)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return `${headerB64}.${payloadB64}.${sigB64}`;
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

export async function verifyToken(token: string): Promise<{ role: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  let payload: any;
  try {
    payload = JSON.parse(base64urlDecode(parts[1]));
  } catch {
    return null;
  }

  if (payload.exp && payload.exp * 1000 < Date.now()) return null;
  if (payload.role !== "admin") return null;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false, ["verify"]
    );

    const sigBytes = Uint8Array.from(base64urlDecode(parts[2]), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify(
      "HMAC", key, sigBytes,
      encoder.encode(`${parts[0]}.${parts[1]}`)
    );

    if (!valid) return null;
  } catch {
    return null;
  }

  return { role: "admin" };
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const token =
    request.cookies.get("admin_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  return token || null;
}

export async function requireAdmin(
  request: NextRequest
): Promise<{ authenticated: boolean; response?: Response }> {
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

  const payload = await verifyToken(token);
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
