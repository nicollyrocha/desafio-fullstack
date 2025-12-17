import { redirect } from "next/navigation";
import { getUserIdFromCookie } from "@/src/lib/middleware";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage() {
  const userId = await getUserIdFromCookie();
  if (userId) {
    redirect("/dashboard");
  }

  return <RegisterForm />;
}
