import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/src/lib/db";

async function getUserIdFromCookie(): Promise<number | null> {
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

export async function GET() {
  const userId = await getUserIdFromCookie();
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
  const userId = await getUserIdFromCookie();
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
