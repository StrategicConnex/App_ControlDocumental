-- Seed data for testing SC Platform

-- 1. Create a dummy organization
INSERT INTO organizations (id, name, logo_url, settings)
VALUES (
    'org-techops-001',
    'TechOps Energy',
    'https://example.com/logo-techops.png',
    '{"theme": "dark", "max_upload_size": 200}'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Documents
INSERT INTO documents (id, org_id, title, code, category, status, expiry_date)
VALUES 
    ('doc-001', 'org-techops-001', 'Manual de Procedimientos HSE', 'HSE-MAN-001', 'ISO/Ingeniería', 'aprobado', '2026-12-31'),
    ('doc-002', 'org-techops-001', 'Política de Seguridad Vial', 'HSE-POL-002', 'ISO/Ingeniería', 'por_vencer', '2026-05-10'),
    ('doc-003', 'org-techops-001', 'Presupuesto Perforación Q3', 'PRE-2026-Q3', 'Presupuesto', 'borrador', NULL),
    ('doc-004', 'org-techops-001', 'Planilla de Seguros Flota', 'FLT-SEG-004', 'Vehículos', 'vencido', '2026-01-15')
ON CONFLICT (id) DO NOTHING;

-- 3. Personnel
INSERT INTO personnel (id, org_id, first_name, last_name, cuil, job_title, status)
VALUES 
    ('per-001', 'org-techops-001', 'Carlos', 'Gómez', '20-12345678-9', 'Operador de Torre', 'aprobado'),
    ('per-002', 'org-techops-001', 'Ana', 'Martínez', '27-98765432-1', 'Supervisora HSE', 'por_vencer'),
    ('per-003', 'org-techops-001', 'Juan', 'Pérez', '20-11112222-3', 'Chofer de Cargas', 'bloqueado')
ON CONFLICT (id) DO NOTHING;

-- Link Personnel to Docs (personnel_docs)
INSERT INTO personnel_docs (id, personnel_id, document_id, status, expiry_date)
VALUES
    ('pdoc-001', 'per-001', 'doc-001', 'aprobado', '2026-12-31'),
    ('pdoc-002', 'per-002', 'doc-002', 'por_vencer', '2026-05-10'),
    ('pdoc-003', 'per-003', 'doc-004', 'vencido', '2026-01-15')
ON CONFLICT (id) DO NOTHING;

-- 4. Vehicles
INSERT INTO vehicles (id, org_id, license_plate, type, brand, model, year, status)
VALUES
    ('veh-001', 'org-techops-001', 'AB 123 CD', 'Camioneta 4x4', 'Toyota', 'Hilux', 2023, 'aprobado'),
    ('veh-002', 'org-techops-001', 'XYZ 987', 'Camión Articulado', 'Scania', 'R450', 2021, 'bloqueado'),
    ('veh-003', 'org-techops-001', 'AF 555 GT', 'Furgón', 'Mercedes-Benz', 'Sprinter', 2024, 'vigente')
ON CONFLICT (id) DO NOTHING;

-- Link Vehicles to Docs (vehicle_docs)
INSERT INTO vehicle_docs (id, vehicle_id, document_id, status, expiry_date)
VALUES
    ('vdoc-001', 'veh-001', 'doc-001', 'aprobado', '2026-12-31'),
    ('vdoc-002', 'veh-002', 'doc-004', 'vencido', '2026-01-15')
ON CONFLICT (id) DO NOTHING;

-- 5. Budgets & Budget Items
INSERT INTO budgets (id, org_id, title, status, total_amount)
VALUES
    ('bud-001', 'org-techops-001', 'Provisión de Servicios HSE Q3', 'enviado', 2500000),
    ('bud-002', 'org-techops-001', 'Auditoría Ambiental Planta Sur', 'aceptado', 4500000),
    ('bud-003', 'org-techops-001', 'Capacitación Altura y Rescate', 'rechazado', 1200000),
    ('bud-004', 'org-techops-001', 'Mantenimiento Preventivo Flota', 'borrador', 850000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO budget_items (id, budget_id, description, quantity, unit_price, total)
VALUES
    ('bitem-001', 'bud-001', 'Horas Consultor Senior HSE', 100, 20000, 2000000),
    ('bitem-002', 'bud-001', 'Viáticos y Traslados', 1, 500000, 500000),
    ('bitem-003', 'bud-002', 'Auditoría Base 1', 1, 3000000, 3000000),
    ('bitem-004', 'bud-002', 'Reporte Técnico', 1, 1500000, 1500000),
    ('bitem-005', 'bud-003', 'Instructor Senior', 40, 25000, 1000000),
    ('bitem-006', 'bud-003', 'Material Didáctico', 10, 20000, 200000),
    ('bitem-007', 'bud-004', 'Revisión VTV', 5, 50000, 250000),
    ('bitem-008', 'bud-004', 'Cambio de Neumáticos', 4, 150000, 600000)
ON CONFLICT (id) DO NOTHING;
