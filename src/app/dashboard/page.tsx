import { Button } from "@/src/components/button";
import { Input } from "@/src/components/input";
import { prisma } from "@/src/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Task } from "@/src/lib/models/Task.model";

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

export async function createTaskAction(formData: FormData) {
  "use server";
  const userId = await getUserIdFromCookie();
  if (!userId) {
    throw new Error("Não autenticado");
  }
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!title) {
    throw new Error("Título é obrigatório");
  }
  await prisma.tasks.create({
    data: {
      title,
      description: description || undefined,
      status: (status || undefined) as Task["status"],
      user_id: userId,
    },
  });
  revalidatePath("/dashboard");
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
      <div className="bg-[#e66e55] w-full p-4 text-white justify-center flex">
        <div className="text-xl font-semibold">Dashboard</div>
      </div>

      <div className="flex flex-col gap-10 w-full items-center">
        <form
          action={createTaskAction}
          className="flex flex-col gap-2 items-stretch w-64"
        >
          <div className="flex flex-col gap-1">
            <Input label="Title" name="title" type="text" />
          </div>
          <div className="flex flex-col gap-1">
            <Input label="Description" name="description" type="text" />
          </div>
          <div className="flex flex-col gap-1 mb-2">
            <Input label="Status" name="status" type="text" />
          </div>
          <Button type="submit">Cadastrar</Button>
        </form>
        <div>
          {tarefas?.length === 0 ? (
            <div className="text-center">Nenhuma tarefa encontrada.</div>
          ) : (
            <table className="table-auto border-collapse border border-[#ca8554] w-3xl">
              <thead>
                <tr className="bg-[#ca8554]/30 h-10">
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="rounded-sm">
                {tarefas.map((task) => (
                  <tr key={task.id}>
                    <td className="border px-4 py-2 text-black border-[#ca8554]">
                      {task.title}
                    </td>
                    <td className="border px-4 py-2 text-black border-[#ca8554]">
                      {task.description}
                    </td>
                    <td className="border px-4 py-2 text-black border-[#ca8554]">
                      {task.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
