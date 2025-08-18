-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create employees table
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL,
  category VARCHAR(50),
  major_org VARCHAR(100),
  organization VARCHAR(100),
  name VARCHAR(50),
  grade VARCHAR(20),
  grade_year INTEGER,
  position VARCHAR(50),
  years_of_service INTEGER,
  hiring_type VARCHAR(50),
  gender VARCHAR(10),
  age INTEGER,
  is_implemented BOOLEAN DEFAULT false,
  implemented_date DATE,
  agreement_status VARCHAR(10),
  is_confirmed BOOLEAN DEFAULT false,
  confirmed_date DATE,
  final_agreement VARCHAR(10),
  upload_batch_id UUID REFERENCES upload_batches(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create allowed_users table
CREATE TABLE allowed_users (
  employee_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user', -- 'admin' or 'user'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create upload_batches table
CREATE TABLE upload_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by VARCHAR(20),
  upload_date TIMESTAMP DEFAULT NOW(),
  total_employees INTEGER,
  file_name VARCHAR(200),
  base_date DATE,
  base_time TIME
);

-- Create AI analysis cache table
CREATE TABLE ai_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  analysis TEXT NOT NULL,
  data_hash INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_upload_batch_id ON employees(upload_batch_id);
CREATE INDEX idx_employees_is_implemented ON employees(is_implemented);
CREATE INDEX idx_employees_agreement_status ON employees(agreement_status);
CREATE INDEX idx_upload_batches_upload_date ON upload_batches(upload_date);
CREATE INDEX idx_upload_batches_base_date ON upload_batches(base_date);
CREATE INDEX idx_upload_batches_base_time ON upload_batches(base_time);
CREATE INDEX idx_ai_analysis_cache_category ON ai_analysis_cache(category);
CREATE INDEX idx_ai_analysis_cache_created_at ON ai_analysis_cache(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees
CREATE POLICY "Allow all operations for authenticated users" ON employees
  FOR ALL USING (true);

-- RLS Policies for allowed_users (for authentication)
CREATE POLICY "Allow authentication queries" ON allowed_users
  FOR SELECT USING (true);

-- RLS Policies for upload_batches
CREATE POLICY "Allow all operations for authenticated users" ON upload_batches
  FOR ALL USING (true);

-- RLS Policies for ai_analysis_cache
CREATE POLICY "Allow all operations for authenticated users" ON ai_analysis_cache
  FOR ALL USING (true);

-- Enable realtime for upload_batches table
ALTER PUBLICATION supabase_realtime ADD TABLE upload_batches;

-- Insert some default admin users
INSERT INTO allowed_users (employee_id, name, role) VALUES
('122400298', '관리자 1', 'admin'),
('121800140', '관리자 2', 'admin'),
('121800077', '관리자 3', 'admin'),
('120700243', '사용자 1', 'user'),
('121500029', '사용자 2', 'user'),
('121500065', '사용자 3', 'user'),
('121600025', '사용자 4', 'user'),
('121600245', '사용자 5', 'user'),
('121600276', '사용자 6', 'user'),
('121700072', '사용자 7', 'user'),
('121900074', '사용자 8', 'user');
