import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const db = new PrismaClient();

async function seed() {
    await db.account.create({
        data: {
            username: "admin",
            password: await bcrypt.hash("admin", 10),
        }
    });
}

seed();