# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BelHISFirm Frontend is a Docker Compose application stack for exploring Belgian historical firm data through a Virtual Knowledge Graph. It combines:
- **PostgreSQL Database** - Relational data storage
- **Ontop VKG** - Virtual Knowledge Graph that translates SPARQL queries to SQL
- **Varnish Cache** - Caching layer for SPARQL queries (development only)
- **Sampo UI** - React-based semantic web interface (forked from GhentCDH/sampo-ui)

## Architecture

```
Sampo UI Client (React) → Sampo UI Server (Express)
    ↓
Varnish Cache (dev only, port 8082)
    ↓
Ontop VKG SPARQL Endpoint (port 8080/8081)
    ↓
PostgreSQL Database
```

### Key Architectural Concepts

**Ontop Virtual Knowledge Graph (VKG)**: Ontop doesn't materialize RDF triples. Instead, it translates SPARQL queries into SQL queries at runtime using R2RML mappings. This means:
- Changes to `vkg/input/mappings.ttl` require restarting the `vkg-scob` or `vkg` service
- The ontology (`ontology.ttl`) defines the RDF/OWL schema
- Database changes are immediately reflected in SPARQL queries (no ETL needed)

**Network Modes**: Development uses `network_mode: host` for Ontop and Sampo services to simplify VPN access to external databases. Production uses Docker bridge networks. Varnish (dev only) uses bridge network and connects via `host.docker.internal`.

**Configuration-Driven UI**: Sampo UI is highly configurable through JSON files in `sampo/configs/`. Most customizations should be done via config changes, not code modifications.

## Development Commands

### Prerequisites
Download JDBC driver before first run:
```bash
curl -L https://jdbc.postgresql.org/download/postgresql-42.7.8.jar -o vkg/jdbc/postgresql-42.7.1.jar
```

### Running the Application

**Development (connects to external SCOB database via VPN):**
```bash
docker compose up -d
```

**Production (uses local PostgreSQL):**
```bash
docker compose -f compose-prod.yml up -d
```

**View logs:**
```bash
docker compose logs -f [service-name]  # vkg-scob, sampo-client, sampo-server, varnish
```

**Restart after config changes:**
```bash
docker compose restart [service-name]
```

### Working with Sampo UI

The Sampo UI is split into client (React) and server (Express):

**Client development (inside container):**
```bash
# Client runs on webpack-dev-server at port 8081
docker compose up sampo-client
```

**Server development (inside container):**
```bash
# Server runs on port 3001
docker compose up sampo-server
```

**Linting (follows StandardJS):**
Sampo UI uses StandardJS style. Install an editor plugin rather than running linters manually. No custom ESLint configs should be added.

### Ontop VKG Development

**Access YASGUI query interface:**
- Development: http://localhost:8080
- Production: http://localhost:8081

**Query via curl:**
```bash
curl -X POST http://localhost:8080/sparql \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Accept: application/sparql-results+json" \
  --data-urlencode "query=SELECT * WHERE { ?s ?p ?o } LIMIT 10"
```

**After modifying mappings or ontology:**
```bash
docker compose restart vkg-scob
```

### Varnish Cache (Development Only)

Varnish caches SPARQL query responses on port 8082.

**View cache statistics:**
```bash
docker exec belhisfirm-varnish-dev varnishstat
```

**Check cache hit rate:**
```bash
docker exec belhisfirm-varnish-dev varnishstat -1 | grep cache_hit
```

**Purge cache:**
```bash
curl -X PURGE http://localhost:8082/sparql
```

**View logs:**
```bash
docker logs belhisfirm-varnish-dev
docker exec belhisfirm-varnish-dev varnishlog
```

## Configuration Structure

### Environment Variables

Copy `.env.example` to `.env` and customize. Key variables:
- `DB_URL_SCOB`, `DB_USER_SCOB`, `DB_PASSWORD_SCOB` - External SCOB database (development)
- `POSTGRES_PASSWORD` - Local PostgreSQL password (production)
- `API_URL` - Sampo server API endpoint (defaults to `http://localhost:3001/api/v1`)

### Ontop Configuration (`vkg/input/`)

1. **ontop.properties** - Database connection and cache settings
   - Sets `ontop.http.cacheControl=max-age=3600, stale-while-revalidate=360, stale-if-error=3600`
   - Query timeout: 30 seconds

2. **ontology.ttl** - OWL ontology defining classes and properties
   - Uses `bhf:` namespace for BelHISFirm entities
   - Defines `Corporation`, `Stock`, `Address`, `LegalForm`, etc.

3. **mappings.ttl** (dev) / **mappings.obda** (prod) - R2RML mappings
   - Maps SQL tables/views to RDF triples
   - Each mapping has a unique ID and triple pattern

### Sampo UI Configuration (`sampo/configs/`)

**Key files to modify for UI changes:**

1. **portalConfig.json** - Portal-wide settings
   - `yasguiConfig.endpoint` - SPARQL endpoint URL
   - Theme colors, map settings, internationalization

2. **sampo/search_perspectives/*.json** - Search/browse interfaces
   - `corporations.json` - Corporation faceted search
   - `securities.json` - Securities/stocks faceted search
   - Each defines: endpoint URL, facets, properties, result displays

3. **sampo/only_instance_pages/*.json** - Entity detail pages
   - `corporationNames.json`, `legalForms.json`, `addresses.json`
   - Define how individual entities are displayed

4. **sampo/sparql_queries/*.js** - SPARQL query templates
   - `SparqlQueriesScob.js` - Main queries for corporations
   - `ScobStocks.js` - Queries for securities

**When changing SPARQL endpoint URLs:**
All config files reference the endpoint. In development, these should point to:
- Direct to Ontop: `http://localhost:8080/sparql`
- Through Varnish: `http://localhost:8082/sparql` (recommended)

### Varnish Configuration (`varnish/`)

1. **default.vcl** - Varnish caching logic
   - Backend: `host.docker.internal:8080` (accesses Ontop on host network)
   - Caches POST requests to `/sparql` (SPARQL uses POST)
   - TTL: 1 hour, grace period: 6 hours
   - Adds `X-Cache: HIT/MISS` headers for debugging

## Common Workflows

### Adding a New Search Perspective

1. Create `sampo/configs/sampo/search_perspectives/new_perspective.json`
2. Define endpoint, facets, properties, and result classes
3. Create corresponding SPARQL queries in `sampo/configs/sampo/sparql_queries/`
4. Register perspective in `portalConfig.json` navigation
5. Restart sampo-server: `docker compose restart sampo-server`

### Modifying the Ontology

1. Edit `vkg/input/ontology.ttl` to add/modify classes or properties
2. Update `vkg/input/mappings.ttl` with new R2RML mappings
3. Restart Ontop: `docker compose restart vkg-scob`
4. Test queries via YASGUI at http://localhost:8080
5. If using Varnish, purge cache: `curl -X PURGE http://localhost:8082/sparql`

### Changing Port Configuration

**Client port (currently 8081):**
Edit `sampo/client/webpack.client.dev.js` → `devServer.port`

**Varnish port (currently 8082):**
1. Edit `compose.yml` → `varnish.ports`
2. Update all SPARQL endpoint URLs in `sampo/configs/` to match new port

**Ontop port (8080 in dev, 8081 in prod):**
Port conflicts exist in development due to host networking. Changing requires coordinating with client port.

### Debugging SPARQL Query Performance

1. Check Ontop logs: `docker compose logs vkg-scob`
2. Enable Ontop debug mode: Set `ONTOP_DEV_MODE=true` in compose.yml
3. Check Varnish cache effectiveness:
   ```bash
   docker exec belhisfirm-varnish-dev varnishstat -1 | grep -E "cache_hit|cache_miss"
   ```
4. Examine generated SQL: Look for `Executed query:` in Ontop logs

## Port Reference

| Service | Development | Production |
|---------|-------------|------------|
| Sampo Client | 8081 | 8080 |
| Sampo Server | 3001 | 3001 |
| Ontop VKG | 8080 | 8081 |
| Varnish Cache | 8082 | N/A |
| PostgreSQL | N/A (external) | 5432 |

## Important Files

**Critical files that affect multiple components:**
- `compose.yml` / `compose-prod.yml` - Service orchestration
- `vkg/input/mappings.ttl` - Core data transformation logic
- `vkg/input/ontology.ttl` - RDF schema definition
- `sampo/configs/portalConfig.json` - Global UI settings
- `sampo/configs/sampo/search_perspectives/*.json` - Search interface definitions

**Do not modify:**
- `sampo/client/node_modules/`, `sampo/server/node_modules/` (managed by npm)
- `vkg/jdbc/*.jar` (JDBC drivers, download separately)
- Files under `sampo/client/src/library_configs/` (upstream Sampo UI library)

## Troubleshooting

**Varnish exits with "Undefined acl localhost":**
Ensure `varnish/default.vcl` defines the ACL before using it in `vcl_recv`.

**Ontop fails to start:**
- Check JDBC driver exists in `vkg/jdbc/`
- Verify database connection in environment variables
- Check `ontop.properties` syntax

**Sampo UI shows no data:**
- Verify endpoint URLs in `sampo/configs/` point to correct port
- Check Sampo server logs: `docker compose logs sampo-server`
- Test SPARQL endpoint directly with curl

**Port conflicts in development:**
Development uses host networking. Ensure no other services use ports 8080, 8081, 3001, 8082.

**Changes to configs not reflected:**
- Sampo configs: Restart `sampo-server`
- VKG mappings: Restart `vkg-scob`
- Varnish VCL: Restart `varnish`
- Webpack configs: Restart `sampo-client`
