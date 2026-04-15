import { uniqueValues } from "./helpers.js";

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

function pickPrimaryResult(results) {
  return [...results].sort((left, right) => {
    if (left.inStock !== right.inStock) {
      return Number(right.inStock) - Number(left.inStock);
    }

    if (left.confidenceScore !== right.confidenceScore) {
      return right.confidenceScore - left.confidenceScore;
    }

    return left.price - right.price;
  })[0];
}

export function getBasketCategories(basket) {
  return uniqueValues(basket.map((item) => item.category)).sort((left, right) => left.localeCompare(right));
}

export function filterBasketItems(basket, filters) {
  const searchValue = filters.search.trim().toLowerCase();

  return basket.filter((item) => {
    const matchesCategory = filters.category === "all" || item.category === filters.category;
    const haystack = [item.name, item.category, item.preferredBrand, item.notes]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = !searchValue || haystack.includes(searchValue);

    return matchesCategory && matchesSearch;
  });
}

export function getVisibleStoreIds(stores, filters) {
  if (filters.store === "all") {
    return stores.map((store) => store.id);
  }

  return stores.some((store) => store.id === filters.store) ? [filters.store] : [];
}

function getStoreIdsForItem(stores, filters, item) {
  const visibleStoreIds = getVisibleStoreIds(stores, filters);

  if (!item.preferredStore) {
    return visibleStoreIds;
  }

  return visibleStoreIds.includes(item.preferredStore) ? [item.preferredStore] : [];
}

export function selectBestResult(results) {
  const available = results.filter((result) => result.inStock);

  if (available.length === 0) {
    return null;
  }

  return [...available].sort((left, right) => {
    if (left.price !== right.price) {
      return left.price - right.price;
    }

    return right.confidenceScore - left.confidenceScore;
  })[0];
}

export function buildComparisonRows({ basket, results, stores, filters }) {
  const basketItems = filterBasketItems(basket, filters);
  const rows = [];

  basketItems.forEach((item) => {
    const storeIds = getStoreIdsForItem(stores, filters, item);
    const matches = results.filter(
      (result) => result.basketItemId === item.id && storeIds.includes(result.store)
    );

    const matchesByStore = new Map();

    matches.forEach((result) => {
      const entries = matchesByStore.get(result.store) || [];
      entries.push(result);
      matchesByStore.set(result.store, entries);
    });

    const primaryResults = [...matchesByStore.values()].map(pickPrimaryResult);
    const bestResult = selectBestResult(primaryResults);
    const rowsForItem = filters.bestOnly
      ? bestResult
        ? [bestResult]
        : []
      : primaryResults.sort((left, right) => left.price - right.price);

    if (rowsForItem.length === 0) {
      rows.push({
        type: "missing",
        basketItem: item
      });
      return;
    }

    rowsForItem.forEach((result) => {
      const store = stores.find((entry) => entry.id === result.store);

      rows.push({
        type: "result",
        basketItem: item,
        store,
        result,
        isBest: Boolean(bestResult && bestResult.id === result.id),
        lineTotal: item.quantity * result.price
      });
    });
  });

  return rows;
}

export function aggregateTotalsByStore({ basket, results, stores, filters }) {
  const storeIds = getVisibleStoreIds(stores, filters);
  const basketItems = filterBasketItems(basket, filters);

  return storeIds
    .map((storeId) => {
      const store = stores.find((entry) => entry.id === storeId) || { id: storeId, name: storeId };

      const summary = basketItems.reduce(
        (accumulator, item) => {
          if (item.preferredStore && item.preferredStore !== storeId) {
            accumulator.missingCount += 1;
            return accumulator;
          }

          const matches = results.filter(
            (result) => result.store === storeId && result.basketItemId === item.id
          );
          const bestMatch = pickPrimaryResult(matches);

          if (bestMatch?.inStock) {
            accumulator.total += bestMatch.price * item.quantity;
            accumulator.itemCount += 1;
          } else {
            accumulator.missingCount += 1;
          }

          return accumulator;
        },
        {
          store,
          total: 0,
          itemCount: 0,
          missingCount: 0
        }
      );

      return {
        ...summary,
        coverage: basketItems.length === 0 ? 0 : summary.itemCount / basketItems.length
      };
    })
    .filter((entry) => entry.itemCount > 0 || entry.missingCount > 0)
    .sort((left, right) => {
      if (left.coverage !== right.coverage) {
        return right.coverage - left.coverage;
      }

      return left.total - right.total;
    });
}

export function getDashboardSummary(aggregates, basketItemCount) {
  if (aggregates.length === 0) {
    return {
      basketItemCount,
      cheapestStore: null,
      cheapestTotal: null,
      spread: null
    };
  }

  const highestCoverage = aggregates[0].coverage;
  const comparableStores = aggregates.filter((entry) => entry.coverage === highestCoverage);
  const cheapest = comparableStores[0];
  const priciest = comparableStores[comparableStores.length - 1];

  return {
    basketItemCount,
    cheapestStore: cheapest,
    cheapestTotal: cheapest.total,
    spread: priciest.total - cheapest.total
  };
}
