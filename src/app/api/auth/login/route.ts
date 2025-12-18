import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

  try {
    const { email, password } = await req.json();

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: "Senha incorreta" }, { status: 401 });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const res = NextResponse.json({
      message: "Login realizado com sucesso",
      userId: user.id,
      token,
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hora
    });
    res.cookies.set(
      "user",
      JSON.stringify({ id: user.id, name: user.name, email: user.email }),
      {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hora
      }
    );

    return res;
  } catch (err: unknown) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
