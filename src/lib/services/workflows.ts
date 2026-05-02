import { createAdminClient } from '@/utils/supabase/admin';
import { notificationService } from './notifications';

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

/**
 * Service to manage and execute document workflows.
 */
export const workflowService = {
  /**
   * Triggers workflows for a specific event.
   */
  async trigger(event: string, orgId: string, context: any) {
    const supabase = createAdminClient();
    
    // Fetch active workflows for the event
    const { data: workflows, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('org_id', orgId)
      .eq('trigger_event', event)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching workflows:', error);
      return;
    }

    if (!workflows || workflows.length === 0) return;

    for (const workflow of workflows) {
      console.log(`Executing workflow: ${workflow.name}`);
      await this.executeActions(workflow.actions as unknown as WorkflowAction[], orgId, context);
    }
  },

  /**
   * Executes a list of actions.
   */
  async executeActions(actions: WorkflowAction[], orgId: string, context: any) {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'notification':
            await notificationService.send({
              orgId,
              type: 'system',
              severity: action.params.severity || 'info',
              title: action.params.title || 'Alerta de Workflow',
              message: this.interpolate(action.params.message, context),
              userId: action.params.userId || context.userId
            });
            break;

          case 'status_change':
            // Logic to change status of a resource (e.g., document)
            const { resource, id, status } = action.params;
            if (resource && id && status) {
              const supabase = createAdminClient();
              await supabase.from(resource).update({ status }).eq('id', id);
            }
            break;

          // Add more action types here (AI validation, Approvals, etc.)
        }
      } catch (err) {
        console.error(`Error executing action ${action.type}:`, err);
      }
    }
  },

  /**
   * Simple string interpolation for context variables.
   */
  interpolate(template: string, context: any): string {
    return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      const parts = key.trim().split('.');
      let val = context;
      for (const part of parts) {
        val = val?.[part];
      }
      return val || '';
    });
  }
};
