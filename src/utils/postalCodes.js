function normalizeLookupText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildStreetLabel(columns) {
  return [columns[5], columns[6], columns[7], columns[8], columns[9], columns[10]]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ");
}

export function normalizePostalCodeInput(value) {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .slice(0, 7);

  if (digits.length <= 4) {
    return digits;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

export function createPostalCodeIndex(rawText) {
  const lookup = new Map();
  const byPrefix4 = new Map();
  const lines = String(rawText || "").split(/\r?\n/);

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line) {
      continue;
    }

    const columns = line.split("\t");
    const numCode = columns[14]?.trim();
    const extCode = columns[15]?.trim();
    const locality = columns[3]?.trim() || "";
    const postalLabel = columns[16]?.trim() || locality || "";
    const street = buildStreetLabel(columns);

    if (!/^\d{4}$/.test(numCode) || !/^\d{3}$/.test(extCode)) {
      continue;
    }

    const code = `${numCode}-${extCode}`;
    const existingRecord = lookup.get(code);

    if (existingRecord) {
      if (street) {
        existingRecord.streetSet.add(street);
      }
      continue;
    }

    const record = {
      code,
      label: locality || postalLabel,
      postalArea: postalLabel,
      normalizedLabel: normalizeLookupText(locality || postalLabel),
      normalizedPostalArea: normalizeLookupText(postalLabel),
      streetSet: new Set(street ? [street] : [])
    };

    lookup.set(code, record);
  }

  const records = [...lookup.values()]
    .map((record) => {
      const streets = [...record.streetSet].sort((left, right) => left.localeCompare(right, "pt"));

      return {
        code: record.code,
        label: record.label,
        postalArea: record.postalArea,
        normalizedLabel: record.normalizedLabel,
        normalizedPostalArea: record.normalizedPostalArea,
        streets,
        normalizedStreets: streets.map((street) => normalizeLookupText(street))
      };
    })
    .sort((left, right) => {
      const labelComparison = left.label.localeCompare(right.label, "pt");

      if (labelComparison !== 0) {
        return labelComparison;
      }

      return left.code.localeCompare(right.code, "pt");
    });

  records.forEach((record) => {
    const prefix = record.code.slice(0, 4);
    const entries = byPrefix4.get(prefix) || [];
    entries.push(record);
    byPrefix4.set(prefix, entries);
  });

  return {
    lookup,
    byPrefix4,
    records
  };
}

export function findPostalCodeRecord(index, value) {
  const normalized = normalizePostalCodeInput(value);
  const exactCodeMatch = index.lookup.get(normalized);

  if (exactCodeMatch) {
    return exactCodeMatch;
  }

  const normalizedText = normalizeLookupText(value);

  if (!normalizedText) {
    return null;
  }

  return (
    index.records.find(
      (record) =>
        record.normalizedLabel === normalizedText ||
        record.normalizedPostalArea === normalizedText ||
        record.normalizedStreets.includes(normalizedText)
    ) || null
  );
}

export function getPostalCodeSuggestions(index, value, limit = 50) {
  const normalized = normalizePostalCodeInput(value);
  const normalizedText = normalizeLookupText(value);
  const digits = normalized.replace(/\D/g, "");

  if (!digits && normalizedText.length < 2) {
    return [];
  }

  if (digits.length >= 4) {
    const candidates = index.byPrefix4.get(digits.slice(0, 4)) || [];

    return candidates.filter((record) => record.code.startsWith(normalized)).slice(0, limit);
  }

  return index.records
    .filter(
      (record) =>
        record.normalizedLabel.startsWith(normalizedText) ||
        record.normalizedPostalArea.startsWith(normalizedText) ||
        record.normalizedStreets.some((street) => street.startsWith(normalizedText))
    )
    .slice(0, limit);
}
