import basketExample from "../data/basket.example.json";
import resultsExample from "../data/results.example.json";
import storesExample from "../data/stores.json";
import { enrichResults } from "../utils/calculations.js";
import { getBrandOptions } from "../utils/brands.js";
import { getCategoryOptions, normalizeCategoryId } from "../utils/categories.js";
import { slugify, uniqueValues } from "../utils/helpers.js";
import {
  createPostalCodeIndex,
  findPostalCodeRecord,
  getPostalCodeSuggestions,
  normalizePostalCodeInput
} from "../utils/postalCodes.js";
import { loadPublishedData } from "../utils/publishedData.js";
import { validateBasketJson, validateResultsJson, validateStoresJson } from "../utils/validation.js";
import { renderApp } from "./render.js";

const STORAGE_KEYS = {
  basket: "cabaz:basket",
  results: "cabaz:results",
  stores: "cabaz:stores"
};

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

function persistJson(storageKey, value) {
  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

function removeStoredJson(storageKey) {
  window.localStorage.removeItem(storageKey);
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

function readFileAsJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch {
        reject(new Error("O ficheiro selecionado não contém JSON válido."));
      }
    };

    reader.onerror = () => reject(new Error("Não foi possível ler o ficheiro selecionado."));
    reader.readAsText(file);
  });
}

function createInitialState() {
  const storedBasket = loadStoredJson(STORAGE_KEYS.basket, validateBasketJson);
  const storedResults = loadStoredJson(STORAGE_KEYS.results, validateResultsJson);
  const storedStores = loadStoredJson(STORAGE_KEYS.stores, validateStoresJson);
  const baseResults = storedResults || cloneValue(resultsExample);
  const baseStores = storedStores || cloneValue(storesExample);

  const stores = createFallbackStoresFromResults(baseResults, baseStores);

  return {
    basket: storedBasket || [],
    catalogProducts: [],
    results: enrichResults(baseResults),
    stores,
    currentSection: DEFAULT_SECTION,
    catalogSearch: cloneValue(DEFAULT_CATALOG_SEARCH),
    editingItemId: null,
    notice: "",
    error: "",
    sources: {
      results: storedResults ? "Ficheiro importado" : "Exemplo local",
      stores: storedStores ? "Ficheiro importado" : "Exemplo local"
    }
  };
}

function getViewModel(state) {
  const categories = getCategoryOptions();
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
        categoryName: getCategoryOptions().find((category) => category.id === categoryId)?.name || "Sem categoria"
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
    const quantity = Math.max(1, Number.parseInt(String(item.quantity || "1"), 10) || 1);

    return {
      item,
      quantity,
      result,
      catalogProduct,
      store,
      lineTotal: result ? result.price * quantity : null
    };
  });
  const basketTotal = basketRows.reduce((total, row) => total + (row.lineTotal || 0), 0);
  const pricedBasketRows = basketRows.filter((row) => row.lineTotal !== null);

  return {
    currentSection: state.currentSection,
    stores: state.stores,
    brands: getBrandOptions({
      basket: state.basket,
      results: state.results
    }),
    categories,
    editingItem: state.basket.find((item) => item.id === state.editingItemId) || null,
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
    summary: {
      basketItemCount: state.basket.length > 0 ? state.basket.length : null,
      cheapestStore: null,
      cheapestTotal: pricedBasketRows.length > 0 ? basketTotal : null,
      spread: null
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

  function resetEditor() {
    state.editingItemId = null;
  }

  function closeCustomSelects(exceptSelect = null) {
    rootElement.querySelectorAll("[data-custom-select]").forEach((select) => {
      if (select !== exceptSelect) {
        select.classList.remove("custom-select-open");
      }
    });
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

  function upsertBasketItem(formData) {
    const normalizedName = String(formData.get("name") || "").trim();

    if (!normalizedName) {
      setError("O nome do item é obrigatório.");
      render();
      return;
    }

    const item = {
      id: String(formData.get("id") || "").trim() || slugify(normalizedName),
      name: normalizedName,
      quantity: Math.max(1, Number.parseInt(String(formData.get("quantity") || "1"), 10) || 1),
      preferredStore: String(formData.get("preferredStore") || "").trim(),
      category: normalizeCategoryId(formData.get("category")),
      preferredBrand: String(formData.get("preferredBrand") || "").trim(),
      notes: String(formData.get("notes") || "").trim()
    };

    const existingIndex = state.basket.findIndex((entry) => entry.id === item.id);

    if (existingIndex >= 0) {
      state.basket.splice(existingIndex, 1, item);
      setNotice(`Item "${item.name}" atualizado.`);
    } else {
      state.basket.unshift(item);
      setNotice(`Item "${item.name}" adicionado ao cabaz.`);
    }

    persistJson(STORAGE_KEYS.basket, state.basket);
    resetEditor();
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

  function updateBasketItemQuantity(itemId, quantity) {
    const normalizedQuantity = Math.max(1, Number.parseInt(String(quantity || "1"), 10) || 1);
    const item = state.basket.find((entry) => entry.id === itemId);

    if (!item) {
      setError("Não foi possível encontrar o item no cabaz.");
      render();
      return;
    }

    item.quantity = normalizedQuantity;
    persistJson(STORAGE_KEYS.basket, state.basket);
    setNotice(`Quantidade atualizada para "${item.name}".`);
    render();
  }

  function removeItem(itemId) {
    const item = state.basket.find((entry) => entry.id === itemId);

    if (!item) {
      return;
    }

    state.basket = state.basket.filter((entry) => entry.id !== itemId);
    persistJson(STORAGE_KEYS.basket, state.basket);
    resetEditor();
    setNotice(`Item "${item.name}" removido.`);
    render();
  }

  async function importJsonFile(file, kind) {
    if (!file) {
      return;
    }

    try {
      const parsed = await readFileAsJson(file);
      const validatorByKind = {
        basket: validateBasketJson,
        results: validateResultsJson,
        stores: validateStoresJson
      };
      const validation = validatorByKind[kind](parsed);

      if (!validation.valid) {
        setError(validation.error);
        render();
        return;
      }

      if (kind === "basket") {
        state.basket = validation.data;
        persistJson(STORAGE_KEYS.basket, state.basket);
        resetEditor();
      }

      if (kind === "results") {
        state.catalogProducts = [];
        state.results = enrichResults(validation.data);
        state.stores = createFallbackStoresFromResults(state.results, state.stores);
        persistJson(STORAGE_KEYS.results, validation.data);
        state.sources.results = "Ficheiro importado";
      }

      if (kind === "stores") {
        state.stores = createFallbackStoresFromResults(state.results, validation.data);
        persistJson(STORAGE_KEYS.stores, validation.data);
        state.sources.stores = "Ficheiro importado";
      }

      setNotice(`Ficheiro ${kind} importado com sucesso.`);
      render();
    } catch (error) {
      setError(error.message || "Não foi possível importar o ficheiro selecionado.");
      render();
    }
  }

  function loadExampleData() {
    state.catalogProducts = [];
    state.results = enrichResults(cloneValue(resultsExample));
    state.stores = createFallbackStoresFromResults(state.results, cloneValue(storesExample));
    state.sources.results = "Exemplo local";
    state.sources.stores = "Exemplo local";
    removeStoredJson(STORAGE_KEYS.results);
    removeStoredJson(STORAGE_KEYS.stores);
    setNotice("Dados de exemplo carregados.");
    render();
  }

  function resetDemo() {
    state.basket = cloneValue(basketExample);
    state.catalogProducts = [];
    state.results = enrichResults(cloneValue(resultsExample));
    state.stores = createFallbackStoresFromResults(state.results, cloneValue(storesExample));
    state.sources.results = "Exemplo local";
    state.sources.stores = "Exemplo local";
    removeStoredJson(STORAGE_KEYS.results);
    removeStoredJson(STORAGE_KEYS.stores);
    persistJson(STORAGE_KEYS.basket, state.basket);
    resetEditor();
    setNotice("Demo reposta com os valores iniciais.");
    render();
  }

  async function bootstrapPublishedData() {
    const isUsingImportedResults = state.sources.results === "Ficheiro importado";
    const isUsingImportedStores = state.sources.stores === "Ficheiro importado";

    try {
      const publishedData = await loadPublishedData(import.meta.env.BASE_URL);

      state.catalogProducts = publishedData.catalogProducts;

      if (publishedData.offers.length > 0 && !isUsingImportedResults && !isUsingImportedStores) {
        state.results = enrichResults(publishedData.offers);
        state.stores = createFallbackStoresFromResults(state.results, publishedData.stores);
        state.sources.results = "Publicação local";
        state.sources.stores = "Publicação local";
        render();
      }
    } catch {
      state.catalogProducts = [];
    }
  }

  rootElement.addEventListener("submit", async (event) => {
    if (event.target instanceof HTMLFormElement && event.target.id === "basket-form") {
      event.preventDefault();
      clearMessages();
      upsertBasketItem(new FormData(event.target));
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

    if (
      event.target instanceof HTMLFormElement &&
      event.target.classList.contains("basket-quantity-form") &&
      event.target.dataset.itemId
    ) {
      event.preventDefault();
      clearMessages();
      const formData = new FormData(event.target);
      updateBasketItemQuantity(event.target.dataset.itemId, formData.get("quantity"));
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
    const importTarget = target.dataset.target;

    if (action === "toggle-custom-select") {
      const customSelect = target.closest("[data-custom-select]");

      if (customSelect instanceof HTMLElement) {
        const isOpen = customSelect.classList.contains("custom-select-open");
        closeCustomSelects(customSelect);
        customSelect.classList.toggle("custom-select-open", !isOpen);
      }

      return;
    }

    if (action === "select-custom-option") {
      const customSelect = target.closest("[data-custom-select]");
      const selectName = target.dataset.selectName;
      const selectValue = target.dataset.selectValue || "";
      const selectLabel = target.dataset.selectLabel || "";

      if (customSelect instanceof HTMLElement) {
        const hiddenInput = selectName ? customSelect.querySelector('input[type="hidden"]') : null;
        const triggerLabel = customSelect.querySelector(".custom-select-trigger span");

        if (hiddenInput instanceof HTMLInputElement) {
          hiddenInput.value = selectValue;
        }

        if (triggerLabel instanceof HTMLElement) {
          triggerLabel.textContent = selectLabel;
        }

        customSelect.classList.remove("custom-select-open");
      }

      return;
    }

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

    if (action === "edit-item" && itemId) {
      state.editingItemId = itemId;
      setNotice("Modo de edição ativo.");
      render();
      return;
    }

    if (action === "remove-item" && itemId) {
      removeItem(itemId);
      return;
    }

    if (action === "clear-edit") {
      resetEditor();
      setNotice("Formulário limpo.");
      render();
      return;
    }

    if (action === "load-example") {
      loadExampleData();
      return;
    }

    if (action === "reset-demo") {
      resetDemo();
      return;
    }

    if (action === "trigger-import" && importTarget) {
      rootElement.querySelector(`#${importTarget}`)?.click();
    }
  });

  rootElement.addEventListener("pointerout", (event) => {
    const target = event.target;
    const customSelect = target instanceof HTMLElement ? target.closest("[data-custom-select]") : null;

    if (!(customSelect instanceof HTMLElement)) {
        return;
    }

    if (event.relatedTarget instanceof Node && customSelect.contains(event.relatedTarget)) {
      return;
    }

    customSelect.classList.remove("custom-select-open");
  });

  rootElement.addEventListener("change", async (event) => {
    const target = event.target;

    if (target instanceof HTMLSelectElement && target.closest("#catalog-filters-form")) {
      state.catalogSearch.filters[target.name] = target.value;
      render();
      return;
    }

    if (target instanceof HTMLInputElement && target.dataset.importType) {
      await importJsonFile(target.files?.[0], target.dataset.importType);
      target.value = "";
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
    }
  });

  render();
  bootstrapPublishedData();
}
