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
  }
  UNION
  {
    ?id bhf:hasLegalForm ?legalForm__id .
    #TODO fix for legal form labels table
    BIND(?legalForm__id as ?legalForm__prefLabel)
  }
  UNION
  {
    ?id bhf:hasAddress ?address__id .
    OPTIONAL { ?address__id bhf:streetAddress ?address__street . }
    OPTIONAL { ?address__id bhf:city ?address__city . }
    OPTIONAL { ?address__id bhf:country ?address__country . }
    BIND(CONCAT(?address__street, " ", ?address__city, " ", ?address__country) as ?address__prefLabel)
    BIND(?address__street as ?streetAddress__id)
    BIND(?address__street as ?streetAddress__prefLabel)
    BIND(?address__city as ?city__id)
    BIND(?address__city as ?city__prefLabel)
    BIND(?address__country as ?country__id)
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