const currencyFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR"
});

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
  timeStyle: "short"
});

export function formatCurrency(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "n/d";
  }

  return currencyFormatter.format(value);
}

export function formatDate(value) {
  if (!value) {
    return "n/d";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "n/d";
  }

  return dateFormatter.format(parsed);
}

export function formatUnitPrice(unitPrice, unit) {
  if (typeof unitPrice !== "number" || Number.isNaN(unitPrice)) {
    return "n/d";
  }

  return `${formatCurrency(unitPrice)}/${unit || "un"}`;
}

export function formatSize(size, sizeUnit) {
  if (size === null || size === undefined || size === "") {
    return "n/d";
  }

  return `${size} ${sizeUnit || ""}`.trim();
}

