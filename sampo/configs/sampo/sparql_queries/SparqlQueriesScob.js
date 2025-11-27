export const corporationProperties = `
  {
    ?id rdf:type bhf:Corporation .
    ?id bhf:scobID ?scobID__prefLabel .
    BIND(?id as ?scobID_id)
    BIND(?id as ?uri__id)
    BIND(?id as ?uri__prefLabel)
    BIND(CONCAT("/scob/page/", STRAFTER(STR(?id), "corporation/")) AS ?scobID__dataProviderUrl)
  }
  UNION
  {
    ?id bhf:hasName ?corporationName__id .
    ?corporationName__id rdfs:label ?corporationName__prefLabel .
    BIND(CONCAT("/corporationNames/page/", STRAFTER(STR(?corporationName__id), "corporationName/")) AS ?corporationName__dataProviderUrl)
  }
  UNION
  {
    ?id bhf:hasLegalForm ?legalForm__id .
    ?legalForm__id rdfs:label ?legalForm__prefLabel .
    BIND(CONCAT("/legalForms/page/", STRAFTER(STR(?legalForm__id), "legalForm/")) AS ?legalForm__dataProviderUrl)
  }
  UNION
  {
    ?id bhf:hasAddress ?address__id .
    OPTIONAL { ?address__id bhf:streetAddress ?address__street . }
    OPTIONAL { ?address__id bhf:city ?address__city . }
    OPTIONAL { ?address__id bhf:country ?address__country . }
    OPTIONAL { ?address__id bhf:startDate ?address__startDate . }
    OPTIONAL { ?address__id bhf:endDate ?address__endDate . }
    BIND(
      CONCAT(
        COALESCE(?address__street, ""), 
        ", ",
        COALESCE(?address__city, ""), 
        ", ",
        COALESCE(?address__country, "")
      )
    AS ?address__prefLabel)
    BIND(?address__id as ?streetAddress__id)
    BIND(?address__street as ?streetAddress__prefLabel)
    BIND(?address__id as ?city__id)
    BIND(?address__city as ?city__prefLabel)
    BIND(?address__id as ?country__id)
    BIND(?address__country as ?country__prefLabel)
    BIND(CONCAT("/addresses/page/", STRAFTER(STR(?address__id), "address/")) AS ?address__dataProviderUrl)
  }
  UNION
  {
    ?id bhf:dateOfIncorporation ?dateOfIncorporation__id .
    BIND(STR(?dateOfIncorporation__id) as ?dateOfIncorporation__prefLabel)
  }
  UNION
  {
    ?id bhf:dateOfDissolution ?dateOfDissolution__id .
    BIND(?dateOfDissolution__id as ?dateOfDissolution__prefLabel)
  }
  UNION
  {
    ?id bhf:hasStockCorporation ?stockcorp__id .
    ?stockcorp__id bhf:hasStock ?stock__id .
    optional {?stockcorp__id bhf:startDate ?stock__startDate .}
    optional {?stockcorp__id bhf:endDate ?stock__endDate .}
    ?stock__id bhf:hasSharetype ?stock__sharetype .
    bind(concat(
      ?stock__sharetype,
      ": ",
      COALESCE(str(?stock__startDate), "????"), 
      " - ",
      COALESCE(str(?stock__endDate), "????")
    ) as ?stock__prefLabel)
    
    BIND(CONCAT("/stocks/page/", STRAFTER(STR(?stock__id), "stock/")) AS ?stock__dataProviderUrl)
  }
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


export const corporationNamePropertiesInstancePage = `
{
    ?id rdfs:label ?name__id .
    BIND(?id as ?uri__prefLabel)
    BIND(?id as ?uri__id)
    BIND(?name__id as ?name__prefLabel)
    BIND(CONCAT("/corporationNames/page/", STRAFTER(STR(?id), "corporationName/")) AS ?uri__dataProviderUrl)
}
UNION
{
    ?corporation__id bhf:hasName ?id .
    BIND(?corporation__id as ?corporation__prefLabel)
    BIND(CONCAT("/scob/page/", STRAFTER(STR(?corporation__id), "corporation/")) AS ?corporation__dataProviderUrl)
}
UNION
{
    ?id bhf:startDate ?startDate__id .
    BIND(?startDate__id as ?startDate__prefLabel) .
}
UNION
{
    ?id bhf:endDate ?endDate__id .
    BIND(?endDate__id as ?endDate__prefLabel) .
}
UNION
{
    ?id bhf:source ?source__id .
    BIND(?source__id as ?source__prefLabel) .
}
UNION
{
    ?id bhf:comments ?comments__id .
    BIND(?comments__id as ?comments__prefLabel) .
}
`

export const corporationLegalFormPropertiesInstancePage = `
{
    ?id rdfs:label ?legalForm__id .
    BIND(?legalForm__id as ?legalForm__prefLabel)
    BIND(?id as ?uri__prefLabel)
    BIND(?id as ?uri__id)
    BIND(CONCAT("/legalForms/page/", STRAFTER(STR(?id), "legalForm/")) AS ?uri__dataProviderUrl)
}
UNION
{
    ?corporation__id bhf:hasLegalForm ?id .
    BIND(?corporation__id as ?corporation__prefLabel)
    BIND(CONCAT("/scob/page/", STRAFTER(STR(?corporation__id), "corporation/")) AS ?corporation__dataProviderUrl)
}
UNION
{
    ?id bhf:startDate ?startDate__id .
    BIND(?startDate__id as ?startDate__prefLabel) .
}
UNION
{
    ?id bhf:endDate ?endDate__id .
    BIND(?endDate__id as ?endDate__prefLabel) .
}
UNION
{
    ?id bhf:comments ?comments__id .
    BIND(?comments__id as ?comments__prefLabel) .
}
UNION
{
    ?id bhf:source ?source__id .
    BIND(?source__id as ?source__prefLabel) .
}
`

export const corporationAddressPropertiesInstancePage = `
{
    ?id bhf:country ?country__id .
    BIND(?country__id as ?country__prefLabel)
    BIND(?id as ?uri__prefLabel)
    BIND(?id as ?uri__id)
    BIND(CONCAT("/addresses/page/", STRAFTER(STR(?id), "address/")) AS ?uri__dataProviderUrl)
}
UNION
{
    ?corporation__id bhf:hasAddress ?id .
    BIND(?corporation__id as ?corporation__prefLabel)
    BIND(CONCAT("/scob/page/", STRAFTER(STR(?corporation__id), "corporation/")) AS ?corporation__dataProviderUrl)
}
UNION
{
    ?id bhf:city ?city__id .
    BIND(?city__id as ?city__prefLabel)
}
UNION
{
    ?id bhf:streetAddress ?streetAddress__id .
    BIND(?streetAddress__id as ?streetAddress__prefLabel)
}
UNION
{
    ?id bhf:startDate ?startDate__id .
    BIND(?startDate__id as ?startDate__prefLabel)
}
UNION
{
    ?id bhf:endDate ?endDate__id .
    BIND(?endDate__id as ?endDate__prefLabel)
}

`


