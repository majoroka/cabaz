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

export function validateStoresJson(data) {
  const stores = normalizeEnvelope(data, "stores");

  if (!stores) {
    return {
      valid: false,
      error: "O ficheiro das lojas deve ser um array JSON ou um objeto com a propriedade stores."
    };
  }

  const normalizedStores = stores.map((store, index) => {
    if (!isPlainObject(store) || typeof store.name !== "string" || store.name.trim() === "") {
      throw new Error(`A loja ${index + 1} precisa de um campo name válido.`);
    }

    return {
      id: String(store.id || slugify(store.name)).trim(),
      name: store.name.trim(),
      website: String(store.website || "").trim(),
      themeColor: String(store.themeColor || "#51606f").trim()
    };
  });

  return {
    valid: true,
    data: normalizedStores
  };
}

export function validateResultsJson(data) {
  const results = normalizeEnvelope(data, "results");

  if (!results) {
    return {
      valid: false,
      error: "O ficheiro de resultados deve ser um array JSON ou um objeto com a propriedade results."
    };
  }

  const normalizedResults = results.map((result, index) => {
    if (!isPlainObject(result)) {
      throw new Error(`O registo ${index + 1} de resultados não é um objeto válido.`);
    }

    if (!result.basketItemId || !result.store || !result.matchedName) {
      throw new Error(
        `O registo ${index + 1} precisa de basketItemId, store e matchedName para ser aceite.`
      );
    }

    const price = Number(result.price);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`O registo ${index + 1} precisa de um campo price numérico e positivo.`);
    }

    return {
      basketItemId: String(result.basketItemId).trim(),
      store: String(result.store).trim(),
      matchedName: String(result.matchedName).trim(),
      brand: String(result.brand || "").trim(),
      price,
      size: result.size === null || result.size === undefined ? null : Number(result.size),
      sizeUnit: result.sizeUnit ? String(result.sizeUnit).trim() : null,
      unitPrice:
        result.unitPrice === null || result.unitPrice === undefined ? null : Number(result.unitPrice),
      unit: result.unit ? String(result.unit).trim() : null,
      url: String(result.url || "").trim(),
      lastUpdated: String(result.lastUpdated || "").trim(),
      inStock: result.inStock !== false,
      confidenceScore:
        result.confidenceScore === null || result.confidenceScore === undefined
          ? 0.5
          : Number(result.confidenceScore)
    };
  });

  return {
    valid: true,
    data: normalizedResults
  };
}
