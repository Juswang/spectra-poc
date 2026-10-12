import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: "ADMIN", description: "Full access — manage users, roles, agencies, see all data" },
    { name: "EDITOR", description: "Can modify dashboard configurations" },
    { name: "VIEWER", description: "Read-only access to dashboards scoped to their agency" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  const agencies = [
    { name: "Government Technology Agency", code: "GOVTECH" },
    { name: "Ministry of Health", code: "MOH" },
    { name: "Ministry of Education", code: "MOE" },
    { name: "Ministry of Finance", code: "MOF" },
  ];

  for (const agency of agencies) {
    await prisma.agency.upsert({
      where: { code: agency.code },
      update: { name: agency.name },
      create: agency,
    });
  }

  console.log("Seeded 3 roles and 4 agencies");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });