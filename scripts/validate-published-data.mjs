import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const dataDir = path.join(rootDir, "public", "data");
const publicDir = path.join(rootDir, "public");

const errors = [];
const warnings = [];

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

async function loadJson(filename) {
  const filePath = path.join(dataDir, filename);

  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    addError(`Não foi possível ler ${filename}: ${error.message}`);
    return null;
  }
}

function requireArray(value, filename) {
  if (!Array.isArray(value)) {
    addError(`${filename} deve conter um array.`);
    return [];
  }

  return value;
}

function requireObject(value, filename) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    addError(`${filename} deve conter um objeto.`);
    return {};
  }

  return value;
}

function getDuplicateValues(items, selector) {
  const seen = new Set();
  const duplicates = new Set();

  items.forEach((item) => {
    const value = selector(item);

    if (!value) {
      return;
    }

    if (seen.has(value)) {
      duplicates.add(value);
      return;
    }

    seen.add(value);
  });

  return [...duplicates];
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidConfidence(value) {
  return isFiniteNumber(value) && value >= 0 && value <= 1;
}

function normalizeLogoPath(logo) {
  return String(logo || "").replace(/^\.\//, "");
}

function validateMetadata(metadata, collections) {
  const expectedCounts = {
    storesPublished: collections.stores.length,
    storeLocationsPublished: collections.storeLocations.length,
    offersPublished: collections.offers.length,
    catalogProductsPublished: collections.catalogProducts.length,
    comparisonGroupsPublished: collections.comparisonGroups.length,
    equivalenceRulesPublished: collections.equivalenceRules.length,
    postalCodesPilotPublished: collections.postalCodesPilot.length
  };

  Object.entries(expectedCounts).forEach(([field, expected]) => {
    if (metadata[field] !== expected) {
      addError(`metadata.json: ${field}=${metadata[field]} mas foram encontrados ${expected}.`);
    }
  });

  if (metadata.currency !== "EUR") {
    addWarning("metadata.json: currency diferente de EUR.");
  }

  if (metadata.country !== "PT") {
    addWarning("metadata.json: country diferente de PT.");
  }
}

function validateStores(stores) {
  getDuplicateValues(stores, (store) => store.storeId).forEach((storeId) => {
    addError(`stores.json: storeId duplicado "${storeId}".`);
  });

  stores.forEach((store, index) => {
    const prefix = `stores.json[${index}]`;

    if (!store.storeId) {
      addError(`${prefix}: storeId obrigatório.`);
    }

    if (!store.name) {
      addError(`${prefix}: name obrigatório.`);
    }

    if (store.logo) {
      const logoPath = path.join(publicDir, normalizeLogoPath(store.logo));

      if (!existsSync(logoPath)) {
        addError(`${prefix}: logo não encontrado em public/${normalizeLogoPath(store.logo)}.`);
      }
    }
  });
}

function validateStoreLocations(storeLocations, storeIds) {
  getDuplicateValues(storeLocations, (location) => location.locationId).forEach((locationId) => {
    addError(`store-locations.json: locationId duplicado "${locationId}".`);
  });

  storeLocations.forEach((location, index) => {
    const prefix = `store-locations.json[${index}]`;

    if (!location.locationId) {
      addError(`${prefix}: locationId obrigatório.`);
    }

    if (!storeIds.has(location.storeId)) {
      addError(`${prefix}: storeId desconhecido "${location.storeId}".`);
    }

    if (!/^\d{4}-\d{3}$/.test(String(location.postalCode || ""))) {
      addWarning(`${prefix}: postalCode deve seguir o formato 0000-000.`);
    }

    if (!isFiniteNumber(location.lat) || !isFiniteNumber(location.lng)) {
      addError(`${prefix}: lat/lng obrigatórios e numéricos.`);
    }
  });
}

function validateCatalogProducts(catalogProducts, comparisonGroupIds) {
  getDuplicateValues(catalogProducts, (product) => product.productId).forEach((productId) => {
    addError(`catalog-products.json: productId duplicado "${productId}".`);
  });

  catalogProducts.forEach((product, index) => {
    const prefix = `catalog-products.json[${index}]`;

    if (!product.productId) {
      addError(`${prefix}: productId obrigatório.`);
    }

    if (!product.canonicalName) {
      addError(`${prefix}: canonicalName obrigatório.`);
    }

    if (!product.categoryId) {
      addError(`${prefix}: categoryId obrigatório.`);
    }

    if (!comparisonGroupIds.has(product.comparisonGroup)) {
      addError(`${prefix}: comparisonGroup desconhecido "${product.comparisonGroup}".`);
    }
  });
}

function validateComparisonGroups(comparisonGroups) {
  getDuplicateValues(comparisonGroups, (group) => group.comparisonGroupId).forEach((groupId) => {
    addError(`comparison-groups.json: comparisonGroupId duplicado "${groupId}".`);
  });

  comparisonGroups.forEach((group, index) => {
    const prefix = `comparison-groups.json[${index}]`;

    if (!group.comparisonGroupId) {
      addError(`${prefix}: comparisonGroupId obrigatório.`);
    }

    if (!group.label) {
      addError(`${prefix}: label obrigatório.`);
    }
  });
}

function validateOffers(offers, { storeIds, locationById, productIds, currency }) {
  getDuplicateValues(offers, (offer) => offer.offerId).forEach((offerId) => {
    addError(`offers.json: offerId duplicado "${offerId}".`);
  });

  offers.forEach((offer, index) => {
    const prefix = `offers.json[${index}]`;
    const location = locationById.get(offer.locationId);

    if (!offer.offerId) {
      addError(`${prefix}: offerId obrigatório.`);
    }

    if (!storeIds.has(offer.storeId)) {
      addError(`${prefix}: storeId desconhecido "${offer.storeId}".`);
    }

    if (!location) {
      addError(`${prefix}: locationId desconhecido "${offer.locationId}".`);
    } else if (location.storeId !== offer.storeId) {
      addError(`${prefix}: locationId pertence a "${location.storeId}", mas a oferta usa "${offer.storeId}".`);
    }

    if (!productIds.has(offer.productId)) {
      addError(`${prefix}: productId desconhecido "${offer.productId}".`);
    }

    if (!offer.scrapedName) {
      addError(`${prefix}: scrapedName obrigatório.`);
    }

    if (!isFiniteNumber(offer.price) || offer.price < 0) {
      addError(`${prefix}: price deve ser numérico e positivo.`);
    }

    if (!isFiniteNumber(offer.size) || offer.size <= 0) {
      addError(`${prefix}: size deve ser numérico e maior que zero.`);
    }

    if (!isFiniteNumber(offer.unitPrice) || offer.unitPrice < 0) {
      addError(`${prefix}: unitPrice deve ser numérico e positivo.`);
    }

    if (offer.currency !== currency) {
      addError(`${prefix}: currency="${offer.currency}" difere de metadata.currency="${currency}".`);
    }

    if (!offer.url) {
      addWarning(`${prefix}: url vazio.`);
    }

    if (!offer.image) {
      addWarning(`${prefix}: image vazio.`);
    }

    if (typeof offer.inStock !== "boolean") {
      addError(`${prefix}: inStock deve ser booleano.`);
    }

    if (!isValidConfidence(offer.confidenceScore)) {
      addError(`${prefix}: confidenceScore deve estar entre 0 e 1.`);
    }
  });
}

function validateEquivalenceRules(equivalenceRules, productIds) {
  const allowedRelations = new Set(["equivalent", "alternative", "blocked"]);

  getDuplicateValues(equivalenceRules, (rule) => rule.ruleId).forEach((ruleId) => {
    addError(`equivalence-rules.json: ruleId duplicado "${ruleId}".`);
  });

  equivalenceRules.forEach((rule, index) => {
    const prefix = `equivalence-rules.json[${index}]`;

    if (!productIds.has(rule.sourceProductId)) {
      addError(`${prefix}: sourceProductId desconhecido "${rule.sourceProductId}".`);
    }

    if (!productIds.has(rule.targetProductId)) {
      addError(`${prefix}: targetProductId desconhecido "${rule.targetProductId}".`);
    }

    if (!allowedRelations.has(rule.relation)) {
      addError(`${prefix}: relation inválida "${rule.relation}".`);
    }

    if (!isValidConfidence(rule.confidenceScore)) {
      addError(`${prefix}: confidenceScore deve estar entre 0 e 1.`);
    }

    if (!rule.reason) {
      addWarning(`${prefix}: reason vazio.`);
    }
  });
}

function validatePostalCodesPilot(postalCodesPilot) {
  getDuplicateValues(postalCodesPilot, (entry) => entry.code).forEach((code) => {
    addError(`postal-codes-pilot.json: código postal duplicado "${code}".`);
  });

  postalCodesPilot.forEach((entry, index) => {
    const prefix = `postal-codes-pilot.json[${index}]`;

    if (!/^\d{4}-\d{3}$/.test(String(entry.code || ""))) {
      addError(`${prefix}: code deve seguir o formato 0000-000.`);
    }

    if (!entry.label) {
      addError(`${prefix}: label obrigatório.`);
    }
  });
}

const metadata = requireObject(await loadJson("metadata.json"), "metadata.json");
const stores = requireArray(await loadJson("stores.json"), "stores.json");
const storeLocations = requireArray(await loadJson("store-locations.json"), "store-locations.json");
const catalogProducts = requireArray(await loadJson("catalog-products.json"), "catalog-products.json");
const comparisonGroups = requireArray(await loadJson("comparison-groups.json"), "comparison-groups.json");
const equivalenceRules = requireArray(await loadJson("equivalence-rules.json"), "equivalence-rules.json");
const postalCodesPilot = requireArray(await loadJson("postal-codes-pilot.json"), "postal-codes-pilot.json");
const offers = requireArray(await loadJson("offers.json"), "offers.json");

const storeIds = new Set(stores.map((store) => store.storeId).filter(Boolean));
const locationById = new Map(storeLocations.map((location) => [location.locationId, location]));
const productIds = new Set(catalogProducts.map((product) => product.productId).filter(Boolean));
const comparisonGroupIds = new Set(comparisonGroups.map((group) => group.comparisonGroupId).filter(Boolean));

validateStores(stores);
validateStoreLocations(storeLocations, storeIds);
validateComparisonGroups(comparisonGroups);
validateCatalogProducts(catalogProducts, comparisonGroupIds);
validateOffers(offers, {
  storeIds,
  locationById,
  productIds,
  currency: metadata.currency || "EUR"
});
validateEquivalenceRules(equivalenceRules, productIds);
validatePostalCodesPilot(postalCodesPilot);
validateMetadata(metadata, {
  stores,
  storeLocations,
  catalogProducts,
  comparisonGroups,
  equivalenceRules,
  postalCodesPilot,
  offers
});

console.log("Validação dos dados publicados");
console.log(`Lojas: ${stores.length}`);
console.log(`Localizações: ${storeLocations.length}`);
console.log(`Produtos canónicos: ${catalogProducts.length}`);
console.log(`Grupos de comparação: ${comparisonGroups.length}`);
console.log(`Ofertas: ${offers.length}`);
console.log(`Regras de equivalência: ${equivalenceRules.length}`);
console.log(`Códigos postais piloto: ${postalCodesPilot.length}`);

if (warnings.length > 0) {
  console.log("\nAvisos:");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (errors.length > 0) {
  console.error("\nErros:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("\nOK: dados publicados consistentes.");
}
