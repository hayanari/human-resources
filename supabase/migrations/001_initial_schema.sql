-- HRナビ Pro - Supabase スキーマ
-- 社員マスタ・人事評価をExcel形式と互換

-- 社員マスタ
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  belong TEXT,
  dept TEXT,
  position TEXT,
  job_type TEXT,
  grade TEXT,
  goubou TEXT,
  email TEXT,
  phone TEXT,
  joined DATE,
  dob DATE,
  zip TEXT,
  address TEXT,
  name_changed DATE,
  address_changed DATE,
  skills JSONB DEFAULT '[]',
  notes TEXT,
  certs JSONB DEFAULT '[]',
  grade_history JSONB DEFAULT '[]',
  transfer_history JSONB DEFAULT '[]',
  skill_levels JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 人事評価
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emp_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period TEXT,
  satei TEXT,
  eval_1st TEXT,
  eval_2nd TEXT,
  comment TEXT,
  comp_scores JSONB DEFAULT '{}',
  kpi_scores JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 顔写真（Supabase Storage を使う場合はこちらでパス管理）
CREATE TABLE IF NOT EXISTS employee_photos (
  emp_id TEXT PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS（Row Level Security）: 認証済みユーザーのみアクセス可能にする場合
-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for anon" ON employees FOR ALL USING (true);
-- CREATE POLICY "Allow all for anon" ON evaluations FOR ALL USING (true);

-- updated_at 自動更新
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS employees_updated_at ON employees;
CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS evaluations_updated_at ON evaluations;
CREATE TRIGGER evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
