BEGIN;

CREATE TABLE IF NOT EXISTS ai_reajuste_history (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES economic_plans(id) ON DELETE CASCADE,
  requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  model_name VARCHAR(80) NOT NULL,
  context JSONB,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_reajuste_history_plan
  ON ai_reajuste_history(plan_id);

COMMIT;
