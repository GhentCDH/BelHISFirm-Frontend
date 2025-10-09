# BellHisFirm Database & Ontology Update Summary

## ✅ Changes Completed

### 1. Database Schema (`db/init/01-init.sql`)

**Companies Table:**
- company_name (VARCHAR 500)
- legal_form (e.g., SA, NV)
- street_address, city, postal_code, country
- date_of_founding, date_of_dissolution
- business_sector, company_type
- registered_capital

**Persons Table:**
- first_name, last_name, full_name
- date_of_birth, date_of_death
- place_of_birth
- nationality

**Company_Person Relationship Table:**
- Links companies to persons
- role field (Director, Founder, Shareholder, Manager)
- start_date, end_date for temporal relationships
- share_percentage for shareholders

**Sample Data Includes:**
- 10 Belgian historical companies:
  * Société Générale de Belgique (1822)
  * Union Minière du Haut Katanga (1906)
  * Cockerill-Sambre (1817)
  * Banque de Bruxelles (1871)
  * Solvay & Cie (1863)
  * And 5 more...

- 15 Historical Belgian figures:
  * Ferdinand de Meeûs, Ernest Solvay, Édouard Empain
  * John Cockerill, Alexandre Galopin
  * And 10 more directors, founders, and industrialists

- 20+ Relationship mappings connecting persons to companies


### 2. Ontology (`vkg/input/ontology.ttl`)

**Uses Standard Vocabularies:**
- **FOAF** (Friend of a Friend) - for person data
- **W3C Organization Ontology** - for organizational structures
- **RegOrg** - for registered organizations
- **Schema.org** - for cross-compatibility
- **Dublin Core** - for metadata
- **vCard** - for address information

**Custom BellHisFirm Classes:**
- bhf:Company (subclass of org:Organization)
- bhf:Person (subclass of foaf:Person)
- bhf:Director, bhf:Founder, bhf:Shareholder
- bhf:Address (subclass of vcard:Address)

**Object Properties:**
- bhf:hasDirector, bhf:hasFounder, bhf:hasShareholder
- bhf:worksFor, bhf:founded
- bhf:hasAddress

**Data Properties:**
- Company: companyName, legalForm, dateOfFounding, businessSector, registeredCapital
- Person: dateOfBirth, dateOfDeath, placeOfBirth, nationality
- Temporal: startDate, endDate
- Address: streetAddress, city, postalCode, country

**Bilingual Labels:**
- All properties have English and Dutch (nl) labels
- Supports multilingual interface development

### 3. R2RML Mappings (`vkg/input/mappings.obda`)

**Company Mappings:**
- Map database companies to bhf:Company class
- Expose company names via foaf:name (FOAF integration)
- Map addresses to vcard:Address
- Include temporal data (founding/dissolution dates)
- Business sector and capital information

**Person Mappings (FOAF-compliant):**
- Map persons to foaf:Person class
- Use FOAF properties: foaf:name, foaf:firstName, foaf:lastName
- Also use: foaf:givenName, foaf:familyName
- Birth/death dates mapped to both bhf: and schema.org
- Nationality and birthplace included
11. Brussels-based companies
12. Directors born before 1850
13. Company network - shared directors
14. Founders who are also directors
15. Company capital statistics
16. Person details with FOAF properties
17. Companies active in 1900 (temporal query)
18. Timeline of company foundings by decade
19. Export company data as Turtle (CONSTRUCT)
20. FOAF person network (CONSTRUCT)

**Query Categories:**
- Basic data retrieval
- Relationship exploration
- Temporal analysis
- Aggregation and statistics
- Network analysis
- Data export (CONSTRUCT queries)

## 🎯 Key Features

### Standards Compliance
✅ **FOAF Integration**: All person data uses Friend of a Friend vocabulary
✅ **W3C Org Ontology**: Company organizational structures
✅ **Schema.org**: Cross-platform compatibility
✅ **Multilingual**: English and Dutch labels throughout

### Data Model Highlights
- **Temporal Relationships**: Track when people held roles (start/end dates)
- **Multiple Roles**: Same person can be director, founder, shareholder
- **Network Analysis**: Query shared directors across companies
- **Historical Data**: Belgian companies from 1717-1906
- **Real Historical Figures**: Ernest Solvay, John Cockerill, etc.

### Belgian Historical Context
Based on SCOB (Belgian company information) database:
- Real Belgian companies and historical figures
- Brussels Stock Exchange data foundation
- EURHISFIRM project alignment
- Suitable for historical research and analysis

## 📊 Sample Data Statistics

**Companies:** 10 historical Belgian firms
- Banking: 2 companies
- Manufacturing: 3 companies (steel, arms, chemicals)
- Other: Mining, shipping, retail, brewing

**Persons:** 15 Belgian historical figures
- Birth dates ranging from 1790-1887
- Multiple nationalities (primarily Belgian)
- Various roles: founders, directors, shareholders

**Relationships:** 20+ company-person links
- Directors: 12 relationships
- Founders: 6 relationships
- Shareholders: 2 relationships

## 🚀 Testing Your Setup

### 1. Start the Services
```bash
cd ~/Projects/BellHisFirm-Frontend
./setup.sh
# OR
make up
```

### 2. Access the SPARQL Endpoint
Open: http://localhost:8080

### 3. Try a Simple Query
```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX bhf: <http://belhisfirm.be/ontology#>

SELECT ?name ?company
WHERE {
  ?person foaf:name ?name ;
          bhf:worksFor ?c .
  ?c foaf:name ?company .
}
LIMIT 10
```

### 4. Verify Data
Expected results:
- ~10 companies visible
- ~15 persons visible
- ~20+ relationships
- All with proper FOAF properties

## 📚 Ontology Design Rationale

### Why FOAF?
- **Standard**: Widely adopted for person data
- **Interoperable**: Works with existing Linked Data
- **Rich**: Provides comprehensive person properties
- **Social**: Supports network relationships (foaf:knows)

### Why Multiple Vocabularies?
- **Best Practice**: Reuse standard ontologies
- **Compatibility**: Works with Sampo UI expectations
- **Flexibility**: Different views of same data
- **Future-proof**: Easy integration with other systems

### Property Duplication
Some properties mapped to multiple vocabularies:
- foaf:name AND bhf:companyName (for company names)
- schema:birthDate AND bhf:dateOfBirth
- Reason: Maximum compatibility and query flexibility

## 🔍 Validation Checklist

- [x] Database schema includes companies, persons, relationships
- [x] Sample data loaded with Belgian historical context
- [x] Ontology uses FOAF for person data
- [x] Ontology uses W3C Org for company data
- [x] R2RML mappings expose FOAF properties
- [x] Company-person relationships properly mapped
- [x] Temporal data (dates) included
- [x] Address information structured
- [x] Example queries demonstrate all features
- [x] Bilingual labels (EN/NL) provided

## 📖 Related Documentation

See also:
- **README.md** - Full project documentation
- **QUICKREF.md** - Command reference
- **PROJECT-SUMMARY.md** - Setup guide
- **vkg/input/example-queries.md** - All SPARQL queries
- **vkg/jdbc/README.md** - JDBC driver setup

## 🎓 Learning Resources

### FOAF Vocabulary
- Specification: http://xmlns.com/foaf/spec/
- Examples: http://xmlns.com/foaf/spec/#sec-example

### W3C Organization Ontology
- Specification: https://www.w3.org/TR/vocab-org/

### EURHISFIRM Project
- Website: https://eurhisfirm.eu/
- Data Model: https://eurhisfirm.eu/wp-content/uploads/2021/04/D5.4_v9.pdf
- Wikibase: http://data.eurhisfirm.eu/

### Belgian Business History
- SCOB Database context
- Brussels Stock Exchange history
- Belgian industrial revolution

## 🛠️ Next Steps for Development

1. **Verify Setup**: Start services and test queries
2. **Explore Data**: Use example queries to understand structure
3. **Extend Schema**: Add more companies and persons as needed
4. **Customize Ontology**: Add domain-specific properties
5. **Build Sampo UI**: Create faceted search interface
6. **Performance Test**: Evaluate with larger datasets
7. **Document**: Add your own queries and findings

## 🎉 Summary

The BellHisFirm-Frontend project now has:
- ✅ Complete database schema with Belgian company data
- ✅ FOAF-compliant person ontology
- ✅ Standard vocabulary integration (FOAF, W3C Org, Schema.org)
- ✅ Comprehensive R2RML mappings
- ✅ 20+ example SPARQL queries
- ✅ Real historical Belgian data
- ✅ Ready for Sampo UI integration
- ✅ Aligned with EURHISFIRM/SCOB standards

**Ready to explore Belgian business history through semantic web technologies!** 🇧🇪
