/**
 * Shared types for notifications.
 * Safe for client and server.
 */

export interface NotificationPayload {
  orgId: string;
  userId?: string;
  type: 'audit_alert' | 'system' | 'document_expiry' | 'approval_request';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}
