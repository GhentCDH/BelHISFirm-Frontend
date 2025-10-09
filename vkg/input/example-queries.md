# SPARQL Queries for BellHisFirm Virtual Knowledge Graph

This document contains example SPARQL queries for exploring Belgian historical company data.

## Basic Queries

### Query 1: List All Companies
Get all companies with their names and founding dates.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?company ?name ?foundingDate
WHERE {
  ?company a bhf:Company ;
           foaf:name ?name .
  OPTIONAL { ?company bhf:dateOfFounding ?foundingDate }
}
ORDER BY ?foundingDate
```

### Query 2: List All Persons (using FOAF)
Get all persons with their names and birth dates.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?person ?name ?firstName ?lastName ?birthDate
WHERE {
  ?person a foaf:Person ;
          foaf:name ?name ;
          foaf:firstName ?firstName ;
          foaf:lastName ?lastName .
  OPTIONAL { ?person bhf:dateOfBirth ?birthDate }
}
ORDER BY ?lastName ?firstName
```


### Query 3: Companies by City
Count companies per city.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>

SELECT ?city (COUNT(?company) as ?count)
WHERE {
  ?company a bhf:Company ;
           bhf:city ?city .
}
GROUP BY ?city
ORDER BY DESC(?count)
```

### Query 4: Companies by Business Sector
List companies grouped by their business sector.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?sector ?companyName
WHERE {
  ?company a bhf:Company ;
           foaf:name ?companyName ;
           bhf:businessSector ?sector .
}
ORDER BY ?sector ?companyName
```

## Relationship Queries

### Query 5: Companies and Their Directors
Find all companies with their directors.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?companyName ?directorName
WHERE {
  ?company a bhf:Company ;
           foaf:name ?companyName ;
           bhf:hasDirector ?director .
  ?director foaf:name ?directorName .
}
ORDER BY ?companyName
```


### Query 6: Company Founders
Find companies and their founders with founding dates.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?companyName ?founderName ?foundingDate
WHERE {
  ?company a bhf:Company ;
           foaf:name ?companyName ;
           bhf:hasFounder ?founder ;
           bhf:dateOfFounding ?foundingDate .
  ?founder foaf:name ?founderName .
}
ORDER BY ?foundingDate
```

### Query 7: Person's Company Affiliations
Find all companies associated with a specific person.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?personName ?companyName ?role
WHERE {
  ?person foaf:name ?personName ;
          bhf:worksFor ?company ;
          bhf:role ?role .
  ?company foaf:name ?companyName .
  FILTER(CONTAINS(LCASE(?personName), "solvay"))
}
```

### Query 8: Companies Founded in Specific Period
Find companies founded between 1800 and 1900.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?companyName ?foundingDate ?city
WHERE {
  ?company a bhf:Company ;
           foaf:name ?companyName ;
           bhf:dateOfFounding ?foundingDate ;
           bhf:city ?city .
  FILTER(?foundingDate >= "1800-01-01"^^xsd:date && 
         ?foundingDate <= "1900-12-31"^^xsd:date)
}
ORDER BY ?foundingDate
```


## Advanced Queries

### Query 9: Companies with Full Address Details
Get complete address information for all companies.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?companyName ?street ?city ?postalCode ?country
WHERE {
  ?company a bhf:Company ;
           foaf:name ?companyName ;
           bhf:streetAddress ?street ;
           bhf:city ?city ;
           bhf:postalCode ?postalCode ;
           bhf:country ?country .
}
ORDER BY ?city ?companyName
```

### Query 10: Persons by Nationality
Count persons by their nationality.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?nationality (COUNT(?person) as ?count)
WHERE {
  ?person a foaf:Person ;
          bhf:nationality ?nationality .
}
GROUP BY ?nationality
ORDER BY DESC(?count)
```

### Query 11: Brussels-Based Companies
Find all companies located in Brussels with their sectors.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?companyName ?sector ?address ?foundingDate
WHERE {
  ?company a bhf:Company ;
           foaf:name ?companyName ;
           bhf:city "Brussels" ;
           bhf:businessSector ?sector ;
           bhf:streetAddress ?address .
  OPTIONAL { ?company bhf:dateOfFounding ?foundingDate }
}
ORDER BY ?companyName
```


### Query 12: Directors Born Before 1850
Find directors who were born before 1850.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?directorName ?birthDate ?birthPlace
WHERE {
  ?director a bhf:Director ;
            foaf:name ?directorName ;
            bhf:dateOfBirth ?birthDate .
  OPTIONAL { ?director bhf:placeOfBirth ?birthPlace }
  FILTER(?birthDate < "1850-01-01"^^xsd:date)
}
ORDER BY ?birthDate
```

### Query 13: Company Network - Shared Directors
Find companies that share directors (network analysis).

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?company1Name ?company2Name ?directorName
WHERE {
  ?company1 bhf:hasDirector ?director .
  ?company2 bhf:hasDirector ?director .
  ?company1 foaf:name ?company1Name .
  ?company2 foaf:name ?company2Name .
  ?director foaf:name ?directorName .
  FILTER(?company1 != ?company2)
  FILTER(STR(?company1) < STR(?company2))
}
ORDER BY ?directorName
```

### Query 14: Founders Who Are Also Directors
Find persons who are both founders and directors of companies.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?personName ?companyName
WHERE {
  ?person a bhf:Founder , bhf:Director ;
          foaf:name ?personName ;
          bhf:founded ?company ;
          bhf:worksFor ?company .
  ?company foaf:name ?companyName .
}
ORDER BY ?personName
```


### Query 15: Company Capital Statistics
Get statistics on registered capital by business sector.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>

SELECT ?sector 
       (COUNT(?company) as ?companyCount)
       (AVG(?capital) as ?avgCapital)
       (MIN(?capital) as ?minCapital)
       (MAX(?capital) as ?maxCapital)
WHERE {
  ?company a bhf:Company ;
           bhf:businessSector ?sector ;
           bhf:registeredCapital ?capital .
}
GROUP BY ?sector
ORDER BY DESC(?avgCapital)
```

### Query 16: Person Details with FOAF Properties
Comprehensive person information using FOAF ontology.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX schema: <http://schema.org/>

SELECT ?name ?firstName ?lastName ?birthDate ?birthPlace ?nationality
WHERE {
  ?person a foaf:Person ;
          foaf:name ?name ;
          foaf:firstName ?firstName ;
          foaf:lastName ?lastName .
  OPTIONAL { ?person schema:birthDate ?birthDate }
  OPTIONAL { ?person schema:birthPlace ?birthPlace }
  OPTIONAL { ?person bhf:nationality ?nationality }
}
ORDER BY ?lastName ?firstName
```

## Temporal Queries

### Query 17: Companies Active in 1900
Find companies that were active (founded before, not yet dissolved) in 1900.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?companyName ?foundingDate ?dissolutionDate
WHERE {
  ?company a bhf:Company ;
           foaf:name ?companyName ;
           bhf:dateOfFounding ?foundingDate .
  OPTIONAL { ?company bhf:dateOfDissolution ?dissolutionDate }
  FILTER(?foundingDate < "1900-01-01"^^xsd:date)
  FILTER(!BOUND(?dissolutionDate) || ?dissolutionDate > "1900-12-31"^^xsd:date)
}
ORDER BY ?foundingDate
```


### Query 18: Timeline of Company Foundings by Decade
Count companies founded per decade.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?decade (COUNT(?company) as ?count)
WHERE {
  ?company a bhf:Company ;
           bhf:dateOfFounding ?foundingDate .
  BIND(FLOOR(YEAR(?foundingDate) / 10) * 10 AS ?decade)
}
GROUP BY ?decade
ORDER BY ?decade
```

## CONSTRUCT Queries

### Query 19: Export Company Data as Turtle
Create a subgraph of Belgian companies in Brussels.

```sparql
PREFIX bhf: <http://belhisfirm.be/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

CONSTRUCT {
  ?company a bhf:Company ;
           foaf:name ?name ;
           bhf:city ?city ;
           bhf:businessSector ?sector .
}
WHERE {
  ?company a bhf:Company ;
           foaf:name ?name ;
           bhf:city "Brussels" ;
           bhf:businessSector ?sector .
}
```

### Query 20: FOAF Person Network
Create a FOAF-compatible person network.

```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX bhf: <http://belhisfirm.be/ontology#>

CONSTRUCT {
  ?person a foaf:Person ;
          foaf:name ?name ;
          foaf:knows ?colleague .
}
WHERE {
  ?person a foaf:Person ;
          foaf:name ?name ;
          bhf:worksFor ?company .
  ?colleague a foaf:Person ;
             bhf:worksFor ?company .
  FILTER(?person != ?colleague)
}
```

## Useful Tips

### Testing Your Setup
Start with this simple query to verify everything works:

```sparql
SELECT ?s ?p ?o
WHERE {
  ?s ?p ?o .
}
LIMIT 10
```

### Count All Triples
```sparql
SELECT (COUNT(*) as ?count)
WHERE {
  ?s ?p ?o .
}
```

### List All Predicates
```sparql
SELECT DISTINCT ?predicate
WHERE {
  ?s ?predicate ?o .
}
ORDER BY ?predicate
```

## How to Execute

1. **Access YASGUI**: Visit http://localhost:8080
2. **Copy Query**: Select and copy any query above
3. **Paste**: Paste into the YASGUI editor
4. **Execute**: Click "Run" or press Ctrl+Enter
5. **Explore**: View results in table/JSON/CSV format

## Notes

- All queries use the BellHisFirm ontology with FOAF for persons
- Company data uses both custom bhf: properties and standard vocabularies
- Person data leverages FOAF (Friend of a Friend) ontology
- Queries demonstrate various SPARQL features:
  - SELECT for data retrieval
  - FILTER for constraints
  - OPTIONAL for missing data
  - GROUP BY for aggregation
  - CONSTRUCT for data transformation

## Next Steps

- Modify queries for your specific research questions
- Combine multiple patterns for complex analysis
- Export results for further processing
- Create custom faceted views in Sampo UI

## Resources

- SPARQL 1.1 Query Language: https://www.w3.org/TR/sparql11-query/
- FOAF Vocabulary: http://xmlns.com/foaf/spec/
- Ontop Documentation: https://ontop-vkg.org/
- W3C Organization Ontology: https://www.w3.org/TR/vocab-org/
