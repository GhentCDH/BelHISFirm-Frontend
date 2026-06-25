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
const MISSING = 'http://ldf.fi/MISSING_VALUE'

const firstValue = values => {
  if (Array.isArray(values)) return values[0]
  if (values && typeof values === 'object') return values.value ?? values.start ?? null
  return values
}

// Normalize a uriFilter selection into a clean array of literal strings, dropping the
// "unknown value" sentinel and empties.
const toLiterals = values =>
  (Array.isArray(values) ? values : [values])
    .filter(v => v != null && v !== '' && v !== MISSING)
    .map(String)

// Forward paths from a Corporation (?instance in facet-values queries) to each filtered value.
const CORP_TO_SECTOR =
  'bhf:hasStockCorporation/bhf:hasStock/bhf:hasNotation/bhf:hasSector/bhf:hasName/rdfs:label'
const CORP_TO_PRICEYEAR =
  'bhf:hasStockCorporation/bhf:hasStock/bhf:hasNotation/bhf:hasNotationPrice/bhf:priceYearEnd'

// Each filter is filterTarget-aware:
//  - result/count query (filterTarget 'id'): constrain the ?not/?corp chain that yearBind binds.
//  - facet-values query (filterTarget 'instance'): the subject is ?instance (a bhf:Corporation),
//    so constrain ?instance via the forward paths above. This narrows each facet's value list to
//    what's available given the other active filters (default Sampo behaviour).

// year: in the result/count query, emit the corp -> notation -> price chain bounded to the year
// (this is the only place ?id exists, keeping the count cheap until a year is set). In the
// facet-values query, restrict ?instance to corporations that have a price in this year.
// ?year is bound first; the priceYearEnd triple inlines the literal because BIND cannot reassign
// a variable already used in a triple.
export const yearBind = ({ values, filterTarget }) => {
  const year = parseInt(firstValue(values), 10)
  if (!Number.isInteger(year)) return ''
  if (filterTarget === 'instance') {
    return `?instance ${CORP_TO_PRICEYEAR} ${year} .\n`
  }
  return `
    BIND(${year} AS ?year)
    ?corp a bhf:Corporation ;
          bhf:hasStockCorporation/bhf:hasStock/bhf:hasNotation ?not .
    ?not bhf:hasNotationPrice ?id .
    ?id bhf:priceYearEnd ${year} .
  `
}

// sector: exact match on the notation's sector label (multi-select OR).
export const sectorFilter = ({ values, filterTarget }) => {
  const labels = toLiterals(values)
  if (!labels.length) return ''
  const vals = labels.map(l => `"${esc(l)}"`).join(' ')
  if (filterTarget === 'instance') {
    return `?instance ${CORP_TO_SECTOR} ?sectorFilter .
            VALUES ?sectorFilter { ${vals} }\n`
  }
  return `?not bhf:hasSector/bhf:hasName/rdfs:label ?sectorFilter .
          VALUES ?sectorFilter { ${vals} }\n`
}

// corporation: exact match on the corporation's latest name (multi-select OR).
export const nameFilter = ({ values, filterTarget }) => {
  const labels = toLiterals(values)
  if (!labels.length) return ''
  const vals = labels.map(l => `"${esc(l)}"`).join(' ')
  if (filterTarget === 'instance') {
    return `?instance bhf:hasLatestName ?nameFilter .
            VALUES ?nameFilter { ${vals} }\n`
  }
  return `?corp bhf:hasLatestName ?nameFilter .
          VALUES ?nameFilter { ${vals} }\n`
}
