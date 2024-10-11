export function writeStringLines(lines: string[]) {
  return Buffer.from(lines.join("\n") + "\n", "utf8");
}
