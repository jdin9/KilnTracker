export type StudioColor = {
  id: number;
  name: string;
  brand: string;
  retired: boolean;
};

export const initialStudioColors: StudioColor[] = [
  { id: 1, name: "Celadon", brand: "Amaco", retired: false },
  { id: 2, name: "Shino", brand: "Coyote", retired: false },
  { id: 3, name: "Tenmoku", brand: "Laguna", retired: true },
  { id: 4, name: "Floating Blue", brand: "Amaco", retired: false },
  { id: 5, name: "Satin White", brand: "Spectrum", retired: false },
];

export const getActiveStudioColors = (colors: StudioColor[]) =>
  colors.filter((color) => !color.retired);
