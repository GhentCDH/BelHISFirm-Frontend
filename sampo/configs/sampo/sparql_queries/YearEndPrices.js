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

export const yearEndPricesResultSetQuery = `
  SELECT * WHERE {
    {
      SELECT DISTINCT ?id ?corp ?not ?day ?val ?val2 ?val3 ?year {
        <FILTER>
        ?corp a bhf:Corporation ;
              bhf:hasStockCorporation/bhf:hasStock/bhf:hasNotation ?not .
        ?not bhf:hasNotationPrice ?id .
        ?id bhf:priceYearEnd ?year ;
            bhf:priceDay ?day ;
            bhf:openValue ?val ;
            bhf:closeValue ?val2 ;
            bhf:previousValue ?val3 .
        <ORDER_BY_TRIPLE>
      }
      <ORDER_BY>
      <PAGE>
    }
    FILTER(BOUND(?id))
    <RESULT_SET_PROPERTIES>
  }
`

// Count: same inner shape wrapped in COUNT(DISTINCT ?id). Inherits the same <FILTER> (year),
// so it is only cheap once a year is set; the gated result component prevents it from firing
// before a year is chosen.
export const yearEndPricesCountQuery = `
  SELECT (COUNT(DISTINCT ?id) AS ?count) WHERE {
    <FILTER>
    ?corp a bhf:Corporation ;
          bhf:hasStockCorporation/bhf:hasStock/bhf:hasNotation ?not .
    ?not bhf:hasNotationPrice ?id .
    ?id bhf:priceYearEnd ?year .
  }
`

// Outer properties: single-valued joins (name, sector) plus the price scalars already carried
// out of the inner sub-SELECT. All functional per ?id, so a flat (non-UNION) block is correct.
export const yearEndPricesProperties = `
  BIND(?id AS ?uri__id)
  BIND(?id AS ?uri__prefLabel)
  OPTIONAL {
    ?corp bhf:hasLatestName ?corporationName__prefLabel .
    BIND(?corp AS ?corporationName__id)
    BIND(CONCAT("/corporations/page/", STRAFTER(STR(?corp), "corporation/")) AS ?corporationName__dataProviderUrl)
  }
  OPTIONAL { ?not bhf:hasSector/bhf:hasName/rdfs:label ?sector__prefLabel . }
  BIND(STR(?year) AS ?priceYearEnd__prefLabel)
  BIND(STR(?day)  AS ?priceDay__prefLabel)
  BIND(STR(?val)  AS ?openValue__prefLabel)
  BIND(STR(?val2) AS ?closeValue__prefLabel)
  BIND(STR(?val3) AS ?previousValue__prefLabel)
`
