import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data to ensure a clean slate before seeding
  await prisma.photo.deleteMany();
  await prisma.projectStepGlaze.deleteMany();
  await prisma.projectStepFiring.deleteMany();
  await prisma.projectStep.deleteMany();
  await prisma.project.deleteMany();
  await prisma.firingEvent.deleteMany();
  await prisma.firing.deleteMany();
  await prisma.kilnMaintenanceEntry.deleteMany();
  await prisma.kiln.deleteMany();
  await prisma.glaze.deleteMany();
  await prisma.clayBody.deleteMany();
  await prisma.user.deleteMany();
  await prisma.studio.deleteMany();

  const studio = await prisma.studio.create({
    data: {
      name: "My Studio",
      notes: "Empty seed for a fresh start.",
    },
  });

  console.log("Seed completed with studio:", studio);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
