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
    ?id bhf:hasStockExchange ?stockExchange__id .
    bind(?stockExchange__id as ?stockExchange__prefLabel)
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
    ?corporation__id bhf:hasName/rdfs:label ?corporation__name .
    optional {?stockcorp__id bhf:startDate ?corporation__startDate .}
    optional {?stockcorp__id bhf:endDate ?corporation__endDate .}
    bind(concat(
      str(?corporation__name),
      " [",
      COALESCE(str(?corporation__startDate), "..."), 
      " - ",
      COALESCE(str(?corporation__endDate), "..."),
      "]"
    ) as ?corporation__prefLabel)
    BIND(CONCAT("/corporations/page/", STRAFTER(STR(?corporation__id), "corporation/")) AS ?corporation__dataProviderUrl)
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


export const securitiesExportQuery = `
  SELECT DISTINCT ?uri ?scobID ?name ?exchange ?type ?sector ?sharetype ?corporation
  WHERE {
    <FILTER>
    ?uri rdf:type bhf:Stock .
    ?uri bhf:scobID ?scobID .
    OPTIONAL {
      ?uri bhf:hasName ?_nameNode .
      ?_nameNode rdfs:label ?name .
    }
    OPTIONAL {
      ?uri bhf:hasStockExchange ?exchange .
    }
    OPTIONAL {
      ?uri bhf:hasStockType ?_stNode .
      ?_stNode bhf:typeName ?type .
    }
    OPTIONAL {
      ?uri bhf:hasNotation ?_notationNode .
      ?_notationNode bhf:hasSector ?_sectorNode .
      ?_sectorNode bhf:hasName ?_sectorNameNode .
      ?_sectorNameNode rdfs:label ?sector .
    }
    OPTIONAL {
      ?uri bhf:hasSharetype ?sharetype .
    }
    OPTIONAL {
      ?_stockcorpNode bhf:hasStock ?uri .
      ?_corpNode bhf:hasStockCorporation ?_stockcorpNode .
      ?_corpNode bhf:hasName/rdfs:label ?corporation .
    }
  }
  ORDER BY ?scobID
`

// Force having a stockexchange and a sharetype for all queries about securities
export const facetResultSetQueryStocks = `
  SELECT *
  WHERE {
    {
      SELECT DISTINCT * {
        <FILTER>
        VALUES ?facetClass { <FACET_CLASS> }
        ?id <FACET_CLASS_PREDICATE> ?facetClass ;
            bhf:hasStockExchange ?_exchng ;
            bhf:hasSharetype ?_shrtyp .
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

export const countQueryStocks = `
  SELECT (COUNT(DISTINCT ?id) as ?count)
  WHERE {
    <FILTER>
    VALUES ?facetClass { <FACET_CLASS> }
    ?id <FACET_CLASS_PREDICATE> ?facetClass ;
        bhf:hasStockExchange ?_exchng ;
        bhf:hasSharetype ?_shrtyp .
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
