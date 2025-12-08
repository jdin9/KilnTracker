export type ClayBody = {
  id: number;
  name: string;
  bisqueTemp?: number;
  notes?: string;
};

export const initialClayBodies: ClayBody[] = [
  { id: 1, name: "Stoneware 266", bisqueTemp: 1828 },
  { id: 2, name: "Porcelain P10", bisqueTemp: 1830 },
  { id: 3, name: "Speckled Buff", bisqueTemp: 1828 },
];
