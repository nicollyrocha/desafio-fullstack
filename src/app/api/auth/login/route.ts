import { NextResponse } from "next/server";
import { User } from "../users.model";

export async function GET() {
  const users = await User.findAll();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await User.create(body);
  return NextResponse.json(user, { status: 201 });
}
