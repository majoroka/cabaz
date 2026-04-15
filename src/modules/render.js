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

function renderBasketForm(editingItem, categories, stores, brands) {
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
        <input type="hidden" name="quantity" value="${escapeHtml(String(editingItem?.quantity || 1))}" />
        <label>
          <span>Nome</span>
          <input name="name" type="text" placeholder="Ex.: Leite meio-gordo" required value="${escapeHtml(
            editingItem?.name || ""
          )}" />
        </label>
        <label>
          <span>Supermercado</span>
          <select name="preferredStore" data-close-on-leave="true">
            <option value="">Todos os supermercados</option>
            ${stores
              .map(
                (store) => `
                  <option value="${escapeHtml(store.id)}" ${
                    editingItem?.preferredStore === store.id ? "selected" : ""
                  }>${escapeHtml(store.name)}</option>
                `
              )
              .join("")}
          </select>
        </label>
        <label>
          <span>Categoria</span>
          <select name="category" required data-close-on-leave="true">
            ${categories
              .map(
                (category) => `
                  <option value="${escapeHtml(category.id)}" ${
                    editingItem?.category === category.id ? "selected" : ""
                  }>${escapeHtml(category.name)}</option>
                `
              )
              .join("")}
          </select>
        </label>
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

function renderFilters(filters, categories, stores) {
  return `
    <section class="toolbar panel-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Filtros</p>
          <h2>Comparação atual</h2>
        </div>
      </div>
      <div class="toolbar-grid">
        <label>
          <span>Pesquisar item</span>
          <input
            type="search"
            placeholder="Ex.: leite, atum, limpeza"
            value="${escapeHtml(filters.search)}"
            data-filter="search"
          />
        </label>
        <label>
          <span>Categoria</span>
          <select data-filter="category" data-close-on-leave="true">
            <option value="all">Todas</option>
            ${categories
              .map(
                (category) => `
                  <option value="${escapeHtml(category.id)}" ${
                    filters.category === category.id ? "selected" : ""
                  }>${escapeHtml(category.name)}</option>
                `
              )
              .join("")}
          </select>
        </label>
        <label>
          <span>Supermercado</span>
          <select data-filter="store" data-close-on-leave="true">
            <option value="all">Todos</option>
            ${stores
              .map(
                (store) => `
                  <option value="${escapeHtml(store.id)}" ${
                    filters.store === store.id ? "selected" : ""
                  }>${escapeHtml(store.name)}</option>
                `
              )
              .join("")}
          </select>
        </label>
        <label class="checkbox-row">
          <input type="checkbox" data-filter="bestOnly" ${filters.bestOnly ? "checked" : ""} />
          <span>Mostrar apenas o melhor resultado por item</span>
        </label>
      </div>
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
      <article class="summary-card">
        <span class="summary-label">Diferença mais barata vs. mais cara</span>
        <strong>${formatCurrency(summary.spread)}</strong>
        <p>Comparação entre lojas com a mesma cobertura de itens.</p>
      </article>
    </section>
  `;
}

function renderStoreTotals(aggregates) {
  if (aggregates.length === 0) {
    return `
      <section class="panel-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Totais por supermercado</p>
            <h2>Sem totais calculáveis</h2>
          </div>
        </div>
        <p class="empty-state">Carregue dados ou ajuste os filtros para ver estimativas por loja.</p>
      </section>
    `;
  }

  const highestCoverage = aggregates[0].coverage;
  const cheapestId = aggregates.find((entry) => entry.coverage === highestCoverage)?.store.id;

  return `
    <section class="panel-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Totais por supermercado</p>
          <h2>Estimativa do cabaz</h2>
        </div>
      </div>
      <div class="store-total-grid">
        ${aggregates
          .map(
            (entry) => `
              <article class="store-total-card ${entry.store.id === cheapestId ? "store-total-card-best" : ""}">
                <div class="store-total-heading">
                  <h3>${escapeHtml(entry.store.name)}</h3>
                  ${entry.store.id === cheapestId ? '<span class="status-tag">Melhor total</span>' : ""}
                </div>
                <strong>${formatCurrency(entry.total)}</strong>
                <p>${entry.itemCount} itens com preço · ${entry.missingCount} em falta</p>
                <small>Cobertura ${(entry.coverage * 100).toFixed(0)}%</small>
              </article>
            `
          )
          .join("")}
      </div>
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
    <div class="shell">
      <header class="hero">
        <div>
          <p class="eyebrow">Ferramenta utilitária</p>
          <h1>Cabaz</h1>
          <p class="hero-copy">
            Compare preços do mesmo cabaz entre supermercados em Portugal.
          </p>
        </div>
      </header>
      ${renderFlash(state)}
      <main class="layout">
        <aside class="sidebar">
          ${renderBasketForm(viewModel.editingItem, viewModel.categories, state.stores, viewModel.brands)}
          ${renderBasketList(state.basket, state.stores)}
          ${renderImports(state)}
        </aside>
        <section class="content">
          ${renderFilters(state.filters, viewModel.categories, state.stores)}
          ${renderSummaryCards(viewModel.summary)}
          ${renderStoreTotals(viewModel.aggregates)}
          ${renderTable(viewModel.rows)}
        </section>
      </main>
    </div>
  `;
}
