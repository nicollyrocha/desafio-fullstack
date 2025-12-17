import bcrypt from "bcrypt";
import { prisma } from "./db";

export async function createUser(
  email: string,
  password: string,
  name: string
) {
  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) throw new Error("Usuário já existe");

  return prisma.users.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
      name,
    },
  });
}
