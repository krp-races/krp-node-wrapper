export function readStringLines(buffer: Buffer) {
  return buffer
    .toString("utf8")
    .split("\n")
    .filter((n) => n.length > 0);
}
