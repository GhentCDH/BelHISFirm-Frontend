"""
Configuration for BellHisFirm Data Seeder
"""
import os
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


@dataclass
class DatabaseConfig:
    """Database connection configuration"""
    host: str = os.getenv("DB_HOST", "localhost")
    port: int = int(os.getenv("DB_PORT", "5432"))
    database: str = os.getenv("DB_NAME", "belhisfirm")
    user: str = os.getenv("DB_USER", "belhisfirm_user")
    password: str = os.getenv("DB_PASSWORD", "changeme_secure_password")

    @property
    def connection_string(self) -> str:
        """Get PostgreSQL connection string"""
        return f"host={self.host} port={self.port} dbname={self.database} user={self.user} password={self.password}"


# Belgian cities with postal codes
BELGIAN_CITIES = [
    ("Brussels", "1000"),
    ("Antwerp", "2000"),
    ("Ghent", "9000"),
    ("Charleroi", "6000"),
    ("Liège", "4000"),
    ("Bruges", "8000"),
    ("Namur", "5000"),
    ("Leuven", "3000"),
    ("Mons", "7000"),
    ("Mechelen", "2800"),
    ("Aalst", "9300"),
    ("Hasselt", "3500"),
    ("Kortrijk", "8500"),
    ("Ostend", "8400"),
    ("Tournai", "7500"),
    ("Genk", "3600"),
    ("Roeselare", "8800"),
    ("Mouscron", "7700"),
    ("Verviers", "4800"),
    ("Dendermonde", "9200"),
]

# Belgian legal forms
LEGAL_FORMS = [
    "SA", "NV", "BVBA", "SPRL", "SRL", "BV", 
    "CVBA", "SCRL", "VZW", "ASBL", "Stichting",
]

# Business sectors
BUSINESS_SECTORS = [
    "Banking & Finance",
    "Manufacturing",
    "Technology & IT",
    "Retail & Commerce",
    "Healthcare & Pharmaceuticals",
    "Transportation & Logistics",
    "Construction & Real Estate",
    "Energy & Utilities",
    "Food & Beverage",
    "Telecommunications",
    "Insurance",
    "Consulting Services",
    "Education",
    "Media & Entertainment",
    "Chemicals",
]

# Company type suffixes
COMPANY_SUFFIXES = [
    "Group", "Holding", "Industries", "Enterprises", 
    "Solutions", "Systems", "Partners", "Associates",
    "International", "Services", "Technologies", "Company",
]

# Role types for company-person relationships
ROLE_TYPES = ["Director", "Founder", "Shareholder", "Manager"]
