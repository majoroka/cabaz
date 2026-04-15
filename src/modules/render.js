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
          <button type="button" class="button" data-action="search-products">Pesquisar</button>
          <button type="button" class="button button-muted" data-action="clear-edit">Limpar</button>
        </div>
      </form>
      <datalist id="brand-options">
        ${brands.map((brand) => `<option value="${escapeHtml(brand)}"></option>`).join("")}
      </datalist>
    </section>
  `;
}

function renderProductSearchModal(productSearch) {
  if (!productSearch.isOpen) {
    return "";
  }

  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="product-search-title">
      <section class="modal-card">
        <div class="modal-header">
          <div>
            <p class="eyebrow">Pesquisa de produtos</p>
            <h2 id="product-search-title">Resultados para “${escapeHtml(productSearch.query)}”</h2>
            <p class="modal-subtitle">Quantidade pretendida: ${escapeHtml(String(productSearch.quantity))}</p>
          </div>
          <button type="button" class="button button-small button-muted" data-action="close-product-search">
            Fechar
          </button>
        </div>
        ${
          productSearch.rows.length === 0
            ? `<p class="empty-state">Não foram encontrados produtos com esse termo nos dados carregados.</p>`
            : `
              <div class="table-wrapper">
                <table class="comparison-table product-search-table">
                  <thead>
                    <tr>
                      <th>Ação</th>
                      <th>Supermercado</th>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Preço</th>
                      <th>Total estimado</th>
                      <th>Formato</th>
                      <th>Preço unitário</th>
                      <th>Estado</th>
                      <th>Atualizado</th>
                      <th>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${productSearch.rows
                      .map(
                        (row) => `
                          <tr>
                            <td>
                              <button
                                type="button"
                                class="button button-small button-primary"
                                data-action="add-search-result"
                                data-result-id="${escapeHtml(row.result.id)}"
                              >
                                Adicionar
                              </button>
                            </td>
                            <td>${escapeHtml(row.store?.name || row.result.store)}</td>
                            <td>
                              <strong>${escapeHtml(row.result.matchedName)}</strong>
                              <small>${escapeHtml(row.basketItem?.name || "Produto encontrado")}</small>
                            </td>
                            <td>${escapeHtml(String(productSearch.quantity))}</td>
                            <td><strong>${formatCurrency(row.result.price)}</strong></td>
                            <td><strong>${formatCurrency(row.lineTotal)}</strong></td>
                            <td>${escapeHtml(formatSize(row.result.size, row.result.sizeUnit))}</td>
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
                        `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
        }
      </section>
    </div>
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
          <span class="brand-mark">C</span>
          <span>Cabaz</span>
        </a>
        <nav class="nav-list">
          <a class="nav-link nav-link-active" href="#dashboard">Painel</a>
          <a class="nav-link" href="#comparison">Comparação</a>
          <a class="nav-link" href="#basket-form">Produtos</a>
          <a class="nav-link" href="#basket">Cabaz</a>
          <a class="nav-link" href="#data">Dados</a>
        </nav>
      </aside>
      <div class="app-main" id="dashboard">
        <header class="hero">
          <div>
            <p class="eyebrow">Ferramenta utilitária</p>
            <h1>Compare o seu cabaz</h1>
            <p class="hero-copy">
              Acompanhe preços, pesquise produtos e compare supermercados numa interface simples.
            </p>
          </div>
        </header>
        <div class="dashboard-body">
          ${renderFlash(state)}
          ${renderProductSearchModal(viewModel.productSearch)}
          ${renderSummaryCards(viewModel.summary)}
          <main class="layout">
            <section class="content">
              ${renderBasketForm(viewModel.editingItem, viewModel.categories, state.stores, viewModel.brands)}
              <div id="comparison">
                ${renderTable(viewModel.rows)}
              </div>
            </section>
            <aside class="sidebar">
              <div id="basket">
                ${renderBasketList(state.basket, state.stores)}
              </div>
              <div id="data">
                ${renderImports(state)}
              </div>
            </aside>
          </main>
        </div>
      </div>
    </div>
  `;
}
