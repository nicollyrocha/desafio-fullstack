import { prisma } from "@/src/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { TaskTable } from "./TaskTable";
import { TaskForm } from "./TaskForm";
import { LogoutButton } from "./LogoutButton";

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

export default async function DashboardPage() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return (
      <div className="flex w-full flex-col items-center gap-14">
        <div className="bg-[#e66e55] w-full p-4 text-white justify-center flex">
          <div className="text-xl font-semibold">Dashboard</div>
        </div>
        <div>Você precisa fazer login para ver suas tarefas.</div>
      </div>
    );
  }

  const tarefas = await prisma.tasks.findMany({ where: { user_id: userId } });

  return (
    <div className="flex w-full flex-col items-center gap-14">
      <div className="bg-[#e66e55] w-full p-4 text-white justify-between flex">
        <div></div>
        <div className="text-xl font-semibold">Dashboard</div>
        <LogoutButton />
      </div>

      <div className="flex flex-col gap-10 w-full items-center">
        <TaskForm />
        <TaskTable tasks={tarefas} />
      </div>
    </div>
  );
}
