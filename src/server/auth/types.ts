export type UserRole = 'ADMIN' | 'MEMBER';

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  studioId: string;
  role: UserRole;
}
