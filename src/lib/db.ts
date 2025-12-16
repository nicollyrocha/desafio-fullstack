import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: "mysql",
  dialectModule: mysql2,
  logging: false,
  retry: {
    max: 10,
  },
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Banco conectado");
  } catch (error) {
    console.error("❌ Erro ao conectar no banco:", error);
    throw error;
  }
}

export { sequelize };
