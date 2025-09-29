"""
Data Generator for Belgian Companies and Persons
Uses Faker to generate realistic data
"""
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from faker import Faker

from .config import (
    BELGIAN_CITIES, LEGAL_FORMS, BUSINESS_SECTORS,
    COMPANY_SUFFIXES, ROLE_TYPES
)


class BelgianDataGenerator:
    """Generate realistic Belgian company and person data"""
    
    def __init__(self, seed: int = None):
        """
        Initialize generator with optional seed for reproducibility
        
        Args:
            seed: Random seed for reproducible data generation
        """
        self.fake = Faker(['nl_BE', 'fr_BE'])  # Belgian locales
        if seed:
            Faker.seed(seed)
            random.seed(seed)
    
    def generate_company(self, company_id: int) -> Dict[str, Any]:
        """
        Generate a single company record
        
        Args:
            company_id: Unique identifier for the company
            
        Returns:
            Dictionary with company data
        """
        city, postal_code = random.choice(BELGIAN_CITIES)
        
        # Generate company name
        company_name = self._generate_company_name()
        
        # Generate founding date between 1800 and 2020
        founding_date = self.fake.date_between(
            start_date=datetime(1800, 1, 1),
            end_date=datetime(2020, 12, 31)
        )
        
        # 10% chance of dissolution
        dissolution_date = None
        if random.random() < 0.1:
            dissolution_date = self.fake.date_between(
                start_date=founding_date,
                end_date=datetime(2024, 12, 31)
            )
        
        return {
            "id": company_id,
            "company_name": company_name,
            "legal_form": random.choice(LEGAL_FORMS),
            "street_address": self.fake.street_address(),
            "city": city,
            "postal_code": postal_code,
            "country": "Belgium",
            "date_of_founding": founding_date,
            "date_of_dissolution": dissolution_date,
            "business_sector": random.choice(BUSINESS_SECTORS),
            "company_type": random.choice(["Public", "Private"]),
            "registered_capital": round(random.uniform(10000, 50000000), 2),
        }
    
    def generate_person(self, person_id: int) -> Dict[str, Any]:
        """
        Generate a single person record
        
        Args:
            person_id: Unique identifier for the person
            
        Returns:
            Dictionary with person data
        """
        first_name = self.fake.first_name()
        last_name = self.fake.last_name()
        full_name = f"{first_name} {last_name}"
        
        # Birth date between 1940 and 2000
        birth_date = self.fake.date_of_birth(
            minimum_age=25,
            maximum_age=85
        )
        
        # 5% chance of death
        death_date = None
        if random.random() < 0.05:
            death_date = self.fake.date_between(
                start_date=birth_date + timedelta(days=365*20),  # At least 20 years old
                end_date=datetime.now()
            )
        
        # Pick Belgian city for birthplace
        birthplace_city, _ = random.choice(BELGIAN_CITIES)
        
        # 90% Belgian, 10% other nationalities
        nationality = "Belgian" if random.random() < 0.9 else self.fake.country()
        
        return {
            "id": person_id,
            "first_name": first_name,
            "last_name": last_name,
            "full_name": full_name,
            "date_of_birth": birth_date,
            "place_of_birth": birthplace_city,
            "date_of_death": death_date,
            "nationality": nationality,
        }
    
    def generate_relationships(
        self, 
        company_ids: List[int],
        person_ids: List[int],
        relationships_per_company: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Generate company-person relationships
        
        Args:
            company_ids: List of company IDs
            person_ids: List of person IDs
            relationships_per_company: Average number of relationships per company
            
        Returns:
            List of relationship dictionaries
        """
        relationships = []
        relationship_id = 1001  # Start after sample data
        
        for company_id in company_ids:
            # Random number of relationships (1 to 2x average)
            num_relationships = random.randint(1, relationships_per_company * 2)
            
            # Sample random persons for this company
            selected_persons = random.sample(
                person_ids, 
                min(num_relationships, len(person_ids))
            )
            
            for person_id in selected_persons:
                role = random.choice(ROLE_TYPES)
                
                # Start date between 1990 and 2023
                start_date = self.fake.date_between(
                    start_date=datetime(1990, 1, 1),
                    end_date=datetime(2023, 12, 31)
                )
                
                # 20% chance of ended relationship
                end_date = None
                if random.random() < 0.2:
                    end_date = self.fake.date_between(
                        start_date=start_date,
                        end_date=datetime(2024, 12, 31)
                    )
                
                # Shareholders get share percentage
                share_percentage = None
                if role == "Shareholder":
                    share_percentage = round(random.uniform(0.1, 25.0), 2)
                
                relationships.append({
                    "id": relationship_id,
                    "company_id": company_id,
                    "person_id": person_id,
                    "role": role,
                    "start_date": start_date,
                    "end_date": end_date,
                    "share_percentage": share_percentage,
                })
                
                relationship_id += 1
        
        return relationships
    
    def _generate_company_name(self) -> str:
        """Generate a realistic Belgian company name"""
        templates = [
            lambda: f"{self.fake.company()} {random.choice(COMPANY_SUFFIXES)}",
            lambda: f"Belgische {self.fake.last_name()} {random.choice(COMPANY_SUFFIXES)}",
            lambda: f"{self.fake.last_name()} & {self.fake.last_name()}",
            lambda: f"{random.choice(BELGIAN_CITIES)[0]} {random.choice(['Bouw', 'Industries', 'Trading', 'Services'])}",
            lambda: self.fake.company(),
        ]
        
        name = random.choice(templates)()
        
        # Add legal form suffix 30% of the time
        if random.random() < 0.3:
            name = f"{name} {random.choice(LEGAL_FORMS)}"
        
        return name
