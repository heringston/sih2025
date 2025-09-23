-- schema.sql
CREATE TABLE IF NOT EXISTS universities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  university_id INT REFERENCES universities(id),
  course VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employers (
  id SERIAL PRIMARY KEY,
  employer_id VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  company VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  cert_id VARCHAR(100) UNIQUE NOT NULL,
  student_id VARCHAR(100) NOT NULL,
  student_name VARCHAR(255),
  course VARCHAR(255),
  issued_by INT REFERENCES universities(id),
  issued_at TIMESTAMP DEFAULT now(),
  block_index INT,
  hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS blocks (
  id SERIAL PRIMARY KEY,
  index INT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT now(),
  cert_id VARCHAR(100),
  data JSONB,
  previous_hash VARCHAR(255) NOT NULL,
  hash VARCHAR(255) NOT NULL
);

-- helpful index on cert_id
CREATE INDEX IF NOT EXISTS idx_cert_certid ON certificates(cert_id);
CREATE INDEX IF NOT EXISTS idx_blocks_index ON blocks("index");
