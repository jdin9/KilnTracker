// Shared domain types mirroring Prisma models for UI and tRPC input/output shapes.
// These are intentionally simplified (e.g., numeric IDs replaced by string IDs) to keep
// client contracts stable even if database specifics evolve.

export enum ControlType {
  MANUAL_SWITCHES = 'MANUAL_SWITCHES',
  MANUAL_DIAL = 'MANUAL_DIAL',
}

export enum FiringType {
  BISQUE = 'BISQUE',
  GLAZE = 'GLAZE',
}

export enum FillLevel {
  SPREAD_OUT = 'SPREAD_OUT',
  MODERATELY_FULL = 'MODERATELY_FULL',
  VERY_FULL = 'VERY_FULL',
}

export enum FiringStatus {
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  ABORTED = 'ABORTED',
  TEST = 'TEST',
}

export enum FiringEventType {
  SWITCH_ON = 'SWITCH_ON',
  SWITCH_OFF = 'SWITCH_OFF',
  LID_OPEN = 'LID_OPEN',
  LID_CLOSED = 'LID_CLOSED',
  TEMP_READING = 'TEMP_READING',
  NOTE = 'NOTE',
}

export enum SwitchPosition {
  OFF = 'OFF',
  LOW = 'LOW',
  MED = 'MED',
  HIGH = 'HIGH',
}

export enum StepType {
  GLAZE = 'GLAZE',
  FIRING = 'FIRING',
}

export enum ApplicationMethod {
  DIP = 'DIP',
  BRUSH = 'BRUSH',
  POUR = 'POUR',
  SPRAY = 'SPRAY',
  OTHER = 'OTHER',
}

export interface Studio {
  id: string;
  name: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  studioId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Kiln {
  id: string;
  studioId: string;
  name: string;
  controlType: ControlType;
  numSwitches?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface KilnMaintenanceEntry {
  id: string;
  kilnId: string;
  date: Date;
  maintenanceType: string;
  notes?: string | null;
}

export interface Firing {
  id: string;
  kilnId: string;
  startedByUserId: string;
  firingType: FiringType;
  targetCone: string;
  fillLevel: FillLevel;
  outsideTempStart: number;
  startTime: Date;
  sitterDropTime?: Date | null;
  coneUsed?: string | null;
  status: FiringStatus;
  maxTemp?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FiringEvent {
  id: string;
  firingId: string;
  timestamp: Date;
  eventType: FiringEventType;
  switchIndex?: number | null;
  newSwitchPosition?: SwitchPosition | null;
  dialSetting?: string | null;
  pyrometerTemp?: number | null;
  noteText?: string | null;
}

export interface Glaze {
  id: string;
  studioId: string;
  name: string;
  brand?: string | null;
  color?: string | null;
  coneRange?: string | null;
  notes?: string | null;
}

export interface ClayBody {
  id: string;
  studioId: string;
  name: string;
  typicalBisqueTemp?: number | null;
  notes?: string | null;
}

export interface Project {
  id: string;
  studioId: string;
  createdByUserId: string;
  clayBodyId: string;
  hasBeenBisque: boolean;
  bisqueTemp?: number | null;
  makerName: string;
  title?: string | null;
  createdAt: Date;
  notes?: string | null;
}

export interface ProjectStepBase {
  id: string;
  projectId: string;
  stepOrder: number;
  stepType: StepType;
  createdAt: Date;
  createdByUserId: string;
  notes?: string | null;
}

export interface ProjectStepGlaze extends ProjectStepBase {
  stepType: StepType.GLAZE;
  glazeId: string;
  numCoats: number;
  applicationMethod: ApplicationMethod;
  patternDescription?: string | null;
}

export interface ProjectStepFiring extends ProjectStepBase {
  stepType: StepType.FIRING;
  firingId?: string | null;
  localCone?: string | null;
  localPeakTemp?: number | null;
  firingDate?: Date | null;
}

export type ProjectStep = ProjectStepGlaze | ProjectStepFiring;

export interface Photo {
  id: string;
  parentStepId: string;
  filePathOrUrl: string;
  isCoverForProject: boolean;
  createdAt: Date;
}

