export const stocksProperties = `
{
    ?id bhf:scobID ?scobID__id .
    bind(?scobID__id as ?scobID__prefLabel)
    bind(?id as ?uri__id)
    bind(?id as ?uri__prefLabel)
    BIND(CONCAT("/securities/page/", str(?scobID__id)) AS ?scobID__dataProviderUrl)
}
union
{
    ?id bhf:hasName ?name__id .
    ?name__id rdfs:label ?name__label .
    optional {?name__id bhf:startDate ?name__startDate .}
    optional {?name__id bhf:endDate ?name__endDate .}
    bind(concat(
      str(?name__label),
      " [",
      COALESCE(str(?name__startDate), "..."),
      "]"
    ) as ?name__prefLabel)
}
union 
{
    ?id bhf:hasStockType ?stocktype__id .
    ?stocktype__id bhf:typeName ?stocktype__prefLabel .
}
union
{
    # All sector-name candidates (with their validity dates); the corporationNameForYear
    # postprocess (mappers.js) keeps only the sector name valid at the selected year-end.
    # startDate and/or endDate are frequently null (open-ended intervals); pickForYear treats
    # a null bound as "unbounded on that side".
    ?id bhf:hasNotation ?notation__id .
    ?notation__id bhf:hasSector ?sector__id .
    ?sector__id bhf:hasName ?sectorName__id .
    ?sectorName__id rdfs:label ?sectorName__prefLabel .
    optional { ?sectorName__id bhf:startDate ?sectorName__startDate . }
    optional { ?sectorName__id bhf:endDate ?sectorName__endDate . }
}
union
{
    # All corporation-name candidates (with their validity dates); the corporationNameForYear
    # postprocess (mappers.js) keeps only the name valid at the selected year-end.
    ?stockcorp__id bhf:hasStock ?id .
    ?corporation__id bhf:hasStockCorporation ?stockcorp__id .
    ?corporation__id bhf:hasName ?corporationName__id .
    ?corporationName__id rdfs:label ?corporationName__label .
    
    optional { ?corporationName__id bhf:startDate ?corporationName__startDate . }
    optional { ?corporationName__id bhf:endDate ?corporationName__endDate . }
    
    bind(concat(
      str(?corporationName__label),
      " [",
      COALESCE(str(?corporationName__startDate), "..."),
      "]"
    ) as ?corporationName__prefLabel)
    
    BIND(CONCAT("/corporations/page/", STRAFTER(STR(?corporation__id), "corporation/")) AS ?corporationName__dataProviderUrl)
}
`


// Instance-page property block for a single security. Independent of the year-scoped result-set
// query (no ?year / ?price plumbing): it reads the security's own detail directly off ?id, so
// the instance page shows the full history (all names, all corporation names) regardless of any
// selected year. Referenced by securities.json instanceConfig.propertiesQueryBlock.
export const stockInstanceProperties = `
{
    ?id bhf:scobID ?scobID__id .
    bind(?scobID__id as ?scobID__prefLabel)
    bind(?id as ?uri__id)
    bind(?id as ?uri__prefLabel)
    BIND(CONCAT("/securities/page/", str(?scobID__id)) AS ?scobID__dataProviderUrl)
}
union
{
    ?id bhf:hasName ?name__id .
    ?name__id rdfs:label ?name__label .
    optional {?name__id bhf:startDate ?name__startDate .}
    optional {?name__id bhf:endDate ?name__endDate .}
    bind(concat(
      str(?name__label),
      " [",
      COALESCE(str(?name__startDate), "..."),
      "]"
    ) as ?name__prefLabel)
}
union
{
    ?id bhf:hasStockExchange ?stockExchange__id .
    bind(?stockExchange__id as ?stockExchange__prefLabel)
}
union
{
    ?id bhf:hasSharetype ?sharetype__id .
    bind(?sharetype__id as ?sharetype__prefLabel)
}
union
{
    ?id bhf:hasStockType ?stocktype__id .
    ?stocktype__id bhf:typeName ?stocktype__prefLabel .
}
union
{
    ?id bhf:hasNotation ?notation__id .
    ?notation__id bhf:hasSector ?sector__id .
    ?sector__id bhf:hasName ?sectorName__id .
    ?sectorName__id rdfs:label ?sectorName__prefLabel .
    optional { ?sectorName__id bhf:startDate ?sectorName__startDate . }
    optional { ?sectorName__id bhf:endDate ?sectorName__endDate . }
}
union
{
    # No ?year in scope and no postprocess on instanceConfig, so all of the security's
    # corporation names are shown (year-independent).
    ?stockcorp__id bhf:hasStock ?id .
    ?corporation__id bhf:hasStockCorporation ?stockcorp__id .
    ?corporation__id bhf:hasName ?corporationNames__id .
    ?corporationNames__id rdfs:label ?corporationNames__label .
    optional { ?corporationNames__id bhf:startDate ?corporationNames__startDate . }
    
    bind(concat(
      str(?corporationNames__label),
      " [",
      COALESCE(str(?corporationNames__startDate), "..."),
      "]"
    ) as ?corporationNames__prefLabel)
    
    BIND(CONCAT("/corporations/page/", STRAFTER(STR(?corporation__id), "corporation/")) AS ?corporationNames__dataProviderUrl)
}
`

// export const stocksGraphOpenClose = `
// SELECT DISTINCT ?date ?open ?close
// where {
//     bind(<ID> as ?id)
//     ?id bhf:hasNotation/bhf:hasNotationPrice ?price__id .
//     ?price__id bhf:priceDay ?date .
//     optional {?price__id bhf:openValue ?open .}
//     optional {?price__id bhf:closeValue ?close .}
// }
// ORDER BY ?date
// `
//
// export const stocksGraphMinMax = `
// SELECT DISTINCT ?date ?min ?max
// where {
//     bind(<ID> as ?id)
//     ?id bhf:hasNotation/bhf:hasNotationPrice ?price__id .
//     ?price__id bhf:priceDay ?date .
//     optional {?price__id bhf:maxValue ?max .}
//     optional {?price__id bhf:minValue ?min .}
// }
// ORDER BY ?date
// `




// The stock -> exchange/sharetype/notation -> year-end openValue-price skeleton (bounded to the
// selected year) is emitted by the `yearBindStock` custom filter into <FILTER>, inside the
// LIMIT-bounded inner sub-SELECT (keeps the expensive price scan under Ontop's 30s timeout).
// The cheap single-valued display binds live in the outer <RESULT_SET_PROPERTIES> block.
// With no year selected <FILTER> is empty, ?id is unbound and the perspective shows nothing
// (the GatedResultTable placeholder handles that).
export const facetResultSetQueryStocks = `
  SELECT * WHERE {
    {
      SELECT DISTINCT ?id ?year ?not ?price__id ?stockExchange__id ?sharetype__id ?openValue__prefLabel {
        <FILTER>
        <ORDER_BY_TRIPLE>
      }
      <ORDER_BY>
      <PAGE>
    }
    FILTER(BOUND(?id))
    BIND(?stockExchange__id AS ?stockExchange__prefLabel)
    BIND(?sharetype__id AS ?sharetype__prefLabel)
    <RESULT_SET_PROPERTIES>
  }
`

// Count: ?id (and the whole skeleton) is supplied by <FILTER> via yearBindStock. With no year
// selected <FILTER> is empty, ?id is unbound and COUNT(DISTINCT ?id) is 0 without scanning the
// price data. VALUES ?ping guards the otherwise-empty group pattern. Mirrors yearEndPricesCountQuery.
export const countQueryStocks = `
  SELECT (COUNT(DISTINCT ?id) as ?count) WHERE {
    <FILTER>
    VALUES ?ping { 1 }
  }
`

export const facetValuesQueryStocks = `
  SELECT DISTINCT ?id ?prefLabel ?selected ?parent ?instanceCount {
    {
      {
        SELECT DISTINCT (count(DISTINCT ?instance) as ?instanceCount) ?id ?parent ?selected {
          # facet values that return results
          {
            <FILTER>
            ?instance <PREDICATE> ?id .
            <PARENTS>
            VALUES ?facetClass { <FACET_CLASS> }
            ?instance <FACET_CLASS_PREDICATE> ?facetClass ;
                      bhf:hasStockExchange ?_exchng ;
                      bhf:hasSharetype ?_shrtyp .
            <SELECTED_VALUES>
          }
          <SELECTED_VALUES_NO_HITS>     
          BIND(COALESCE(?selected_, false) as ?selected)
        }
        GROUP BY ?id ?parent ?selected
      }
      FILTER(BOUND(?id))
      <FACET_VALUE_FILTER>
      <LABELS>
    }
  }
  <ORDER_BY>
`

// CSV export for the securities perspective. This is the un-paged form of the result-table query
// (facetResultSetQueryStocks) and reuses the same `stocksProperties` block, so it returns the exact
// same columns/values as the table: scobID, name (all candidates), openValue, stockExchange,
// stocktype, sectorName, sharetype, corporationName (all candidates). The year skeleton (?id, ?year,
// ?stockExchange__id, ?sharetype__id, ?not, ?price__id, ?openValue__prefLabel) is supplied by the
// `yearBindStock` custom filter into <FILTER>, so the export resultClass must use filterTarget "id".
//
// Unlike a SPARQL-side year match, name/corporationName are NOT filtered by date here — all name
// candidates (with their startDate/endDate) are returned cheaply and the GatedExportCSV custom
// component picks the value valid at <year>-12-31 in the browser (mirroring the corporationNameForYear
// mapper). This moves the expensive per-row date comparisons off the Ontop/Oracle VKG. The component
// fetches this with resultFormat=json so makeObjectList groups the candidates into arrays.
//
// The inner OPTIONAL{?id bhf:scobID ?orderBy} + ORDER BY is a materialization boundary that Ontop needs
// to type the outer UNION (stocksProperties): without it, an unbounded `SELECT *` over the UNION fails
// reformulation with "Was expecting a unique and known DB term type … for the SQL variable v3m…". This
// mirrors the working result-table query (facetResultSetQueryStocks), minus paging. We do NOT put a
// top-level ORDER BY on the integer scobID (that hits the separate Ontop/Oracle "ORDER BY under DISTINCT"
// bug); the boolean+asc inner ORDER BY is safe, and the component sorts rows by numeric scobID anyway.
export const securitiesExportQuery = `
  SELECT * WHERE {
    {
      SELECT DISTINCT ?id ?year ?not ?price__id ?stockExchange__id ?sharetype__id ?openValue__prefLabel {
        <FILTER>
        OPTIONAL { ?id bhf:scobID ?orderBy }
      }
      ORDER BY (!BOUND(?orderBy)) ASC(?orderBy)
    }
    FILTER(BOUND(?id))
    BIND(?stockExchange__id AS ?stockExchange__prefLabel)
    BIND(?sharetype__id AS ?sharetype__prefLabel)
    ${stocksProperties}
  }
`
