-- =========================================================================
-- Oracle initialization for PDB: scob
-- =========================================================================
WHENEVER SQLERROR EXIT SQL.SQLCODE;

-- Connect to the correct PDB (scripts run as SYSTEM by default)
CONNECT system/oracle_password@//localhost:1521/scob

-- Grant necessary privileges to APP_USER
GRANT CREATE TABLE TO scoball;
GRANT UNLIMITED TABLESPACE TO scoball;

-- Switch to APP_USER
-- THIS LINE NEEDS TO BE REPEATED AT THE START OF EVERY SQL SCRIPT WITH DUMPS
CONNECT scoball/oracle_password@//localhost:1521/scob

--------------------------------------------------
-- Table: corporation
--------------------------------------------------
CREATE TABLE corporation
(
    id        NUMBER(19,0) PRIMARY KEY,
    startdate TIMESTAMP,
    enddate   TIMESTAMP
);

--------------------------------------------------
-- Table: juridisch_statuut
--------------------------------------------------
CREATE TABLE juridisch_statuut
(
    id                NUMBER(19,0) PRIMARY KEY,
    juridisch_statuut VARCHAR2(4000) NOT NULL
);

--------------------------------------------------
-- Table: corporation_juridisch_statuut
--------------------------------------------------
CREATE TABLE corporation_juridisch_statuut
(
    corporation       NUMBER(19,0) REFERENCES corporation(id) ON DELETE CASCADE,
    juridisch_statuut NUMBER(19,0),
    startdate         DATE,
    enddate           DATE,
    comments          VARCHAR2(4000),
    source            VARCHAR2(1000),
    CONSTRAINT pk_cjs PRIMARY KEY (corporation, startdate, juridisch_statuut)
);

--------------------------------------------------
-- Table: corporation_location
--------------------------------------------------
CREATE TABLE corporation_location
(
    corporation NUMBER(19,0) REFERENCES corporation(id) ON DELETE CASCADE,
    address     VARCHAR2(4000),
    city        VARCHAR2(200),
    country     VARCHAR2(200),
    startdate   DATE,
    enddate     DATE,
    CONSTRAINT pk_cl PRIMARY KEY (corporation, startdate, city)
);

--------------------------------------------------
-- Table: corporation_name
--------------------------------------------------
CREATE TABLE corporation_name
(
    corporation NUMBER(19,0) REFERENCES corporation(id) ON DELETE CASCADE,
    name        VARCHAR2(4000),
    startdate   TIMESTAMP,
    enddate     TIMESTAMP,
    source      VARCHAR2(1000),
    comments    VARCHAR2(4000),
    CONSTRAINT pk_cn PRIMARY KEY (corporation, startdate, name)
);

--------------------------------------------------
-- Indexes
--------------------------------------------------
CREATE INDEX idx_corp_js_corporation ON corporation_juridisch_statuut (corporation);
CREATE INDEX idx_corp_js_juridisch ON corporation_juridisch_statuut (juridisch_statuut);
CREATE INDEX idx_corp_loc_corporation ON corporation_location (corporation);
CREATE INDEX idx_corp_loc_country ON corporation_location (country);
CREATE INDEX idx_corp_name_corporation ON corporation_name (corporation);
CREATE INDEX idx_corp_name_name ON corporation_name (name);
CREATE INDEX idx_juridisch_statuut_name ON juridisch_statuut (juridisch_statuut);

EXIT;