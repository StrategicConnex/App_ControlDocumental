-- Roadmap de Liderazgo v4.4 - Sistema de Notificaciones Inteligentes
-- Fecha: 28 de abril de 2026

-- 1. Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id), -- Opcional: Si es para un usuario específico o toda la org
  type TEXT NOT NULL CHECK (type IN ('audit_alert', 'system', 'document_expiry', 'approval_request')),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Enlace para navegar al recurso afectado
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Políticas RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven notificaciones de su organización" ON notifications
  FOR SELECT USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Sistema inserta notificaciones" ON notifications
  FOR INSERT WITH CHECK (true);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_notifications_org_read ON notifications(org_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
