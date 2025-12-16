import { NextResponse } from "next/server";
import { Task } from "../task.model";

export async function GET() {
  const tasks = await Task.findAll();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const task = await Task.create(body);
  return NextResponse.json(task, { status: 201 });
}
