# JDBC Driver Required

⚠️ **Important**: You need to download the PostgreSQL JDBC driver manually.

## Quick Download

Run this command from the project root:

```bash
curl -L https://jdbc.postgresql.org/download/postgresql-42.7.8.jar -o vkg/jdbc/postgresql-42.7.1.jar
```

## Manual Download

1. Visit: https://jdbc.postgresql.org/download/
2. Download the latest `.jar` file
3. Place it in this directory (`vkg/jdbc/`)

## Why?

The Ontop VKG service needs this driver to connect to PostgreSQL.
Without it, the VKG service will fail to start.

## Verify

After downloading, you should see:
```
vkg/jdbc/postgresql-42.7.1.jar
```

The `.jar` file is excluded from git (see .gitignore).
