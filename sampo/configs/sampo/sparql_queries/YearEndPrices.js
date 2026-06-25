// Queries for the "yearEndPrices" search perspective.
//
// Performance note: listing year-end notation prices together with the corporation's latest
// name and the notation sector only stays under Ontop's 30s timeout when the expensive
// notation/price chain lives INSIDE the LIMIT-bounded inner sub-SELECT, and the cheap
// single-valued joins (name, sector) are added in the OUTER <RESULT_SET_PROPERTIES> block.
// The year is injected into the inner <FILTER> by the `yearBind` custom filter (filters.js)
// as `BIND(<year> AS ?year)`, reproducing the proven-fast hand-written query.
//
// ?id = the notation-price node (one result row per stock-notation year-end price).
// makeObjectList (the default result mapper) merges rows by ?id.

// The corp -> notation -> price chain arrives via <FILTER> (emitted by the yearBind custom
// filter only when a year is selected); the value triples stay inside the LIMIT-bounded inner
// sub-SELECT. This perspective is gated by GatedResultTable, so this query only runs once a
// year is set.
export const yearEndPricesResultSetQuery = `
  SELECT * WHERE {
    {
      SELECT DISTINCT ?id ?corp ?not ?year {
        <FILTER>
        <ORDER_BY_TRIPLE>
      }
      <ORDER_BY>
      <PAGE>
    }
    FILTER(BOUND(?id))
    <RESULT_SET_PROPERTIES>
  }
`

// Count: the price chain (and thus ?id) is supplied entirely by <FILTER> via the yearBind
// custom filter. With no year selected, <FILTER> is empty, ?id is unbound, and
// COUNT(DISTINCT ?id) returns 0 without scanning the price data. The VALUES ?ping row guards
// against an empty group pattern and adds no scan. The count query is dispatched by the
// framework on load and on every facet change (FacetInfo), which we cannot gate from config —
// so we make it cheap until a year bounds it.
export const yearEndPricesCountQuery = `
  SELECT (COUNT(DISTINCT ?id) AS ?count) WHERE {
    <FILTER>
    VALUES ?ping { 1 }
  }
`

// Outer properties: single-valued joins (name, sector) plus the price scalars already carried
// out of the inner sub-SELECT. All functional per ?id, so a flat (non-UNION) block is correct.
export const yearEndPricesProperties = `
  BIND(?id AS ?uri__id)
  BIND(?id AS ?uri__prefLabel)
  BIND(STR(?year) AS ?priceYearEnd__prefLabel)

  OPTIONAL {
    ?corp bhf:hasLatestName ?corporationName__prefLabel .
    BIND(?corp AS ?corporationName__id)
    BIND(CONCAT("/corporations/page/", STRAFTER(STR(?corp), "corporation/")) AS ?corporationName__dataProviderUrl)
  }
  OPTIONAL { ?not bhf:hasSector/bhf:hasName/rdfs:label ?sector__prefLabel }
  OPTIONAL { ?id bhf:priceDay      ?day  . BIND(STR(?day)  AS ?priceDay__prefLabel) }
  OPTIONAL { ?id bhf:openValue     ?val  . BIND(STR(?val)  AS ?openValue__prefLabel) }
  OPTIONAL { ?id bhf:closeValue    ?val2 . BIND(STR(?val2) AS ?closeValue__prefLabel) }
  OPTIONAL { ?id bhf:previousValue ?val3 . BIND(STR(?val3) AS ?previousValue__prefLabel) }
`
