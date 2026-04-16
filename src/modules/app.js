import basketExample from "../data/basket.example.json";
import resultsExample from "../data/results.example.json";
import storesExample from "../data/stores.json";
import {
  aggregateTotalsByStore,
  buildComparisonRows,
  enrichResults,
  filterBasketItems,
  getDashboardSummary
} from "../utils/calculations.js";
import { getBrandOptions } from "../utils/brands.js";
import { getCategoryOptions, normalizeCategoryId } from "../utils/categories.js";
import { slugify, uniqueValues } from "../utils/helpers.js";
import {
  createPostalCodeIndex,
  findPostalCodeRecord,
  getPostalCodeSuggestions,
  normalizePostalCodeInput
} from "../utils/postalCodes.js";
import { validateBasketJson, validateResultsJson, validateStoresJson } from "../utils/validation.js";
import { renderApp } from "./render.js";

const STORAGE_KEYS = {
  basket: "cabaz:basket",
  results: "cabaz:results",
  stores: "cabaz:stores"
};

const DEFAULT_FILTERS = {
  store: "all",
  category: "all",
  bestOnly: false,
  search: ""
};

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

function sortByLabel(items) {
  return [...items].sort((left, right) => left.label.localeCompare(right.label, "pt"));
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
    basket: storedBasket || cloneValue(basketExample),
    results: enrichResults(baseResults),
    stores,
    filters: { ...DEFAULT_FILTERS },
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
  const filteredItems = filterBasketItems(state.basket, state.filters);
  const categories = getCategoryOptions();
  const aggregates = aggregateTotalsByStore({
    basket: state.basket,
    results: state.results,
    stores: state.stores,
    filters: state.filters
  });
  const summary = getDashboardSummary(aggregates, filteredItems.length);
  const catalogSearchRecords = state.catalogSearch.resultIds
    .map((resultId) => {
      const result = state.results.find((entry) => entry.id === resultId);

      if (!result) {
        return null;
      }

      const store = state.stores.find((entry) => entry.id === result.store) || null;
      const basketItem = state.basket.find((item) => item.id === result.basketItemId) || null;
      const brand = result.brand || basketItem?.preferredBrand || "";
      const categoryId = basketItem?.category || "sem_categoria";

      return {
        result,
        store,
        basketItem,
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

  return {
    brands: getBrandOptions({
      basket: state.basket,
      results: state.results
    }),
    categories,
    editingItem: state.basket.find((item) => item.id === state.editingItemId) || null,
    aggregates,
    rows: buildComparisonRows({
      basket: state.basket,
      results: state.results,
      stores: state.stores,
      filters: state.filters
    }),
    catalogSearch: {
      ...state.catalogSearch,
      resultCount: catalogSearchRecords.length,
      rows: visibleCatalogRecords,
      options: catalogFilterOptions
    },
    summary
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
    const datalist = rootElement.querySelector("#postal-code-options");

    if (!(datalist instanceof HTMLDataListElement)) {
      return;
    }

    datalist.replaceChildren(
      ...state.catalogSearch.postalSuggestions.map((record) => {
        const option = document.createElement("option");
        option.value = record.code;
        option.textContent = record.label;
        return option;
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
    const normalizedQuery = normalizeSearchText(query);

    if (!normalizedQuery) {
      setError("Escreva um termo de pesquisa.");
      render();
      return;
    }

    const matches = state.results.filter((result) => {
      const basketItem = state.basket.find((item) => item.id === result.basketItemId);
      const store = state.stores.find((entry) => entry.id === result.store);
      const haystack = normalizeSearchText(
        [
          result.matchedName,
          result.brand,
          basketItem?.name,
          basketItem?.preferredBrand,
          basketItem?.notes,
          basketItem?.category,
          store?.name
        ]
          .filter(Boolean)
          .join(" ")
      );

      return haystack.includes(normalizedQuery);
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
    state.results = enrichResults(cloneValue(resultsExample));
    state.stores = createFallbackStoresFromResults(state.results, cloneValue(storesExample));
    state.filters = { ...DEFAULT_FILTERS };
    state.sources.results = "Exemplo local";
    state.sources.stores = "Exemplo local";
    removeStoredJson(STORAGE_KEYS.results);
    removeStoredJson(STORAGE_KEYS.stores);
    persistJson(STORAGE_KEYS.basket, state.basket);
    resetEditor();
    setNotice("Demo reposta com os valores iniciais.");
    render();
  }

  rootElement.addEventListener("submit", async (event) => {
    if (event.target instanceof HTMLFormElement && event.target.id === "basket-form") {
      event.preventDefault();
      clearMessages();
      upsertBasketItem(new FormData(event.target));
      return;
    }

    if (event.target instanceof HTMLFormElement && event.target.id === "hero-search-form") {
      event.preventDefault();
      const formData = new FormData(event.target);
      const postalCode = normalizePostalCodeInput(String(formData.get("postalCode") || "").trim());

      if (postalCode) {
        try {
          const index = await ensurePostalCodeIndex();
          const postalRecord = findPostalCodeRecord(index, postalCode);

          if (!postalRecord) {
            setError("Introduza um código postal válido no formato 0000-000.");
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
        const normalizedPostalCode = normalizePostalCodeInput(target.value);

        state.catalogSearch.postalCode = normalizedPostalCode;
        state.catalogSearch.postalLabel = "";
        state.catalogSearch.postalSuggestions = [];

        if (target.value !== normalizedPostalCode) {
          target.value = normalizedPostalCode;
        }

        if (normalizedPostalCode.replace(/\D/g, "").length >= 4) {
          try {
            const index = await ensurePostalCodeIndex();
            state.catalogSearch.postalSuggestions = getPostalCodeSuggestions(index, normalizedPostalCode);
          } catch {
            state.catalogSearch.postalSuggestions = [];
          }
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
}
