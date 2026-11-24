const root = document.querySelector("[data-search]");
const form = root.querySelector("form");
const input = form.elements.q;
const status = root.querySelector("[data-search-status]");
const notice = root.querySelector("[data-search-notice]");
const list = root.querySelector(".search-results");
const more = root.querySelector(".search-more");
const pageSize = 20;
const { indexUrl, pagefindUrl, loading, empty, noEntries, error, resultCount, pagefindFallback } = root.dataset;
let catalog;
let pagefind;
let current;
let debounceTimer = 0;
function normalize(value) {
  return value.normalize("NFKC").toLowerCase().trim();
}

function pathKey(value) {
  const url = new URL(value, window.location.href);
  if (url.origin !== window.location.origin) return null;
  return url.pathname.replace(/%[0-9a-f]{2}/gi, (escape) => escape.toUpperCase()).replace(/\/(?:index\.html)?$/, "");
}

function loadCatalog() {
  catalog ??= fetch(indexUrl).then(async (response) => {
    if (!response.ok) throw new Error(`Search index returned ${response.status}`);
    return (await response.json()).map((record) => ({
      record,
      id: normalize(record.archiveId),
      title: normalize(record.title),
      summary: normalize(record.summary),
      tags: record.tags.map(normalize),
    }));
  }).catch((failure) => {
    catalog = undefined;
    throw failure;
  });
  return catalog;
}

function loadPagefind() {
  const moduleURL = new URL(pagefindUrl, window.location.href);
  pagefind ??= import(moduleURL.href).then(async (api) => {
    await api.options({ baseUrl: new URL("../", moduleURL).pathname });
    await api.init();
    return api;
  }).catch((failure) => {
    pagefind = undefined;
    throw failure;
  });
  return pagefind;
}

function catalogMatches(entries, query) {
  const words = query.split(/\s+/);
  const matches = [];
  for (const entry of entries) {
    let score = entry.title === query ? 8 : 0;
    let complete = true;
    for (const word of words) {
      if (entry.title.includes(word)) score += 4;
      else if (entry.tags.some((tag) => tag.includes(word))) score += 2;
      else if (entry.summary.includes(word)) score += 1;
      else {
        complete = false;
        break;
      }
    }
    if (complete) matches.push({ record: entry.record, score });
  }
  return matches.sort((a, b) => b.score - a.score).map(({ record }) => record);
}

async function* searchResults(state, entries, query) {
  const normalized = normalize(query);
  const exactId = entries.filter(({ id }) => id === normalized || id === `#${normalized}`);
  const local = exactId.length ? exactId.map(({ record }) => record) : catalogMatches(entries, normalized);
  let external = [];
  if (pagefindUrl) {
    try {
      const api = await loadPagefind();
      if (!exactId.length) ({ results: external } = await api.search(query));
    } catch {
      state.pagefindUnavailable = true;
    }
  }
  yield* local;
  if (!external.length) return;

  // Only use Pagefind matches with a canonical URL in this language's Hugo catalog.
  const recordsByPath = new Map(entries.map(({ record }) => [pathKey(record.url), record]));
  for (const record of local) recordsByPath.delete(pathKey(record.url));
  for (let offset = 0; offset < external.length && current === state; offset += pageSize) {
    let batch;
    try {
      batch = await Promise.all(external.slice(offset, offset + pageSize).map((result) => result.data()));
    } catch {
      state.pagefindUnavailable = true;
      return;
    }
    for (const result of batch) {
      const path = pathKey(result.url);
      const record = recordsByPath.get(path);
      if (!record) continue;
      recordsByPath.delete(path);
      yield { ...record, excerpt: result.excerpt };
    }
  }
}

function resultRow(record) {
  const row = document.createElement("li");
  row.className = "search-result";

  const dateCol = document.createElement("div");
  dateCol.className = "search-result-date-col";
  dateCol.translate = false;
  const date = document.createElement("time");
  date.className = "search-result-date";
  date.dateTime = record.date;
  date.textContent = record.date;
  dateCol.append(date);

  const body = document.createElement("div");
  body.className = "search-result-body";
  const title = document.createElement("h2");
  title.className = "search-result-title";
  const link = document.createElement("a");
  link.href = record.url;
  link.textContent = record.title;
  title.append(link);
  body.append(title);

  if (record.excerpt || record.summary) {
    const summary = document.createElement("p");
    summary.className = "search-result-summary";
    if (record.excerpt) {
      // Pagefind escapes excerpt text and adds only match highlighting markup.
      summary.innerHTML = record.excerpt;
    } else {
      summary.textContent = record.summary;
    }
    body.append(summary);
  }

  if (record.tags.length) {
    const tags = document.createElement("p");
    tags.className = "search-result-tags";
    record.tags.forEach((tag, idx) => {
      if (idx > 0) {
        const sep = document.createElement("span");
        sep.className = "search-result-tag-sep";
        sep.setAttribute("aria-hidden", "true");
        sep.textContent = "·";
        tags.append(sep);
      }
      const item = document.createElement("span");
      item.textContent = tag;
      tags.append(item);
    });
    body.append(tags);
  }

  row.append(dateCol, body);
  if (record.archiveId) {
    const id = document.createElement("span");
    id.className = "search-result-id";
    id.translate = false;
    id.textContent = record.archiveId;
    row.append(id);
  }
  return row;
}

async function showMore(state, focusFirst = false) {
  if (!state?.rows || state.busy || state.next?.done) return;
  state.busy = true;
  list.setAttribute("aria-busy", "true");
  more.setAttribute("aria-disabled", "true");
  status.textContent = loading;
  try {
    const batch = document.createDocumentFragment();
    state.next ??= await state.rows.next();
    for (let count = 0; count < pageSize && !state.next.done && current === state; count++) {
      batch.append(resultRow(state.next.value));
      state.next = await state.rows.next();
    }
    if (current !== state) return;
    const firstLink = batch.querySelector("a");
    list.append(batch);
    list.removeAttribute("aria-busy");
    const isEmpty = list.children.length === 0;
    status.dataset.state = isEmpty ? "empty" : "ready";
    status.textContent = isEmpty
      ? empty
      : resultCount.replace("{count}", String(list.children.length));
    more.hidden = state.next.done;
    more.removeAttribute("aria-disabled");
    state.busy = false;
    notice.hidden = !state.pagefindUnavailable;
    if (focusFirst) firstLink?.focus();
  } catch {
    if (current !== state) return;
    list.removeAttribute("aria-busy");
    more.hidden = true;
    more.removeAttribute("aria-disabled");
    state.busy = false;
    status.dataset.state = "error";
    status.textContent = error;
  }
}

async function update(syncInput = true) {
  window.clearTimeout(debounceTimer);
  const query = (new URLSearchParams(window.location.search).get("q") ?? "").trim();
  const state = {};
  current = state;
  if (syncInput) input.value = query;
  list.replaceChildren();
  list.removeAttribute("aria-busy");
  more.hidden = true;
  more.removeAttribute("aria-disabled");
  notice.hidden = true;
  delete status.dataset.state;
  status.textContent = "";
  if (!query) return;

  status.dataset.state = "loading";
  status.textContent = loading;
  try {
    const entries = await loadCatalog();
    if (current !== state) return;
    if (!entries.length) {
      status.dataset.state = "empty";
      status.textContent = noEntries;
      return;
    }
    state.rows = searchResults(state, entries, query);
    await showMore(state);
  } catch {
    if (current !== state) return;
    list.removeAttribute("aria-busy");
    status.dataset.state = "error";
    status.textContent = error;
  }
}

function commitQuery(raw, pushHistory) {
  const query = raw.trim();
  const url = new URL(window.location.href);
  if (query) url.searchParams.set("q", query);
  else url.searchParams.delete("q");
  if (url.href !== window.location.href) {
    if (pushHistory) history.pushState(null, "", url);
    else history.replaceState(null, "", url);
  }
  update(pushHistory);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  commitQuery(input.value, true);
});

input.addEventListener("input", () => {
  window.clearTimeout(debounceTimer);
  if (!input.value.trim()) {
    commitQuery("", false);
    return;
  }
  debounceTimer = window.setTimeout(() => commitQuery(input.value, false), 160);
});

more.addEventListener("click", () => {
  if (current?.rows) showMore(current, document.activeElement === more);
});
window.addEventListener("popstate", () => update(true));
notice.textContent = pagefindFallback;
root.querySelector("[data-search-unavailable]").hidden = true;
form.hidden = false;
update(true);
