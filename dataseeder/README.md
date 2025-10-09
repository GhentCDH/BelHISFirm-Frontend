# BellHisFirm Data Seeder

A Python-based data seeding tool for generating realistic Belgian company and person data to test the performance of the BellHisFirm Virtual Knowledge Graph system.

## Features

- ✅ Generate **realistic Belgian company names** and data
- ✅ Generate **realistic Belgian person names** (first, last, full names)
- ✅ Create **relationships** between companies and persons (directors, founders, shareholders)
- ✅ **Configurable scale** - from hundreds to hundreds of thousands of records
- ✅ **Batch processing** for efficient database insertion
- ✅ **Progress tracking** with progress bars
- ✅ **Belgian-specific** data (Belgian cities, addresses, legal forms)
- ✅ Uses **Faker** library for realistic data generation
- ✅ Managed with **uv** (fast Python package manager)

## Prerequisites

- Python 3.11 or higher
- [uv](https://github.com/astral-sh/uv) package manager
- PostgreSQL database running (via Docker Compose)

## Installation

### Install uv (if not already installed)

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Or with Homebrew:**
```bash
brew install uv
```

### Setup Project

```bash
cd dataseeder

# Install dependencies
uv sync
```

This will:
- Create a virtual environment
- Install all dependencies from `pyproject.toml`
- Set up the project

## Usage

### Basic Usage

```bash
# Generate 1000 companies and 2000 persons (default)
uv run seed

# Specify custom numbers
uv run seed --companies 10000 --persons 20000

# Performance testing with large datasets
uv run seed --companies 50000 --persons 100000

# Benchmark mode
uv run seed --companies 100000 --persons 200000 --batch-size 5000
```

### Command-Line Options

| Option | Default | Description |
|--------|---------|-------------|
| `--companies` | 1000 | Number of companies to generate |
| `--persons` | 2000 | Number of persons to generate |
| `--batch-size` | 1000 | Batch size for database inserts |
| `--relationships-per-company` | 3 | Avg relationships per company |
| `--db-host` | `db` | Database host |
| `--db-port` | 5432 | Database port |
| `--db-name` | `belhisfirm` | Database name |
| `--db-user` | `belhisfirm_user` | Database user |
| `--db-password` | Set via env | Database password |
| `--clear-existing` | False | Clear existing data before seeding |

### Environment Variables

Create a `.env` file in the `dataseeder` directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=belhisfirm
DB_USER=belhisfirm_user
DB_PASSWORD=changeme_secure_password
```

## Docker Integration

The data seeder runs automatically after the database initializes when using Docker Compose.

### Run with Docker Compose

```bash
# From project root
docker-compose up -d

# The seeder will run automatically with default parameters
# Check logs:
docker-compose logs dataseeder
```

### Configure via Environment Variables

Edit `docker-compose.yml` or create a `.env` file:

```yaml
services:
  dataseeder:
    environment:
      - SEED_COMPANIES=10000
      - SEED_PERSONS=20000
      - SEED_BATCH_SIZE=2000
```

## Performance Benchmarks

Typical generation times on modern hardware:

| Scale | Companies | Persons | Relationships | Time | DB Size |
|-------|-----------|---------|---------------|------|---------|
| Small | 1,000 | 2,000 | ~3,000 | ~5s | ~5 MB |
| Medium | 10,000 | 20,000 | ~30,000 | ~45s | ~50 MB |
| Large | 50,000 | 100,000 | ~150,000 | ~4min | ~250 MB |
| XL | 100,000 | 200,000 | ~300,000 | ~8min | ~500 MB |

## Generated Data

### Companies
- **Name**: Realistic Belgian company names (e.g., "Belgische Constructie NV")
- **Legal Forms**: SA, NV, BVBA, SPRL, etc.
- **Addresses**: Real Belgian cities and postal codes
- **Sectors**: 15+ different business sectors
- **Founding Dates**: Between 1800-2020

### Persons
- **Names**: Belgian first and last names
- **Birth Dates**: Between 1940-2000
- **Nationalities**: Primarily Belgian, with some variety
- **Birth Places**: Real Belgian cities

### Relationships
- **Directors**: 1-5 per company
- **Founders**: 1-2 per company  
- **Shareholders**: 0-3 per company
- **Temporal Data**: Start dates between founding and present

## Data Quality

The seeder ensures:
- ✅ **Referential integrity** - all foreign keys valid
- ✅ **Realistic dates** - founding before relationships start
- ✅ **Belgian context** - appropriate cities, postal codes, legal forms
- ✅ **Variety** - diverse business sectors and roles
- ✅ **Uniqueness** - no duplicate primary keys

## Development

### Project Structure

```
dataseeder/
├── src/
│   └── dataseeder/
│       ├── __init__.py
│       ├── main.py           # CLI entry point
│       ├── generator.py      # Data generation logic
│       ├── database.py       # Database operations
│       └── config.py         # Configuration
├── pyproject.toml            # Project configuration
├── README.md                 # This file
└── .env                      # Environment variables (create this)
```

### Running Tests

```bash
uv run pytest
```

### Adding Dependencies

```bash
uv add <package-name>
```

## Troubleshooting

### Connection Refused

If you see "Connection refused":
- Ensure PostgreSQL is running: `docker-compose ps db`
- Check if using correct host (`localhost` outside Docker, `db` inside)
- Wait for database to fully initialize (~10 seconds)

### Out of Memory

For very large datasets (>1M records):
- Increase batch size: `--batch-size 10000`
- Reduce relationships: `--relationships-per-company 2`
- Ensure adequate system RAM

### Slow Performance

- Use larger batch sizes for bulk inserts
- Ensure database has adequate resources
- Consider running seeder directly in Docker network

## Examples

### Small Test Dataset
```bash
uv run seed --companies 100 --persons 200
```

### Medium Production-Like Dataset
```bash
uv run seed --companies 5000 --persons 10000 --batch-size 2000
```

### Large Performance Benchmark
```bash
uv run seed --companies 100000 --persons 200000 --batch-size 5000 --clear-existing
```

### Clear and Reseed
```bash
uv run seed --companies 1000 --persons 2000 --clear-existing
```

## Integration with Ontop

After seeding, the data is immediately available via:
- **SPARQL Endpoint**: http://localhost:8080
- **Direct SQL**: psql -h localhost -U belhisfirm_user -d belhisfirm

Test with SPARQL:
```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX bhf: <http://belhisfirm.be/ontology#>

SELECT (COUNT(?company) as ?count)
WHERE {
  ?company a bhf:Company .
}
```

## License

Part of the BellHisFirm project.

## Support

For issues or questions, check the main project documentation in the parent directory.
