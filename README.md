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
│   Ontop VKG     │
│ SPARQL Endpoint │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│    Database     │
└─────────────────┘
```

## Prerequisites
### Install jdbc driver(s) for database

Run this command from the project root:

Postgres:
```bash
curl -L https://jdbc.postgresql.org/download/postgresql-42.7.8.jar -o vkg/jdbc/postgresql-42.7.1.jar
```

Oracle:
```shell
curl -L -o vkg/jdbc/ojdbc8-21.11.0.0.jar https://repo1.maven.org/maven2/com/oracle/database/jdbc/ojdbc8/21.11.0.0/ojdbc8-21.11.0.0.jar
```

You should then see the jar file(s) in `vkg/jdbc`

## Quick Start

### 1. Initial Setup

Clone or navigate to the project directory:
```bash
cd ~/Projects/BellHisFirm-Frontend
```

### 2. Download PostgreSQL JDBC Driver

The Ontop VKG service requires a PostgreSQL JDBC driver. Download it and place it in the `vkg/jdbc/` directory:

```bash
# Download the PostgreSQL JDBC driver
curl -L https://jdbc.postgresql.org/download/postgresql-42.7.1.jar \
  -o vkg/jdbc/postgresql-42.7.1.jar
```

Or download manually from: https://jdbc.postgresql.org/download/

### 3. Configure Environment (Optional)

Copy the example environment file and customize if needed:
```bash
cp example.env .env
# Edit .env with your preferred settings
```

**Important**: Change the default password in production!

### 4. Start the Application

Launch all services with Docker Compose:

```bash
docker-compose up -d
```

Check the status of services:
```bash
docker-compose ps
```

View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f vkg
```

### 5. Access the Services

Once all services are running:

- **Sampo UI**: http://localhost:8080
- **Ontop SPARQL Endpoint**: http://localhost:8082
- **PostgreSQL Database**: localhost:5432
  - Database name and login to be set in `.env` and `compose.yml`

## Configuration

### Database (PostgreSQL)

- **Init Scripts**: Place SQL scripts in `scob_db_dump/init/` - they run automatically on first startup
- **Data Persistence**: Data is stored in a Docker volume named `postgres_data`
- **Connection**: Services connect via the internal network using hostname `scob-db`

### Virtual Knowledge Graph (Ontop)

The VKG maps relational database data to RDF/OWL knowledge graphs.

**Configuration Files** (in `vkg/input/`):

1. **ontology.ttl** - Define your OWL ontology (classes, properties, relationships)
2. **mappings.ttl** - R2RML mappings from SQL to RDF
3. **ontop.properties** - Database connection and Ontop settings

**SPARQL Endpoint**:
- Access the YASGUI query interface at http://localhost:8082
- Query via POST to http://localhost:8082/sparql
- Ontop automatically translates SPARQL queries to SQL

### Sampo UI

The frontend application that consumes the SPARQL endpoint.
Uses sampo-ui from: https://github.com/GhentCDH/sampo-ui

Configs set in `sampo/configs`

## Common Tasks

### Stop the Application
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes all data)
```bash
docker-compose down -v
```

### Restart a Specific Service
```bash
docker-compose restart scob-vkg
```

### Rebuild After Changes
```bash
docker-compose up -d --build
```

## Resources

### Ontop Documentation

- Official Website: https://ontop-vkg.org/
- Docker Hub: https://hub.docker.com/r/ontop/ontop
- Tutorials: https://ontop-vkg.org/tutorial/
- R2RML Specification: https://www.w3.org/TR/r2rml/

### PostgreSQL
- Official Documentation: https://www.postgresql.org/docs/
- JDBC Driver Downloads: https://jdbc.postgresql.org/download/

### SPARQL
- SPARQL 1.1 Query Language: https://www.w3.org/TR/sparql11-query/
- YASGUI Query Interface: https://yasgui.triply.cc/

## Support

For issues or questions:
- Create an issue in the project repository
- Check the Ontop documentation at https://ontop-vkg.org/
- Consult the Docker Compose documentation

---
