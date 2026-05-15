-- ============================================================
--  BITGAMESO — Tabla bug_reports
--  Ejecutar en Supabase > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS bug_reports (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    usuario          TEXT NOT NULL,
    descripcion      TEXT NOT NULL,
    mascota          TEXT,
    monedas          NUMERIC,
    salud            NUMERIC,
    victoria         TEXT,
    navegador        TEXT,
    pantalla         TEXT,
    url              TEXT,
    errores_consola  TEXT,          -- JSON string con los últimos errores
    tiene_screenshot BOOLEAN DEFAULT false,
    created_at       TIMESTAMPTZ DEFAULT now()
);

-- Índices útiles para consultar
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_usuario    ON bug_reports (usuario);

-- Row Level Security: solo tú (admin) puedes leer; cualquiera puede insertar
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Política: insertar (cualquier usuario autenticado o anónimo puede reportar)
CREATE POLICY "Insertar bug report"
    ON bug_reports FOR INSERT
    WITH CHECK (true);

-- Política: leer solo el propio user (los admins ven todo desde el dashboard de Supabase)
CREATE POLICY "Leer propios bug reports"
    ON bug_reports FOR SELECT
    USING (auth.uid() = user_id);
