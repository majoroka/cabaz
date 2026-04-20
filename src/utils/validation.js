import { isPlainObject, slugify } from "./helpers.js";
import { normalizeCategoryId } from "./categories.js";

function normalizeEnvelope(data, propertyName) {
  if (Array.isArray(data)) {
    return data;
  }

  if (isPlainObject(data) && Array.isArray(data[propertyName])) {
    return data[propertyName];
  }

  return null;
}

export function validateBasketJson(data) {
  const items = normalizeEnvelope(data, "items");

  if (!items) {
    return {
      valid: false,
      error: "O ficheiro do cabaz deve ser um array JSON ou um objeto com a propriedade items."
    };
  }

  const normalizedItems = items.map((item, index) => {
    if (!isPlainObject(item) || typeof item.name !== "string" || item.name.trim() === "") {
      throw new Error(`O item ${index + 1} do cabaz precisa de um campo name válido.`);
    }

    return {
      id: item.id || slugify(item.name),
      name: item.name.trim(),
      quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1),
      preferredStore: String(item.preferredStore || "").trim(),
      category: normalizeCategoryId(item.category),
      preferredBrand: String(item.preferredBrand || "").trim(),
      notes: String(item.notes || "").trim()
    };
  });

  return {
    valid: true,
    data: normalizedItems
  };
}
