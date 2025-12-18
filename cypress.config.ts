import { defineConfig } from "cypress";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        async "db:reset"() {
          await prisma.tasks.deleteMany();
          await prisma.users.deleteMany();
          return null;
        },
      });
    },
  },
});
