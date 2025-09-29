# Data Seeder for Performance Testing

The project includes a Python-based data seeder for generating realistic Belgian company and person data at scale.

## Quick Usage

### With Docker Compose (Recommended)

The seeder runs automatically when you start the services:

```bash
# Default: 1000 companies, 2000 persons
docker compose up -d

# Custom dataset
SEED_COMPANIES=10000 SEED_PERSONS=20000 docker compose up dataseeder

# Using Makefile shortcuts
make seed-small    # 100 companies, 200 persons
make seed-medium   # 10k companies, 20k persons
make seed-large    # 50k companies, 100k persons
make seed-xl       # 100k companies, 200k persons
```

### Standalone Usage

```bash
cd dataseeder

# Install uv (if not installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Run seeder
uv run seed --companies 10000 --persons 20000
```

## Configuration

Edit `.env` file to set default values:

```env
SEED_COMPANIES=1000
SEED_PERSONS=2000
SEED_BATCH_SIZE=1000
```

## Performance Benchmarks

| Scale | Companies | Persons | Time | DB Size |
|-------|-----------|---------|------|---------|
| Small | 1,000 | 2,000 | ~5s | ~5 MB |
| Medium | 10,000 | 20,000 | ~45s | ~50 MB |
| Large | 50,000 | 100,000 | ~4min | ~250 MB |
| XL | 100,000 | 200,000 | ~8min | ~500 MB |

See `dataseeder/README.md` for detailed documentation.
:
```bash
# Increase batch size
SEED_BATCH_SIZE=5000 docker compose up dataseeder

# Reduce relationships per company (in code)
# relationships_per_company parameter

# Run standalone (faster than Docker)
cd dataseeder && uv run seed --companies 10000 --persons 20000 --batch-size 5000
```

### Data Already Exists

**Problem**: Duplicate key errors

**Solution**:
```bash
# Clear existing data
docker compose exec db psql -U bellhisfirm_user -d bellhisfirm \
  -c "DELETE FROM company_person WHERE id > 100; \
      DELETE FROM persons WHERE id > 100; \
      DELETE FROM companies WHERE id > 100;"

# Or reset everything
make reset
```

## 🎉 Success Indicators

When seeding is complete, you should see:

```
======================================================================
✅ Data Seeding Complete!
======================================================================
📊 Final Statistics:
   Companies:          11,000
   Persons:            22,000
   Relationships:      33,245
   Total Records:      66,245

⏱️  Total Time: 47.32s
🚀 Throughput: 1400 records/second
======================================================================

🔍 Test your data:
   SPARQL Endpoint: http://localhost:8080
   Database: psql -h db -U bellhisfirm_user -d bellhisfirm
```

## 📖 Key Files

| File | Purpose |
|------|---------|
| `dataseeder/Dockerfile` | Container build instructions |
| `dataseeder/pyproject.toml` | Python project config (uv) |
| `dataseeder/src/dataseeder/main.py` | CLI entry point |
| `dataseeder/src/dataseeder/generator.py` | Data generation logic |
| `dataseeder/src/dataseeder/database.py` | Database operations |
| `dataseeder/src/dataseeder/config.py` | Belgian data constants |
| `compose.yml` | Main Docker Compose config |
| `compose.dev.yml` | Development overrides |
| `compose.prod.yml` | Production overrides |

## 🔄 Workflow

```
┌─────────────────────┐
│  Start Services     │
│  docker compose up  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  DB Health Check    │
│  (PostgreSQL ready) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Data Seeder Runs   │
│  Generate & Insert  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  VKG Starts         │
│  (After seeder OK)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Ready to Query     │
│  SPARQL + SQL       │
└─────────────────────┘
```

## 💡 Tips

### For Development
- Use `compose.dev.yml` with small datasets (100/200)
- Faster iteration cycles
- Less memory usage

### For Testing
- Use default config (1k/2k)
- Good balance of speed and realism
- Suitable for most testing

### For Benchmarking
- Use `compose.prod.yml` or larger
- Test with 10k-100k+ records
- Monitor performance metrics

### For Production
- Don't use the seeder in production!
- It's for testing/development only
- Real data should come from actual sources

## 🎓 Learning the Data

After seeding, explore the generated data:

```bash
# Connect to database
docker compose exec db psql -U bellhisfirm_user -d bellhisfirm

# Sample companies
SELECT company_name, city, business_sector 
FROM companies 
LIMIT 10;

# Sample persons
SELECT full_name, date_of_birth, nationality 
FROM persons 
LIMIT 10;

# Sample relationships
SELECT c.company_name, p.full_name, cp.role
FROM company_person cp
JOIN companies c ON cp.company_id = c.id
JOIN persons p ON cp.person_id = p.id
LIMIT 10;
```

## 🚀 Next Steps

1. **Verify Seeding**: Check logs and database
2. **Test SPARQL**: Run queries at http://localhost:8080
3. **Performance Test**: Try different dataset sizes
4. **Optimize**: Adjust batch sizes for your hardware
5. **Benchmark**: Measure query performance with large datasets

## 📞 Support

- Check `dataseeder/README.md` for detailed docs
- Review error messages in logs: `make logs-seeder`
- Ensure database is healthy: `docker compose ps`
- Verify environment variables: `docker compose config`

---

**The data seeder is now fully integrated and ready to use! 🎉**

Run `make seed-small` to get started with a quick test, or `docker compose up -d` for the default configuration.
