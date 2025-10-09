
export const companyProperties = `
    {
        ?id rdf:type bhf:Company .
        ?id foaf:name ?companyName__id .
        BIND(?companyName__id as ?companyName__prefLabel)
        BIND(?id as ?uri__id)
        BIND(?id as ?uri__prefLabel)
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
