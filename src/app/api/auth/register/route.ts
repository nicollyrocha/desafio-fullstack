import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/src/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Usuário já existe" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Usuário criado com sucesso" },
      { status: 201 }
    );
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
