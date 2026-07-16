# BellHisFirm Frontend

A Docker Compose application stack for BellHisFirm consisting of:
- **Ontop VKG** - Virtual Knowledge Graph SPARQL endpoint
- **Sampo UI** - Frontend user interface

## Architecture

```

┌─────────────────┐
│   Sampo UI      │ 
│    Client       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Sampo UI      │ 
│    Server       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     NGINX.      │
│ HTTP cache layer│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Ontop VKG     │
│ SPARQL Endpoint │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      SCOB       │
│ Oracle Database │
└─────────────────┘
```

## Quick Start

### 1. Initial Setup

Clone or navigate to the project directory:
```bash
cd ~/Projects/BellHisFirm-Frontend
```

### 2. Configure Environment

Copy the example environment file and customize if needed:
```bash
cp env.example .env
# Edit .env with your preferred settings
```

### 3. Start the Application

Launch all services with Docker Compose:

```bash
docker-compose up -d
```

Or first build sampo images and run prod compose:

```shell
cd sampo
docker compose -f compose-prod.yaml build 
```

```shell
docker compose -f compose-prod.yml up
```

### 4. Access the Services

Once all services are running

In dev:
- **Sampo UI client**: http://localhost:80
- **Sampo UI server**: http://localhost:3001
- **Ontop SPARQL Endpoint**: http://localhost:8080/sparql
- **HAProxy Caching Layer**: http://localhost:8864/sparql

## Configuration

### Virtual Knowledge Graph (Ontop)

The VKG maps relational database data to RDF/OWL knowledge graphs.

**Configuration Files** (in `vkg/input/`):

1. **ontology.ttl** - OWL ontology (classes, properties, relationships)
2. **mappings.ttl** - R2RML mappings from SQL to RDF
3. **ontop.properties** - Database connection and Ontop settings

**SPARQL Endpoint**:
- Access the YASGUI Ontop query interface at http://localhost:8080
- Query via POST to http://localhost:8080/sparql
- Ontop automatically translates SPARQL queries to SQL

### Sampo UI

The frontend application that consumes the SPARQL endpoint.
Uses sampo-ui from: https://github.com/GhentCDH/sampo-ui

Configs set in `sampo/configs`

## Common Tasks

### Stop the Application
```bash
docker compose down
```

### Stop and Remove Volumes (⚠️ Deletes all data)
```bash
docker compose down -v
```

### Restart a Specific Service
```bash
docker compose restart vkg-scob
```

### Rebuild After Changes
```bash
docker compose up -d --build
```

## Making changes

### Text and column names
All text on the app can be edited in the localeEN and localeNL files in `sampo/configs/sampo/translations`.
Info and instructions pages can be edited in `sampo/configs/sampo/pages` in the html files.

### Ontology
Ontology is defined in `vkg/input/ontology.ttl` and in the ttk files under `vkg/input/ontology`. Be careful if edits
need to be made to ontology it likely means mappings need to change as well.

Important to note is that while the portal uses the term "security", since the DB uses the term "Stock" the ontology
also uses the term "Stock".

### Mappings
All mappings are defined in the `vkg/input/ontology/mappings.ttl` file using the R2RML standard. 

Because of the nature of the legacy scob database some choices had to be made for the mappings that might not seem
intuitive at first sight:
- Corporations with IDs 1 and 2 are results of some unclean design in the scob database that have to be filtered out
- The scob database often uses years 1000-01-01 and 3999-12-31 for unknown dates, so those have to be mapped to null at
multiple spots
- For notation prices it is irrelevant to query prices without an `open_value`, so that also gets filtered out at sql
level.

### Sampo configs and custom components
Find more detailed info on how these systems work on the [sampo docs](https://github.com/GhentCDH/sampo-ui/tree/master/docs).

## Resources

### Ontop Documentation

- Official Website: https://ontop-vkg.org/
- Docker Hub: https://hub.docker.com/r/ontop/ontop
- Tutorials: https://ontop-vkg.org/tutorial/
- R2RML Specification: https://www.w3.org/TR/r2rml/

### SPARQL
- SPARQL 1.1 Query Language: https://www.w3.org/TR/sparql11-query/
- YASGUI Query Interface: https://yasgui.triply.cc/

### Sampo-ui
- Main repository (we only use version 4): https://github.com/SemanticComputing/sampo-ui/tree/dev-v4
- Sampo docs: https://github.com/GhentCDH/sampo-ui/tree/master/docs

## Support

For issues or questions:
- Create an issue in the project repository
- Check the Ontop documentation at https://ontop-vkg.org/
- Consult the Docker Compose documentation

## Credits

Sampo UI by the Semantic Computing Research Group (SeCo), Helsinki.

Development by [Ghent Centre for Digital Humanities - Ghent University](https://www.ghentcdh.ugent.be/). Funded by the [GhentCDH research projects](https://www.ghentcdh.ugent.be/projects).

<img src="https://www.ghentcdh.ugent.be/ghentcdh_logo_blue_text_transparent_bg_landscape.svg" alt="Landscape" width="500">
