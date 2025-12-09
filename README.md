# BellHisFirm Frontend

A Docker Compose application stack for BellHisFirm consisting of:
- **PostgreSQL Database** - Relational data storage
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
│     Varnish     │
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

## Prerequisites

### Install jdbc driver(s) for Oracle database

Run this command from the project root:



You should then see the jar file(s) in `vkg/jdbc`



## Quick Start

### 1. Initial Setup

Clone or navigate to the project directory:
```bash
cd ~/Projects/BellHisFirm-Frontend
```

### 2. Download Oracle JDBC Driver

Oracle:
```shell
curl -L -o vkg/jdbc/ojdbc8-21.11.0.0.jar https://repo1.maven.org/maven2/com/oracle/database/jdbc/ojdbc8/21.11.0.0/ojdbc8-21.11.0.0.jar
```

### 3. Configure Environment

Copy the example environment file and customize if needed:
```bash
cp env.example .env
# Edit .env with your preferred settings
```

### 4. Start the Application

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

### 5. Access the Services

Once all services are running

In dev:
- **Sampo UI client**: http://localhost:8081
- **Sampo UI server**: http://localhost:3001
- **Ontop SPARQL Endpoint**: http://localhost:8080/sparql
- **Varnish Caching Layer**: http://localhost:8082/sparql

## Configuration

### Virtual Knowledge Graph (Ontop)

The VKG maps relational database data to RDF/OWL knowledge graphs.

**Configuration Files** (in `vkg/input/`):

1. **ontology.ttl** - Define your OWL ontology (classes, properties, relationships)
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

## Resources

### Ontop Documentation

- Official Website: https://ontop-vkg.org/
- Docker Hub: https://hub.docker.com/r/ontop/ontop
- Tutorials: https://ontop-vkg.org/tutorial/
- R2RML Specification: https://www.w3.org/TR/r2rml/

### SPARQL
- SPARQL 1.1 Query Language: https://www.w3.org/TR/sparql11-query/
- YASGUI Query Interface: https://yasgui.triply.cc/

## Support

For issues or questions:
- Create an issue in the project repository
- Check the Ontop documentation at https://ontop-vkg.org/
- Consult the Docker Compose documentation

## Credits

Sampo UI by the Semantic Computing Research Group (SeCo), Helsinki.

Development by [Ghent Centre for Digital Humanities - Ghent University](https://www.ghentcdh.ugent.be/). Funded by the [GhentCDH research projects](https://www.ghentcdh.ugent.be/projects).

<img src="https://www.ghentcdh.ugent.be/ghentcdh_logo_blue_text_transparent_bg_landscape.svg" alt="Landscape" width="500">
