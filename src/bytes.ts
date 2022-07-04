const map: Record<Unit, number> = {
  B: 1,
  KB: 1 << 10,
  MB: 1 << 20,
  GB: 1 << 30,
  TB: Math.pow(1024, 4),
  PB: Math.pow(1024, 5),
};

type Unit = "PB" | "TB" | "GB" | "MB" | "KB" | "B";

export function format(value: number) {
  let unit: Unit;
  if (value >= map.PB) {
    unit = "PB";
  } else if (value >= map.TB) {
    unit = "TB";
  } else if (value >= map.GB) {
    unit = "GB";
  } else if (value >= map.MB) {
    unit = "MB";
  } else if (value >= map.KB) {
    unit = "KB";
  } else {
    unit = "B";
  }

  return (value / map[unit]).toFixed(2) + unit;
}
