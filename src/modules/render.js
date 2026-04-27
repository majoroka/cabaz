import { formatCurrency, formatDate, formatSize, formatUnitPrice } from "../utils/formatters.js";
import { escapeHtml } from "../utils/helpers.js";
import { getCategoryName } from "../utils/categories.js";

const NAV_ITEMS = [
  { id: "painel", label: "Painel" },
  { id: "lojas", label: "Lojas" },
  { id: "favoritos", label: "Favoritos" },
  { id: "cabaz", label: "Cabaz" },
  { id: "listagem", label: "Listagem" },
  { id: "comparacao", label: "Comparação" }
];

const STORE_LOGO_MAP = {
  aldi: "aldi.png",
  amanhecer: "amanhecer.png",
  apolonia: "apolonia.png",
  auchan: "auchan.png",
  continente: "continente.png",
  coviran: "coviran.png",
  intermarche: "intermarche.png",
  lidl: "lidl.png",
  mercadona: "mercadona.png",
  minipreco: "minipreco.png",
  "meu-super": "meusuper.png",
  "pingo-doce": "pingodoce.png",
  spar: "spar.png"
};

function renderFlash(state) {
  if (state.error) {
    return `<div class="flash flash-error">${escapeHtml(state.error)}</div>`;
  }

  if (state.notice) {
    return `<div class="flash flash-notice">${escapeHtml(state.notice)}</div>`;
  }

  return "";
}

function renderSelectField({ label, name, value, options }) {
  return `
    <label class="filter-field">
      <span>${escapeHtml(label)}</span>
      <select name="${escapeHtml(name)}">
        ${options
          .map(
            (option) => `
              <option value="${escapeHtml(option.value)}" ${option.value === value ? "selected" : ""}>
                ${escapeHtml(option.label)}
              </option>
            `
          )
          .join("")}
      </select>
    </label>
  `;
}

function pluralize(value, singular, plural) {
  return value === 1 ? singular : plural;
}

function formatDistance(distanceKm) {
  if (typeof distanceKm !== "number" || !Number.isFinite(distanceKm)) {
    return "";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toLocaleString("pt-PT", {
    maximumFractionDigits: distanceKm < 10 ? 1 : 0
  })} km`;
}

export function getSummaryCards(summary) {
  const basketItemCount = summary.basketItemCount || 0;
  const basketQuantityCount = summary.basketQuantityCount || 0;
  const basketPricedItemCount = summary.basketPricedItemCount || 0;
  const favoriteCount = summary.favoriteCount || 0;
  const completeStoreCount = summary.completeStoreCount || 0;
  const comparedStoreCount = summary.comparedStoreCount || 0;
  const cheapestStore = summary.cheapestStore || null;
  const mostExpensiveStore = summary.mostExpensiveStore || null;

  return [
    {
      id: "basket-items",
      label: "Itens no cabaz",
      value: String(basketItemCount),
      copy:
        basketItemCount === 0
          ? `${favoriteCount} ${pluralize(favoriteCount, "favorito guardado", "favoritos guardados")}. Adicione produtos para começar.`
          : `${basketQuantityCount} ${pluralize(basketQuantityCount, "unidade", "unidades")} no total · ${basketPricedItemCount}/${basketItemCount} ${pluralize(basketItemCount, "item", "itens")} com preço.`
    },
    {
      id: "cheapest-store",
      label: "Loja mais barata",
      value: cheapestStore?.store.name || "—",
      copy:
        basketItemCount === 0
          ? "Será calculada quando existir um cabaz ativo."
          : cheapestStore
            ? completeStoreCount > 1
              ? `${completeStoreCount} lojas com cobertura completa do cabaz.`
              : "Única loja com cobertura completa do cabaz."
            : `Nenhuma das ${comparedStoreCount} ${pluralize(comparedStoreCount, "loja", "lojas")} cobre ainda todo o cabaz.`
    },
    {
      id: "cheapest-total",
      label: "Total mais baixo",
      value: summary.cheapestTotal == null ? "—" : formatCurrency(summary.cheapestTotal),
      copy:
        basketItemCount === 0
          ? "Adicione produtos para calcular o total."
          : summary.cheapestTotal == null
            ? "Aguardando preços suficientes para uma loja cobrir todo o cabaz."
            : `Estimativa em ${cheapestStore?.store.name || "loja com menor total"}.`
    },
    {
      id: "store-spread",
      label: "Diferença entre lojas",
      value: summary.spread == null ? "—" : formatCurrency(summary.spread),
      copy:
        basketItemCount === 0
          ? "Aparece quando houver cabaz e lojas comparáveis."
          : summary.spread == null
            ? "Necessárias pelo menos duas lojas com cobertura completa."
            : `${cheapestStore?.store.name || "Mais barata"} vs. ${mostExpensiveStore?.store.name || "mais cara"}.`
    }
  ];
}

function renderSummaryCards(summary) {
  const cards = getSummaryCards(summary);

  return `
    <section class="summary-grid">
      ${cards
        .map(
          (card, index) => `
            <article class="summary-card ${index === cards.length - 1 ? "summary-card-featured" : ""}">
              <span class="summary-label">${escapeHtml(card.label)}</span>
              <strong data-summary-value="${escapeHtml(card.id)}">${escapeHtml(card.value)}</strong>
              <p data-summary-copy="${escapeHtml(card.id)}">${escapeHtml(card.copy)}</p>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function getStoreLogoFilename(storeId) {
  return STORE_LOGO_MAP[storeId] || null;
}

function renderStoreLogo({ store, className = "" }) {
  const logoFilename = getStoreLogoFilename(store.id);

  return logoFilename
    ? `<img class="${escapeHtml(className)}" src="./lojas/${escapeHtml(logoFilename)}" alt="${escapeHtml(store.name)}" loading="lazy" />`
    : `<span class="${escapeHtml(className)}">${escapeHtml(store.name.slice(0, 1))}</span>`;
}

function renderFavoriteButton({ productId, isFavorite, label }) {
  return `
    <button
      type="button"
      class="favorite-button ${isFavorite ? "favorite-button-active" : ""}"
      data-action="toggle-favorite"
      data-product-id="${escapeHtml(productId)}"
      aria-pressed="${isFavorite ? "true" : "false"}"
      aria-label="${escapeHtml(label)}"
      title="${escapeHtml(label)}"
    >
      <span aria-hidden="true">${isFavorite ? "♥" : "♡"}</span>
    </button>
  `;
}

function renderStoresDirectory(stores) {
  return `
    <section class="panel-card stores-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Lojas</p>
          <h2>Lojas suportadas</h2>
        </div>
      </div>
      <div class="stores-grid">
        ${stores
          .map((store) => {
            const logoFilename = getStoreLogoFilename(store.id);
            const logoMarkup = logoFilename
              ? `<img src="./lojas/${escapeHtml(logoFilename)}" alt="${escapeHtml(store.name)}" loading="lazy" />`
              : `<span class="store-logo-fallback">${escapeHtml(store.name)}</span>`;

            return `
              <a
                class="store-link-card"
                href="${escapeHtml(store.website || "#")}"
                target="_blank"
                rel="noreferrer noopener"
                ${store.website ? "" : 'aria-disabled="true"'}
              >
                <span class="store-logo-box">
                  ${logoMarkup}
                </span>
                <strong>${escapeHtml(store.name)}</strong>
              </a>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderComingSoonSection(title) {
  return `
    <section class="panel-card section-placeholder">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${escapeHtml(title)}</p>
          <h2>Em preparação</h2>
        </div>
      </div>
      <div class="section-placeholder-body">
        <p>Esta área será implementada de seguida.</p>
      </div>
    </section>
  `;
}

function renderBasketSection(basketView) {
  if (basketView.rows.length === 0) {
    return `
      <section class="panel-card basket-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Cabaz</p>
            <h2>O cabaz ainda está vazio</h2>
          </div>
        </div>
        <div class="basket-empty">
          <p>Pesquise produtos no topo da página e use o botão + para os adicionar ao cabaz.</p>
          <button type="button" class="button button-primary" data-action="set-section" data-section="painel">
            Pesquisar produtos
          </button>
        </div>
      </section>
    `;
  }

  return `
    <section class="panel-card basket-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Cabaz</p>
          <h2>${escapeHtml(String(basketView.itemCount))} produtos adicionados</h2>
        </div>
        <button type="button" class="button button-danger button-small" data-action="clear-basket">
          Esvaziar cabaz
        </button>
      </div>
      <div class="basket-summary-strip">
        <div>
          <span>Total estimado</span>
          <strong class="basket-total-value">${basketView.total == null ? "—" : formatCurrency(basketView.total)}</strong>
        </div>
        <div>
          <span>Com preço conhecido</span>
          <strong>${escapeHtml(String(basketView.pricedItemCount))}/${escapeHtml(String(basketView.itemCount))}</strong>
        </div>
      </div>
      <div class="basket-lines">
        ${basketView.rows
          .map((row) => {
            const storeId = row.store?.id || row.result?.store || row.item.preferredStore;
            const storeName = row.store?.name || storeId || "Loja por definir";
            const storeLogoFilename = getStoreLogoFilename(storeId);

            return `
              <article class="basket-line" data-item-id="${escapeHtml(row.item.id)}">
                <div class="basket-line-media">
                  ${
                    row.result?.image
                      ? `<img
                          src="${escapeHtml(row.result.image)}"
                          alt="${escapeHtml(row.result.matchedName)}"
                          loading="lazy"
                          referrerpolicy="no-referrer"
                        />`
                      : `<span class="basket-line-image-fallback">Sem imagem</span>`
                  }
                </div>
                <div class="basket-line-main">
                  <div class="product-title-row">
                    <h3>${escapeHtml(row.item.name)}</h3>
                    ${renderFavoriteButton({
                      productId: row.item.id,
                      isFavorite: row.isFavorite,
                      label: row.isFavorite
                        ? `Remover ${row.item.name} dos favoritos`
                        : `Adicionar ${row.item.name} aos favoritos`
                    })}
                  </div>
                  <p>
                    ${escapeHtml(getCategoryName(row.item.category))}
                    ${row.item.preferredBrand ? ` · ${escapeHtml(row.item.preferredBrand)}` : ""}
                  </p>
                  ${row.item.notes ? `<small>${escapeHtml(row.item.notes)}</small>` : ""}
                </div>
                <div class="basket-line-store">
                  ${
                    storeLogoFilename
                      ? `<img src="./lojas/${escapeHtml(storeLogoFilename)}" alt="${escapeHtml(storeName)}" />`
                      : `<strong>${escapeHtml(storeName)}</strong>`
                  }
                  <span>${escapeHtml(storeName)}</span>
                </div>
                <div class="basket-line-price">
                  <span>Preço</span>
                  <strong>${row.result ? formatCurrency(row.result.price) : "—"}</strong>
                  <small>${row.result ? escapeHtml(formatUnitPrice(row.result.unitPrice, row.result.unit)) : "Sem preço"}</small>
                </div>
                <div class="basket-quantity-control" data-item-id="${escapeHtml(row.item.id)}">
                  <label>
                    <span>Qtd.</span>
                    <input
                      class="basket-quantity-input"
                      type="number"
                      name="quantity"
                      min="1"
                      step="1"
                      value="${escapeHtml(String(row.quantity))}"
                      inputmode="numeric"
                      aria-label="Quantidade no cabaz"
                    />
                  </label>
                </div>
                <div class="basket-line-total">
                  <span>Subtotal</span>
                  <strong class="basket-line-subtotal">${row.lineTotal == null ? "—" : formatCurrency(row.lineTotal)}</strong>
                </div>
                <div class="basket-line-action">
                  <button
                    type="button"
                    class="basket-remove-button"
                    data-action="remove-item"
                    data-item-id="${escapeHtml(row.item.id)}"
                    aria-label="Remover ${escapeHtml(row.item.name)} do cabaz"
                    title="Remover do cabaz"
                  >
                    <span aria-hidden="true">−</span>
                  </button>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderShoppingListSection(basketView) {
  if (basketView.rows.length === 0) {
    return `
      <section class="panel-card shopping-list-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Listagem</p>
            <h2>A listagem ainda está vazia</h2>
          </div>
        </div>
        <div class="basket-empty">
          <p>Adicione produtos ao cabaz para gerar uma lista de compras simples e imprimível.</p>
          <button type="button" class="button button-primary" data-action="set-section" data-section="painel">
            Pesquisar produtos
          </button>
        </div>
      </section>
    `;
  }

  const totalQuantity = basketView.rows.reduce((sum, row) => sum + row.quantity, 0);

  return `
    <section class="panel-card shopping-list-panel">
      <div class="section-heading shopping-list-heading">
        <div>
          <p class="eyebrow">Listagem</p>
          <h2>Lista de compras</h2>
        </div>
        <button type="button" class="button button-primary button-small shopping-print-button" data-action="print-list">
          Imprimir
        </button>
      </div>
      <div class="shopping-list-summary">
        <div>
          <span>Produtos</span>
          <strong>${escapeHtml(String(basketView.itemCount))}</strong>
        </div>
        <div>
          <span>Unidades</span>
          <strong>${escapeHtml(String(totalQuantity))}</strong>
        </div>
        <div>
          <span>Total estimado</span>
          <strong>${basketView.total == null ? "—" : formatCurrency(basketView.total)}</strong>
        </div>
      </div>
      <div class="shopping-list-lines">
        ${basketView.rows
          .map((row) => {
            const storeId = row.store?.id || row.result?.store || row.item.preferredStore;
            const storeName = row.store?.name || storeId || "Loja por definir";
            const storeLogoFilename = getStoreLogoFilename(storeId);
            const productName = row.result?.matchedName || row.item.name;
            const imageMarkup = row.result?.image
              ? `<img
                  src="${escapeHtml(row.result.image)}"
                  alt="${escapeHtml(productName)}"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                />`
              : `<span class="shopping-list-image-fallback">Sem imagem</span>`;

            return `
              <article class="shopping-list-line">
                <span class="shopping-list-check" aria-hidden="true"></span>
                <div class="shopping-list-media">
                  ${
                    row.result?.url
                      ? `<a href="${escapeHtml(row.result.url)}" target="_blank" rel="noreferrer" title="Ver o produto na loja">${imageMarkup}</a>`
                      : imageMarkup
                  }
                </div>
                <div class="shopping-list-main">
                  <h3>${escapeHtml(row.item.name)}</h3>
                  <p>
                    ${escapeHtml(getCategoryName(row.item.category))}
                    ${row.item.preferredBrand ? ` · ${escapeHtml(row.item.preferredBrand)}` : ""}
                  </p>
                  ${
                    row.item.notes || row.result?.notes
                      ? `<small>${escapeHtml(row.item.notes || row.result.notes)}</small>`
                      : ""
                  }
                </div>
                <div class="shopping-list-store">
                  <span>Loja/preço</span>
                  <strong>${escapeHtml(storeName)}</strong>
                  ${
                    storeLogoFilename
                      ? `<img src="./lojas/${escapeHtml(storeLogoFilename)}" alt="${escapeHtml(storeName)}" loading="lazy" />`
                      : ""
                  }
                  <small>${row.result ? `${formatCurrency(row.result.price)} · ${escapeHtml(formatUnitPrice(row.result.unitPrice, row.result.unit))}` : "Preço indisponível"}</small>
                </div>
                <div class="shopping-list-quantity">
                  <span>Qtd.</span>
                  <strong>${escapeHtml(String(row.quantity))}</strong>
                </div>
                <div class="shopping-list-total">
                  <span>Subtotal</span>
                  <strong>${row.lineTotal == null ? "—" : formatCurrency(row.lineTotal)}</strong>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderFavoritesSection(favoritesView) {
  if (favoritesView.itemCount === 0) {
    return `
      <section class="panel-card favorites-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Favoritos</p>
            <h2>Ainda não existem favoritos</h2>
          </div>
        </div>
        <div class="basket-empty">
          <p>Use o coração nos resultados da pesquisa para guardar produtos recorrentes.</p>
          <button type="button" class="button button-primary" data-action="set-section" data-section="painel">
            Pesquisar produtos
          </button>
        </div>
      </section>
    `;
  }

  const storeOptions = [
    { value: "all", label: "Todas" },
    ...favoritesView.options.stores
  ];
  const categoryOptions = [
    { value: "all", label: "Todas" },
    ...favoritesView.options.categories
  ];
  const brandOptions = [
    { value: "all", label: "Todas" },
    ...favoritesView.options.brands
  ];

  return `
    <section class="panel-card favorites-panel">
      <div class="section-heading favorites-heading">
        <div>
          <p class="eyebrow">Favoritos</p>
          <h2>${escapeHtml(String(favoritesView.itemCount))} produtos guardados</h2>
        </div>
        <span class="status-tag">${escapeHtml(String(favoritesView.visibleCount))} visíveis</span>
      </div>
      <div class="favorites-toolbar">
        <form id="favorites-filters-form" class="favorites-filters">
          <label class="filter-field favorites-search-field">
            <span>Pesquisar favoritos</span>
            <input
              type="search"
              name="query"
              value="${escapeHtml(favoritesView.filters.query)}"
              placeholder="Ex.: leite, arroz, ovos"
              aria-label="Pesquisar nos favoritos"
            />
          </label>
          ${renderSelectField({
            label: "Lojas",
            name: "store",
            value: favoritesView.filters.store,
            options: storeOptions
          })}
          ${renderSelectField({
            label: "Categorias",
            name: "category",
            value: favoritesView.filters.category,
            options: categoryOptions
          })}
          ${renderSelectField({
            label: "Marcas",
            name: "brand",
            value: favoritesView.filters.brand,
            options: brandOptions
          })}
        </form>
        <div class="favorites-actions">
          <button type="button" class="button button-small" data-action="clear-favorites-filters">
            Limpar filtros
          </button>
          <button
            type="button"
            class="button button-primary button-small"
            data-action="add-visible-favorites"
            ${favoritesView.addableCount === 0 ? "disabled" : ""}
          >
            Adicionar todos visíveis
          </button>
        </div>
      </div>
      ${
        favoritesView.rows.length === 0
          ? `<p class="empty-state">Não existem favoritos visíveis com os filtros atuais.</p>`
          : `<div class="catalog-results-grid favorites-grid">
              ${favoritesView.rows
                .map((entry) => {
                  const productId = entry.favorite.productId;
                  const productName = entry.catalogProduct?.name || entry.result?.matchedName || "Produto";
                  const storeId = entry.store?.id || entry.result?.store || "";
                  const storeName = entry.store?.name || storeId || "Loja por definir";
                  const storeLogoFilename = getStoreLogoFilename(storeId);

                  return `
                    <article class="catalog-result-card favorite-result-card">
                      <div class="catalog-result-store-block">
                        <span class="catalog-store" title="${escapeHtml(storeName)}">
                          ${
                            storeLogoFilename
                              ? `<img
                                  src="./lojas/${escapeHtml(storeLogoFilename)}"
                                  alt="${escapeHtml(storeName)}"
                                  class="catalog-store-logo"
                                  loading="lazy"
                                />`
                              : `<span class="catalog-store-fallback">${escapeHtml(storeName)}</span>`
                          }
                        </span>
                        <span class="catalog-store-name">${escapeHtml(storeName)}</span>
                      </div>
                      <div class="catalog-result-media-shell">
                        ${
                          entry.result?.image
                            ? `${
                                entry.result.url
                                  ? `<a
                                      class="catalog-result-media"
                                      href="${escapeHtml(entry.result.url)}"
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Ver o produto na loja"
                                      aria-label="Ver o produto na loja"
                                    >`
                                  : `<div class="catalog-result-media">`
                              }
                                <img
                                  src="${escapeHtml(entry.result.image)}"
                                  alt="${escapeHtml(entry.result.matchedName)}"
                                  loading="lazy"
                                  referrerpolicy="no-referrer"
                                />
                              ${entry.result.url ? `</a>` : `</div>`}`
                            : `<div class="catalog-result-media"><span class="catalog-media-fallback">Sem imagem</span></div>`
                        }
                      </div>
                      <div class="catalog-result-price-block">
                        <strong>${entry.result ? formatCurrency(entry.result.price) : "—"}</strong>
                        <span class="catalog-result-price-label">Preço unitário</span>
                        <span class="catalog-result-price-unit">${entry.result ? escapeHtml(formatUnitPrice(entry.result.unitPrice, entry.result.unit)) : "Sem preço"}</span>
                      </div>
                      <div class="catalog-result-info">
                        <div class="product-title-row">
                          <h3>${escapeHtml(productName)}</h3>
                          ${renderFavoriteButton({
                            productId,
                            isFavorite: true,
                            label: `Remover ${productName} dos favoritos`
                          })}
                        </div>
                        <p class="catalog-result-meta">
                          ${escapeHtml(entry.categoryName)}
                          ${entry.brand ? ` · ${escapeHtml(entry.brand)}` : ""}
                        </p>
                        ${
                          entry.result?.notes
                            ? `<p class="catalog-result-note">${escapeHtml(entry.result.notes)}</p>`
                            : ""
                        }
                        <div class="catalog-result-format">
                          <span class="catalog-result-format-label">Formato</span>
                          <strong>${entry.result ? escapeHtml(formatSize(entry.result.size, entry.result.sizeUnit)) : "n/d"}</strong>
                        </div>
                      </div>
                      <div class="catalog-result-status">
                        <div class="catalog-result-status-item">
                          <span class="catalog-result-status-label">Estado</span>
                          <strong>${entry.result?.inStock ? "Disponível" : "Sem preço"}</strong>
                        </div>
                        <div class="catalog-result-status-item">
                          <span class="catalog-result-status-label">Atualizado</span>
                          <strong>${entry.result ? escapeHtml(formatDate(entry.result.lastUpdated)) : "n/d"}</strong>
                        </div>
                      </div>
                      <div class="catalog-result-actions">
                        ${
                          entry.result
                            ? `<form class="catalog-add-form" data-result-id="${escapeHtml(entry.result.id)}">
                                <label class="catalog-quantity-field">
                                  <span>Qtd.</span>
                                  <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    step="1"
                                    value="1"
                                    inputmode="numeric"
                                    aria-label="Quantidade a adicionar ao cabaz"
                                  />
                                </label>
                                <button type="submit" class="catalog-add-button" aria-label="Adicionar ao cabaz">
                                  <span aria-hidden="true">+</span>
                                </button>
                              </form>`
                            : `<span class="empty-state-inline">Sem oferta disponível</span>`
                        }
                      </div>
                    </article>
                  `;
                })
                .join("")}
            </div>`
      }
    </section>
  `;
}

function renderEquivalenceReviewSection(comparisonView) {
  const reviews = comparisonView.equivalenceReviews || {
    rows: [],
    summary: { total: 0, pending: 0, approved: 0, needsReview: 0 }
  };

  return `
    <div class="comparison-review-panel">
      <div class="comparison-review-heading">
        <div>
          <p class="eyebrow">Validação</p>
          <h3>Correspondências a validar</h3>
          <p>Confirme manualmente se os seguintes produtos podem ser considerados como equivalentes, uma vez que o produto exato não foi encontrado noutras lojas.</p>
        </div>
        <div class="comparison-review-counts" aria-label="Resumo da validação de equivalências">
          <span>${escapeHtml(String(reviews.summary.pending))} por validar</span>
          <span>${escapeHtml(String(reviews.summary.approved))} aprovadas</span>
          <span>${escapeHtml(String(reviews.summary.needsReview))} a rever</span>
        </div>
      </div>
      ${
        reviews.rows.length === 0
          ? `<p class="empty-state">Sem correspondências controladas no cabaz atual. Os produtos estão como exatos ou em falta.</p>`
          : `<div class="comparison-review-lines">
              ${reviews.rows
                .map((row) => {
                  const relationLabel = row.matchType === "alternative" ? "Alternativa" : "Equivalente";
                  const statusLabel =
                    row.status === "approved"
                      ? "Aprovada"
                      : row.status === "needs_review"
                        ? "A rever"
                        : "Por validar";
                  const confidence =
                    typeof row.matchRule?.confidenceScore === "number"
                      ? `${Math.round(row.matchRule.confidenceScore * 100)}%`
                      : typeof row.result.confidenceScore === "number"
                      ? `${Math.round(row.result.confidenceScore * 100)}%`
                      : "n/d";
                  const referenceImage = row.referenceResult?.image || "";
                  const referenceStore = row.referenceStore || {
                    id: row.item.preferredStore || "",
                    name: row.item.preferredStore || "Loja original"
                  };
                  const referenceBrand = row.item.preferredBrand || row.referenceResult?.brand || "";
                  const referenceSize = formatSize(
                    row.referenceResult?.size || row.resultProduct?.size || null,
                    row.referenceResult?.sizeUnit || row.resultProduct?.sizeUnit || null
                  );
                  const referencePrice = row.referenceResult?.price ?? null;
                  const referenceUnitPrice = row.referenceResult?.unitPrice ?? null;
                  const referenceUnit = row.referenceResult?.unit ?? "";
                  const candidateBrand = row.result.brand || "";
                  const candidateSize = formatSize(row.result.size, row.result.sizeUnit);

                  return `
                    <article class="comparison-review-line">
                      <div class="comparison-review-side comparison-review-side-reference">
                        <span>Produto no cabaz</span>
                        <div class="comparison-review-side-shell">
                          <div class="comparison-review-product-shell">
                            <div class="comparison-review-product-store">
                              ${renderStoreLogo({
                                store: referenceStore,
                                className: "comparison-review-store-logo"
                              })}
                              <small>${escapeHtml(referenceStore.name)}</small>
                            </div>
                            <div class="comparison-review-product-media">
                              ${
                                referenceImage
                                  ? `<img src="${escapeHtml(referenceImage)}" alt="${escapeHtml(row.item.name)}" loading="lazy" referrerpolicy="no-referrer" />`
                                  : `<span>Sem imagem</span>`
                              }
                            </div>
                            <div class="comparison-review-product-copy">
                              <strong>${escapeHtml(row.item.name)}</strong>
                              <small>
                                ${escapeHtml(getCategoryName(row.item.category))}
                                ${referenceBrand ? ` · ${escapeHtml(referenceBrand)}` : ""}
                                ${referenceSize ? ` · ${escapeHtml(referenceSize)}` : ""}
                              </small>
                              ${
                                row.item.notes
                                  ? `<small>${escapeHtml(row.item.notes)}</small>`
                                  : ""
                              }
                            </div>
                          </div>
                          <div class="comparison-review-meta comparison-review-side-price">
                            <strong>${referencePrice == null ? "—" : formatCurrency(referencePrice)}</strong>
                            <small>${escapeHtml(referenceUnitPrice == null ? "Sem preço base" : formatUnitPrice(referenceUnitPrice, referenceUnit))}</small>
                          </div>
                        </div>
                      </div>
                      <div class="comparison-review-side comparison-review-side-candidate">
                        <span>Produto candidato</span>
                        <div class="comparison-review-side-shell">
                          <div class="comparison-review-product-shell">
                            <div class="comparison-review-product-store">
                              ${renderStoreLogo({
                                store: row.store,
                                className: "comparison-review-store-logo"
                              })}
                              <small>${escapeHtml(row.store.name)}</small>
                            </div>
                            <div class="comparison-review-product-media">
                              ${
                                row.result?.image
                                  ? `<img src="${escapeHtml(row.result.image)}" alt="${escapeHtml(row.result.matchedName)}" loading="lazy" referrerpolicy="no-referrer" />`
                                  : `<span>Sem imagem</span>`
                              }
                            </div>
                            <div class="comparison-review-product-copy">
                              <strong>${escapeHtml(row.result.matchedName)}</strong>
                              <small>
                                ${escapeHtml(relationLabel)}
                                ${row.countsForTotal ? " · entra no total" : " · fora do total"}
                                ${candidateBrand ? ` · ${escapeHtml(candidateBrand)}` : ""}
                                ${candidateSize ? ` · ${escapeHtml(candidateSize)}` : ""}
                              </small>
                              ${
                                row.result.notes
                                  ? `<small>${escapeHtml(row.result.notes)}</small>`
                                  : ""
                              }
                            </div>
                          </div>
                          <div class="comparison-review-meta comparison-review-side-price">
                            <strong>${formatCurrency(row.result.price)}</strong>
                            <small>${escapeHtml(formatUnitPrice(row.result.unitPrice, row.result.unit))}</small>
                          </div>
                        </div>
                      </div>
                      <div class="comparison-review-meta comparison-review-confidence">
                        <span>Confiança</span>
                        <strong>${escapeHtml(confidence)}</strong>
                        <small>${row.reviewedAt ? `Revisto em ${escapeHtml(formatDate(row.reviewedAt))}` : "Sem decisão manual"}</small>
                      </div>
                      <div class="comparison-review-actions">
                        <span class="comparison-review-status comparison-review-status-${escapeHtml(row.status)}">
                          ${escapeHtml(statusLabel)}
                        </span>
                        <div>
                          ${
                            row.status !== "approved"
                              ? `<button
                                  type="button"
                                  class="button button-small"
                                  data-action="set-equivalence-review"
                                  data-review-id="${escapeHtml(row.id)}"
                                  data-review-status="approved"
                                >
                                  Aprovar
                                </button>`
                              : ""
                          }
                          <button
                            type="button"
                            class="button button-small button-secondary"
                            data-action="set-equivalence-review"
                            data-review-id="${escapeHtml(row.id)}"
                            data-review-status="needs_review"
                          >
                            Rever
                          </button>
                          ${
                            row.status !== "pending"
                              ? `<button
                                  type="button"
                                  class="button button-small button-ghost"
                                  data-action="set-equivalence-review"
                                  data-review-id="${escapeHtml(row.id)}"
                                  data-review-status="pending"
                                >
                                  Limpar
                                </button>`
                              : ""
                          }
                        </div>
                      </div>
                    </article>
                  `;
                })
                .join("")}
            </div>`
      }
    </div>
  `;
}

function renderComparisonSection(comparisonView) {
  if (comparisonView.itemCount === 0) {
    return `
      <section class="panel-card comparison-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Comparação</p>
            <h2>Adicione produtos ao cabaz</h2>
          </div>
        </div>
        <div class="basket-empty">
          <p>A comparação usa os produtos do cabaz para calcular o total em cada loja disponível.</p>
          <button type="button" class="button button-primary" data-action="set-section" data-section="painel">
            Pesquisar produtos
          </button>
        </div>
      </section>
    `;
  }

  if (comparisonView.stores.length === 0) {
    return `
      <section class="panel-card comparison-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Comparação</p>
            <h2>Sem lojas com dados publicados</h2>
          </div>
        </div>
        <p class="empty-state">Quando existirem ofertas publicadas em public/data/offers.json, a comparação será apresentada aqui.</p>
      </section>
    `;
  }

  const activeStore = comparisonView.activeStore;
  const activeStoreLogo = getStoreLogoFilename(activeStore.store.id);
  const activeStoreDistance = formatDistance(activeStore.distanceKm);
  const activeStoreLocationParts = [
    activeStore.location?.name,
    activeStore.location?.address,
    activeStore.location?.postalCode,
    activeStore.location?.locality
  ].filter(Boolean);
  const activeStoreStatusCopy = activeStore.complete
    ? "Cobertura completa do cabaz nesta loja."
    : `${activeStore.notPricedCount} ${activeStore.notPricedCount === 1 ? "produto fora do total" : "produtos fora do total"} nesta loja.`;
  const proximityCopy =
    comparisonView.sortMode === "distance" && comparisonView.locationReference
      ? `Lojas ordenadas por proximidade a ${comparisonView.locationReference.label}.`
      : "Sem localização selecionada; lojas ordenadas por cobertura e preço.";

  return `
    <section class="panel-card comparison-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Comparação</p>
          <h2>Comparação do cabaz por loja</h2>
        </div>
        <span class="status-tag">
          ${escapeHtml(String(comparisonView.stores.length))} ${comparisonView.stores.length === 1 ? "loja" : "lojas"}
        </span>
      </div>
      <p class="comparison-context">${escapeHtml(proximityCopy)}</p>
      <div class="comparison-tabs" role="tablist" aria-label="Lojas para comparação">
        ${comparisonView.stores
          .map((entry) => {
            const logoFilename = getStoreLogoFilename(entry.store.id);
            const isActive = entry.store.id === comparisonView.activeStoreId;
            const distanceLabel = formatDistance(entry.distanceKm);
            const tabStatus =
              entry.notPricedCount > 0
                ? `${entry.notPricedCount} ${entry.notPricedCount === 1 ? "fora do total" : "fora do total"}`
                : "Cobertura completa";

            return `
              <button
                type="button"
                class="comparison-tab ${isActive ? "comparison-tab-active" : ""}"
                data-action="set-comparison-store"
                data-store-id="${escapeHtml(entry.store.id)}"
                role="tab"
                aria-selected="${isActive ? "true" : "false"}"
              >
                <span class="comparison-tab-logo">
                  ${
                    logoFilename
                      ? `<img src="./lojas/${escapeHtml(logoFilename)}" alt="" aria-hidden="true" loading="lazy" />`
                      : `<span>${escapeHtml(entry.store.name.slice(0, 1))}</span>`
                  }
                </span>
                <span class="comparison-tab-copy">
                  <strong>${escapeHtml(entry.store.name)}</strong>
                  <small>${entry.total == null ? "Total indisponível" : formatCurrency(entry.total)}</small>
                  <em>
                    ${distanceLabel ? `${escapeHtml(distanceLabel)} · ` : ""}
                    ${escapeHtml(String(entry.foundCount))}/${escapeHtml(String(entry.itemCount))} produtos · ${escapeHtml(tabStatus)}
                  </em>
                </span>
              </button>
            `;
          })
          .join("")}
      </div>
      <div class="comparison-store-panel" role="tabpanel">
        <div class="comparison-store-heading">
          <div class="comparison-store-title">
            ${
              activeStoreLogo
                ? `<img src="./lojas/${escapeHtml(activeStoreLogo)}" alt="${escapeHtml(activeStore.store.name)}" loading="lazy" />`
                : ""
            }
            <div>
              <span>Loja selecionada</span>
              <strong>${escapeHtml(activeStore.store.name)}</strong>
              ${
                activeStoreLocationParts.length > 0
                  ? `<small>${escapeHtml(activeStoreLocationParts.join(" · "))}</small>`
                  : ""
              }
            </div>
          </div>
          <div class="comparison-store-total">
            <span>Total do cabaz</span>
            <strong>${activeStore.total == null ? "—" : formatCurrency(activeStore.total)}</strong>
            <small>${activeStoreDistance ? `${escapeHtml(activeStoreDistance)} · ` : ""}${escapeHtml(activeStoreStatusCopy)}</small>
          </div>
        </div>
        <div class="comparison-match-summary" aria-label="Resumo de correspondências">
          <span class="comparison-pill comparison-pill-exact">
            ${escapeHtml(String(activeStore.exactCount))} ${activeStore.exactCount === 1 ? "exato" : "exatos"}
          </span>
          <span class="comparison-pill comparison-pill-equivalent">
            ${escapeHtml(String(activeStore.equivalentCount))} ${activeStore.equivalentCount === 1 ? "equivalente" : "equivalentes"}
          </span>
          <span class="comparison-pill comparison-pill-alternative">
            ${escapeHtml(String(activeStore.alternativeCount))} ${activeStore.alternativeCount === 1 ? "alternativa" : "alternativas"}
          </span>
          <span class="comparison-pill comparison-pill-missing">
            ${escapeHtml(String(activeStore.missingCount))} ${activeStore.missingCount === 1 ? "em falta" : "em falta"}
          </span>
        </div>
        <div class="comparison-lines">
          ${activeStore.rows
            .map((row) => {
              const resultName = row.result?.matchedName || "";
              const isEquivalent = row.matchType === "equivalent";
              const isAlternative = row.matchType === "alternative";
              const isExact = row.matchType === "exact";
              const isDifferentProduct = Boolean(row.result && row.result.basketItemId !== row.item.id);
              const displayName = row.result
                ? row.resultCatalogProduct?.name || resultName || row.item.name
                : row.item.name;
              const displayCategory = row.resultCatalogProduct?.category || row.item.category;
              const displayBrand = row.result?.brand || row.resultCatalogProduct?.preferredBrand || row.item.preferredBrand || "";
              const referenceName = row.referenceResult?.matchedName || row.item.name;
              const image = row.result?.image || row.referenceResult?.image || "";
              const imageAlt = row.result ? displayName : referenceName;
              const usesReferenceImage = !row.result && Boolean(row.referenceResult?.image);
              const lineClass = row.result
                ? isEquivalent
                  ? "comparison-line-equivalent"
                  : isAlternative
                    ? "comparison-line-alternative"
                    : "comparison-line-exact"
                : "comparison-line-missing";
              const statusClass = row.result
                ? isEquivalent
                  ? "comparison-status-equivalent"
                  : isAlternative
                    ? "comparison-status-alternative"
                    : "comparison-status-exact"
                : "comparison-status-missing";
              const statusLabel = row.result
                ? isEquivalent
                  ? "Equivalente"
                  : isAlternative
                    ? "Alternativa"
                    : "Exato"
                : "Em falta";
              const statusHint = row.result
                ? isEquivalent
                  ? row.countsForTotal
                    ? row.matchRule?.reason || "Equivalente aprovado; entra no total do cabaz."
                    : row.matchRule?.reason || "Equivalente encontrado, mas ainda aguarda validação manual."
                  : isAlternative
                    ? row.matchRule?.reason || "Alternativa controlada; não entra no total do cabaz."
                    : "Mesmo produto canónico encontrado nesta loja."
                : usesReferenceImage
                  ? "Imagem do produto no cabaz; sem oferta publicada nesta loja."
                  : "Sem oferta publicada para este produto ou equivalente nesta loja.";
              const subtotalLabel = row.lineTotal == null
                ? row.result
                  ? "Fora do total"
                  : "—"
                : formatCurrency(row.lineTotal);
              const productDetail = row.result
                ? isDifferentProduct
                  ? `Produto no cabaz: ${row.item.name}`
                  : resultName
                : "Produto sem preço publicado nesta loja.";

              return `
                <article class="comparison-line ${lineClass}">
                  <div class="comparison-line-media ${usesReferenceImage ? "comparison-line-media-reference" : ""}">
                    ${
                      image
                        ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(imageAlt)}" loading="lazy" referrerpolicy="no-referrer" />`
                        : `<span>Sem imagem</span>`
                    }
                  </div>
                  <div class="comparison-line-main">
                    <h3>${escapeHtml(displayName)}</h3>
                    <p>
                      ${escapeHtml(getCategoryName(displayCategory))}
                      ${displayBrand ? ` · ${escapeHtml(displayBrand)}` : ""}
                    </p>
                    <small>${escapeHtml(productDetail)}</small>
                    <em class="comparison-match-hint">${escapeHtml(statusHint)}</em>
                  </div>
                  <div class="comparison-line-price">
                    <span>Preço</span>
                    <strong>${row.result ? formatCurrency(row.result.price) : "—"}</strong>
                    <small>${row.result ? escapeHtml(formatUnitPrice(row.result.unitPrice, row.result.unit)) : "Sem preço"}</small>
                  </div>
                  <div class="comparison-line-quantity">
                    <span>Qtd.</span>
                    <strong>${escapeHtml(String(row.quantity))}</strong>
                  </div>
                  <div class="comparison-line-total">
                    <span>Subtotal</span>
                    <strong>${escapeHtml(subtotalLabel)}</strong>
                  </div>
                  <div class="comparison-line-status">
                    <span class="${statusClass}">
                      ${escapeHtml(statusLabel)}
                    </span>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </div>
      ${renderEquivalenceReviewSection(comparisonView)}
    </section>
  `;
}

function renderCatalogSearchResults(catalogSearch) {
  if (!catalogSearch.executedQuery) {
    return "";
  }

  const storeOptions = [
    { value: "all", label: "Todas" },
    ...catalogSearch.options.stores
  ];
  const categoryOptions = [
    { value: "all", label: "Todas" },
    ...catalogSearch.options.categories
  ];
  const brandOptions = [
    { value: "all", label: "Todas" },
    ...catalogSearch.options.brands
  ];
  const sortOptions = [
    { value: "price-asc", label: "Preço mais baixo" },
    { value: "price-desc", label: "Preço mais alto" },
    { value: "name-asc", label: "A-Z" },
    { value: "name-desc", label: "Z-A" }
  ];

  return `
    <section class="panel-card catalog-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Resultados da pesquisa</p>
          <h2>Pesquisa por “${escapeHtml(catalogSearch.executedQuery)}”</h2>
        </div>
        <span class="status-tag">${escapeHtml(String(catalogSearch.rows.length))} produtos</span>
      </div>
      <form id="catalog-filters-form" class="catalog-filters">
        ${renderSelectField({
          label: "Lojas",
          name: "store",
          value: catalogSearch.filters.store,
          options: storeOptions
        })}
        ${renderSelectField({
          label: "Categorias",
          name: "category",
          value: catalogSearch.filters.category,
          options: categoryOptions
        })}
        ${renderSelectField({
          label: "Marcas",
          name: "brand",
          value: catalogSearch.filters.brand,
          options: brandOptions
        })}
        ${renderSelectField({
          label: "Ordenar por",
          name: "sort",
          value: catalogSearch.filters.sort,
          options: sortOptions
        })}
      </form>
      ${
        catalogSearch.rows.length === 0
          ? `<p class="empty-state">Não existem produtos visíveis com os filtros atuais.</p>`
          : `
            <div class="catalog-results-grid">
              ${catalogSearch.rows
                .map(
                  (entry) => {
                    const storeId = entry.store?.id || entry.result.store;
                    const storeName = entry.store?.name || entry.result.store;
                    const storeLogoFilename = getStoreLogoFilename(storeId);

                    return `
                    <article class="catalog-result-card">
                      <div class="catalog-result-store-block">
                        <span class="catalog-store" title="${escapeHtml(storeName)}">
                          ${
                            storeLogoFilename
                              ? `<img
                                  src="./lojas/${escapeHtml(storeLogoFilename)}"
                                  alt="${escapeHtml(storeName)}"
                                  class="catalog-store-logo"
                                  loading="lazy"
                                />`
                              : `<span class="catalog-store-fallback">${escapeHtml(storeName)}</span>`
                          }
                        </span>
                        <span class="catalog-store-name">${escapeHtml(storeName)}</span>
                      </div>
                      <div class="catalog-result-media-shell">
                        ${
                          entry.result.image
                            ? `${
                                entry.result.url
                                  ? `<a
                                      class="catalog-result-media"
                                      href="${escapeHtml(entry.result.url)}"
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Ver o produto na loja"
                                      aria-label="Ver o produto na loja"
                                    >`
                                  : `<div class="catalog-result-media">`
                              }
                                <img
                                  src="${escapeHtml(entry.result.image)}"
                                  alt="${escapeHtml(entry.result.matchedName)}"
                                  loading="lazy"
                                  referrerpolicy="no-referrer"
                                />
                              ${entry.result.url ? `</a>` : `</div>`}`
                            : `<div class="catalog-result-media"><span class="catalog-media-fallback">Sem imagem</span></div>`
                        }
                      </div>
                      <div class="catalog-result-price-block">
                        <strong>${formatCurrency(entry.result.price)}</strong>
                        <span class="catalog-result-price-label">Preço unitário</span>
                        <span class="catalog-result-price-unit">${escapeHtml(
                          formatUnitPrice(entry.result.unitPrice, entry.result.unit)
                        )}</span>
                      </div>
                      <div class="catalog-result-info">
                        <div class="product-title-row">
                          <h3>${escapeHtml(entry.result.matchedName)}</h3>
                          ${renderFavoriteButton({
                            productId: entry.result.basketItemId,
                            isFavorite: entry.isFavorite,
                            label: entry.isFavorite
                              ? `Remover ${entry.result.matchedName} dos favoritos`
                              : `Adicionar ${entry.result.matchedName} aos favoritos`
                          })}
                        </div>
                        <p class="catalog-result-meta">
                          ${escapeHtml(entry.categoryName)}
                          ${entry.brand ? ` · ${escapeHtml(entry.brand)}` : ""}
                        </p>
                        ${
                          entry.result.notes
                            ? `<p class="catalog-result-note">${escapeHtml(entry.result.notes)}</p>`
                            : ""
                        }
                        <div class="catalog-result-format">
                          <span class="catalog-result-format-label">Formato</span>
                          <strong>${escapeHtml(formatSize(entry.result.size, entry.result.sizeUnit))}</strong>
                        </div>
                      </div>
                      <div class="catalog-result-status">
                        <div class="catalog-result-status-item">
                          <span class="catalog-result-status-label">Estado</span>
                          <strong>${entry.result.inStock ? "Disponível" : "Indisponível"}</strong>
                        </div>
                        <div class="catalog-result-status-item">
                          <span class="catalog-result-status-label">Atualizado</span>
                          <strong>${escapeHtml(formatDate(entry.result.lastUpdated))}</strong>
                        </div>
                      </div>
                      <div class="catalog-result-actions">
                        <form class="catalog-add-form" data-result-id="${escapeHtml(entry.result.id)}">
                          <label class="catalog-quantity-field">
                            <span>Qtd.</span>
                            <input
                              type="number"
                              name="quantity"
                              min="1"
                              step="1"
                              value="1"
                              inputmode="numeric"
                              aria-label="Quantidade a adicionar ao cabaz"
                            />
                          </label>
                          <button type="submit" class="catalog-add-button" aria-label="Adicionar ao cabaz">
                            <span aria-hidden="true">+</span>
                          </button>
                        </form>
                      </div>
                    </article>
                  `;
                  }
                )
                .join("")}
            </div>
          `
      }
    </section>
  `;
}

function renderMainSection(viewModel) {
  if (viewModel.currentSection === "lojas") {
    return renderStoresDirectory(viewModel.stores);
  }

  if (viewModel.currentSection === "favoritos") {
    return renderFavoritesSection(viewModel.favoritesView);
  }

  if (viewModel.currentSection === "cabaz") {
    return renderBasketSection(viewModel.basketView);
  }

  if (viewModel.currentSection === "listagem") {
    return renderShoppingListSection(viewModel.basketView);
  }

  if (viewModel.currentSection === "comparacao") {
    return renderComparisonSection(viewModel.comparisonView);
  }

  return renderCatalogSearchResults(viewModel.catalogSearch);
}

export function renderApp({ state, viewModel }) {
  const basketItemCount = viewModel.summary?.basketItemCount ?? state.basket.length ?? 0;

  return `
    <div class="app-shell">
      <aside class="app-nav" aria-label="Navegação principal">
        <a class="brand" href="#" aria-label="Cabaz">
          <img class="brand-mark" src="./favicon_io/apple-touch-icon.png" alt="" aria-hidden="true" />
          <span>Cabaz</span>
        </a>
        <nav class="nav-list">
          ${NAV_ITEMS.map(
            (item) => `
              <button
                type="button"
                class="nav-link ${viewModel.currentSection === item.id ? "nav-link-active" : ""}"
                data-action="set-section"
                data-section="${escapeHtml(item.id)}"
              >
                <span>${escapeHtml(item.label)}</span>
                ${
                  item.id === "cabaz"
                    ? `<span class="nav-badge" aria-label="${escapeHtml(
                        `${basketItemCount} ${basketItemCount === 1 ? "produto no cabaz" : "produtos no cabaz"}`
                      )}">${escapeHtml(String(basketItemCount))}</span>`
                    : ""
                }
              </button>
            `
          ).join("")}
        </nav>
      </aside>
      <div class="app-main" id="dashboard">
        <header class="hero">
	          <div class="hero-location-shell">
	            <label class="hero-location">
              <span class="hero-location-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path
                    d="M12 2.5C8.13 2.5 5 5.63 5 9.5C5 14.44 12 21.5 12 21.5C12 21.5 19 14.44 19 9.5C19 5.63 15.87 2.5 12 2.5ZM12 12.5C10.34 12.5 9 11.16 9 9.5C9 7.84 10.34 6.5 12 6.5C13.66 6.5 15 7.84 15 9.5C15 11.16 13.66 12.5 12 12.5Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
	              <input
	                type="search"
	                name="postalCode"
	                form="hero-search-form"
	                inputmode="search"
	                autocomplete="postal-code"
	                size="${Math.max(
	                  16,
	                  Math.min(
	                    32,
	                    (viewModel.catalogSearch.postalLabel ||
	                      viewModel.catalogSearch.postalCode ||
	                      "CP ou localidade").length + 3
	                  )
	                )}"
	                value="${escapeHtml(viewModel.catalogSearch.postalLabel || viewModel.catalogSearch.postalCode)}"
	                placeholder="CP ou localidade"
	                aria-label="Código postal ou localidade"
	              />
	            </label>
            <div class="hero-location-suggestions">
              ${viewModel.catalogSearch.postalSuggestions
                .map(
                  (record) => `
                    <button
                      type="button"
                      class="hero-location-option"
                      data-action="select-postal-suggestion"
                      data-postal-code="${escapeHtml(record.code)}"
                      data-postal-label="${escapeHtml(record.label)}"
	                    >
	                      <strong>${escapeHtml(record.label)}</strong>
	                      <span>${escapeHtml(
	                        [record.code, record.streets?.[0]].filter(Boolean).join(" · ")
	                      )}</span>
	                    </button>
	                  `
                )
                .join("")}
            </div>
          </div>
          <div class="hero-inner">
            <h1>COMPARE O SEU CABAZ</h1>
            <p class="hero-copy">
              Acompanhe preços, pesquise produtos e compare preços entre lojas
            </p>
            <form id="hero-search-form" class="hero-search-shell" role="search" aria-label="Pesquisa principal">
              <div class="hero-search">
                <span class="hero-search-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path
                      d="M10.5 4.5A6 6 0 1 0 16.5 10.5A6 6 0 0 0 10.5 4.5ZM3 10.5A7.5 7.5 0 1 1 16.05 15.55L21 20.5L19.5 22L14.55 17.05A7.5 7.5 0 0 1 3 10.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  type="search"
                  name="query"
                  value="${escapeHtml(viewModel.catalogSearch.query)}"
                  placeholder="O que procura hoje?"
                  aria-label="Pesquisar"
                />
                <button type="submit" class="hero-search-button">Procurar</button>
              </div>
            </form>
          </div>
          <img class="hero-produce" src="./hero-produce.svg" alt="" aria-hidden="true" />
        </header>
        <div class="dashboard-body">
          ${renderFlash(state)}
          ${renderSummaryCards(viewModel.summary)}
          <main class="layout">
            <section class="content">${renderMainSection(viewModel)}</section>
          </main>
        </div>
      </div>
    </div>
  `;
}
