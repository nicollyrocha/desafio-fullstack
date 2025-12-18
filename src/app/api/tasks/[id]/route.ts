import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { getUserId } from "@/src/lib/middleware";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }
  try {
    const { title, description, status } = await req.json();
    const { id } = await params;
    const taskId = Number(id);
    if (!title || String(title).trim().length === 0) {
      return NextResponse.json(
        { message: "Título é obrigatório" },
        { status: 400 }
      );
    }
    const existing = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: userId },
    });
    if (!existing) {
      return NextResponse.json(
        { message: "Task não encontrada" },
        { status: 404 }
      );
    }
    const task = await prisma.tasks.update({
      where: { id: taskId },
      data: {
        title: String(title).trim(),
        description,
        status,
      },
    });
    return NextResponse.json(task, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Erro ao atualizar task" },
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
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const taskId = Number(id);

    if (!taskId) {
      return NextResponse.json(
        { message: "taskId é obrigatório" },
        { status: 400 }
      );
    }
    const existing = await prisma.tasks.findFirst({
      where: { id: taskId, user_id: userId },
    });
    if (!existing) {
      return NextResponse.json(
        { message: "Task não encontrada" },
        { status: 404 }
      );
    }

    await prisma.tasks.delete({ where: { id: taskId } });
    return NextResponse.json(
      { message: "Tarefa deletada com sucesso" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Erro ao deletar task" },
      { status: 500 }
    );
  }
}
