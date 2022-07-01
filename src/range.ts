export function parseRangeRequests(
  text: string,
  size: number
): [number, number][] {
  const token = text.split("=");
  if (token.length !== 2 || token[0] !== "bytes") return [];

  return token[1]
    .split(",")
    .map((v) => parseRange(v, size))
    .filter(([start, end]) => !isNaN(start) && !isNaN(end) && start <= end);
}

function parseRange(text: string, size: number): [number, number] {
  const token = text.split("-");
  if (token.length !== 2) return NaNArray;

  const startText = token[0].trim();
  const endText = token[1].trim();

  if (startText === "") {
    if (endText === "") {
      return NaNArray;
    } else {
      let start = size - Number(endText);
      if (start < 0) start = 0;
      return [start, size - 1];
    }
  } else {
    if (endText === "") {
      return [Number(startText), size - 1];
    } else {
      let end = Number(endText);
      if (end >= size) end = size - 1;
      return [Number(startText), end];
    }
  }
}

const NaNArray: [number, number] = [NaN, NaN];
