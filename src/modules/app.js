import { enrichResults } from "../utils/calculations.js";
import { getBrandOptions } from "../utils/brands.js";
import { getCategoryOptions, normalizeCategoryId } from "../utils/categories.js";
import { formatCurrency } from "../utils/formatters.js";
import { uniqueValues } from "../utils/helpers.js";
import {
  createPostalCodeIndex,
  findPostalCodeRecord,
  getPostalCodeSuggestions,
  normalizePostalCodeInput
} from "../utils/postalCodes.js";
import { loadPublishedData } from "../utils/publishedData.js";
import { validateBasketJson } from "../utils/validation.js";
import { getSummaryCards, renderApp } from "./render.js";

const STORAGE_KEYS = {
  basket: "cabaz:published-v1:basket",
  favorites: "cabaz:published-v1:favorites"
};
const LEGACY_STORAGE_KEYS = ["cabaz:basket", "cabaz:results", "cabaz:stores"];

const DEFAULT_SECTION = "painel";
const DEFAULT_CATALOG_SEARCH = {
  query: "",
  postalCode: "",
  postalLabel: "",
  postalSuggestions: [],
  executedQuery: "",
  resultIds: [],
  filters: {
    store: "all",
    category: "all",
    brand: "all",
    sort: "price-asc"
  }
};
const DEFAULT_FAVORITES_FILTERS = {
  query: "",
  store: "all",
  category: "all",
  brand: "all"
};
const MESSAGE_TIMEOUT_MS = 4000;

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function singularizeSearchToken(token) {
  if (token.length > 4 && token.endsWith("s") && !token.endsWith("ss")) {
    return token.slice(0, -1);
  }

  return token;
}

function buildSearchIndexText(value) {
  const normalized = normalizeSearchText(value);

  if (!normalized) {
    return "";
  }

  const tokens = normalized.split(/\s+/).filter(Boolean);
  const expandedTokens = [...new Set(tokens.flatMap((token) => [token, singularizeSearchToken(token)]))];

  return expandedTokens.join(" ");
}

function buildCanonicalSearchTokens(value) {
  const normalized = normalizeSearchText(value);

  if (!normalized) {
    return [];
  }

  return [...new Set(normalized.split(/\s+/).filter(Boolean).map((token) => singularizeSearchToken(token)))];
}

function sortByLabel(items) {
  return [...items].sort((left, right) => left.label.localeCompare(right.label, "pt"));
}

function findResultForBasketItem(item, results) {
  const matchingResults = results.filter((result) => result.basketItemId === item.id);

  if (matchingResults.length === 0) {
    return null;
  }

  return (
    matchingResults.find((result) => item.preferredStore && result.store === item.preferredStore) ||
    [...matchingResults].sort((left, right) => left.price - right.price)[0]
  );
}

function getBasketItemQuantity(item) {
  return Math.max(1, Number.parseInt(String(item.quantity || "1"), 10) || 1);
}

function findBestResultForBasketItemInStore(item, storeId, results, catalogProducts) {
  const availableResults = results.filter((result) => result.store === storeId && result.inStock !== false);
  const exactResults = availableResults.filter((result) => result.basketItemId === item.id);

  if (exactResults.length > 0) {
    return {
      result: [...exactResults].sort((left, right) => left.price - right.price)[0],
      matchType: "exact"
    };
  }

  const catalogProduct = catalogProducts.find((entry) => entry.id === item.id) || null;

  if (!catalogProduct?.comparisonGroup) {
    return {
      result: null,
      matchType: "missing"
    };
  }

  const equivalentResults = availableResults.filter((result) => {
    const resultProduct = catalogProducts.find((entry) => entry.id === result.basketItemId);

    return resultProduct?.comparisonGroup === catalogProduct.comparisonGroup;
  });

  if (equivalentResults.length === 0) {
    return {
      result: null,
      matchType: "missing"
    };
  }

  return {
    result: [...equivalentResults].sort((left, right) => left.price - right.price)[0],
    matchType: "equivalent"
  };
}

function loadStoredJson(storageKey, validator) {
  try {
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);
    const validation = validator(parsed);

    return validation.valid ? validation.data : null;
  } catch {
    return null;
  }
}

function loadStoredFavorites() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEYS.favorites);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((favorite) => {
        if (typeof favorite === "string") {
          return {
            productId: favorite,
            addedAt: ""
          };
        }

        if (!favorite || typeof favorite !== "object" || !favorite.productId) {
          return null;
        }

        return {
          productId: String(favorite.productId).trim(),
          addedAt: String(favorite.addedAt || "").trim()
        };
      })
      .filter((favorite) => favorite?.productId);
  } catch {
    return [];
  }
}

function persistJson(storageKey, value) {
  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

function cleanupLegacyStorage() {
  LEGACY_STORAGE_KEYS.forEach((storageKey) => {
    window.localStorage.removeItem(storageKey);
  });
}

function createFallbackStoresFromResults(results, stores) {
  const knownIds = new Set(stores.map((store) => store.id));
  const missingStoreIds = uniqueValues(
    results.filter((result) => !knownIds.has(result.store)).map((result) => result.store)
  );

  return [
    ...stores,
    ...missingStoreIds.map((storeId) => ({
      id: storeId,
      name: storeId,
      website: "",
      themeColor: "#51606f"
    }))
  ];
}

function createInitialState() {
  cleanupLegacyStorage();

  const storedBasket = loadStoredJson(STORAGE_KEYS.basket, validateBasketJson);
  const storedFavorites = loadStoredFavorites();

  return {
    basket: storedBasket || [],
    favorites: storedFavorites,
    catalogProducts: [],
    results: [],
    stores: [],
    currentSection: DEFAULT_SECTION,
    comparisonActiveStoreId: "",
    catalogSearch: cloneValue(DEFAULT_CATALOG_SEARCH),
    favoritesFilters: cloneValue(DEFAULT_FAVORITES_FILTERS),
    notice: "",
    error: ""
  };
}

function getViewModel(state) {
  const categories = getCategoryOptions();
  const favoriteIds = new Set(state.favorites.map((favorite) => favorite.productId));
  const catalogSearchRecords = state.catalogSearch.resultIds
    .map((resultId) => {
      const result = state.results.find((entry) => entry.id === resultId);

      if (!result) {
        return null;
      }

      const store = state.stores.find((entry) => entry.id === result.store) || null;
      const basketItem = state.basket.find((item) => item.id === result.basketItemId) || null;
      const catalogProduct = state.catalogProducts.find((item) => item.id === result.basketItemId) || null;
      const brand = result.brand || basketItem?.preferredBrand || catalogProduct?.preferredBrand || "";
      const categoryId = basketItem?.category || catalogProduct?.category || "sem_categoria";

      return {
        result,
        store,
        basketItem,
        catalogProduct,
        brand,
        categoryId,
        categoryName: getCategoryOptions().find((category) => category.id === categoryId)?.name || "Sem categoria",
        isFavorite: favoriteIds.has(result.basketItemId)
      };
    })
    .filter(Boolean);
  const catalogFilterOptions = {
    stores: sortByLabel(
      uniqueValues(catalogSearchRecords.map((entry) => entry.store?.id)).map((storeId) => ({
        value: storeId,
        label: state.stores.find((store) => store.id === storeId)?.name || storeId
      }))
    ),
    categories: sortByLabel(
      uniqueValues(catalogSearchRecords.map((entry) => entry.categoryId)).map((categoryId) => ({
        value: categoryId,
        label: categories.find((category) => category.id === categoryId)?.name || categoryId
      }))
    ),
    brands: sortByLabel(
      uniqueValues(catalogSearchRecords.map((entry) => entry.brand)).map((brand) => ({
        value: brand,
        label: brand
      }))
    )
  };
  const visibleCatalogRecords = catalogSearchRecords
    .filter((entry) => {
      const matchesStore =
        state.catalogSearch.filters.store === "all" || entry.store?.id === state.catalogSearch.filters.store;
      const matchesCategory =
        state.catalogSearch.filters.category === "all" ||
        entry.categoryId === state.catalogSearch.filters.category;
      const matchesBrand =
        state.catalogSearch.filters.brand === "all" || entry.brand === state.catalogSearch.filters.brand;

      return matchesStore && matchesCategory && matchesBrand;
    })
    .sort((left, right) => {
      if (state.catalogSearch.filters.sort === "price-desc") {
        return right.result.price - left.result.price;
      }

      if (state.catalogSearch.filters.sort === "name-asc") {
        return left.result.matchedName.localeCompare(right.result.matchedName, "pt");
      }

      if (state.catalogSearch.filters.sort === "name-desc") {
        return right.result.matchedName.localeCompare(left.result.matchedName, "pt");
      }

      return left.result.price - right.result.price;
    });
  const basketRows = state.basket.map((item) => {
    const result = findResultForBasketItem(item, state.results);
    const catalogProduct = state.catalogProducts.find((entry) => entry.id === item.id) || null;
    const store = result ? state.stores.find((entry) => entry.id === result.store) || null : null;
    const quantity = getBasketItemQuantity(item);

    return {
      item,
      quantity,
      result,
      catalogProduct,
      store,
      isFavorite: favoriteIds.has(item.id),
      lineTotal: result ? result.price * quantity : null
    };
  });
  const basketQuantityCount = basketRows.reduce((sum, row) => sum + row.quantity, 0);
  const basketTotal = basketRows.reduce((total, row) => total + (row.lineTotal || 0), 0);
  const pricedBasketRows = basketRows.filter((row) => row.lineTotal !== null);
  const favoriteRows = state.favorites
    .map((favorite) => {
      const catalogProduct = state.catalogProducts.find((entry) => entry.id === favorite.productId) || null;
      const results = state.results
        .filter((result) => result.basketItemId === favorite.productId)
        .sort((left, right) => left.price - right.price);
      const result = results[0] || null;
      const store = result ? state.stores.find((entry) => entry.id === result.store) || null : null;

      if (!catalogProduct && !result) {
        return null;
      }

      const categoryId = normalizeCategoryId(catalogProduct?.category || "sem_categoria");
      const brand = result?.brand || catalogProduct?.preferredBrand || "";
      const storeId = store?.id || result?.store || "";

      return {
        favorite,
        catalogProduct,
        result,
        store,
        brand,
        storeId,
        categoryId,
        categoryName: categories.find((category) => category.id === categoryId)?.name || "Sem categoria"
      };
    })
    .filter(Boolean);
  const favoriteFilterOptions = {
    stores: sortByLabel(
      uniqueValues(favoriteRows.map((entry) => entry.storeId).filter(Boolean)).map((storeId) => ({
        value: storeId,
        label: state.stores.find((store) => store.id === storeId)?.name || storeId
      }))
    ),
    categories: sortByLabel(
      uniqueValues(favoriteRows.map((entry) => entry.categoryId).filter(Boolean)).map((categoryId) => ({
        value: categoryId,
        label: categories.find((category) => category.id === categoryId)?.name || categoryId
      }))
    ),
    brands: sortByLabel(
      uniqueValues(favoriteRows.map((entry) => entry.brand).filter(Boolean)).map((brand) => ({
        value: brand,
        label: brand
      }))
    )
  };
  const normalizedFavoriteQuery = buildSearchIndexText(state.favoritesFilters.query);
  const favoriteQueryTokens = buildCanonicalSearchTokens(state.favoritesFilters.query);
  const visibleFavoriteRows = favoriteRows.filter((entry) => {
    const searchText = buildSearchIndexText(
      [
        entry.catalogProduct?.name,
        entry.result?.matchedName,
        entry.brand,
        entry.result?.notes,
        entry.store?.name,
        entry.categoryName
      ]
        .filter(Boolean)
        .join(" ")
    );
    const searchTokens = new Set(buildCanonicalSearchTokens(searchText));
    const matchesQuery =
      !normalizedFavoriteQuery ||
      searchText.includes(normalizedFavoriteQuery) ||
      favoriteQueryTokens.every((token) => searchTokens.has(token));
    const matchesStore =
      state.favoritesFilters.store === "all" || entry.storeId === state.favoritesFilters.store;
    const matchesCategory =
      state.favoritesFilters.category === "all" || entry.categoryId === state.favoritesFilters.category;
    const matchesBrand =
      state.favoritesFilters.brand === "all" || entry.brand === state.favoritesFilters.brand;

    return matchesQuery && matchesStore && matchesCategory && matchesBrand;
  });
  const comparisonStoreIds = uniqueValues(state.results.map((result) => result.store));
  const comparisonStores = comparisonStoreIds
    .map((storeId) => state.stores.find((store) => store.id === storeId) || {
      id: storeId,
      name: storeId,
      website: "",
      themeColor: "#51606f"
    })
    .map((store) => {
      const rows = state.basket.map((item) => {
        const quantity = getBasketItemQuantity(item);
        const catalogProduct = state.catalogProducts.find((entry) => entry.id === item.id) || null;
        const match = findBestResultForBasketItemInStore(item, store.id, state.results, state.catalogProducts);

        return {
          item,
          quantity,
          catalogProduct,
          result: match.result,
          matchType: match.matchType,
          lineTotal: match.result ? match.result.price * quantity : null
        };
      });
      const foundRows = rows.filter((row) => row.result);
      const total = foundRows.reduce((sum, row) => sum + (row.lineTotal || 0), 0);

      return {
        store,
        rows,
        total: foundRows.length > 0 ? total : null,
        foundCount: foundRows.length,
        missingCount: rows.length - foundRows.length,
        itemCount: rows.length,
        complete: rows.length > 0 && foundRows.length === rows.length
      };
    })
    .sort((left, right) => {
      if (left.complete !== right.complete) {
        return left.complete ? -1 : 1;
      }

      if (left.total !== null && right.total !== null && left.total !== right.total) {
        return left.total - right.total;
      }

      if (left.missingCount !== right.missingCount) {
        return left.missingCount - right.missingCount;
      }

      return left.store.name.localeCompare(right.store.name, "pt");
    });
  const activeComparisonStore =
    comparisonStores.find((entry) => entry.store.id === state.comparisonActiveStoreId) || comparisonStores[0] || null;
  const completeComparisonStores = comparisonStores.filter((entry) => entry.complete && entry.total !== null);
  const cheapestComparisonStore = completeComparisonStores[0] || null;
  const mostExpensiveComparisonStore = completeComparisonStores.at(-1) || null;
  const comparisonSpread =
    cheapestComparisonStore && mostExpensiveComparisonStore && completeComparisonStores.length > 1
      ? mostExpensiveComparisonStore.total - cheapestComparisonStore.total
      : null;

  return {
    currentSection: state.currentSection,
    stores: state.stores,
    brands: getBrandOptions({
      basket: state.basket,
      results: state.results
    }),
    categories,
    catalogSearch: {
      ...state.catalogSearch,
      resultCount: catalogSearchRecords.length,
      rows: visibleCatalogRecords,
      options: catalogFilterOptions
    },
    basketView: {
      rows: basketRows,
      itemCount: state.basket.length,
      total: pricedBasketRows.length > 0 ? basketTotal : null,
      pricedItemCount: pricedBasketRows.length
    },
    favoritesView: {
      rows: visibleFavoriteRows,
      itemCount: favoriteRows.length,
      visibleCount: visibleFavoriteRows.length,
      addableCount: visibleFavoriteRows.filter((entry) => entry.result).length,
      filters: state.favoritesFilters,
      options: favoriteFilterOptions
    },
    comparisonView: {
      stores: comparisonStores,
      activeStoreId: activeComparisonStore?.store.id || "",
      activeStore: activeComparisonStore,
      itemCount: state.basket.length
    },
    summary: {
      basketItemCount: state.basket.length,
      basketQuantityCount,
      basketPricedItemCount: pricedBasketRows.length,
      favoriteCount: state.favorites.length,
      comparedStoreCount: comparisonStores.length,
      completeStoreCount: completeComparisonStores.length,
      cheapestStore: cheapestComparisonStore,
      mostExpensiveStore: mostExpensiveComparisonStore,
      cheapestTotal: cheapestComparisonStore?.total ?? null,
      spread: comparisonSpread
    }
  };
}

export function createApp(rootElement) {
  if (!rootElement) {
    throw new Error("Não foi possível montar a aplicação.");
  }

  const state = createInitialState();
  let messageTimeoutId = null;
  let postalCodeIndex = null;
  let postalCodeLoadPromise = null;

  function render() {
    rootElement.innerHTML = renderApp({
      state,
      viewModel: getViewModel(state)
    });
  }

  function syncPostalCodeSuggestions() {
    const suggestionsContainer = rootElement.querySelector(".hero-location-suggestions");

    if (!(suggestionsContainer instanceof HTMLElement)) {
      return;
    }

    suggestionsContainer.replaceChildren(
      ...state.catalogSearch.postalSuggestions.map((record) => {
        const button = document.createElement("button");
        const label = document.createElement("strong");
        const code = document.createElement("span");

        button.type = "button";
        button.className = "hero-location-option";
        button.dataset.action = "select-postal-suggestion";
        button.dataset.postalCode = record.code;
        button.dataset.postalLabel = record.label;
        label.textContent = record.label;
        code.textContent = [record.code, record.streets?.[0]].filter(Boolean).join(" · ");
        button.append(label, code);

        return button;
      })
    );
  }

  function cancelMessageDismiss() {
    if (messageTimeoutId) {
      window.clearTimeout(messageTimeoutId);
      messageTimeoutId = null;
    }
  }

  function scheduleMessageDismiss() {
    cancelMessageDismiss();

    messageTimeoutId = window.setTimeout(() => {
      state.error = "";
      state.notice = "";
      messageTimeoutId = null;
      render();
    }, MESSAGE_TIMEOUT_MS);
  }

  function setNotice(message) {
    state.notice = message;
    state.error = "";
    scheduleMessageDismiss();
  }

  function setError(message) {
    state.error = message;
    state.notice = "";
    scheduleMessageDismiss();
  }

  function clearMessages() {
    cancelMessageDismiss();
    state.error = "";
    state.notice = "";
  }

  function resetCatalogSearch() {
    state.catalogSearch = {
      ...cloneValue(DEFAULT_CATALOG_SEARCH),
      postalCode: state.catalogSearch.postalCode,
      postalLabel: state.catalogSearch.postalLabel
    };
  }

  async function ensurePostalCodeIndex() {
    if (postalCodeIndex) {
      return postalCodeIndex;
    }

    if (!postalCodeLoadPromise) {
      postalCodeLoadPromise = fetch(`${import.meta.env.BASE_URL}data/codigos_postais_portugal.txt`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Não foi possível carregar a base de códigos postais.");
          }

          return response.text();
        })
        .then((text) => {
          postalCodeIndex = createPostalCodeIndex(text);
          return postalCodeIndex;
        });
    }

    return postalCodeLoadPromise;
  }

  function runCatalogSearch(query) {
    const normalizedQuery = buildSearchIndexText(query);
    const queryTokens = buildCanonicalSearchTokens(query);

    if (!normalizedQuery) {
      setError("Escreva um termo de pesquisa.");
      render();
      return;
    }

    const matches = state.results.filter((result) => {
      const basketItem = state.basket.find((item) => item.id === result.basketItemId);
      const catalogProduct = state.catalogProducts.find((item) => item.id === result.basketItemId);
      const store = state.stores.find((entry) => entry.id === result.store);
      const haystack = buildSearchIndexText(
        [
          result.matchedName,
          result.brand,
          result.notes,
          basketItem?.name,
          catalogProduct?.name,
          basketItem?.preferredBrand,
          catalogProduct?.preferredBrand,
          basketItem?.notes,
          store?.name
        ]
          .filter(Boolean)
          .join(" ")
      );

      const haystackTokens = new Set(buildCanonicalSearchTokens(haystack));

      return (
        haystack.includes(normalizedQuery) ||
        queryTokens.every((token) => haystackTokens.has(token))
      );
    });

    state.catalogSearch = {
      ...state.catalogSearch,
      query,
      executedQuery: query,
      resultIds: matches.map((result) => result.id),
      postalSuggestions: [],
      filters: {
        ...DEFAULT_CATALOG_SEARCH.filters
      }
    };
    state.currentSection = DEFAULT_SECTION;
    clearMessages();
    render();
  }

  function addCatalogResultToBasket(resultId, quantity) {
    const result = state.results.find((entry) => entry.id === resultId);

    if (!result) {
      setError("Não foi possível encontrar o produto selecionado.");
      render();
      return;
    }

    const catalogProduct = state.catalogProducts.find((entry) => entry.id === result.basketItemId) || null;
    const productName = catalogProduct?.name || result.matchedName;
    const normalizedQuantity = Math.max(1, Number.parseInt(String(quantity || "1"), 10) || 1);
    const existingIndex = state.basket.findIndex((entry) => entry.id === result.basketItemId);

    if (existingIndex >= 0) {
      const existingItem = state.basket[existingIndex];

      state.basket.splice(existingIndex, 1, {
        ...existingItem,
        quantity: existingItem.quantity + normalizedQuantity,
        preferredStore: existingItem.preferredStore || result.store,
        preferredBrand: existingItem.preferredBrand || result.brand || catalogProduct?.preferredBrand || "",
        notes: existingItem.notes || result.notes || ""
      });
      setNotice(`Quantidade atualizada para "${productName}".`);
    } else {
      state.basket.unshift({
        id: result.basketItemId,
        name: productName,
        quantity: normalizedQuantity,
        preferredStore: result.store,
        category: normalizeCategoryId(catalogProduct?.category || "sem_categoria"),
        preferredBrand: result.brand || catalogProduct?.preferredBrand || "",
        notes: result.notes || ""
      });
      setNotice(`Item "${productName}" adicionado ao cabaz.`);
    }

    persistJson(STORAGE_KEYS.basket, state.basket);
    render();
  }

  function toggleFavorite(productId) {
    const catalogProduct = state.catalogProducts.find((entry) => entry.id === productId) || null;
    const result = state.results.find((entry) => entry.basketItemId === productId) || null;
    const productName = catalogProduct?.name || result?.matchedName || "Produto";
    const existingIndex = state.favorites.findIndex((favorite) => favorite.productId === productId);

    if (existingIndex >= 0) {
      state.favorites.splice(existingIndex, 1);
      setNotice(`"${productName}" removido dos favoritos.`);
    } else {
      state.favorites.unshift({
        productId,
        addedAt: new Date().toISOString()
      });
      setNotice(`"${productName}" adicionado aos favoritos.`);
    }

    persistJson(STORAGE_KEYS.favorites, state.favorites);
    render();
  }

  function addVisibleFavoritesToBasket() {
    const favoritesView = getViewModel(state).favoritesView;
    const existingIds = new Set(state.basket.map((item) => item.id));
    const newItems = favoritesView.rows
      .filter((entry) => entry.result && !existingIds.has(entry.result.basketItemId))
      .map((entry) => ({
        id: entry.result.basketItemId,
        name: entry.catalogProduct?.name || entry.result.matchedName,
        quantity: 1,
        preferredStore: entry.result.store,
        category: normalizeCategoryId(entry.catalogProduct?.category || "sem_categoria"),
        preferredBrand: entry.result.brand || entry.catalogProduct?.preferredBrand || "",
        notes: entry.result.notes || ""
      }));

    const alreadyInBasketCount = favoritesView.rows.filter(
      (entry) => entry.result && existingIds.has(entry.result.basketItemId)
    ).length;
    const unavailableCount = favoritesView.rows.filter((entry) => !entry.result).length;

    if (favoritesView.visibleCount === 0) {
      setError("Não existem favoritos visíveis para adicionar ao cabaz.");
      render();
      return;
    }

    if (newItems.length === 0) {
      setNotice(
        alreadyInBasketCount > 0
          ? "Os favoritos visíveis já estão no cabaz."
          : "Os favoritos visíveis não têm oferta disponível para adicionar."
      );
      render();
      return;
    }

    state.basket = [...newItems, ...state.basket];
    persistJson(STORAGE_KEYS.basket, state.basket);

    const skippedParts = [
      alreadyInBasketCount > 0 ? `${alreadyInBasketCount} já existentes` : "",
      unavailableCount > 0 ? `${unavailableCount} sem oferta` : ""
    ].filter(Boolean);

    setNotice(
      `${newItems.length} ${newItems.length === 1 ? "favorito adicionado" : "favoritos adicionados"} ao cabaz${
        skippedParts.length > 0 ? ` (${skippedParts.join(", ")}).` : "."
      }`
    );
    render();
  }

  function updateBasketItemQuantity(itemId, quantity, { renderView = true, showNotice = true } = {}) {
    const normalizedQuantity = Math.max(1, Number.parseInt(String(quantity || "1"), 10) || 1);
    const item = state.basket.find((entry) => entry.id === itemId);

    if (!item) {
      setError("Não foi possível encontrar o item no cabaz.");
      render();
      return;
    }

    item.quantity = normalizedQuantity;
    persistJson(STORAGE_KEYS.basket, state.basket);

    if (showNotice) {
      setNotice(`Quantidade atualizada para "${item.name}".`);
    }

    if (renderView) {
      render();
    }
  }

  function refreshBasketTotalsInDom() {
    const viewModel = getViewModel(state);
    const basketView = viewModel.basketView;
    const totalLabel = basketView.total == null ? "—" : formatCurrency(basketView.total);

    rootElement.querySelectorAll(".basket-total-value").forEach((element) => {
      element.textContent = totalLabel;
    });

    rootElement.querySelectorAll(".basket-status-total").forEach((element) => {
      element.textContent = basketView.total == null ? "Total pendente" : totalLabel;
    });

    getSummaryCards(viewModel.summary).forEach((card) => {
      rootElement.querySelectorAll(`[data-summary-value="${card.id}"]`).forEach((element) => {
        element.textContent = card.value;
      });
      rootElement.querySelectorAll(`[data-summary-copy="${card.id}"]`).forEach((element) => {
        element.textContent = card.copy;
      });
    });

    basketView.rows.forEach((row) => {
      const line = [...rootElement.querySelectorAll(".basket-line")].find(
        (element) => element instanceof HTMLElement && element.dataset.itemId === row.item.id
      );
      const subtotal = line?.querySelector(".basket-line-subtotal");

      if (subtotal) {
        subtotal.textContent = row.lineTotal == null ? "—" : formatCurrency(row.lineTotal);
      }
    });
  }

  function removeItem(itemId) {
    const item = state.basket.find((entry) => entry.id === itemId);

    if (!item) {
      return;
    }

    state.basket = state.basket.filter((entry) => entry.id !== itemId);
    persistJson(STORAGE_KEYS.basket, state.basket);
    setNotice(`Item "${item.name}" removido.`);
    render();
  }

  async function bootstrapPublishedData() {
    try {
      const publishedData = await loadPublishedData(import.meta.env.BASE_URL);

      state.catalogProducts = publishedData.catalogProducts;

      if (publishedData.offers.length > 0) {
        state.results = enrichResults(publishedData.offers);
        state.stores = createFallbackStoresFromResults(state.results, publishedData.stores);
        clearMessages();
        render();
        return;
      }

      state.results = [];
      state.stores = publishedData.stores;
      setError("Não existem ofertas publicadas em public/data/offers.json.");
    } catch {
      state.catalogProducts = [];
      state.results = [];
      state.stores = [];
      setError("Não foi possível carregar os dados publicados em public/data.");
    }
  }

  rootElement.addEventListener("submit", async (event) => {
    if (event.target instanceof HTMLFormElement && event.target.id === "favorites-filters-form") {
      event.preventDefault();
      return;
    }

    if (
      event.target instanceof HTMLFormElement &&
      event.target.classList.contains("catalog-add-form") &&
      event.target.dataset.resultId
    ) {
      event.preventDefault();
      clearMessages();
      const formData = new FormData(event.target);
      addCatalogResultToBasket(event.target.dataset.resultId, formData.get("quantity"));
      event.target.reset();
      return;
    }

    if (event.target instanceof HTMLFormElement && event.target.id === "hero-search-form") {
      event.preventDefault();
      const formData = new FormData(event.target);
      const rawPostalValue = String(formData.get("postalCode") || "").trim();

      if (rawPostalValue) {
        try {
          const index = await ensurePostalCodeIndex();
          const postalRecord =
            state.catalogSearch.postalLabel && rawPostalValue === state.catalogSearch.postalLabel
              ? findPostalCodeRecord(index, state.catalogSearch.postalCode)
              : findPostalCodeRecord(index, rawPostalValue);

          if (!postalRecord) {
            setError("Selecione uma localidade, rua ou introduza um código postal válido.");
            render();
            return;
          }

          state.catalogSearch.postalCode = postalRecord.code;
          state.catalogSearch.postalLabel = postalRecord.label;
          state.catalogSearch.postalSuggestions = [];
        } catch (error) {
          setError(error.message || "Não foi possível validar o código postal.");
          render();
          return;
        }
      } else {
        state.catalogSearch.postalCode = "";
        state.catalogSearch.postalLabel = "";
        state.catalogSearch.postalSuggestions = [];
      }

      runCatalogSearch(String(formData.get("query") || "").trim());
    }
  });

  rootElement.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest("[data-action]") : null;

    if (!target) {
      return;
    }

    const action = target.dataset.action;
    const itemId = target.dataset.itemId;

    if (action === "select-postal-suggestion" && target.dataset.postalCode && target.dataset.postalLabel) {
      state.catalogSearch.postalCode = target.dataset.postalCode;
      state.catalogSearch.postalLabel = target.dataset.postalLabel;
      state.catalogSearch.postalSuggestions = [];

      const postalInput = rootElement.querySelector('input[name="postalCode"]');

      if (postalInput instanceof HTMLInputElement) {
        postalInput.value = target.dataset.postalLabel;
      }

      syncPostalCodeSuggestions();
      return;
    }

    if (action === "set-section" && target.dataset.section) {
      state.currentSection = target.dataset.section;
      clearMessages();
      render();
      return;
    }

    if (action === "set-comparison-store" && target.dataset.storeId) {
      state.comparisonActiveStoreId = target.dataset.storeId;
      render();
      return;
    }

    if (action === "print-list") {
      window.print();
      return;
    }

    if (action === "toggle-favorite" && target.dataset.productId) {
      toggleFavorite(target.dataset.productId);
      return;
    }

    if (action === "add-visible-favorites") {
      addVisibleFavoritesToBasket();
      return;
    }

    if (action === "clear-favorites-filters") {
      state.favoritesFilters = cloneValue(DEFAULT_FAVORITES_FILTERS);
      render();
      return;
    }

    if (action === "remove-item" && itemId) {
      removeItem(itemId);
      return;
    }
  });

  rootElement.addEventListener("change", async (event) => {
    const target = event.target;

    if (target instanceof HTMLSelectElement && target.closest("#catalog-filters-form")) {
      state.catalogSearch.filters[target.name] = target.value;
      render();
      return;
    }

    if (target instanceof HTMLSelectElement && target.closest("#favorites-filters-form")) {
      state.favoritesFilters[target.name] = target.value;
      render();
      return;
    }

    if (target instanceof HTMLInputElement && target.classList.contains("basket-quantity-input")) {
      const quantityControl = target.closest(".basket-quantity-control");
      const itemId = quantityControl instanceof HTMLElement ? quantityControl.dataset.itemId : "";
      const quantity = Math.max(1, Number.parseInt(String(target.value || "1"), 10) || 1);

      target.value = String(quantity);

      if (itemId) {
        updateBasketItemQuantity(itemId, quantity, {
          renderView: false,
          showNotice: false
        });
        refreshBasketTotalsInDom();
      }
    }
  });

  rootElement.addEventListener("input", async (event) => {
    const target = event.target;

    if (
      target instanceof HTMLInputElement &&
      (target.name === "query" || target.name === "postalCode") &&
      (target.closest("#hero-search-form") || target.form?.id === "hero-search-form")
    ) {
      if (target.name === "query") {
        state.catalogSearch.query = target.value;
      }

      if (target.name === "postalCode") {
        const rawPostalValue = target.value.trim();
        const normalizedPostalCode = normalizePostalCodeInput(rawPostalValue);
        const rawDigits = rawPostalValue.replace(/\D/g, "");
        const looksLikePostalCode = rawDigits.length > 0;

        if (rawPostalValue !== state.catalogSearch.postalLabel) {
          state.catalogSearch.postalCode = looksLikePostalCode ? normalizedPostalCode : "";
          state.catalogSearch.postalLabel = "";
        }

        state.catalogSearch.postalSuggestions = [];

        if (!state.catalogSearch.postalLabel && looksLikePostalCode && target.value !== normalizedPostalCode) {
          target.value = normalizedPostalCode;
        }

        if (looksLikePostalCode && normalizedPostalCode.replace(/\D/g, "").length >= 4) {
          try {
            const index = await ensurePostalCodeIndex();
            const exactMatch = findPostalCodeRecord(index, normalizedPostalCode);

            if (exactMatch) {
              state.catalogSearch.postalCode = exactMatch.code;
              state.catalogSearch.postalLabel = exactMatch.label;
              state.catalogSearch.postalSuggestions = [];
              target.value = exactMatch.label;
            } else {
              state.catalogSearch.postalSuggestions = getPostalCodeSuggestions(index, normalizedPostalCode);
            }
          } catch {
            state.catalogSearch.postalSuggestions = [];
          }
        } else if (rawPostalValue.length >= 2) {
          try {
            const index = await ensurePostalCodeIndex();
            state.catalogSearch.postalSuggestions = getPostalCodeSuggestions(index, rawPostalValue);
          } catch {
            state.catalogSearch.postalSuggestions = [];
          }
        } else if (!normalizedPostalCode) {
          state.catalogSearch.postalCode = "";
          state.catalogSearch.postalLabel = "";
        }

        syncPostalCodeSuggestions();
        return;
      }

      if (target.name === "query" && target.value.trim() === "" && state.catalogSearch.executedQuery) {
        clearMessages();
        resetCatalogSearch();
        render();
      }

      return;
    }

    if (
      target instanceof HTMLInputElement &&
      target.name === "query" &&
      target.closest("#favorites-filters-form")
    ) {
      const selectionStart = target.selectionStart ?? target.value.length;
      const selectionEnd = target.selectionEnd ?? target.value.length;
      state.favoritesFilters.query = target.value;
      render();
      const nextInput = rootElement.querySelector('#favorites-filters-form input[name="query"]');

      if (nextInput instanceof HTMLInputElement) {
        nextInput.focus();
        nextInput.setSelectionRange(selectionStart, selectionEnd);
      }
      return;
    }

    if (target instanceof HTMLInputElement && target.classList.contains("basket-quantity-input")) {
      const quantityControl = target.closest(".basket-quantity-control");
      const itemId = quantityControl instanceof HTMLElement ? quantityControl.dataset.itemId : "";
      const rawQuantity = target.value.trim();

      if (!itemId || rawQuantity === "") {
        return;
      }

      const parsedQuantity = Number.parseInt(rawQuantity, 10);

      if (!Number.isFinite(parsedQuantity)) {
        return;
      }

      const quantity = Math.max(1, parsedQuantity);

      if (quantity !== parsedQuantity) {
        target.value = String(quantity);
      }

      updateBasketItemQuantity(itemId, quantity, {
        renderView: false,
        showNotice: false
      });
      refreshBasketTotalsInDom();
    }
  });

  render();
  bootstrapPublishedData();
}
