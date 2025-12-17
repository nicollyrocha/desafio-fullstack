"use client";
import { Input } from "@/src/components/input";
import "../globals.css";
import Form from "next/form";
import { Button } from "@/src/components/button";
import { FormEvent, useRef, useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const registerSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório." }),
  email: z
    .string()
    .min(1, { message: "Email é obrigatório." })
    .email({ message: "Formato de email inválido." }),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres." }),
});

export default function RegisterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    setLoading(true);
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };

    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: { name?: string; email?: string; password?: string } =
        {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as "name" | "email" | "password" | undefined;
        if (path) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    setErrors({});

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        credentials: "include",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setErrors({ form: err?.message ?? "Falha ao fazer cadastro." });
        setLoading(false);
        return;
      }

      toast.success("Cadastro realizado com sucesso!");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch {
      setErrors({ form: "Erro de rede. Tente novamente." });
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <ToastContainer />
      <div className="bg-[#f7f2f0] shadow-md flex flex-col items-center justify-center p-6 rounded-md">
        <h1 className="text-2xl font-bold mb-4 p-4">Cadastro</h1>
        <Form
          action={""}
          ref={formRef}
          className="flex flex-col gap-2 items-stretch w-64"
          onSubmit={onSubmit}
        >
          <div className="flex flex-col gap-1">
            <Input label="Nome" name="name" type="text" />
            {errors.name && (
              <span className="text-red-600 text-sm">{errors.name}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Input label="Email" name="email" type="text" />
            {errors.email && (
              <span className="text-red-600 text-sm">{errors.email}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Input label="Senha" name="password" type="password" />
            {errors.password && (
              <span className="text-red-600 text-sm">{errors.password}</span>
            )}
          </div>
          {errors.form && (
            <div className="text-red-700 text-sm mb-1">{errors.form}</div>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Cadastrar"}
          </Button>
        </Form>
        <div className="w-full justify-start mt-2">
          <Button
            onClick={() => (window.location.href = "/login")}
            variant="text"
            className="text-sm"
          >
            Já tem uma conta?
          </Button>
        </div>
      </div>
    </div>
  );
}
