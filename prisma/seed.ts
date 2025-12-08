import { PrismaClient, ApplicationMethod, ControlType, FiringEventType, FiringStatus, FiringType, FillLevel, StepType, SwitchPosition } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data for idempotent seeding in development
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
      name: "Kiln Collective Studio",
      notes: "Seeded studio for development",
    },
  });

  const [alice, bob] = await Promise.all([
    prisma.user.create({
      data: {
        email: "alice@example.com",
        passwordHash: "hashed-password",
        displayName: "Alice Potter",
        studioId: studio.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "bob@example.com",
        passwordHash: "hashed-password",
        displayName: "Bob Potter",
        studioId: studio.id,
      },
    }),
  ]);

  const [bigKiln, tinyKiln] = await Promise.all([
    prisma.kiln.create({
      data: {
        studioId: studio.id,
        name: "Big Manual Kiln",
        controlType: ControlType.MANUAL_SWITCHES,
        numSwitches: 4,
        notes: "Main studio kiln with four switches",
      },
    }),
    prisma.kiln.create({
      data: {
        studioId: studio.id,
        name: "Tiny Test Kiln",
        controlType: ControlType.MANUAL_DIAL,
        numSwitches: null,
        notes: "Small test kiln with dial control",
      },
    }),
  ]);

  await prisma.glaze.createMany({
    data: [
      { studioId: studio.id, name: "Fog", brand: "Studio", color: "Gray", coneRange: "5-6" },
      { studioId: studio.id, name: "Seaweed", brand: "Studio", color: "Green", coneRange: "5-6" },
      { studioId: studio.id, name: "Carbon Trap", brand: "Studio", color: "Black", coneRange: "10" },
    ],
  });

  const glazeRecords = await prisma.glaze.findMany({ where: { studioId: studio.id } });

  await prisma.clayBody.createMany({
    data: [
      { studioId: studio.id, name: "Speckled Stoneware", typicalBisqueTemp: 1828 },
      { studioId: studio.id, name: "Porcelain", typicalBisqueTemp: 1828 },
    ],
  });

  const clayBodyRecords = await prisma.clayBody.findMany({ where: { studioId: studio.id } });

  const firingStart = new Date();
  const sitterDrop = new Date(firingStart.getTime() + 4 * 60 * 60 * 1000);
  const exampleFiring = await prisma.firing.create({
    data: {
      kilnId: bigKiln.id,
      startedByUserId: alice.id,
      firingType: FiringType.GLAZE,
      targetCone: "6",
      fillLevel: FillLevel.MODERATELY_FULL,
      outsideTempStart: 72,
      startTime: firingStart,
      sitterDropTime: sitterDrop,
      coneUsed: "6",
      status: FiringStatus.COMPLETED,
      maxTemp: 2232,
      notes: "Sample glaze firing for seed data",
    },
  });

  const eventsTimeline = [
    { minutes: 0, type: FiringEventType.SWITCH_ON, switchIndex: 0, newSwitchPosition: SwitchPosition.LOW },
    { minutes: 0, type: FiringEventType.SWITCH_ON, switchIndex: 1, newSwitchPosition: SwitchPosition.LOW },
    { minutes: 30, type: FiringEventType.TEMP_READING, pyrometerTemp: 250 },
    { minutes: 60, type: FiringEventType.SWITCH_ON, switchIndex: 2, newSwitchPosition: SwitchPosition.MED },
    { minutes: 90, type: FiringEventType.TEMP_READING, pyrometerTemp: 1200 },
    { minutes: 120, type: FiringEventType.SWITCH_ON, switchIndex: 3, newSwitchPosition: SwitchPosition.MED },
    { minutes: 150, type: FiringEventType.TEMP_READING, pyrometerTemp: 1800 },
    { minutes: 180, type: FiringEventType.NOTE, noteText: "Approaching cone 6" },
    { minutes: 210, type: FiringEventType.TEMP_READING, pyrometerTemp: 2232 },
  ];

  await prisma.firingEvent.createMany({
    data: eventsTimeline.map((entry) => ({
      firingId: exampleFiring.id,
      timestamp: new Date(firingStart.getTime() + entry.minutes * 60 * 1000),
      eventType: entry.type,
      switchIndex: entry.switchIndex ?? null,
      newSwitchPosition: entry.newSwitchPosition ?? null,
      dialSetting: null,
      pyrometerTemp: entry.pyrometerTemp ?? null,
      noteText: entry.noteText ?? null,
    })),
  });

  const project = await prisma.project.create({
    data: {
      studioId: studio.id,
      createdByUserId: bob.id,
      clayBodyId: clayBodyRecords[0]!.id,
      hasBeenBisque: true,
      bisqueTemp: 1828,
      makerName: "Bob Potter",
      title: "Seaweed over Fog Mug",
      notes: "Example project combining Fog base with Seaweed overlay.",
      steps: {
        create: [
          {
            stepOrder: 1,
            stepType: StepType.GLAZE,
            createdByUserId: bob.id,
            notes: "Base layer dip in Fog glaze",
            glazeStep: {
              create: {
                glazeId: glazeRecords.find((g) => g.name === "Fog")!.id,
                numCoats: 2,
                applicationMethod: ApplicationMethod.DIP,
                patternDescription: "Full dip, rim cleaned",
              },
            },
            photos: {
              create: [
                {
                  filePathOrUrl: "https://example.com/photos/fog-layer.jpg",
                  isCoverForProject: false,
                },
              ],
            },
          },
          {
            stepOrder: 2,
            stepType: StepType.GLAZE,
            createdByUserId: bob.id,
            notes: "Seaweed accent on rim and handle",
            glazeStep: {
              create: {
                glazeId: glazeRecords.find((g) => g.name === "Seaweed")!.id,
                numCoats: 3,
                applicationMethod: ApplicationMethod.BRUSH,
                patternDescription: "Rim and handle banding",
              },
            },
          },
          {
            stepOrder: 3,
            stepType: StepType.FIRING,
            createdByUserId: bob.id,
            notes: "Glaze firing in Big Manual Kiln",
            firingStep: {
              create: {
                firingId: exampleFiring.id,
                localCone: exampleFiring.coneUsed,
                localPeakTemp: exampleFiring.maxTemp,
                firingDate: exampleFiring.startTime,
              },
            },
            photos: {
              create: [
                {
                  filePathOrUrl: "https://example.com/photos/finished-mug.jpg",
                  isCoverForProject: true,
                },
              ],
            },
          },
        ],
      },
    },
    include: { steps: true },
  });

  console.log({ studio, users: [alice, bob], kilns: [bigKiln, tinyKiln], firing: exampleFiring, project });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
