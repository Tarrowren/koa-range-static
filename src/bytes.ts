const UNIT_MAP: Record<Unit, number> = {
  B: 1,
  KB: 1024,
  MB: Math.pow(1024, 2),
  GB: Math.pow(1024, 3),
  TB: Math.pow(1024, 4),
  PB: Math.pow(1024, 5),
};

type Unit = "PB" | "TB" | "GB" | "MB" | "KB" | "B";

export function format(value: number) {
  let unit: Unit;
  if (value >= UNIT_MAP.PB) {
    unit = "PB";
  } else if (value >= UNIT_MAP.TB) {
    unit = "TB";
  } else if (value >= UNIT_MAP.GB) {
    unit = "GB";
  } else if (value >= UNIT_MAP.MB) {
    unit = "MB";
  } else if (value >= UNIT_MAP.KB) {
    unit = "KB";
  } else {
    unit = "B";
  }

  return (value / UNIT_MAP[unit]).toFixed(2) + " " + unit;
}
