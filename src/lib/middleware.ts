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

export const config = {
  matcher: ["/api/:path*"],
};
