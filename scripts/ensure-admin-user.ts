import bcrypt from "bcryptjs";
import { prisma } from "../lib/db";
import { normalizeNickname } from "../lib/nickname";

async function main() {
  const email = (process.env.ADMIN_EMAIL || "drissbadoolivier@gmail.com").trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_NAME || "Driss Olivier Bado";
  const nickname = normalizeNickname(process.env.ADMIN_NICKNAME || "idriss-bado");

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`User already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name,
      nickname,
      passwordHash,
      role: "admin",
    },
  });

  console.log(`Created admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
