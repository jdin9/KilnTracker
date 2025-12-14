import crypto from "node:crypto";

// Prisma-like enums
export enum ControlType {
  MANUAL_SWITCHES = "MANUAL_SWITCHES",
  MANUAL_DIAL = "MANUAL_DIAL",
}

export enum FiringType {
  BISQUE = "BISQUE",
  GLAZE = "GLAZE",
}

export enum FillLevel {
  SPREAD_OUT = "SPREAD_OUT",
  MODERATELY_FULL = "MODERATELY_FULL",
  VERY_FULL = "VERY_FULL",
}

export enum FiringStatus {
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  ABORTED = "ABORTED",
  TEST = "TEST",
}

export enum FiringEventType {
  SWITCH_ON = "SWITCH_ON",
  SWITCH_OFF = "SWITCH_OFF",
  LID_OPEN = "LID_OPEN",
  LID_CLOSED = "LID_CLOSED",
  TEMP_READING = "TEMP_READING",
  NOTE = "NOTE",
}

export enum SwitchPosition {
  OFF = "OFF",
  LOW = "LOW",
  MED = "MED",
  HIGH = "HIGH",
}

export enum StepType {
  GLAZE = "GLAZE",
  FIRING = "FIRING",
}

export enum ApplicationMethod {
  DIP = "DIP",
  BRUSH = "BRUSH",
  POUR = "POUR",
  SPRAY = "SPRAY",
  OTHER = "OTHER",
}

export type Studio = {
  id: string;
  name: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  studioId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Kiln = {
  id: string;
  studioId: string;
  name: string;
  controlType: ControlType;
  numSwitches: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Glaze = {
  id: string;
  studioId: string;
  name: string;
  brand?: string | null;
  color?: string | null;
  coneRange?: string | null;
  notes?: string | null;
};

export type ClayBody = {
  id: string;
  studioId: string;
  name: string;
  typicalBisqueTemp?: number | null;
  notes?: string | null;
};

export type Firing = {
  id: string;
  kilnId: string;
  startedByUserId: string;
  firingType: FiringType;
  targetCone: string;
  fillLevel: FillLevel;
  outsideTempStart: number;
  startTime: Date;
  sitterDropTime: Date | null;
  coneUsed: string | null;
  status: FiringStatus;
  maxTemp: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FiringEvent = {
  id: string;
  firingId: string;
  timestamp: Date;
  eventType: FiringEventType;
  switchIndex: number | null;
  newSwitchPosition: SwitchPosition | null;
  dialSetting: string | null;
  pyrometerTemp: number | null;
  noteText: string | null;
};

export type Project = {
  id: string;
  studioId: string;
  createdByUserId: string;
  clayBodyId: string;
  hasBeenBisque: boolean;
  bisqueTemp: number | null;
  makerName: string;
  title: string | null;
  notes: string | null;
  createdAt: Date;
};

export type ProjectStep = {
  id: string;
  projectId: string;
  stepOrder: number;
  stepType: StepType;
  createdAt: Date;
  createdByUserId: string;
  notes: string | null;
};

export type ProjectStepGlaze = {
  stepId: string;
  glazeId: string;
  numCoats: number;
  applicationMethod: ApplicationMethod;
  patternDescription: string | null;
};

export type ProjectStepFiring = {
  stepId: string;
  firingId: string | null;
  localCone: string | null;
  localPeakTemp: number | null;
  firingDate: Date | null;
};

export type Photo = {
  id: string;
  parentStepId: string;
  filePathOrUrl: string;
  isCoverForProject: boolean;
  createdAt: Date;
};

export type KilnMaintenanceEntry = {
  id: string;
  kilnId: string;
  date: Date;
  maintenanceType: string;
  notes: string | null;
};

const uuid = () => crypto.randomUUID();

function cloneDate(value: Date | null | undefined) {
  return value ? new Date(value) : value ?? null;
}

function normalizeDate(value: Date | string | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

type RangeFilter<T> = { gte?: T; lte?: T };

class PrismaClient {
  studios: Studio[] = [];
  users: User[] = [];
  kilns: Kiln[] = [];
  glazes: Glaze[] = [];
  clayBodies: ClayBody[] = [];
  firings: Firing[] = [];
  firingEvents: FiringEvent[] = [];
  projects: Project[] = [];
  projectSteps: ProjectStep[] = [];
  projectStepGlazes: ProjectStepGlaze[] = [];
  projectStepFirings: ProjectStepFiring[] = [];
  photos: Photo[] = [];
  kilnMaintenanceEntries: KilnMaintenanceEntry[] = [];

  private matchWhere<T extends Record<string, any>>(record: T, where?: any): boolean {
    if (!where) return true;
    for (const [key, value] of Object.entries(where)) {
      const current = (record as any)[key];
      if (value && typeof value === "object" && !(value instanceof Date)) {
        if (key === "kiln" && (value as any).studioId) {
          const kiln = this.kilns.find((k) => k.id === (record as any).kilnId);
          if (!kiln || kiln.studioId !== (value as any).studioId) return false;
          continue;
        }

        if ("contains" in value) {
          const compare = (current ?? "") as string;
          if (!compare.toLowerCase().includes(String((value as any).contains).toLowerCase())) return false;
          continue;
        }

        if ("gte" in value || "lte" in value) {
          const gte = (value as RangeFilter<any>).gte;
          const lte = (value as RangeFilter<any>).lte;
          if (gte !== undefined && current < gte) return false;
          if (lte !== undefined && current > lte) return false;
          continue;
        }
      }

      if (current !== value) return false;
    }
    return true;
  }

  private sortBy<T>(items: T[], orderBy?: { [key: string]: "asc" | "desc" }) {
    if (!orderBy) return items;
    const [[key, direction]] = Object.entries(orderBy);
    return [...items].sort((a: any, b: any) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal === bVal) return 0;
      const result = aVal > bVal ? 1 : -1;
      return direction === "desc" ? -result : result;
    });
  }

  studio = {
    deleteMany: async () => {
      const count = this.studios.length;
      this.studios = [];
      return { count };
    },
    create: async ({ data }: { data: Partial<Studio> }) => {
      const studio: Studio = {
        id: uuid(),
        name: data.name ?? "Studio",
        notes: data.notes ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.studios.push(studio);
      return studio;
    },
  };

  user = {
    deleteMany: async () => {
      const count = this.users.length;
      this.users = [];
      return { count };
    },
    create: async ({ data }: { data: Partial<User> }) => {
      const user: User = {
        id: uuid(),
        email: data.email ?? "user@example.com",
        passwordHash: data.passwordHash ?? "",
        displayName: data.displayName ?? "User",
        studioId: data.studioId ?? this.studios[0]?.id ?? uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.push(user);
      return user;
    },
  };

  kiln = {
    deleteMany: async () => {
      const count = this.kilns.length;
      this.kilns = [];
      return { count };
    },
    findFirst: async ({ where }: { where: Partial<Kiln> }) =>
      this.kilns.find((k) => this.matchWhere(k, where)) ?? null,
    create: async ({ data }: { data: Partial<Kiln> }) => {
      const kiln: Kiln = {
        id: uuid(),
        studioId: data.studioId ?? this.studios[0]?.id ?? uuid(),
        name: data.name ?? "Kiln",
        controlType: data.controlType ?? ControlType.MANUAL_DIAL,
        numSwitches: data.numSwitches ?? null,
        notes: data.notes ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.kilns.push(kiln);
      return kiln;
    },
  };

  kilnMaintenanceEntry = {
    deleteMany: async () => {
      const count = this.kilnMaintenanceEntries.length;
      this.kilnMaintenanceEntries = [];
      return { count };
    },
  };

  glaze = {
    deleteMany: async () => {
      const count = this.glazes.length;
      this.glazes = [];
      return { count };
    },
    createMany: async ({ data }: { data: Partial<Glaze>[] }) => {
      data.forEach((entry) => {
        this.glazes.push({
          id: uuid(),
          studioId: entry.studioId ?? this.studios[0]?.id ?? uuid(),
          name: entry.name ?? "Glaze",
          brand: entry.brand ?? null,
          color: entry.color ?? null,
          coneRange: entry.coneRange ?? null,
          notes: entry.notes ?? null,
        });
      });
      return { count: data.length };
    },
    findMany: async ({ where }: { where?: Partial<Glaze> } = {}) =>
      this.glazes.filter((g) => this.matchWhere(g, where)),
    findFirst: async ({ where }: { where: Partial<Glaze> }) =>
      this.glazes.find((g) => this.matchWhere(g, where)) ?? null,
  };

  clayBody = {
    deleteMany: async () => {
      const count = this.clayBodies.length;
      this.clayBodies = [];
      return { count };
    },
    createMany: async ({ data }: { data: Partial<ClayBody>[] }) => {
      data.forEach((entry) => {
        this.clayBodies.push({
          id: uuid(),
          studioId: entry.studioId ?? this.studios[0]?.id ?? uuid(),
          name: entry.name ?? "Clay body",
          typicalBisqueTemp: entry.typicalBisqueTemp ?? null,
          notes: entry.notes ?? null,
        });
      });
      return { count: data.length };
    },
    findMany: async ({ where }: { where?: Partial<ClayBody> } = {}) =>
      this.clayBodies.filter((c) => this.matchWhere(c, where)),
    findFirst: async ({ where }: { where: Partial<ClayBody> }) =>
      this.clayBodies.find((c) => this.matchWhere(c, where)) ?? null,
  };

  firing = {
    deleteMany: async () => {
      const count = this.firings.length;
      this.firings = [];
      return { count };
    },
    findFirst: async ({ where }: { where: any }) =>
      this.firings.find((f) => this.matchWhere(f, where)) ?? null,
    findMany: async ({ where, orderBy, select }: { where?: any; orderBy?: any; select?: any } = {}) => {
      const filtered = this.firings.filter((f) => this.matchWhere(f, where));
      const sorted = this.sortBy(filtered, orderBy);
      if (select) {
        return sorted.map((item) => {
          const partial: Record<string, any> = {};
          Object.keys(select).forEach((key) => {
            if (select[key]) partial[key] = (item as any)[key];
          });
          return partial;
        }) as any[];
      }
      return sorted as any[];
    },
    create: async ({ data }: { data: Partial<Firing> }) => {
      const now = new Date();
      const firing: Firing = {
        id: uuid(),
        kilnId: data.kilnId!,
        startedByUserId: data.startedByUserId!,
        firingType: data.firingType ?? FiringType.BISQUE,
        targetCone: data.targetCone ?? "",
        fillLevel: data.fillLevel ?? FillLevel.SPREAD_OUT,
        outsideTempStart: data.outsideTempStart ?? 0,
        startTime: normalizeDate((data as any).startTime) ?? now,
        sitterDropTime: normalizeDate((data as any).sitterDropTime),
        coneUsed: (data as any).coneUsed ?? null,
        status: data.status ?? FiringStatus.ONGOING,
        maxTemp: (data as any).maxTemp ?? null,
        notes: (data as any).notes ?? null,
        createdAt: now,
        updatedAt: now,
      };
      this.firings.push(firing);
      return firing;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Firing> }) => {
      const firing = this.firings.find((f) => f.id === where.id);
      if (!firing) throw new Error("Firing not found");
      Object.assign(firing, data, { updatedAt: new Date() });
      firing.sitterDropTime = normalizeDate((firing as any).sitterDropTime);
      firing.startTime = normalizeDate((firing as any).startTime) ?? firing.startTime;
      firing.maxTemp = (firing as any).maxTemp ?? firing.maxTemp;
      return firing;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const index = this.firings.findIndex((f) => f.id === where.id);
      if (index === -1) throw new Error("Firing not found");
      const [removed] = this.firings.splice(index, 1);
      this.firingEvents = this.firingEvents.filter((e) => e.firingId !== removed.id);
      return removed;
    },
  };

  firingEvent = {
    deleteMany: async () => {
      const count = this.firingEvents.length;
      this.firingEvents = [];
      return { count };
    },
    findMany: async ({ where, orderBy, select }: { where?: any; orderBy?: any; select?: any } = {}) => {
      const filtered = this.firingEvents.filter((e) => this.matchWhere(e, where));
      const sorted = this.sortBy(filtered, orderBy);

      if (select) {
        return sorted.map((item) => {
          const partial: Record<string, any> = {};
          Object.keys(select).forEach((key) => {
            if (select[key]) partial[key] = (item as any)[key];
          });
          return partial;
        }) as any[];
      }

      return sorted as any[];
    },
    create: async ({ data }: { data: Partial<FiringEvent> }) => {
      const event: FiringEvent = {
        id: uuid(),
        firingId: data.firingId!,
        timestamp: normalizeDate(data.timestamp) ?? new Date(),
        eventType: data.eventType ?? FiringEventType.NOTE,
        switchIndex: data.switchIndex ?? null,
        newSwitchPosition: data.newSwitchPosition ?? null,
        dialSetting: data.dialSetting ?? null,
        pyrometerTemp: data.pyrometerTemp ?? null,
        noteText: data.noteText ?? null,
      };
      this.firingEvents.push(event);
      return event;
    },
    createMany: async ({ data }: { data: Partial<FiringEvent>[] }) => {
      data.forEach((entry) => {
        this.firingEvents.push({
          id: uuid(),
          firingId: entry.firingId!,
          timestamp: normalizeDate(entry.timestamp) ?? new Date(),
          eventType: entry.eventType ?? FiringEventType.NOTE,
          switchIndex: entry.switchIndex ?? null,
          newSwitchPosition: entry.newSwitchPosition ?? null,
          dialSetting: entry.dialSetting ?? null,
          pyrometerTemp: entry.pyrometerTemp ?? null,
          noteText: entry.noteText ?? null,
        });
      });
      return { count: data.length };
    },
  };

  project = {
    deleteMany: async () => {
      const count = this.projects.length;
      this.projects = [];
      return { count };
    },
    findFirst: async ({ where, include }: { where: any; include?: any }) => {
      const project = this.projects.find((p) => this.matchWhere(p, where));
      if (!project) return null;

      if (!include) return project;

      const clayBody = include.clayBody ? this.clayBodies.find((c) => c.id === project.clayBodyId) ?? null : undefined;
      const steps = include.steps
        ? this.projectSteps
            .filter((s) => s.projectId === project.id)
            .sort((a, b) => a.stepOrder - b.stepOrder)
            .map((step) => this.attachStepRelations(step, include.steps.include))
        : undefined;

      return {
        ...project,
        clayBody,
        steps,
      } as any;
    },
    create: async ({ data, include }: { data: any; include?: any }) => {
      const project: Project = {
        id: uuid(),
        studioId: data.studioId!,
        createdByUserId: data.createdByUserId!,
        clayBodyId: data.clayBodyId!,
        hasBeenBisque: Boolean(data.hasBeenBisque),
        bisqueTemp: data.bisqueTemp ?? null,
        makerName: data.makerName ?? "",
        title: (data as any).title ?? null,
        notes: (data as any).notes ?? null,
        createdAt: new Date(),
      };
      this.projects.push(project);

      if (data.steps?.create?.length) {
        data.steps.create.forEach((stepData: any) => {
          this.projectStep.create({
            data: {
              ...stepData,
              projectId: project.id,
              createdByUserId: stepData.createdByUserId ?? project.createdByUserId,
            },
          });
        });
      }

      if (include?.steps) {
        const steps = this.projectSteps
          .filter((s) => s.projectId === project.id)
          .sort((a, b) => a.stepOrder - b.stepOrder)
          .map((step) => this.attachStepRelations(step, typeof include.steps === "object" ? include.steps.include : undefined));

        return { ...project, steps } as any;
      }

      return project;
    },
  };

  projectStep = {
    deleteMany: async () => {
      const count = this.projectSteps.length;
      this.projectSteps = [];
      return { count };
    },
    aggregate: async ({ where }: { where: any; _max?: any }) => {
      const steps = this.projectSteps.filter((s) => this.matchWhere(s, where));
      const max = steps.reduce((acc, step) => Math.max(acc, step.stepOrder), 0);
      return { _max: { stepOrder: max || null } } as any;
    },
    create: async ({ data }: { data: any }) => {
      const step: ProjectStep = {
        id: uuid(),
        projectId: data.projectId,
        stepOrder: data.stepOrder,
        stepType: data.stepType,
        createdAt: new Date(),
        createdByUserId: data.createdByUserId,
        notes: data.notes ?? null,
      };
      this.projectSteps.push(step);

      if (data.glazeStep?.create) {
        this.projectStepGlazes.push({
          stepId: step.id,
          glazeId: data.glazeStep.create.glazeId,
          numCoats: data.glazeStep.create.numCoats,
          applicationMethod: data.glazeStep.create.applicationMethod,
          patternDescription: data.glazeStep.create.patternDescription ?? null,
        });
      }

      if (data.firingStep?.create) {
        this.projectStepFirings.push({
          stepId: step.id,
          firingId: data.firingStep.create.firingId ?? null,
          localCone: data.firingStep.create.localCone ?? null,
          localPeakTemp: data.firingStep.create.localPeakTemp ?? null,
          firingDate: normalizeDate(data.firingStep.create.firingDate),
        });
      }

      if (data.photos?.create?.length) {
        data.photos.create.forEach((photo: any) => {
          this.photos.push({
            id: uuid(),
            parentStepId: step.id,
            filePathOrUrl: photo.filePathOrUrl,
            isCoverForProject: Boolean(photo.isCoverForProject),
            createdAt: new Date(),
          });
        });
      }

      return this.attachStepRelations(step, data.include);
    },
    findMany: async ({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any } = {}) => {
      const steps = this.projectSteps.filter((s) => this.matchWhere(s, where));
      const sorted = this.sortBy(steps, orderBy);
      return sorted.map((step) => this.attachStepRelations(step, include));
    },
  };

  projectStepGlaze = {
    deleteMany: async () => {
      const count = this.projectStepGlazes.length;
      this.projectStepGlazes = [];
      return { count };
    },
  };

  projectStepFiring = {
    deleteMany: async () => {
      const count = this.projectStepFirings.length;
      this.projectStepFirings = [];
      return { count };
    },
  };

  photo = {
    deleteMany: async () => {
      const count = this.photos.length;
      this.photos = [];
      return { count };
    },
    create: async ({ data }: { data: any }) => {
      const photo: Photo = {
        id: uuid(),
        parentStepId: data.parentStepId,
        filePathOrUrl: data.filePathOrUrl,
        isCoverForProject: Boolean(data.isCoverForProject),
        createdAt: new Date(),
      };
      this.photos.push(photo);
      return photo;
    },
  };

  private attachStepRelations(step: ProjectStep, include?: any) {
    if (!include) return step;

    const base: any = { ...step };
    if (include.glazeStep) {
      const glazeStep = this.projectStepGlazes.find((g) => g.stepId === step.id);
      base.glazeStep = glazeStep
        ? {
            ...glazeStep,
            glaze: include.glazeStep.include?.glaze
              ? this.glazes.find((g) => g.id === glazeStep.glazeId) ?? null
              : undefined,
          }
        : null;
    }
    if (include.firingStep) {
      const firingStep = this.projectStepFirings.find((f) => f.stepId === step.id);
      base.firingStep = firingStep
        ? {
            ...firingStep,
            firing: include.firingStep.include?.firing
              ? this.firings.find((f) => f.id === firingStep.firingId) ?? null
              : undefined,
          }
        : null;
    }
    if (include.photos) {
      base.photos = this.photos.filter((p) => p.parentStepId === step.id);
    }
    return base;
  }

  async $disconnect() {
    return Promise.resolve();
  }
}

export { PrismaClient };
