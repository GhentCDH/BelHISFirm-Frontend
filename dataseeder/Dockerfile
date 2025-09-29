# BellHisFirm Data Seeder Dockerfile
FROM python:3.11-slim

# Install uv for fast Python package management
RUN pip install --no-cache-dir uv

# Set working directory
WORKDIR /app

# Copy project files
COPY pyproject.toml ./
COPY README.md ./
COPY src ./src

# Install dependencies using uv
RUN uv pip install --system -e .

# Set environment variables with defaults
ENV DB_HOST=db \
    DB_PORT=5432 \
    DB_NAME=bellhisfirm \
    DB_USER=bellhisfirm_user \
    DB_PASSWORD=changeme_secure_password \
    SEED_COMPANIES=1000 \
    SEED_PERSONS=2000 \
    SEED_BATCH_SIZE=1000

# Entry point script to wait for database and run seeder
CMD ["sh", "-c", "echo 'Waiting for database to be ready...' && sleep 3 && echo 'Started seeding' seed --companies ${SEED_COMPANIES} --persons ${SEED_PERSONS} --batch-size ${SEED_BATCH_SIZE} --db-host ${DB_HOST}"]
