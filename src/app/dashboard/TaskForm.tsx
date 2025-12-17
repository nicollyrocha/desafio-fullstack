"use client";
import { Button } from "@/src/components/button";
import { Input } from "@/src/components/input";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/src/components/select";
import { toast, ToastContainer } from "react-toastify";

export function TaskForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      status: String(formData.get("status") ?? "").trim(),
    };

    if (!payload.title) {
      setError("Título é obrigatório");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erro ao criar tarefa");
      }

      formRef.current?.reset();
      toast.success("Tarefa criada com sucesso!");
      router.refresh();
    } catch (err) {
      console.error("Error creating task:", err);
      toast.error("Erro ao criar tarefa.");
      setError(err instanceof Error ? err.message : "Erro interno no servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 items-stretch w-64"
      >
        <div className="flex flex-col gap-1">
          <Input label="Título" name="title" type="text" />
        </div>
        <div className="flex flex-col gap-1">
          <Input label="Descrição" name="description" type="text" />
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
        </div>
        {error && <div className="text-red-700 text-sm mb-1">{error}</div>}
        <Button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>
      <ToastContainer />
    </>
  );
}
