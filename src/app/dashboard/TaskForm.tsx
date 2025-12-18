"use client";
import { Button } from "@/src/components/button";
import { Input } from "@/src/components/input";
import { FormEvent, useState } from "react";
import { Select } from "@/src/components/select";
import { toast } from "react-toastify";
import Form from "next/form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const taskSchema = z.object({
  title: z.string().min(1, { message: "Título é obrigatório." }),
  description: z.string().optional().default(""),
  status: z.enum(["pending", "in_progress", "completed"], {
    message: "Status inválido",
  }),
});

export function TaskForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    status?: string;
    form?: string;
  }>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    setLoading(true);
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      status: String(formData.get("status") ?? ""),
    };

    const parsed = taskSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: {
        title?: string;
        description?: string;
        status?: string;
      } = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as
          | "title"
          | "description"
          | "status"
          | undefined;
        if (path) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    setErrors({});

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        credentials: "include",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const errorMsg = err?.message ?? "Falha ao criar tarefa.";
        setErrors({ form: errorMsg });
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      router.refresh();
      toast.success("Tarefa criada com sucesso!");
      setLoading(false);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      const errorMsg = "Erro de rede. Tente novamente.";
      setErrors({ form: errorMsg });
      toast.error(errorMsg);
      setLoading(false);
    }
  }

  return (
    <Form
      action={""}
      onSubmit={onSubmit}
      className="flex flex-col gap-2 items-stretch w-64"
    >
      <div className="flex flex-col gap-1">
        <Input label="Título" name="title" type="text" />
        {errors.title && (
          <span className="text-red-700 text-sm">{errors.title}</span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Input label="Descrição" name="description" type="text" />
        {errors.description && (
          <span className="text-red-700 text-sm">{errors.description}</span>
        )}
      </div>
      <div className="flex flex-col gap-1 mb-2">
        <Select
          name="status"
          label="Status"
          options={[
            { label: "Pendente", value: "pending" },
            { label: "Em progresso", value: "in_progress" },
            { label: "Completo", value: "completed" },
          ]}
        />
        {errors.status && (
          <span className="text-red-700 text-sm">{errors.status}</span>
        )}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : "Cadastrar"}
      </Button>
    </Form>
  );
}
