/**
 * Centralized status constants for all entities.
 * Single source of truth — prevents magic strings across the codebase.
 */

// ─── Document Lifecycle ───────────────────────────────────────────────────────
export const DOCUMENT_STATUS = {
  BORRADOR:   'borrador',
  REVISION:   'revision',
  APROBADO:   'aprobado',
  PUBLICADO:  'publicado',
  POR_VENCER: 'por_vencer',
  VENCIDO:    'vencido',
  OBSOLETO:   'obsoleto',
  ARCHIVADO:  'archivado',
} as const;

export type DocumentStatus = typeof DOCUMENT_STATUS[keyof typeof DOCUMENT_STATUS];

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  borrador:   'Borrador',
  revision:   'En Revisión',
  aprobado:   'Aprobado',
  publicado:  'Publicado',
  por_vencer: 'Por Vencer',
  vencido:    'Vencido',
  obsoleto:   'Obsoleto',
  archivado:  'Archivado',
};

export const DOCUMENT_STATUS_CONFIG: Record<DocumentStatus, {
  label: string;
  color: string;
  bg: string;
  dot: string;
}> = {
  borrador:   { label: 'Borrador',    color: 'text-gray-600',   bg: 'bg-gray-100',   dot: 'bg-gray-400'   },
  revision:   { label: 'En Revisión', color: 'text-blue-600',   bg: 'bg-blue-50',    dot: 'bg-blue-500'   },
  aprobado:   { label: 'Aprobado',    color: 'text-emerald-600',bg: 'bg-emerald-50', dot: 'bg-emerald-500'},
  publicado:  { label: 'Publicado',   color: 'text-indigo-600', bg: 'bg-indigo-50',  dot: 'bg-indigo-500' },
  por_vencer: { label: 'Por Vencer',  color: 'text-amber-600',  bg: 'bg-amber-50',   dot: 'bg-amber-500'  },
  vencido:    { label: 'Vencido',     color: 'text-rose-600',   bg: 'bg-rose-50',    dot: 'bg-rose-500'   },
  obsoleto:   { label: 'Obsoleto',    color: 'text-orange-600', bg: 'bg-orange-50',  dot: 'bg-orange-500' },
  archivado:  { label: 'Archivado',   color: 'text-slate-600',  bg: 'bg-slate-100',  dot: 'bg-slate-400'  },
};

// Document lifecycle flow (ISO 9001:2015 Clause 7.5)
export const DOCUMENT_LIFECYCLE: DocumentStatus[] = [
  'borrador', 'revision', 'aprobado', 'publicado', 'obsoleto', 'archivado',
];

// ─── Personnel Status ─────────────────────────────────────────────────────────
export const PERSONNEL_STATUS = {
  VIGENTE:    'vigente',
  POR_VENCER: 'por_vencer',
  VENCIDO:    'vencido',
  BLOQUEADO:  'bloqueado',
} as const;

export type PersonnelStatus = typeof PERSONNEL_STATUS[keyof typeof PERSONNEL_STATUS];

// ─── Vehicle Status ───────────────────────────────────────────────────────────
export const VEHICLE_STATUS = {
  HABILITADO:   'habilitado',
  POR_VENCER:   'por_vencer',
  VENCIDO:      'vencido',
  INHABILITADO: 'inhabilitado',
  BLOQUEADO:    'bloqueado',
} as const;

export type VehicleStatus = typeof VEHICLE_STATUS[keyof typeof VEHICLE_STATUS];

// ─── Budget Status ────────────────────────────────────────────────────────────
export const BUDGET_STATUS = {
  BORRADOR:  'borrador',
  ENVIADO:   'enviado',
  ACEPTADO:  'aceptado',
  RECHAZADO: 'rechazado',
} as const;

export type BudgetStatus = typeof BUDGET_STATUS[keyof typeof BUDGET_STATUS];

export const BUDGET_STATUS_CONFIG: Record<BudgetStatus, {
  label: string; color: string; bg: string;
}> = {
  borrador:  { label: 'Borrador',   color: 'text-gray-600',   bg: 'bg-gray-100'   },
  enviado:   { label: 'Enviado',    color: 'text-blue-600',   bg: 'bg-blue-50'    },
  aceptado:  { label: 'Aceptado',   color: 'text-emerald-600',bg: 'bg-emerald-50' },
  rechazado: { label: 'Rechazado',  color: 'text-rose-600',   bg: 'bg-rose-50'    },
};

// ─── Legajo Status ────────────────────────────────────────────────────────────
export const LEGAJO_STATUS = {
  ACTIVO:   'activo',
  PENDIENTE:'pendiente',
  APROBADO: 'aprobado',
  ARCHIVADO:'archivado',
} as const;

export type LegajoStatus = typeof LEGAJO_STATUS[keyof typeof LEGAJO_STATUS];

// ─── Alert Severity ───────────────────────────────────────────────────────────
export const ALERT_SEVERITY = {
  CRITICA:   'critica',
  ALTA:      'alta',
  MEDIA:     'media',
  BAJA:      'baja',
} as const;

export type AlertSeverity = typeof ALERT_SEVERITY[keyof typeof ALERT_SEVERITY];

// ─── Days-to-expiry thresholds (ISO 45001 / SRT Argentina) ───────────────────
export const EXPIRY_THRESHOLDS = {
  CRITICAL_DAYS: 7,   // Vencido inminente → rojo
  WARNING_DAYS:  30,  // Por vencer → amarillo
  NOTICE_DAYS:   60,  // Aviso anticipado → azul
} as const;
