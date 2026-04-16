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
    const postalLabel = columns[16]?.trim() || columns[3]?.trim() || "";

    if (!/^\d{4}$/.test(numCode) || !/^\d{3}$/.test(extCode)) {
      continue;
    }

    const code = `${numCode}-${extCode}`;

    if (lookup.has(code)) {
      continue;
    }

    const record = {
      code,
      label: postalLabel
    };

    lookup.set(code, record);

    const entries = byPrefix4.get(numCode) || [];
    entries.push(record);
    byPrefix4.set(numCode, entries);
  }

  return {
    lookup,
    byPrefix4
  };
}

export function findPostalCodeRecord(index, value) {
  const normalized = normalizePostalCodeInput(value);

  return index.lookup.get(normalized) || null;
}

export function getPostalCodeSuggestions(index, value, limit = 8) {
  const normalized = normalizePostalCodeInput(value);
  const digits = normalized.replace(/\D/g, "");

  if (digits.length < 4) {
    return [];
  }

  const candidates = index.byPrefix4.get(digits.slice(0, 4)) || [];

  return candidates.filter((record) => record.code.startsWith(normalized)).slice(0, limit);
}
