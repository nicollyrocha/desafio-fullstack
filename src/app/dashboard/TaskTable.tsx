"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/button";
import { Input } from "@/src/components/input";
import { Select } from "@/src/components/select";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { FormatStatus } from "@/src/utils/format-status";
import { toast } from "react-toastify";
import { Dialog } from "@/src/components/dialog";

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | null;
  user_id: number;
  created_at: Date;
  updated_at: Date;
};

export function TaskTable({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"title" | "status" | "created_at">(
    "created_at"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [drafts, setDrafts] = useState<
    Record<number, { title: string; description: string; status: string }>
  >({});

  const startEdit = (t: Task) => {
    setDrafts((prev) => ({
      ...prev,
      [t.id]: {
        title: t.title ?? "",
        description: t.description ?? "",
        status: t.status ?? "",
      },
    }));
    setEditingId(t.id);
  };

  const handleSort = (field: "title" | "status" | "created_at") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let compareValue = 0;

    if (sortBy === "title") {
      compareValue = a.title.localeCompare(b.title);
    } else if (sortBy === "status") {
      const statusOrder = { pending: 0, in_progress: 1, completed: 2 };
      const aStatus = a.status || "pending";
      const bStatus = b.status || "pending";
      compareValue = statusOrder[aStatus] - statusOrder[bStatus];
    } else if (sortBy === "created_at") {
      compareValue =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  const cancelEdit = () => {
    setEditingId(null);
  };

  const updateDraft = (
    id: number,
    field: "title" | "description" | "status",
    value: string
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { title: "", description: "", status: "" }),
        [field]: value,
      },
    }));
  };

  const updateTask = async (id: number) => {
    const draft = drafts[id];
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, taskId: id }),
        credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const errorMsg = err?.message ?? "Erro ao atualizar tarefa.";
        toast.error(errorMsg);
        setLoading(false);
        throw new Error(errorMsg);
      }
      setLoading(false);
      router.refresh();
      toast.success("Tarefa atualizada com sucesso!");
      cancelEdit();
    } catch (error) {
      setLoading(false);
      console.error("Error updating task:", error);
    }
  };

  const openDeleteDialog = (id: number) => {
    setTaskToDelete(id);
    setOpen(true);
  };

  const deleteTask = async () => {
    console.log("Deleting task:", taskToDelete);
    setLoading(true);
    if (!taskToDelete) return;
    try {
      const response = await fetch(`/api/tasks/${taskToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const errorMsg = err?.message ?? "Erro ao deletar tarefa";
        toast.error(errorMsg);
        setLoading(false);
        throw new Error(errorMsg);
      }
      setLoading(false);
      router.refresh();
      toast.success("Tarefa deletada com sucesso!");
      setOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      setLoading(false);
      console.error("Error deleting task:", error);
    }
  };

  if (!tasks || tasks.length === 0) {
    return <div className="text-center">Nenhuma tarefa encontrada.</div>;
  }

  return (
    <>
      <div className="flex flex-col gap-4 w-full max-w-6xl">
        <div className="flex flex-col gap-2 items-center md:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">
              Ordenar por:
            </span>
            <Select
              className="w-full"
              name="sortBy"
              options={[
                { label: "Data de criação", value: "created_at" },
                { label: "Título", value: "title" },
                { label: "Status", value: "status" },
              ]}
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "title" | "status" | "created_at")
              }
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3! py-1! text-sm"
          >
            {sortOrder === "asc" ? "↑ Crescente" : "↓ Decrescente"}
          </Button>
        </div>
        <table className="table-auto border-collapse border border-[#ca8554] w-full hidden md:table ">
          <thead>
            <tr className="bg-[#ca8554]/30 h-10">
              <th
                className="cursor-pointer hover:bg-[#ca8554]/40"
                onClick={() => handleSort("title")}
              >
                Título {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>Descrição</th>
              <th
                className="cursor-pointer hover:bg-[#ca8554]/40"
                onClick={() => handleSort("status")}
              >
                Status{" "}
                {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer hover:bg-[#ca8554]/40"
                onClick={() => handleSort("created_at")}
              >
                Data de criação{" "}
                {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody className="rounded-sm">
            {sortedTasks.map((task) => {
              const isEditing = editingId === task.id;
              const draft = drafts[task.id] ?? {
                title: task.title ?? "",
                description: task.description ?? "",
                status: task.status ?? "",
              };
              return (
                <tr key={task.id}>
                  <td className="border px-4 py-2 text-black border-[#ca8554]">
                    {isEditing ? (
                      <Input
                        name={`edit-title-${task.id}`}
                        type="text"
                        label=""
                        value={draft.title}
                        onChange={(e) =>
                          updateDraft(task.id, "title", e.target.value)
                        }
                      />
                    ) : (
                      task.title
                    )}
                  </td>
                  <td className="border px-4 py-2 text-black border-[#ca8554]">
                    {isEditing ? (
                      <Input
                        name={`edit-description-${task.id}`}
                        type="text"
                        label=""
                        value={draft.description}
                        onChange={(e) =>
                          updateDraft(task.id, "description", e.target.value)
                        }
                      />
                    ) : (
                      task.description
                    )}
                  </td>
                  <td className="border px-4 py-2 text-black border-[#ca8554]">
                    {isEditing ? (
                      <Select
                        name={`edit-status-${task.id}`}
                        options={[
                          { label: "Pending", value: "pending" },
                          { label: "Em progresso", value: "in_progress" },
                          { label: "Completo", value: "completed" },
                        ]}
                        value={draft.status}
                        onChange={(e) =>
                          updateDraft(task.id, "status", e.target.value)
                        }
                      />
                    ) : task.status ? (
                      FormatStatus(task.status)
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="border px-4 py-2 text-black border-[#ca8554]">
                    {new Date(task.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="border px-4 py-2 text-black border-[#ca8554] space-x-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="icon"
                          onClick={updateTask.bind(null, task.id)}
                          className="confirm-button"
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Check />
                          )}
                        </Button>
                        <Button variant="icon" onClick={cancelEdit}>
                          <X />
                        </Button>
                      </>
                    ) : (
                      <div className="w-full flex justify-center gap-5">
                        <Button
                          onClick={() => startEdit(task)}
                          variant="icon"
                          className="edit-button"
                        >
                          <Pencil size={20} />
                        </Button>
                        <Button
                          onClick={() => openDeleteDialog(task.id)}
                          variant="icon"
                        >
                          <Trash2 size={20} />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Versão mobile */}
      <div className="w-full px-5 mb-10 md:hidden">
        {sortedTasks.map((task) => {
          const isEditing = editingId === task.id;
          return (
            <div
              key={task.id}
              className="md:hidden border border-[#ca8554] rounded-sm p-4 mb-4 w-full"
            >
              <div className="mb-2 flex gap-2 items-center">
                <strong>Título:</strong>
                {isEditing ? (
                  <Input
                    name={`title-${task.id}`}
                    type="text"
                    label=""
                    value={drafts[task.id]?.title || task.title || ""}
                    onChange={(e) =>
                      updateDraft(task.id, "title", e.target.value)
                    }
                    className="py-0"
                  />
                ) : (
                  task.title
                )}
              </div>
              <div className="mb-2 flex gap-2 items-center">
                <strong>Descrição:</strong>{" "}
                {isEditing ? (
                  <Input
                    name={`description-${task.id}`}
                    type="text"
                    label=""
                    value={
                      drafts[task.id]?.description || task.description || ""
                    }
                    onChange={(e) =>
                      updateDraft(task.id, "description", e.target.value)
                    }
                    className="py-0"
                  />
                ) : (
                  task.description
                )}
              </div>
              <div className="mb-2 flex gap-2 items-center w-fit">
                <strong>Status:</strong>{" "}
                {isEditing ? (
                  <Select
                    className="py-0"
                    name="status"
                    options={[
                      { label: "Pending", value: "pending" },
                      { label: "Em progresso", value: "in_progress" },
                      { label: "Completo", value: "completed" },
                    ]}
                    value={drafts[task.id]?.status || task.status || ""}
                    onChange={(e) =>
                      updateDraft(task.id, "status", e.target.value)
                    }
                  />
                ) : task.status ? (
                  FormatStatus(task.status)
                ) : (
                  ""
                )}
              </div>
              <div className="mb-2 flex gap-2 items-center">
                <strong>Criado em:</strong>{" "}
                {new Date(task.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="flex">
                {isEditing ? (
                  <Button onClick={cancelEdit} variant="icon">
                    Cancelar
                  </Button>
                ) : (
                  <div className="">
                    <Button
                      onClick={() => startEdit(task)}
                      variant="icon"
                      className={task.title.toString()}
                    >
                      <Pencil size={20} />
                    </Button>
                  </div>
                )}
                <Button
                  onClick={() => openDeleteDialog(task.id)}
                  variant="icon"
                >
                  <Trash2 size={20} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} title="Confirmar exclusão">
        <p className="mb-4">Tem certeza que deseja deletar esta tarefa?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={deleteTask} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Confirmar"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
