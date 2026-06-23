// Custom filter functions for BelHISFirm perspectives.
//
// They are loaded by the server (server/src/sparql/Utils.js) into
// backendSearchConfig.customFilters and invoked by generateConstraintsBlock
// (server/src/sparql/Filters.js) whenever a facet config declares `customFilterName`.
// Each function receives { backendSearchConfig, facetClass, facetID, filterTarget, values,
// inverse } and must return a SPARQL snippet that is injected into the query's <FILTER> slot.
//
// For the yearEndPrices perspective the <FILTER> sits inside the inner sub-SELECT where
// ?year, ?corp and ?not are in scope, so we constrain those variables directly instead of
// going through ?id with long inverse property paths.

const esc = s => String(s).replace(/["\\]/g, '\\$&')

const firstValue = values => {
  if (Array.isArray(values)) return values[0]
  if (values && typeof values === 'object') return values.value ?? values.start ?? null
  return values
}

// year: reproduces BIND(<year> AS ?year) — the proven fast pattern that bounds the price chain.
export const yearBind = ({ values }) => {
  const year = parseInt(firstValue(values), 10)
  return Number.isInteger(year) ? `BIND(${year} AS ?year)\n` : ''
}

// sector: case-insensitive substring match on the notation's sector label (constrains ?not).
export const sectorFilter = ({ values }) => {
  const q = String(firstValue(values) ?? '').trim()
  if (!q) return ''
  return `?not bhf:hasSector/bhf:hasName/rdfs:label ?sectorFilter .
          FILTER(CONTAINS(LCASE(STR(?sectorFilter)), LCASE("${esc(q)}")))\n`
}

// corporation name: case-insensitive substring match on the corporation's latest name.
// Joins ?name into the inner select only when the filter is active.
export const nameFilter = ({ values }) => {
  const q = String(firstValue(values) ?? '').trim()
  if (!q) return ''
  return `?corp bhf:hasLatestName ?nameFilter .
          FILTER(CONTAINS(LCASE(STR(?nameFilter)), LCASE("${esc(q)}")))\n`
}
