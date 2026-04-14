import basketExample from "../data/basket.example.json";
import resultsExample from "../data/results.example.json";
import storesExample from "../data/stores.json";
import {
  aggregateTotalsByStore,
  buildComparisonRows,
  enrichResults,
  filterBasketItems,
  getBasketCategories,
  getDashboardSummary
} from "../utils/calculations.js";
import { slugify, uniqueValues } from "../utils/helpers.js";
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

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
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
    editingItemId: null,
    notice: storedBasket ? "Cabaz recuperado do armazenamento local." : "Demo pronta a usar.",
    error: "",
    sources: {
      results: storedResults ? "Ficheiro importado" : "Exemplo local",
      stores: storedStores ? "Ficheiro importado" : "Exemplo local"
    }
  };
}

function getViewModel(state) {
  const filteredItems = filterBasketItems(state.basket, state.filters);
  const categories = getBasketCategories(state.basket);
  const aggregates = aggregateTotalsByStore({
    basket: state.basket,
    results: state.results,
    stores: state.stores,
    filters: state.filters
  });
  const summary = getDashboardSummary(aggregates, filteredItems.length);

  return {
    categories,
    editingItem: state.basket.find((item) => item.id === state.editingItemId) || null,
    aggregates,
    rows: buildComparisonRows({
      basket: state.basket,
      results: state.results,
      stores: state.stores,
      filters: state.filters
    }),
    summary
  };
}

export function createApp(rootElement) {
  if (!rootElement) {
    throw new Error("Não foi possível montar a aplicação.");
  }

  const state = createInitialState();

  function render() {
    rootElement.innerHTML = renderApp({
      state,
      viewModel: getViewModel(state)
    });
  }

  function setNotice(message) {
    state.notice = message;
    state.error = "";
  }

  function setError(message) {
    state.error = message;
    state.notice = "";
  }

  function clearMessages() {
    state.error = "";
    state.notice = "";
  }

  function resetEditor() {
    state.editingItemId = null;
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
      category: String(formData.get("category") || "Sem categoria").trim() || "Sem categoria",
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

  rootElement.addEventListener("submit", (event) => {
    if (event.target instanceof HTMLFormElement && event.target.id === "basket-form") {
      event.preventDefault();
      clearMessages();
      upsertBasketItem(new FormData(event.target));
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

  rootElement.addEventListener("input", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const filterName = target.dataset.filter;

    if (!filterName) {
      return;
    }

    clearMessages();

    if (filterName === "search" && target instanceof HTMLInputElement) {
      state.filters.search = target.value;
      render();
    }
  });

  rootElement.addEventListener("change", async (event) => {
    const target = event.target;

    if (target instanceof HTMLElement && target.dataset.filter) {
      clearMessages();

      if (target.dataset.filter === "category" && target instanceof HTMLSelectElement) {
        state.filters.category = target.value;
      }

      if (target.dataset.filter === "store" && target instanceof HTMLSelectElement) {
        state.filters.store = target.value;
      }

      if (target.dataset.filter === "bestOnly" && target instanceof HTMLInputElement) {
        state.filters.bestOnly = target.checked;
      }

      render();
      return;
    }

    if (target instanceof HTMLInputElement && target.dataset.importType) {
      await importJsonFile(target.files?.[0], target.dataset.importType);
      target.value = "";
    }
  });

  render();
}
