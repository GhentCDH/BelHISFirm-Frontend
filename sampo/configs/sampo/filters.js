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


const firstValue = values => {
  if (Array.isArray(values)) return values[0]
  if (values && typeof values === 'object') return values.value ?? values.start ?? null
  return values
}


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
  `
}

// Forward path from a Stock (?instance in facet-values queries) to its year-end price year.
const STOCK_TO_PRICEYEAR = 'bhf:hasNotation/bhf:hasNotationPrice/bhf:priceYearEnd'

// Securities year filter. Here ?id is the bhf:Stock itself (unlike yearBind, where ?id is a
// price node). The whole "stock that has an exchange, a sharetype and a year-end openValue price
// in <year>" skeleton lives in the FILTER, so the count query stays a cheap COUNT(DISTINCT ?id)
// over <FILTER> (0 until a year is chosen), the result-set inner SELECT only needs <FILTER> +
// paging, and ?id/?year/?not/?price__id/?stockExchange__id/?sharetype__id/?openValue__prefLabel are
// all in scope for the outer <RESULT_SET_PROPERTIES> block.
// ?year is bound first so the priceYearEnd triple inlines the literal (BIND can't reassign a var
// already used in a triple).
export const yearBindStock = ({ values, filterTarget }) => {
  const year = parseInt(firstValue(values), 10)
  if (!Number.isInteger(year)) return ''
  if (filterTarget === 'instance') {
    return `?instance ${STOCK_TO_PRICEYEAR} ${year} .\n`
  }
  return `
    BIND(${year} AS ?year)
    ?id a bhf:Stock ;
        bhf:hasStockExchange ?stockExchange__id ;
        bhf:hasSharetype ?sharetype__id ;
        bhf:hasNotation ?not .
    ?not bhf:hasNotationPrice ?price__id .
    ?price__id bhf:priceYearEnd ${year} ;
               bhf:openValue ?openValue__prefLabel .
  `
}
