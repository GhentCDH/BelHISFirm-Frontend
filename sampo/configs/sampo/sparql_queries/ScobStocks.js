export const stockPropertiesInstancePage = `
{
    ?id bhf:hasSharetype ?sharetype__id .
    bind(?sharetype__id as ?sharetype__prefLabel)
    bind(?id as ?uri__id)
    bind(?id as ?uri__prefLabel)
}
UNION
{
    ?id bhf:hasStockExchange ?stockExchange__id .
    bind(?stockExchange__id as ?stockExchange__prefLabel)
}
UNION
{
    ?stockcorp__id bhf:hasStock ?id .
    ?corporation__id bhf:hasStockCorporation ?stockcorp__id .
    optional {?stockcorp__id bhf:startDate ?corporation__startDate .}
    optional {?stockcorp__id bhf:endDate ?corporation__endDate .}
    bind(concat(
      str(?corporation__id),
      ": ",
      COALESCE(str(?corporation__startDate), "????"), 
      " - ",
      COALESCE(str(?corporation__endDate), "????")
    ) as ?corporation__prefLabel)
    BIND(CONCAT("/scob/page/", STRAFTER(STR(?corporation__id), "corporation/")) AS ?corporation__dataProviderUrl)
}
UNION
{
    ?id bhf:hasName ?name__id .
    ?name__id rdfs:label ?name .
    optional {?name__id bhf:startDate ?name__startDate .}
    optional {?name__id bhf:endDate ?name__endDate .}
    bind(concat(
      str(?name),
      ": ",
      COALESCE(str(?name__startDate), "????"), 
      " - ",
      COALESCE(str(?name__endDate), "????")
    ) as ?name__prefLabel)
}
`

export const stocksGraphOpenClose = `
SELECT DISTINCT ?day ?open ?close
where {
    bind(<ID> as ?id)
    ?id bhf:hasNotation/bhf:hasNotationPrice ?price__id .
    optional {?price__id bhf:priceDay ?day .}
    optional {?price__id bhf:openValue ?open .}
    optional {?price__id bhf:closeValue ?close .}
}
`