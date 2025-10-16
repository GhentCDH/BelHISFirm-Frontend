# BellHisFirm Frontend

A Docker Compose application stack for BellHisFirm consisting of:
- **PostgreSQL Database** - Relational data storage
- **Ontop VKG** - Virtual Knowledge Graph SPARQL endpoint
- **Sampo UI** - Frontend user interface

## Architecture

```
┌─────────────────┐
│   Sampo UI      │  (Port 3000)
│  Frontend App   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Ontop VKG     │  (Port 8081)
│ SPARQL Endpoint │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │  (Port 5432)
│    Database     │
└─────────────────┘
```

## Prerequisites

- Docker Desktop installed (with Docker Compose)
- PostgreSQL JDBC driver (see setup instructions below)
- Basic knowledge of SPARQL and RDF (for VKG configuration)

## Project Structure

```
BellHisFirm-Frontend/
├── docker-compose.yml          # Main orchestration file
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
│
├── db/                         # PostgreSQL configuration
│   └── init/                   # Database initialization scripts
│       └── 01-init.sql         # Schema and seed data
│
├── vkg/                        # Ontop Virtual Knowledge Graph
│   ├── input/                  # Ontop configuration files
│   │   ├── ontology.ttl        # OWL ontology definition
│   │   ├── mappings.obda       # R2RML mappings
│   │   └── ontop.properties    # Database connection settings
│   └── jdbc/                   # JDBC drivers (not in git)
│       └── (add postgresql-*.jar here)
│
└── sampo/                      # Sampo UI application
    ├── Dockerfile              # Container build file
    └── (add your Sampo UI files here)
```

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
cp .env.example .env
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

- **Sampo UI**: http://localhost:3000
- **Ontop SPARQL Endpoint**: http://localhost:8080
- **PostgreSQL Database**: localhost:5432
  - Database: `belhisfirm`
  - User: `belhisfirm_user`
  - Password: `changeme_secure_password`

## Configuration

### Database (PostgreSQL)

- **Init Scripts**: Place SQL scripts in `db/init/` - they run automatically on first startup
- **Data Persistence**: Data is stored in a Docker volume named `postgres_data`
- **Connection**: Services connect via the internal network using hostname `db`

### Virtual Knowledge Graph (Ontop)

The VKG maps relational database data to RDF/OWL knowledge graphs.

**Configuration Files** (in `vkg/input/`):

1. **ontology.ttl** - Define your OWL ontology (classes, properties, relationships)
2. **mappings.obda** - R2RML mappings from SQL to RDF
3. **ontop.properties** - Database connection and Ontop settings

**SPARQL Endpoint**:
- Access the YASGUI query interface at http://localhost:8080
- Query via POST to http://localhost:8080/sparql
- Ontop automatically translates SPARQL queries to SQL

**Useful Features**:
- Lazy initialization: VKG starts after database is ready
- CORS enabled: Allow cross-origin requests
- Health checks: Automatic monitoring and restarts

### Sampo UI

The frontend application that consumes the SPARQL endpoint.

**Setup**:
1. Add your Sampo UI application files to the `sampo/` directory
2. Update the `sampo/Dockerfile` with proper build instructions
3. Configure the VKG endpoint via environment variable: `VKG_ENDPOINT`

**Development**:
- For local development, you can mount your source code with volumes
- The service connects to the VKG at `http://vkg:8080/sparql` internally

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
docker-compose restart vkg
```

### Rebuild After Changes
```bash
docker-compose up -d --build
```

### View Database
Connect with any PostgreSQL client:
```bash
psql -h localhost -p 5432 -U belhisfirm_user -d belhisfirm
```

### Test SPARQL Queries
Example query to test the VKG:
```sparql
SELECT ?s ?p ?o
WHERE {
  ?s ?p ?o
}
LIMIT 10
```

## Development Workflow

1. **Design Database Schema**: Create tables in `db/init/01-init.sql`
2. **Define Ontology**: Model your domain in `vkg/input/ontology.ttl`
3. **Create Mappings**: Map SQL to RDF in `vkg/input/mappings.obda`
4. **Test SPARQL**: Query your VKG at http://localhost:8080
5. **Build UI**: Develop Sampo UI to consume the SPARQL endpoint

## Troubleshooting

### Ontop Service Won't Start
- Ensure PostgreSQL JDBC driver is in `vkg/jdbc/`
- Check database is healthy: `docker-compose ps`
- Verify configuration files have no syntax errors
- Check logs: `docker-compose logs vkg`

### Database Connection Failed
- Wait for database initialization (check with `docker-compose ps`)
- Verify credentials in `ontop.properties` match `docker-compose.yml`
- Ensure the `db` service is running

### Port Already in Use
If ports 3000, 5432, or 8080 are in use, modify them in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change host port (left side)
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

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]

## Support

For issues or questions:
- Create an issue in the project repository
- Check the Ontop documentation at https://ontop-vkg.org/
- Consult the Docker Compose documentation

---

**Note**: This is a development setup. For production deployment, consider:
- Using Docker secrets for sensitive data
- Implementing proper authentication and authorization
- Setting up SSL/TLS certificates
- Configuring backup strategies for the database
- Implementing monitoring and logging solutions


## 🌱 Data Seeding for Performance Testing

The project includes an integrated Python-based data seeder for generating realistic Belgian company and person data at scale.

### Quick Start with Data Seeding

```bash
# Start services with default dataset (1k companies, 2k persons)
docker compose up -d

# View seeder logs
docker compose logs -f dataseeder

# Custom dataset sizes
SEED_COMPANIES=10000 SEED_PERSONS=20000 docker compose up dataseeder
```

### Makefile Shortcuts

```bash
make seed-small    # 100 companies, 200 persons (~1s)
make seed-medium   # 10k companies, 20k persons (~45s)
make seed-large    # 50k companies, 100k persons (~4min)
make seed-xl       # 100k companies, 200k persons (~8min)
```

### Generated Data Includes

- ✅ Realistic Belgian company names and addresses
- ✅ Belgian person names (Dutch/French locales)
- ✅ Company-person relationships (directors, founders, shareholders)
- ✅ Temporal data (founding dates, start/end dates)
- ✅ Business sectors, legal forms, registered capital

**See [DATASEEDER.md](DATASEEDER.md) for complete documentation.**

