import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { getUserId } from "@/src/lib/middleware";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const taskId = Number(id);

    // Validação de ID
    if (isNaN(taskId) || taskId <= 0) {
      return NextResponse.json(
        { message: "ID da tarefa inválido" },
        { status: 400 }
      );
    }

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

    // Verifica se a tarefa existe e pertence ao usuário
    const existing = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: userId },
    });
    if (!existing) {
      return NextResponse.json(
        {
          message:
            "Tarefa não encontrada ou você não tem permissão para editá-la",
        },
        { status: 404 }
      );
    }

    const task = await prisma.tasks.update({
      where: { id: taskId },
      data: {
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        status: status || existing.status,
      },
    });
    return NextResponse.json(task, { status: 200 });
  } catch (err: unknown) {
    console.error("UPDATE TASK ERROR:", err);

    if (err instanceof Error) {
      // Erro de banco de dados
      if (err.message.includes("prisma") || err.message.includes("database")) {
        return NextResponse.json(
          { message: "Erro ao acessar banco de dados" },
          { status: 503 }
        );
      }

      // Erro de record not found
      if (err.message.includes("Record to update not found")) {
        return NextResponse.json(
          { message: "Tarefa não encontrada" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: "Erro interno ao atualizar tarefa" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json(
      { message: "Token de autenticação inválido ou ausente" },
      { status: 401 }
    );
  }
  try {
    const { id } = await params;
    const taskId = Number(id);

    // Validação de ID
    if (isNaN(taskId) || taskId <= 0) {
      return NextResponse.json(
        { message: "ID da tarefa inválido" },
        { status: 400 }
      );
    }

    // Verifica se a tarefa existe e pertence ao usuário
    const existing = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: userId },
    });
    if (!existing) {
      return NextResponse.json(
        {
          message:
            "Tarefa não encontrada ou você não tem permissão para deletá-la",
        },
        { status: 404 }
      );
    }

    await prisma.tasks.delete({ where: { id: taskId } });
    return NextResponse.json(
      { message: "Tarefa deletada com sucesso" },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("DELETE TASK ERROR:", err);

    if (err instanceof Error) {
      // Erro de banco de dados
      if (err.message.includes("prisma") || err.message.includes("database")) {
        return NextResponse.json(
          { message: "Erro ao acessar banco de dados" },
          { status: 503 }
        );
      }

      // Erro de record not found
      if (err.message.includes("Record to delete does not exist")) {
        return NextResponse.json(
          { message: "Tarefa não encontrada" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: "Erro interno ao deletar tarefa" },
      { status: 500 }
    );
  }
}
