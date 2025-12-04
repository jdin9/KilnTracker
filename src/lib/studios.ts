export type Studio = {
  id: number;
  name: string;
  password: string;
};

export const initialStudios: Studio[] = [
  {
    id: 1,
    name: "Kiln Collective Studio",
    password: "clayworks123",
  },
];
