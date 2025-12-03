export type ConeChartEntry = {
  cone: string;
  temperatureF: number;
};

export const coneChart: ConeChartEntry[] = [
  { cone: "10", temperatureF: 2381 },
  { cone: "9", temperatureF: 2336 },
  { cone: "8", temperatureF: 2305 },
  { cone: "7", temperatureF: 2264 },
  { cone: "6", temperatureF: 2232 },
  { cone: "5", temperatureF: 2194 },
  { cone: "4", temperatureF: 2157 },
  { cone: "3", temperatureF: 2134 },
  { cone: "2", temperatureF: 2124 },
  { cone: "1", temperatureF: 2118 },
  { cone: "01", temperatureF: 2084 },
  { cone: "02", temperatureF: 2068 },
  { cone: "03", temperatureF: 2052 },
  { cone: "04", temperatureF: 2030 },
  { cone: "05", temperatureF: 2014 },
  { cone: "06", temperatureF: 1940 },
  { cone: "07", temperatureF: 1888 },
  { cone: "08", temperatureF: 1830 },
  { cone: "09", temperatureF: 1789 },
  { cone: "010", temperatureF: 1753 },
  { cone: "011", temperatureF: 1693 },
  { cone: "012", temperatureF: 1673 },
  { cone: "013", temperatureF: 1641 },
  { cone: "014", temperatureF: 1623 },
  { cone: "015", temperatureF: 1607 },
  { cone: "016", temperatureF: 1566 },
  { cone: "017", temperatureF: 1540 },
  { cone: "018", temperatureF: 1450 },
  { cone: "019", temperatureF: 1377 },
  { cone: "020", temperatureF: 1323 },
  { cone: "021", temperatureF: 1261 },
  { cone: "022", temperatureF: 1180 },
];

export function getConeTemperature(cone: string): number | undefined {
  return coneChart.find((entry) => entry.cone === cone)?.temperatureF;
}
