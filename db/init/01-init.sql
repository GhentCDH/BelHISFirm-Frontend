-- BellHisFirm Database Schema
-- Belgian Historical Firm Database (SCOB-inspired)
-- Initialize database with company and person data

-- =============================================================================
-- COMPANIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(500) NOT NULL,
    legal_form VARCHAR(100),
    street_address VARCHAR(500),
    city VARCHAR(255),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Belgium',
    date_of_founding DATE,
    date_of_dissolution DATE,
    business_sector VARCHAR(255),
    company_type VARCHAR(100),
    registered_capital NUMERIC(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- PERSONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS persons (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(500),
    date_of_birth DATE,
    place_of_birth VARCHAR(255),
    date_of_death DATE,
    nationality VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- COMPANY_PERSON RELATIONSHIP TABLE
-- Links persons to companies with their roles
-- =============================================================================
CREATE TABLE IF NOT EXISTS company_person (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    role VARCHAR(255) NOT NULL,  -- e.g., 'Director', 'Founder', 'Shareholder', 'Manager'
    start_date DATE,
    end_date DATE,
    share_percentage NUMERIC(5, 2),  -- For shareholders
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, person_id, role, start_date)
);

-- =============================================================================
-- INDEXES for performance
-- =============================================================================
CREATE INDEX idx_companies_name ON companies(company_name);
CREATE INDEX idx_companies_city ON companies(city);
CREATE INDEX idx_companies_founding ON companies(date_of_founding);
CREATE INDEX idx_persons_name ON persons(last_name, first_name);
CREATE INDEX idx_company_person_company ON company_person(company_id);
CREATE INDEX idx_company_person_person ON company_person(person_id);


-- =============================================================================
-- SAMPLE DATA - Belgian Historical Companies
-- =============================================================================

-- Insert sample companies (Belgian historical context)
INSERT INTO companies (company_name, legal_form, street_address, city, postal_code, date_of_founding, business_sector, company_type, registered_capital) VALUES
('Société Générale de Belgique', 'SA/NV', 'Rue Royale 30', 'Brussels', '1000', '1822-12-28', 'Banking & Finance', 'Public', 50000000.00),
('Union Minière du Haut Katanga', 'SA', 'Avenue Louise 149', 'Brussels', '1050', '1906-10-28', 'Mining & Metals', 'Public', 25000000.00),
('Cockerill-Sambre', 'SA', 'Boulevard de Colonster 1', 'Liège', '4000', '1817-08-12', 'Steel Manufacturing', 'Public', 30000000.00),
('Banque de Bruxelles', 'SA/NV', 'Rue de la Régence 2', 'Brussels', '1000', '1871-03-15', 'Banking', 'Public', 20000000.00),
('Solvay & Cie', 'SA', 'Rue de Ransbeek 310', 'Brussels', '1120', '1863-12-26', 'Chemicals', 'Public', 15000000.00),
('Compagnie Maritime Belge', 'SA', 'Havenlaan 86c', 'Antwerp', '2030', '1895-06-15', 'Shipping & Transport', 'Public', 12000000.00),
('Établissements Empain', 'SA', 'Avenue des Arts 56', 'Brussels', '1000', '1881-01-10', 'Railways & Industry', 'Public', 18000000.00),
('Fabrique Nationale de Herstal', 'SA', 'Voie de Liège 33', 'Herstal', '4040', '1889-07-03', 'Arms Manufacturing', 'Public', 8000000.00),
('Magasins Innovation', 'SA', 'Rue Neuve 111', 'Brussels', '1000', '1897-09-20', 'Retail', 'Private', 5000000.00),
('Brasserie Artois', 'SA', 'Vaartstraat 94', 'Leuven', '3000', '1717-01-01', 'Brewing', 'Private', 3000000.00);

-- Insert sample persons (Belgian historical figures)
INSERT INTO persons (first_name, last_name, full_name, date_of_birth, place_of_birth, nationality) VALUES
('Ferdinand', 'de Meeûs', 'Ferdinand de Meeûs', '1798-05-18', 'Brussels', 'Belgian'),
('Ernest', 'Solvay', 'Ernest Solvay', '1838-04-16', 'Rebecq', 'Belgian'),
('Édouard', 'Empain', 'Édouard Empain', '1852-09-07', 'Belœil', 'Belgian'),
('John', 'Cockerill', 'John Cockerill', '1790-08-03', 'Haslingden', 'British-Belgian'),
('Jules', 'Cornet', 'Jules Cornet', '1865-02-15', 'Mons', 'Belgian'),
('Henri', 'Lambert', 'Henri Lambert', '1862-11-20', 'Brussels', 'Belgian'),
('Wauthier', 'Frère-Orban', 'Walthère Frère-Orban', '1812-04-24', 'Liège', 'Belgian'),
('Raoul', 'Warocqué', 'Raoul Warocqué', '1870-06-10', 'Mariemont', 'Belgian'),
('Fernand', 'Collin', 'Fernand Collin', '1887-03-12', 'Liège', 'Belgian'),
('Camille', 'Gutt', 'Camille Gutt', '1884-11-14', 'Brussels', 'Belgian'),
('Alexandre', 'Galopin', 'Alexandre Galopin', '1879-02-18', 'Brussels', 'Belgian'),
('Léon', 'Bekaert', 'Léon Bekaert', '1855-08-15', 'Zwevegem', 'Belgian'),
('Gustave', 'Joris', 'Gustave Joris', '1869-07-22', 'Antwerp', 'Belgian'),
('Paul', 'de Launoit', 'Paul de Launoit', '1870-05-30', 'Brussels', 'Belgian'),
('Louis', 'Franck', 'Louis Franck', '1868-01-28', 'Antwerp', 'Belgian');

-- =============================================================================
-- SAMPLE RELATIONSHIPS - Link persons to companies
-- =============================================================================

-- Société Générale de Belgique relationships
INSERT INTO company_person (company_id, person_id, role, start_date, end_date) VALUES
(1, 1, 'Founder', '1822-12-28', '1861-06-15'),
(1, 11, 'Director', '1935-01-01', '1944-02-20');

-- Solvay & Cie relationships
INSERT INTO company_person (company_id, person_id, role, start_date) VALUES
(5, 2, 'Founder', '1863-12-26'),
(5, 2, 'Director', '1863-12-26');


-- Établissements Empain relationships
INSERT INTO company_person (company_id, person_id, role, start_date) VALUES
(7, 3, 'Founder', '1881-01-10'),
(7, 3, 'Director', '1881-01-10');

-- Cockerill-Sambre relationships
INSERT INTO company_person (company_id, person_id, role, start_date, end_date) VALUES
(3, 4, 'Founder', '1817-08-12', '1840-06-19');

-- Union Minière relationships
INSERT INTO company_person (company_id, person_id, role, start_date) VALUES
(2, 5, 'Director', '1906-10-28'),
(2, 14, 'Director', '1920-01-01');

-- Banque de Bruxelles relationships
INSERT INTO company_person (company_id, person_id, role, start_date) VALUES
(4, 6, 'Director', '1871-03-15'),
(4, 10, 'Director', '1925-01-01');

-- Compagnie Maritime Belge relationships
INSERT INTO company_person (company_id, person_id, role, start_date) VALUES
(6, 13, 'Director', '1900-01-01'),
(6, 15, 'Director', '1895-06-15');

-- Fabrique Nationale relationships
INSERT INTO company_person (company_id, person_id, role, start_date) VALUES
(8, 8, 'Shareholder', '1889-07-03');

-- Additional director relationships
INSERT INTO company_person (company_id, person_id, role, start_date) VALUES
(1, 7, 'Director', '1848-01-01'),
(9, 9, 'Director', '1897-09-20'),
(10, 12, 'Founder', '1717-01-01');

-- =============================================================================
-- VIEWS for easier querying
-- =============================================================================

-- View: Companies with their current directors
CREATE OR REPLACE VIEW v_company_directors AS
SELECT 
    c.id as company_id,
    c.company_name,
    c.city,
    p.id as person_id,
    p.full_name,
    cp.role,
    cp.start_date,
    cp.end_date
FROM companies c
JOIN company_person cp ON c.id = cp.company_id
JOIN persons p ON cp.person_id = p.id
WHERE cp.role IN ('Director', 'Founder', 'Manager')
ORDER BY c.company_name, cp.start_date;

-- View: Person affiliations
CREATE OR REPLACE VIEW v_person_affiliations AS
SELECT 
    p.id as person_id,
    p.full_name,
    p.date_of_birth,
    c.id as company_id,
    c.company_name,
    cp.role,
    cp.start_date,
    cp.end_date
FROM persons p
JOIN company_person cp ON p.id = cp.person_id
JOIN companies c ON cp.company_id = c.id
ORDER BY p.full_name, cp.start_date;

-- =============================================================================
-- Database setup complete
-- =============================================================================
