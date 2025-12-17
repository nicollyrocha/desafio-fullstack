"use client";
import { Input } from "@/src/components/input";
import "../globals.css";
import Form from "next/form";
import { Button } from "@/src/components/button";
import { FormEvent, useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email é obrigatório." })
    .email({ message: "Formato de email inválido." }),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres." }),
});

const LoginPage = () => {
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    form?: string;
  }>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };

    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: { name?: string; email?: string; password?: string } =
        {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as "name" | "email" | "password" | undefined;
        if (path) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setErrors({ form: err?.message ?? "Falha ao fazer login." });
        return;
      }

      const data = await response.json();
      console.log(data);
      localStorage.setItem("userid", data.userId);
      window.location.href = "/dashboard";
    } catch {
      setErrors({ form: "Erro de rede. Tente novamente." });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="bg-[#f7f2f0] shadow-md flex flex-col items-center justify-center p-6 rounded-md">
        <h1 className="text-2xl font-bold mb-4 p-4">Login</h1>
        <Form
          action={""}
          className="flex flex-col gap-2 items-stretch w-64"
          onSubmit={onSubmit}
        >
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
          <Button type="submit">Login</Button>
        </Form>
        <div className="w-full justify-start mt-2">
          <Button
            onClick={() => (window.location.href = "/register")}
            variant="text"
            className="text-sm"
          >
            Cadastrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
