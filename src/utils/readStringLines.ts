export function readStringLines(buffer: Buffer) {
  return buffer.toString("utf8").split("\n");
}
