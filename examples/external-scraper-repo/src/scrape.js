import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

await mkdir(path.join(rootDir, "data", "raw"), { recursive: true });
await mkdir(path.join(rootDir, "data", "normalized"), { recursive: true });
await mkdir(path.join(rootDir, "data", "published"), { recursive: true });

console.error("Scraper real ainda não implementado.");
console.error("Implementar coletores em src/collectors/ e gerar JSON finais em data/published/.");
process.exitCode = 1;
