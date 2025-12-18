import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Corpo da requisição inválido" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Validação de campos obrigatórios
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { message: "Email e senha devem ser strings" },
        { status: 400 }
      );
    }

    if (email.trim().length === 0) {
      return NextResponse.json(
        { message: "Email não pode ser vazio" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Senha deve ter pelo menos 8 caracteres" },
        { status: 400 }
      );
    }

    // Busca o usuário
    const user = await prisma.users.findUnique({
      where: { email: email.trim() },
    });
    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Valida a senha
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

    // Tratamento de erros específicos
    if (err instanceof Error) {
      // Erro de JWT
      if (err.message.includes("jwt")) {
        return NextResponse.json(
          { message: "Erro ao gerar token de autenticação" },
          { status: 500 }
        );
      }

      // Erro de bcrypt
      if (err.message.includes("bcrypt")) {
        return NextResponse.json(
          { message: "Erro ao validar senha" },
          { status: 500 }
        );
      }

      // Erro de banco de dados
      if (err.message.includes("prisma") || err.message.includes("database")) {
        return NextResponse.json(
          { message: "Erro ao acessar banco de dados" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
