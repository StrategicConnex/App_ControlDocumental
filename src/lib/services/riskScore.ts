/**
 * Risk Score Calculator — Strategic Connex
 *
 * Computes a 0–100 risk score for an entity (document, personnel, vehicle)
 * based on the weighted severity of its alerts.
 *
 * - 0–30   → LOW    (green)
 * - 31–60  → MEDIUM (amber)
 * - 61–100 → HIGH   (rose)
 */

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskScoreResult {
  score: number;
  level: RiskLevel;
  label: string;
  color: string;
}

/** Weights per status severity */
const STATUS_WEIGHTS: Record<string, number> = {
  vigente: 0,
  aprobado: 0,
  por_vencer: 40,
  vencido: 80,
  bloqueado: 100,
  borrador: 10,
  revision: 5,
};

/**
 * Compute the risk score for a set of statuses.
 * Useful for computing aggregate risk of a person or vehicle
 * based on all their associated document statuses.
 */
export function computeRiskScore(statuses: string[]): RiskScoreResult {
  if (statuses.length === 0) {
    return buildResult(0);
  }

  const total = statuses.reduce((acc, status) => {
    return acc + (STATUS_WEIGHTS[status] ?? 50);
  }, 0);

  const avg = Math.round(total / statuses.length);
  return buildResult(Math.min(avg, 100));
}

/**
 * Compute risk score for a single entity.
 * When the entity's own status is 'vencido' or 'bloqueado',
 * that overrides any partial calculation.
 */
export function computeEntityRisk(status: string, childStatuses: string[] = []): RiskScoreResult {
  const primaryWeight = STATUS_WEIGHTS[status] ?? 50;

  if (childStatuses.length === 0) {
    return buildResult(primaryWeight);
  }

  const childScore = computeRiskScore(childStatuses).score;
  // Primary status counts as 60% of the score, children as 40%
  const composite = Math.round(primaryWeight * 0.6 + childScore * 0.4);
  return buildResult(Math.min(composite, 100));
}

function buildResult(score: number): RiskScoreResult {
  if (score <= 30) {
    return { score, level: 'low', label: 'Riesgo Bajo', color: 'emerald' };
  }
  if (score <= 60) {
    return { score, level: 'medium', label: 'Riesgo Medio', color: 'amber' };
  }
  return { score, level: 'high', label: 'Riesgo Alto', color: 'rose' };
}

/**
 * DB INTERACTIONS
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getRiskHistory(supabase: SupabaseClient, orgId: string) {
  const { data, error } = await supabase
    .from('risk_score_history')
    .select('*')
    .eq('org_id', orgId)
    .order('recorded_at', { ascending: true })
    .limit(30);

  if (error) throw error;
  return data;
}

export async function recordDailyRiskScore(
  supabase: SupabaseClient, 
  orgId: string,
  scores: { score: number; docs: number; legajos: number; personal: number }
) {
  const { error } = await supabase
    .from('risk_score_history')
    .insert({
      org_id: orgId,
      score: scores.score,
      docs_score: scores.docs,
      legajos_score: scores.legajos,
      personal_score: scores.personal
    });

  if (error) throw error;
}

