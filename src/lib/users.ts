export type User = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
};

export const initialUsers: User[] = [
  {
    id: 1,
    firstName: "Jamie",
    lastName: "Rivera",
    username: "jrivera",
    password: "wheelThrow123",
  },
  {
    id: 2,
    firstName: "Taylor",
    lastName: "Shaw",
    username: "tshaw",
    password: "glazeGuard!",
  },
  {
    id: 3,
    firstName: "Morgan",
    lastName: "Lee",
    username: "mlee",
    password: "kilnSafe2024",
  },
];
