import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/src/lib/db";

export async function POST(req: Request) {
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

    const { name, email, password } = body;

    // Validação de campos obrigatórios
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { message: "Nome, email e senha devem ser strings" },
        { status: 400 }
      );
    }

    if (name.trim().length === 0) {
      return NextResponse.json(
        { message: "Nome não pode ser vazio" },
        { status: 400 }
      );
    }

    if (email.trim().length === 0) {
      return NextResponse.json(
        { message: "Email não pode ser vazio" },
        { status: 400 }
      );
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { message: "Formato de email inválido" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Senha deve ter pelo menos 8 caracteres" },
        { status: 400 }
      );
    }

    // Verifica se usuário já existe
    const existingUser = await prisma.users.findUnique({
      where: { email: email.trim() },
    });
    if (existingUser) {
      return NextResponse.json(
        { message: "Usuário já existe" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    await prisma.users.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Usuário criado com sucesso" },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("REGISTER ERROR:", err);

    // Tratamento de erros específicos
    if (err instanceof Error) {
      // Erro de bcrypt
      if (err.message.includes("bcrypt")) {
        return NextResponse.json(
          { message: "Erro ao criptografar senha" },
          { status: 500 }
        );
      }

      // Erro de banco de dados - violação de constraint única
      if (
        err.message.includes("Unique constraint") ||
        err.message.includes("unique")
      ) {
        return NextResponse.json(
          { message: "Este email já está cadastrado" },
          { status: 409 }
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
