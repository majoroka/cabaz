import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const publishedDir = path.join(rootDir, "data", "published");
const requiredFiles = [
  "metadata.json",
  "stores.json",
  "store-locations.json",
  "catalog-products.json",
  "comparison-groups.json",
  "equivalence-rules.json",
  "postal-codes-pilot.json",
  "offers.json"
];

const errors = [];

for (const filename of requiredFiles) {
  const filePath = path.join(publishedDir, filename);

  try {
    await access(filePath);
    JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    errors.push(`${filename}: ${error.message}`);
  }
}

if (errors.length > 0) {
  console.error("Output inválido em data/published/:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("Output base válido em data/published/.");
}
