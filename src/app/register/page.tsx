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

const RegisterPage = () => {
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
      });

      if (!response.ok) {
        const err = await response.json();
        setErrors({ form: err.message });
        setLoading(false);
        toast.error(err.message || "Erro ao cadastrar usuário.");
        return;
      }

      const data = await response.json();
      console.log(data);
      setLoading(false);
      formData.delete("name");
      formData.delete("email");
      formData.delete("password");
      formRef.current?.reset();
      toast.success("Usuário cadastrado com sucesso!");
      window.location.href = "/login";
    } catch {
      setErrors({ form: "Erro de rede. Tente novamente." });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <ToastContainer />
      <div className="bg-[#f7f2f0] shadow-md flex flex-col items-center justify-center p-6 rounded-md">
        <h1 className="text-2xl font-bold mb-4 p-4">Login</h1>
        <Form
          ref={formRef}
          action={""}
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
          <div className="flex flex-col gap-1 mb-2">
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
      </div>
    </div>
  );
};

export default RegisterPage;
