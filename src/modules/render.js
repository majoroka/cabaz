import { formatCurrency, formatDate, formatSize, formatUnitPrice } from "../utils/formatters.js";
import { escapeHtml } from "../utils/helpers.js";
import { getCategoryName } from "../utils/categories.js";

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

function renderDropdown({ label, name, value, options }) {
  const selectedOption = options.find((option) => option.value === value) || options[0];

  return `
    <div class="field">
      <span class="field-label">${escapeHtml(label)}</span>
      <div class="custom-select" data-custom-select>
        ${
          name
            ? `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(
                selectedOption?.value || ""
              )}" />`
            : ""
        }
        <button type="button" class="custom-select-trigger" data-action="toggle-custom-select">
          <span>${escapeHtml(selectedOption?.label || "")}</span>
        </button>
        <div class="custom-select-menu">
          ${options
            .map(
              (option) => `
                <button
                  type="button"
                  class="custom-select-option ${option.value === value ? "custom-select-option-selected" : ""}"
                  data-action="select-custom-option"
                  data-select-name="${escapeHtml(name || "")}"
                  data-select-value="${escapeHtml(option.value)}"
                  data-select-label="${escapeHtml(option.label)}"
                >
                  ${escapeHtml(option.label)}
                </button>
              `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderBasketForm(editingItem, categories, stores, brands) {
  const storeOptions = [
    {
      value: "",
      label: "Todos os supermercados"
    },
    ...stores.map((store) => ({
      value: store.id,
      label: store.name
    }))
  ];
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name
  }));

  return `
    <section class="panel-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Gestão do cabaz</p>
          <h2>${editingItem ? "Editar item" : "Adicionar item"}</h2>
        </div>
        ${editingItem ? '<span class="status-tag">Modo edição</span>' : ""}
      </div>
      <form id="basket-form" class="stack-form">
        <input type="hidden" name="id" value="${escapeHtml(editingItem?.id || "")}" />
        <label>
          <span>Nome</span>
          <input name="name" type="text" placeholder="Ex.: Leite meio-gordo" required value="${escapeHtml(
            editingItem?.name || ""
          )}" />
        </label>
        <label>
          <span>Quantidade</span>
          <input
            name="quantity"
            type="number"
            min="1"
            step="1"
            required
            value="${escapeHtml(String(editingItem?.quantity || 1))}"
          />
        </label>
        ${renderDropdown({
          label: "Supermercado",
          name: "preferredStore",
          value: editingItem?.preferredStore || "",
          options: storeOptions
        })}
        ${renderDropdown({
          label: "Categoria",
          name: "category",
          value: editingItem?.category || "sem_categoria",
          options: categoryOptions
        })}
        <label>
          <span>Marca</span>
          <input
            name="preferredBrand"
            type="text"
            list="brand-options"
            placeholder="Opcional"
            value="${escapeHtml(editingItem?.preferredBrand || "")}"
          />
        </label>
        <label>
          <span>Observações</span>
          <textarea name="notes" rows="3" placeholder="Opcional">${escapeHtml(
            editingItem?.notes || ""
          )}</textarea>
        </label>
        <div class="button-row">
          <button type="submit" class="button button-primary">
            ${editingItem ? "Guardar item" : "Adicionar"}
          </button>
          <button type="button" class="button button-muted" data-action="clear-edit">Limpar</button>
        </div>
      </form>
      <datalist id="brand-options">
        ${brands.map((brand) => `<option value="${escapeHtml(brand)}"></option>`).join("")}
      </datalist>
    </section>
  `;
}

function getStoreName(stores, storeId) {
  return stores.find((store) => store.id === storeId)?.name || storeId;
}

function renderBasketList(basket, stores) {
  if (basket.length === 0) {
    return `
      <section class="panel-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Cabaz atual</p>
            <h2>Sem itens</h2>
          </div>
        </div>
        <p class="empty-state">Adicione itens para começar a comparar supermercados.</p>
      </section>
    `;
  }

  return `
    <section class="panel-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Cabaz atual</p>
          <h2>${basket.length} itens guardados</h2>
        </div>
      </div>
      <div class="basket-list">
        ${basket
          .map(
            (item) => `
              <article class="basket-item">
                <div>
                  <h3>${escapeHtml(item.name)}</h3>
                  <p>${escapeHtml(getCategoryName(item.category))} · ${escapeHtml(String(item.quantity))} un.</p>
                  ${
                    item.preferredStore || item.preferredBrand || item.notes
                      ? `<small>${escapeHtml(
                          [
                            item.preferredStore ? getStoreName(stores, item.preferredStore) : "",
                            item.preferredBrand,
                            item.notes
                          ]
                            .filter(Boolean)
                            .join(" · ")
                        )}</small>`
                      : ""
                  }
                </div>
                <div class="basket-item-actions">
                  <button type="button" class="button button-small" data-action="edit-item" data-item-id="${escapeHtml(
                    item.id
                  )}">
                    Editar
                  </button>
                  <button type="button" class="button button-small button-danger" data-action="remove-item" data-item-id="${escapeHtml(
                    item.id
                  )}">
                    Remover
                  </button>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderImports(state) {
  return `
    <section class="panel-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Dados</p>
          <h2>Importação e demo</h2>
        </div>
      </div>
      <div class="source-grid">
        <div class="source-card">
          <span class="source-label">Resultados</span>
          <strong>${escapeHtml(state.sources.results)}</strong>
        </div>
        <div class="source-card">
          <span class="source-label">Lojas</span>
          <strong>${escapeHtml(state.sources.stores)}</strong>
        </div>
      </div>
      <div class="stack-actions">
        <button type="button" class="button button-primary" data-action="load-example">
          Carregar dados de exemplo
        </button>
        <button type="button" class="button button-muted" data-action="reset-demo">
          Repor demo
        </button>
      </div>
      <div class="stack-actions">
        <button type="button" class="button" data-action="trigger-import" data-target="import-basket">
          Importar cabaz JSON
        </button>
        <button type="button" class="button" data-action="trigger-import" data-target="import-results">
          Importar resultados JSON
        </button>
        <button type="button" class="button" data-action="trigger-import" data-target="import-stores">
          Importar lojas JSON
        </button>
      </div>
      <input id="import-basket" data-import-type="basket" type="file" accept="application/json,.json" hidden />
      <input id="import-results" data-import-type="results" type="file" accept="application/json,.json" hidden />
      <input id="import-stores" data-import-type="stores" type="file" accept="application/json,.json" hidden />
      <p class="help-text">
        A app lê ficheiros JSON locais e valida a estrutura mínima antes de atualizar os dados.
      </p>
    </section>
  `;
}

function renderSummaryCards(summary) {
  return `
    <section class="summary-grid">
      <article class="summary-card">
        <span class="summary-label">Itens em análise</span>
        <strong>${escapeHtml(String(summary.basketItemCount))}</strong>
        <p>Itens visíveis após os filtros aplicados.</p>
      </article>
      <article class="summary-card">
        <span class="summary-label">Supermercado mais barato</span>
        <strong>${escapeHtml(summary.cheapestStore?.store.name || "n/d")}</strong>
        <p>
          ${
            summary.cheapestStore
              ? `${summary.cheapestStore.itemCount}/${summary.basketItemCount} itens encontrados`
              : "Sem dados suficientes para comparar."
          }
        </p>
      </article>
      <article class="summary-card">
        <span class="summary-label">Total mais baixo</span>
        <strong>${formatCurrency(summary.cheapestTotal)}</strong>
        <p>Estimativa com base no preço por item e quantidade pedida.</p>
      </article>
      <article class="summary-card summary-card-featured">
        <span class="summary-label">Diferença mais barata vs. mais cara</span>
        <strong>${formatCurrency(summary.spread)}</strong>
        <p>Comparação entre lojas com a mesma cobertura de itens.</p>
      </article>
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
                  (entry) => `
                    <article class="catalog-result-card">
                      <div class="catalog-result-top">
                        <span class="catalog-store">${escapeHtml(entry.store?.name || entry.result.store)}</span>
                        <strong>${formatCurrency(entry.result.price)}</strong>
                      </div>
                      <h3>${escapeHtml(entry.result.matchedName)}</h3>
                      <p class="catalog-result-meta">
                        ${escapeHtml(entry.categoryName)}
                        ${entry.brand ? ` · ${escapeHtml(entry.brand)}` : ""}
                      </p>
                      <dl class="catalog-result-details">
                        <div>
                          <dt>Formato</dt>
                          <dd>${escapeHtml(formatSize(entry.result.size, entry.result.sizeUnit))}</dd>
                        </div>
                        <div>
                          <dt>Preço unitário</dt>
                          <dd>${escapeHtml(formatUnitPrice(entry.result.unitPrice, entry.result.unit))}</dd>
                        </div>
                        <div>
                          <dt>Estado</dt>
                          <dd>${entry.result.inStock ? "Disponível" : "Indisponível"}</dd>
                        </div>
                        <div>
                          <dt>Atualizado</dt>
                          <dd>${escapeHtml(formatDate(entry.result.lastUpdated))}</dd>
                        </div>
                      </dl>
                      ${
                        entry.result.url
                          ? `<a class="catalog-result-link" href="${escapeHtml(entry.result.url)}" target="_blank" rel="noreferrer">Abrir produto</a>`
                          : ""
                      }
                    </article>
                  `
                )
                .join("")}
            </div>
          `
      }
    </section>
  `;
}

function renderTable(rows) {
  if (rows.length === 0) {
    return `
      <section class="panel-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Tabela de comparação</p>
            <h2>Sem resultados</h2>
          </div>
        </div>
        <p class="empty-state">Não há linhas a mostrar com os filtros atuais.</p>
      </section>
    `;
  }

  return `
    <section class="panel-card comparison-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Tabela de comparação</p>
          <h2>Resultados por item</h2>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Supermercado</th>
              <th>Produto encontrado</th>
              <th>Formato</th>
              <th>Preço</th>
              <th>Preço unitário</th>
              <th>Estado</th>
              <th>Atualizado</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map((row) => {
                if (row.type === "missing") {
                  return `
                    <tr class="missing-row">
                      <td>
                        <strong>${escapeHtml(row.basketItem.name)}</strong>
                        <small>${escapeHtml(getCategoryName(row.basketItem.category))} · ${escapeHtml(
                          String(row.basketItem.quantity)
                        )} un.</small>
                      </td>
                      <td colspan="8">Sem correspondências disponíveis para os filtros atuais.</td>
                    </tr>
                  `;
                }

                return `
                  <tr class="${row.isBest ? "best-row" : ""}">
                    <td>
                      <strong>${escapeHtml(row.basketItem.name)}</strong>
                      <small>${escapeHtml(getCategoryName(row.basketItem.category))} · ${escapeHtml(
                        String(row.basketItem.quantity)
                      )} un.</small>
                    </td>
                    <td>
                      ${escapeHtml(row.store?.name || row.result.store)}
                      ${row.isBest ? '<span class="status-tag status-tag-inline">Melhor preço</span>' : ""}
                    </td>
                    <td>${escapeHtml(row.result.matchedName)}</td>
                    <td>${escapeHtml(formatSize(row.result.size, row.result.sizeUnit))}</td>
                    <td>
                      <strong>${formatCurrency(row.result.price)}</strong>
                      <small>Total da linha: ${formatCurrency(row.lineTotal)}</small>
                    </td>
                    <td>${escapeHtml(formatUnitPrice(row.result.unitPrice, row.result.unit))}</td>
                    <td>${row.result.inStock ? "Disponível" : "Indisponível"}</td>
                    <td>${escapeHtml(formatDate(row.result.lastUpdated))}</td>
                    <td>
                      ${
                        row.result.url
                          ? `<a href="${escapeHtml(row.result.url)}" target="_blank" rel="noreferrer">Abrir</a>`
                          : '<span class="muted">n/d</span>'
                      }
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export function renderApp({ state, viewModel }) {
  return `
    <div class="app-shell">
      <aside class="app-nav" aria-label="Navegação principal">
        <a class="brand" href="#" aria-label="Cabaz">
          <img class="brand-mark" src="./favicon_io/apple-touch-icon.png" alt="" aria-hidden="true" />
          <span>Cabaz</span>
        </a>
        <nav class="nav-list">
          <span class="nav-link nav-link-active">Painel</span>
          <span class="nav-link">Lojas</span>
          <span class="nav-link">Categorias</span>
          <span class="nav-link">Marcas</span>
          <span class="nav-link">Cabaz</span>
          <span class="nav-link">Comparação</span>
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
            <section class="content">${renderCatalogSearchResults(viewModel.catalogSearch)}</section>
          </main>
        </div>
      </div>
    </div>
  `;
}
