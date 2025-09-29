"""
Database operations for BellHisFirm Data Seeder
"""
import psycopg2
from psycopg2.extras import execute_batch
from typing import List, Dict, Any
from tqdm import tqdm

from .config import DatabaseConfig


class DatabaseSeeder:
    """Handle database connections and bulk inserts"""
    
    def __init__(self, config: DatabaseConfig):
        """
        Initialize database connection
        
        Args:
            config: Database configuration
        """
        self.config = config
        self.conn = None
        self.cursor = None
    
    def connect(self):
        """Establish database connection"""
        self.conn = psycopg2.connect(self.config.connection_string)
        self.cursor = self.conn.cursor()
    
    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
    
    def clear_data(self):
        """Clear all seeded data (keeps initial sample data)"""
        print("🗑️  Clearing existing seeded data...")
        
        # Delete in correct order (relationships first due to foreign keys)
        self.cursor.execute("DELETE FROM company_person WHERE id > 100")
        self.cursor.execute("DELETE FROM persons WHERE id > 100")
        self.cursor.execute("DELETE FROM companies WHERE id > 100")
        
        self.conn.commit()
        print("✅ Cleared existing data (kept sample data with ID <= 100)")
    
    def insert_companies_batch(self, companies: List[Dict[str, Any]], batch_size: int = 1000):
        """
        Insert companies in batches
        
        Args:
            companies: List of company dictionaries
            batch_size: Number of records per batch
        """
        query = """
            INSERT INTO companies (
                id, company_name, legal_form, street_address, city, postal_code, 
                country, date_of_founding, date_of_dissolution, business_sector,
                company_type, registered_capital
            ) VALUES (
                %(id)s, %(company_name)s, %(legal_form)s, %(street_address)s,
                %(city)s, %(postal_code)s, %(country)s, %(date_of_founding)s,
                %(date_of_dissolution)s, %(business_sector)s, %(company_type)s,
                %(registered_capital)s
            )
        """
        
        with tqdm(total=len(companies), desc="Inserting companies", unit="records") as pbar:
            for i in range(0, len(companies), batch_size):
                batch = companies[i:i + batch_size]
                execute_batch(self.cursor, query, batch, page_size=batch_size)
                self.conn.commit()
                pbar.update(len(batch))
    
    def insert_persons_batch(self, persons: List[Dict[str, Any]], batch_size: int = 1000):
        """
        Insert persons in batches
        
        Args:
            persons: List of person dictionaries
            batch_size: Number of records per batch
        """
        query = """
            INSERT INTO persons (
                id, first_name, last_name, full_name, date_of_birth,
                place_of_birth, date_of_death, nationality
            ) VALUES (
                %(id)s, %(first_name)s, %(last_name)s, %(full_name)s,
                %(date_of_birth)s, %(place_of_birth)s, %(date_of_death)s,
                %(nationality)s
            )
        """
        
        with tqdm(total=len(persons), desc="Inserting persons", unit="records") as pbar:
            for i in range(0, len(persons), batch_size):
                batch = persons[i:i + batch_size]
                execute_batch(self.cursor, query, batch, page_size=batch_size)
                self.conn.commit()
                pbar.update(len(batch))
    
    def insert_relationships_batch(self, relationships: List[Dict[str, Any]], batch_size: int = 1000):
        """
        Insert company-person relationships in batches
        
        Args:
            relationships: List of relationship dictionaries
            batch_size: Number of records per batch
        """
        query = """
            INSERT INTO company_person (
                id, company_id, person_id, role, start_date, end_date, share_percentage
            ) VALUES (
                %(id)s, %(company_id)s, %(person_id)s, %(role)s,
                %(start_date)s, %(end_date)s, %(share_percentage)s
            )
        """
        
        with tqdm(total=len(relationships), desc="Inserting relationships", unit="records") as pbar:
            for i in range(0, len(relationships), batch_size):
                batch = relationships[i:i + batch_size]
                execute_batch(self.cursor, query, batch, page_size=batch_size)
                self.conn.commit()
                pbar.update(len(batch))
    
    def get_statistics(self) -> Dict[str, int]:
        """
        Get database statistics
        
        Returns:
            Dictionary with record counts
        """
        stats = {}
        
        self.cursor.execute("SELECT COUNT(*) FROM companies")
        stats["companies"] = self.cursor.fetchone()[0]
        
        self.cursor.execute("SELECT COUNT(*) FROM persons")
        stats["persons"] = self.cursor.fetchone()[0]
        
        self.cursor.execute("SELECT COUNT(*) FROM company_person")
        stats["relationships"] = self.cursor.fetchone()[0]
        
        return stats
