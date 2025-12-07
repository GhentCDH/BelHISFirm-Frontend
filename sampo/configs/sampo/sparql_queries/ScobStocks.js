export const stockPropertiesInstancePage = `
{
    ?id bhf:hasSharetype ?sharetype__id .
    bind(?sharetype__id as ?sharetype__prefLabel)
    bind(?id as ?uri__id)
    bind(?id as ?uri__prefLabel)
}
UNION
{
    ?stockcorp__id bhf:hasStock ?id .
    ?corporation__id bhf:hasStockCorporation ?stockcorp__id .
    optional {?stockcorp__id bhf:startDate ?corporation__startDate .}
    optional {?stockcorp__id bhf:endDate ?corporation__endDate .}
    bind(concat(
      str(?corporation__id),
      " [",
      COALESCE(str(?corporation__startDate), "????"), 
      " - ",
      COALESCE(str(?corporation__endDate), "????"),
      "]"
    ) as ?corporation__prefLabel)
    BIND(CONCAT("/corporations/page/", STRAFTER(STR(?corporation__id), "corporation/")) AS ?corporation__dataProviderUrl)
}
UNION
{
    ?id bhf:hasName ?name__id .
    ?name__id rdfs:label ?name .
    optional {?name__id bhf:startDate ?name__startDate .}
    optional {?name__id bhf:endDate ?name__endDate .}
    bind(concat(
      str(?name),
      " [",
      COALESCE(str(?name__startDate), "????"), 
      " - ",
      COALESCE(str(?name__endDate), "????"),
      "]"
    ) as ?name__prefLabel)
}
union
{
    ?id bhf:hasStockQuantity ?stockQuantity__id .
    ?stockQuantity__id bhf:hasCurrency ?currency__id .
    ?currency__id foaf:name ?currency__prefLabel .
}
union
{
    ?id bhf:hasStockExchange ?stockExchange__id .
    ?stockExchange__id bhf:hasName ?stockExchangeName__id .
    ?stockExchangeName__id rdfs:label ?stockExchangeName__prefLabel .
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
    ?sectorName__id rdfs:label ?sectorName__prefLabel
}
`

export const stocksProperties = `
{
    bind(?id as ?uri__prefLabel)
    ?id bhf:scobID ?scobID__id .
    bind(?scobID__id as ?scobID__prefLabel)
    BIND(CONCAT("/securities/page/", str(?scobID__id)) AS ?scobID__dataProviderUrl)
}
union
{
    ?id bhf:hasName ?name__id .
    ?name__id rdfs:label ?name .
    optional {?name__id bhf:startDate ?name__startDate .}
    optional {?name__id bhf:endDate ?name__endDate .}
    bind(concat(
      str(?name),
      " [",
      COALESCE(str(?name__startDate), "????"), 
      " - ",
      COALESCE(str(?name__endDate), "????"),
      "]"
    ) as ?name__prefLabel)
}
union
{
    ?id bhf:hasStockQuantity ?stockQuantity__id .
    ?stockQuantity__id bhf:hasCurrency ?currency__id .
    ?currency__id foaf:name ?currency__prefLabel .
}
union
{
    ?id bhf:hasStockExchange ?stockExchange__id .
    ?stockExchange__id bhf:hasName ?stockExchangeName__id .
    ?stockExchangeName__id rdfs:label ?stockExchangeName__prefLabel .
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
    ?sectorName__id rdfs:label ?sectorName__prefLabel
}
union 
{
    ?id bhf:hasSharetype ?sharetype__id .
    bind(?sharetype__id as ?sharetype__prefLabel)
}
union
{
    ?stockcorp__id bhf:hasStock ?id .
    ?corporation__id bhf:hasStockCorporation ?stockcorp__id .
    optional {?stockcorp__id bhf:startDate ?corporation__startDate .}
    optional {?stockcorp__id bhf:endDate ?corporation__endDate .}
    bind(concat(
      str(?corporation__id),
      " [",
      COALESCE(str(?corporation__startDate), "????"), 
      " - ",
      COALESCE(str(?corporation__endDate), "????"),
      "]"
    ) as ?corporation__prefLabel)
    BIND(CONCAT("/corporations/page/", STRAFTER(STR(?corporation__id), "corporation/")) AS ?corporation__dataProviderUrl)
}
`

export const stocksGraphOpenClose = `
SELECT DISTINCT ?date ?open ?close
where {
    bind(<ID> as ?id)
    ?id bhf:hasNotation/bhf:hasNotationPrice ?price__id .
    ?price__id bhf:priceDay ?date .
    optional {?price__id bhf:openValue ?open .}
    optional {?price__id bhf:closeValue ?close .}
}
ORDER BY ?date
`

export const stocksGraphOpen = `
SELECT DISTINCT ?category ?count ?categoryLabel
where {
    bind(<ID> as ?id)
    ?id bhf:hasNotation/bhf:hasNotationPrice ?price__id .
    ?price__id bhf:priceDay ?category .
    bind(?category as ?categoryLabel)
    ?price__id bhf:openValue ?count .
}
ORDER BY ?category
`

export const facetResultSetQueryBelhisfirm = `
  SELECT *
  WHERE {
    {
      SELECT DISTINCT * {
        <FILTER>
        VALUES ?facetClass { <FACET_CLASS> }
        ?id <FACET_CLASS_PREDICATE> ?facetClass .
        <ORDER_BY_TRIPLE>
      }
      <ORDER_BY>
      <PAGE>
    }
    FILTER(BOUND(?id))
    <RESULT_SET_PROPERTIES>
  }
  <ORDER_BY>
`
