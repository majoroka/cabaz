const DEFAULT_THEME_COLOR = "#51606f";

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function getThemeColor(storeId) {
  const colors = {
    continente: "#1b6ca8",
    "pingo-doce": "#2f7f3a",
    auchan: "#d71920",
    intermarche: "#cc3b2f",
    lidl: "#0050aa",
    aldi: "#1f4e79",
    mercadona: "#13824b",
    minipreco: "#d42b1e",
    spar: "#007a3d",
    coviran: "#3d8b37",
    apolonia: "#7a5b2f",
    "meu-super": "#f28c28",
    amanhecer: "#f5a623"
  };

  return colors[storeId] || DEFAULT_THEME_COLOR;
}

export function mapPublishedStores(stores) {
  if (!Array.isArray(stores)) {
    return [];
  }

  return stores
    .filter((store) => isPlainObject(store) && store.active !== false && typeof store.name === "string")
    .map((store) => ({
      id: String(store.storeId || store.id || store.name).trim(),
      name: String(store.name).trim(),
      website: String(store.website || "").trim(),
      themeColor: getThemeColor(String(store.storeId || store.id || "").trim())
    }));
}

export function mapPublishedCatalogProducts(products) {
  if (!Array.isArray(products)) {
    return [];
  }

  return products
    .filter(
      (product) => isPlainObject(product) && product.active !== false && typeof product.canonicalName === "string"
    )
    .map((product) => ({
      id: String(product.productId || product.id || product.canonicalName).trim(),
      name: String(product.canonicalName).trim(),
      quantity: 1,
      preferredStore: "",
      category: String(product.categoryId || "sem_categoria").trim(),
      preferredBrand: String(product.brand || "").trim(),
      notes: "",
      comparisonGroup: String(product.comparisonGroup || "").trim()
    }));
}

export function mapPublishedOffers(offers) {
  if (!Array.isArray(offers)) {
    return [];
  }

  return offers
    .filter(
      (offer) =>
        isPlainObject(offer) &&
        offer.storeId &&
        offer.productId &&
        typeof offer.scrapedName === "string" &&
        Number.isFinite(Number(offer.price))
    )
    .map((offer, index) => ({
      id: String(offer.offerId || `${offer.storeId}-${offer.productId}-${index}`).trim(),
      basketItemId: String(offer.productId).trim(),
      store: String(offer.storeId).trim(),
      matchedName: String(offer.scrapedName).trim(),
      brand: String(offer.brand || "").trim(),
      notes: String(offer.notes || "").trim(),
      price: Number(offer.price),
      size: toNumberOrNull(offer.size),
      sizeUnit: offer.sizeUnit ? String(offer.sizeUnit).trim() : null,
      unitPrice: toNumberOrNull(offer.unitPrice),
      unit: offer.unit ? String(offer.unit).trim() : null,
      url: String(offer.url || "").trim(),
      image: String(offer.image || "").trim(),
      lastUpdated: String(offer.lastUpdated || "").trim(),
      inStock: offer.inStock !== false,
      confidenceScore: toNumberOrNull(offer.confidenceScore) ?? 0.5,
      locationId: String(offer.locationId || "").trim()
    }));
}

export async function loadPublishedData(baseUrl) {
  const fetchJson = async (path) => {
    const response = await fetch(`${baseUrl}${path}`);

    if (!response.ok) {
      throw new Error(`Não foi possível carregar ${path}.`);
    }

    return response.json();
  };

  const [metadata, stores, catalogProducts, offers] = await Promise.all([
    fetchJson("data/metadata.json"),
    fetchJson("data/stores.json"),
    fetchJson("data/catalog-products.json"),
    fetchJson("data/offers.json")
  ]);

  return {
    metadata: isPlainObject(metadata) ? metadata : null,
    stores: mapPublishedStores(stores),
    catalogProducts: mapPublishedCatalogProducts(catalogProducts),
    offers: mapPublishedOffers(offers)
  };
}
