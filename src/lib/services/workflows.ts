/**
 * Shared types and interfaces for workflows.
 * Safe to import in both client and server components.
 */

export interface WorkflowAction {
  type: 'notification' | 'approval_request' | 'ai_validation' | 'status_change';
  params: any;
}

export interface Workflow {
  id: string;
  name: string;
  trigger_event: string;
  trigger_filters?: any;
  actions: WorkflowAction[];
  is_active: boolean;
}
