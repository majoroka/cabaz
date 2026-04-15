import categories from "../data/categories.json";
import { slugify } from "./helpers.js";

const LEGACY_CATEGORY_MAP = {
  conservas: "mercearia",
  frescos: "lacteos_ovos",
  fruta: "fruta_legumes",
  "higiene-do-lar": "limpeza_casa",
  laticinios: "lacteos_ovos",
  limpeza: "limpeza_casa",
  mercearia: "mercearia",
  talho: "talho"
};

export function getCategoryOptions() {
  return categories;
}

export function normalizeCategoryId(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return "mercearia";
  }

  if (categories.some((category) => category.id === rawValue)) {
    return rawValue;
  }

  const slug = slugify(rawValue);
  const categoryByName = categories.find((category) => slugify(category.name) === slug);

  return categoryByName?.id || LEGACY_CATEGORY_MAP[slug] || rawValue;
}

export function getCategoryName(categoryId) {
  return categories.find((category) => category.id === categoryId)?.name || categoryId || "Sem categoria";
}
