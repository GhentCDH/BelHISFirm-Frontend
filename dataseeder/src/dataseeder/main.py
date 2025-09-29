"""
Main CLI entry point for BellHisFirm Data Seeder
"""
import sys
import time
import click
from typing import Optional

from .config import DatabaseConfig
from .generator import BelgianDataGenerator
from .database import DatabaseSeeder


@click.command()
@click.option('--companies', default=1000, help='Number of companies to generate')
@click.option('--persons', default=2000, help='Number of persons to generate')
@click.option('--batch-size', default=1000, help='Batch size for database inserts')
@click.option('--relationships-per-company', default=3, help='Average relationships per company')
@click.option('--clear-existing', is_flag=True, help='Clear existing seeded data before inserting')
@click.option('--db-host', default=None, help='Database host (overrides env)')
@click.option('--db-port', default=None, type=int, help='Database port (overrides env)')
@click.option('--db-name', default=None, help='Database name (overrides env)')
@click.option('--db-user', default=None, help='Database user (overrides env)')
@click.option('--db-password', default=None, help='Database password (overrides env)')
@click.option('--seed', default=None, type=int, help='Random seed for reproducibility')
def cli(
    companies: int,
    persons: int,
    batch_size: int,
    relationships_per_company: int,
    clear_existing: bool,
    db_host: Optional[str],
    db_port: Optional[int],
    db_name: Optional[str],
    db_user: Optional[str],
    db_password: Optional[str],
    seed: Optional[int],
):
    """
    BellHisFirm Data Seeder
    
    Generate realistic Belgian company and person data for performance testing.
    """
    
    print("=" * 70)
    print("🌱 BellHisFirm Data Seeder")
    print("=" * 70)
    print(f"📊 Target: {companies:,} companies, {persons:,} persons")
    print(f"🔗 Estimated relationships: ~{companies * relationships_per_company:,}")
    print(f"📦 Batch size: {batch_size:,}")
    if seed:
        print(f"🎲 Random seed: {seed}")
    print("=" * 70)
    print()
    
    start_time = time.time()
    
    try:
        # Setup database configuration
        config = DatabaseConfig()
        if db_host:
            config.host = db_host
        if db_port:
            config.port = db_port
        if db_name:
            config.database = db_name
        if db_user:
            config.user = db_user
        if db_password:
            config.password = db_password
        
        # Connect to database
        print("📡 Connecting to database...")
        db = DatabaseSeeder(config)
        db.connect()
        print(f"✅ Connected to {config.host}:{config.port}/{config.database}")
        print()
        
        # Clear existing data if requested
        if clear_existing:
            db.clear_data()
            print()
        
        # Initialize data generator
        print("🔧 Initializing data generator...")
        generator = BelgianDataGenerator(seed=seed)
        print("✅ Generator ready")
        print()
        
        # Generate companies
        print(f"🏢 Generating {companies:,} companies...")
        gen_start = time.time()
        company_data = []
        company_ids = []
        
        # Start IDs after sample data (which uses 1-10)
        start_id = 1001
        
        for i in range(companies):
            company_id = start_id + i
            company_data.append(generator.generate_company(company_id))
            company_ids.append(company_id)
        
        gen_time = time.time() - gen_start
        print(f"✅ Generated {len(company_data):,} companies in {gen_time:.2f}s")
        print()
        
        # Generate persons
        print(f"👥 Generating {persons:,} persons...")
        gen_start = time.time()
        person_data = []
        person_ids = []
        
        # Start IDs after sample data (which uses 1-15)
        start_id = 1001
        
        for i in range(persons):
            person_id = start_id + i
            person_data.append(generator.generate_person(person_id))
            person_ids.append(person_id)
        
        gen_time = time.time() - gen_start
        print(f"✅ Generated {len(person_data):,} persons in {gen_time:.2f}s")
        print()
        
        # Generate relationships
        print(f"🔗 Generating relationships...")
        gen_start = time.time()
        relationship_data = generator.generate_relationships(
            company_ids,
            person_ids,
            relationships_per_company
        )
        gen_time = time.time() - gen_start
        print(f"✅ Generated {len(relationship_data):,} relationships in {gen_time:.2f}s")
        print()
        
        # Insert data into database
        print("💾 Inserting data into database...")
        print()
        
        db.insert_companies_batch(company_data, batch_size)
        db.insert_persons_batch(person_data, batch_size)
        db.insert_relationships_batch(relationship_data, batch_size)
        
        print()
        
        # Get final statistics
        stats = db.get_statistics()
        
        # Calculate total time
        total_time = time.time() - start_time
        
        # Print summary
        print("=" * 70)
        print("✅ Data Seeding Complete!")
        print("=" * 70)
        print(f"📊 Final Statistics:")
        print(f"   Companies:      {stats['companies']:>10,}")
        print(f"   Persons:        {stats['persons']:>10,}")
        print(f"   Relationships:  {stats['relationships']:>10,}")
        print(f"   Total Records:  {sum(stats.values()):>10,}")
        print()
        print(f"⏱️  Total Time: {total_time:.2f}s")
        print(f"🚀 Throughput: {sum(stats.values()) / total_time:.0f} records/second")
        print("=" * 70)
        print()
        print("🔍 Test your data:")
        print(f"   SPARQL Endpoint: http://localhost:8080")
        print(f"   Database: psql -h {config.host} -U {config.user} -d {config.database}")
        print()
        
        # Close database connection
        db.disconnect()
        
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    cli()
