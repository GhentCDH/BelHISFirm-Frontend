# Quick Reference Guide

## Essential Commands

### Start Everything
```bash
./setup.sh
# OR
docker-compose up -d
```

### Stop Everything
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f db
docker-compose logs -f vkg
docker-compose logs -f sampo
```

### Restart a Service
```bash
docker-compose restart vkg
```

### Check Status
```bash
docker-compose ps
```

## Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Sampo UI | http://localhost:3000 | Frontend interface |
| Ontop VKG | http://localhost:8080 | SPARQL endpoint & YASGUI |
| PostgreSQL | localhost:5432 | Database |

## Database Connection

```bash
# Using psql
psql -h localhost -p 5432 -U bellhisfirm_user -d bellhisfirm

# Connection string
postgresql://bellhisfirm_user:changeme_secure_password@localhost:5432/bellhisfirm
```

## Common Issues

### "Port already in use"
Change ports in docker-compose.yml:
```yaml
ports:
  - "5433:5432"  # Use different host port
```

### "VKG won't start"
1. Check JDBC driver exists: `ls vkg/jdbc/*.jar`
2. Download if missing: `./setup.sh`
3. Check logs: `docker-compose logs vkg`

### "Database not ready"
Wait 10-15 seconds for initialization, then check:
```bash
docker-compose ps db
```

## Development Workflow

1. **Modify database**: Edit `db/init/01-init.sql`
2. **Rebuild**: `docker-compose down -v && docker-compose up -d`
3. **Update mappings**: Edit `vkg/input/mappings.obda`
4. **Restart VKG**: `docker-compose restart vkg`
5. **Test queries**: Visit http://localhost:8080

## Useful SPARQL Queries

### List all triples
```sparql
SELECT ?s ?p ?o
WHERE {
  ?s ?p ?o
}
LIMIT 100
```

### Count entities
```sparql
SELECT (COUNT(?s) as ?count)
WHERE {
  ?s a ?type
}
```

### Find specific entity
```sparql
PREFIX ex: <http://example.org/voc#>
SELECT ?entity ?name
WHERE {
  ?entity a ex:Entity ;
          ex:hasName ?name .
}
```

## Production Checklist

- [ ] Change all default passwords
- [ ] Enable SSL/TLS
- [ ] Set up database backups
- [ ] Configure authentication
- [ ] Review CORS settings
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Test disaster recovery

## Support

- Ontop Docs: https://ontop-vkg.org/
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Docker Compose Docs: https://docs.docker.com/compose/
