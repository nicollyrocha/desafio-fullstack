import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { getUserId } from "@/src/lib/middleware";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json(
      { message: "Token de autenticação inválido ou ausente" },
      { status: 401 }
    );
  }
  try {
    const tasks = await prisma.tasks.findMany({ where: { user_id: userId } });
    return NextResponse.json(tasks);
  } catch (err: unknown) {
    console.error("GET TASKS ERROR:", err);

    if (err instanceof Error) {
      // Erro de banco de dados
      if (err.message.includes("prisma") || err.message.includes("database")) {
        return NextResponse.json(
          { message: "Erro ao acessar banco de dados" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { message: "Erro interno ao buscar tarefas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json(
      { message: "Token de autenticação inválido ou ausente" },
      { status: 401 }
    );
  }
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

    const { title, description, status } = body;

    // Validação de título
    if (!title || String(title).trim().length === 0) {
      return NextResponse.json(
        { message: "Título é obrigatório" },
        { status: 400 }
      );
    }

    if (String(title).trim().length > 255) {
      return NextResponse.json(
        { message: "Título não pode ter mais de 255 caracteres" },
        { status: 400 }
      );
    }

    // Validação de status
    const validStatuses = ["pending", "in_progress", "completed"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Status inválido. Use: pending, in_progress ou completed" },
        { status: 400 }
      );
    }

    const task = await prisma.tasks.create({
      data: {
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        status: status || "pending",
        user_id: userId,
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err: unknown) {
    console.error("CREATE TASK ERROR:", err);

    if (err instanceof Error) {
      // Erro de banco de dados
      if (err.message.includes("prisma") || err.message.includes("database")) {
        return NextResponse.json(
          { message: "Erro ao acessar banco de dados" },
          { status: 503 }
        );
      }

      // Erro de foreign key (usuário não existe)
      if (err.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { message: "Usuário não encontrado" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: "Erro interno ao criar tarefa" },
      { status: 500 }
    );
  }
}
