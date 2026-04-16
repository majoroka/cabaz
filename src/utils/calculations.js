const UNIT_MULTIPLIERS = {
  g: { baseUnit: "kg", factor: 0.001 },
  kg: { baseUnit: "kg", factor: 1 },
  mL: { baseUnit: "L", factor: 0.001 },
  L: { baseUnit: "L", factor: 1 },
  un: { baseUnit: "un", factor: 1 }
};

export function calculateUnitPrice(price, size, sizeUnit) {
  const normalized = UNIT_MULTIPLIERS[sizeUnit];

  if (!normalized || typeof price !== "number" || typeof size !== "number" || size <= 0) {
    return null;
  }

  return price / (size * normalized.factor);
}

export function enrichResults(results) {
  return results.map((result, index) => {
    const unitPrice =
      typeof result.unitPrice === "number"
        ? result.unitPrice
        : calculateUnitPrice(result.price, result.size, result.sizeUnit);

    return {
      ...result,
      id: result.id || `${result.store}-${result.basketItemId}-${index}`,
      unitPrice,
      unit: result.unit || UNIT_MULTIPLIERS[result.sizeUnit]?.baseUnit || null
    };
  });
}
