import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { getUserId } from "@/src/lib/middleware";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }
  try {
    const tasks = await prisma.tasks.findMany({ where: { user_id: userId } });
    return NextResponse.json(tasks);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Erro ao buscar tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }
  try {
    const { title, description, status } = await req.json();
    if (!title || String(title).trim().length === 0) {
      return NextResponse.json(
        { message: "Título é obrigatório" },
        { status: 400 }
      );
    }
    const task = await prisma.tasks.create({
      data: {
        title: String(title).trim(),
        description,
        status,
        user_id: userId,
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Erro ao criar task" },
      { status: 500 }
    );
  }
}
