import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function middleware(req: NextRequest) {
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { message: "Token não fornecido" },
      { status: 401 }
    );
  }

  try {
    jwt.verify(token, JWT_SECRET);
    console.log("Token válido");
    return NextResponse.next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ message: "Token inválido" }, { status: 401 });
  }
}

export async function getUserIdFromCookie(): Promise<number | null> {
  const { cookies } = await import("next/headers");
  const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number };
    return payload.id;
  } catch {
    return null;
  }
}

export function getUserIdFromToken(req: Request): number | null {
  const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number };
    return payload.id;
  } catch {
    return null;
  }
}

export async function getUserId(req: Request): Promise<number | null> {
  const userIdFromToken = getUserIdFromToken(req);
  if (userIdFromToken) return userIdFromToken;

  return await getUserIdFromCookie();
}

export async function getToken(): Promise<string | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  return token || null;
}

export const config = {
  matcher: ["/api/:path*"],
};
