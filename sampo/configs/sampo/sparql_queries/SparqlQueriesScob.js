export const corporationProperties = `
  {
    ?id rdf:type bhf:Corporation .
    BIND(?id as ?uri__id)
    BIND(?id as ?uri__prefLabel)
    BIND(CONCAT("/scob/page/", STRAFTER(STR(?id), "corporation/")) AS ?uri__dataProviderUrl)
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
        " ",
        COALESCE(?address__city, ""), 
        " ",
        COALESCE(?address__country, ""))
    AS ?address__prefLabel)
    BIND(?address__id as ?streetAddress__id)
    BIND(?address__street as ?streetAddress__prefLabel)
    BIND(?address__id as ?city__id)
    BIND(?address__city as ?city__prefLabel)
    BIND(?address__id as ?country__id)
    BIND(?address__country as ?country__prefLabel)
  }
  UNION
  {
    ?id bhf:dateOfFounding ?dateOfFounding__id .
    BIND(?dateOfFounding__id as ?dateOfFounding__prefLabel)
  }
  UNION
  {
    ?id bhf:dateOfDissolution ?dateOfDissolution__id .
    BIND(?dateOfDissolution__id as ?dateOfDissolution__prefLabel)
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
}
UNION
{
    
}
`
