import { redirect } from "next/navigation";
import { getUserIdFromCookie } from "@/src/lib/middleware";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const userId = await getUserIdFromCookie();
  if (userId) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
