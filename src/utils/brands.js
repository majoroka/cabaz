import baseBrands from "../data/brands.json";
import { uniqueValues } from "./helpers.js";

export function getBrandOptions({ basket = [], results = [] } = {}) {
  const importedBasketBrands = basket.map((item) => item.preferredBrand);
  const importedResultBrands = results.map((result) => result.brand);

  return uniqueValues([...baseBrands, ...importedBasketBrands, ...importedResultBrands])
    .map((brand) => String(brand).trim())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "pt-PT", { sensitivity: "base" }));
}

