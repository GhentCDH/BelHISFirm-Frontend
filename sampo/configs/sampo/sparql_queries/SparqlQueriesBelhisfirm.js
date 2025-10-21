export const companyProperties = `
  {
    ?id rdf:type bhf:Company .
    ?id foaf:name ?companyName__id .
    BIND(?companyName__id as ?companyName__prefLabel)
    BIND(?id as ?uri__id)
    BIND(?id as ?uri__prefLabel)
    BIND(CONCAT("/belhisfirm/page/", STRAFTER(STR(?id), "company/")) AS ?companyName__dataProviderUrl)
  }
  UNION
  {
    ?id bhf:hasFounder ?founder__id .
    ?founder__id foaf:name ?founder__prefLabel .
  }
  UNION
  {
    ?id bhf:businessSector ?businessSector__id .
    BIND(?businessSector__id as ?businessSector__prefLabel)
  }
  UNION
  {
    ?id bhf:hasDirector ?director__id .
    ?director__id foaf:name ?director__prefLabel .
  }
  UNION 
  {
    ?id bhf:hasFounder ?founder__id .
    ?founder__id foaf:name ?founder__prefLabel .
  }
  UNION
  {
    ?id bhf:hasShareholder ?shareholder__id .
    ?shareholder__id foaf:name ?shareholder__prefLabel .
  }
  UNION
  {
    ?id bhf:legalForm ?legalForm__id .
    BIND(?legalForm__id as ?legalForm__prefLabel)
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
  UNION
  {
    ?id bhf:registeredCapital ?registeredCapital__id .
    BIND(?registeredCapital__id as ?registeredCapital__prefLabel)
  }
  UNION
  {
    ?id bhf:hasAddress ?address__id .
    ?address__id bhf:streetAddress ?address__street ;
                 bhf:postalCode ?address__postalCode ;
                 bhf:city ?address__city ;
                 bhf:country ?address__country .
    BIND(CONCAT(?address__street, " ", ?address__postalCode, " ", ?address__city, " ", ?address__country) as ?address__prefLabel)
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

export const knowledgeGraphMetadataQuery = `
  SELECT * 
  WHERE {
    ?id a sd:Dataset ;
        dct:title ?title ;
        dct:publisher ?publisher ;
        dct:rightsHolder ?rightsHolder ;
        dct:modified ?modified ;
        dct:source ?databaseDump__id .
    ?databaseDump__id skos:prefLabel ?databaseDump__prefLabel ;
                      mmm-schema:data_provider_url ?databaseDump__dataProviderUrl ;
                      dct:modified ?databaseDump__modified .
  }
`
