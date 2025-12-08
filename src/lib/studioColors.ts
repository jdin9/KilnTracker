export type StudioColor = {
  id: number;
  name: string;
  brand: string;
  retired: boolean;
};

export const initialStudioColors: StudioColor[] = [];

export const getActiveStudioColors = (colors: StudioColor[]) =>
  colors.filter((color) => !color.retired);
