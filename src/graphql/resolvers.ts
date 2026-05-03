import { GraphQLContext } from './context';
import { getComplianceMetrics } from '@/lib/services/search';

export const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: GraphQLContext) => {
      if (!context.user) return null;
      const { data, error } = await context.supabase
        .from('profiles')
        .select('*')
        .eq('id', context.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    organization: async (_parent: any, _args: any, context: GraphQLContext) => {
      if (!context.orgId) return null;
      const { data, error } = await context.supabase
        .from('organizations')
        .select('*')
        .eq('id', context.orgId)
        .single();
      if (error) throw error;
      return data;
    },
    documents: async (_parent: any, args: { startDate?: string, endDate?: string, status?: string, category?: string, search?: string }, context: GraphQLContext) => {
      if (!context.orgId) return [];
      let query = context.supabase
        .from('documents')
        .select('*')
        .eq('org_id', context.orgId);
      
      if (args.status) query = query.eq('status', args.status);
      if (args.category) query = query.eq('category', args.category);
      if (args.startDate) query = query.gte('created_at', args.startDate);
      if (args.endDate) query = query.lte('created_at', args.endDate);
      if (args.search) {
        query = query.or(`title.ilike.%${args.search}%,code.ilike.%${args.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    document: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      const { data, error } = await context.supabase
        .from('documents')
        .select('*')
        .eq('id', args.id)
        .single();
      if (error) throw error;
      return data;
    },
    personnel: async (_parent: any, args: { status?: string, search?: string }, context: GraphQLContext) => {
      if (!context.orgId) return [];
      let query = context.supabase
        .from('personnel')
        .select('*')
        .eq('org_id', context.orgId);
      
      if (args.status) query = query.eq('status', args.status);
      if (args.search) {
        query = query.or(`first_name.ilike.%${args.search}%,last_name.ilike.%${args.search}%,cuil.ilike.%${args.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    vehicles: async (_parent: any, args: { status?: string, search?: string }, context: GraphQLContext) => {
      if (!context.orgId) return [];
      let query = context.supabase
        .from('vehicles')
        .select('*')
        .eq('org_id', context.orgId);
      
      if (args.status) query = query.eq('status', args.status);
      if (args.search) {
        query = query.or(`license_plate.ilike.%${args.search}%,brand.ilike.%${args.search}%,model.ilike.%${args.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    invoices: async (_parent: any, args: { startDate?: string, endDate?: string, status?: string }, context: GraphQLContext) => {
      if (!context.orgId) return [];
      let query = context.supabase
        .from('invoices')
        .select('*')
        .eq('org_id', context.orgId);
      
      if (args.status) query = query.eq('status', args.status);
      if (args.startDate) query = query.gte('created_at', args.startDate);
      if (args.endDate) query = query.lte('created_at', args.endDate);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    purchaseOrders: async (_parent: any, _args: any, context: GraphQLContext) => {
      if (!context.orgId) return [];
      const { data, error } = await context.supabase
        .from('purchase_orders')
        .select('*')
        .eq('org_id', context.orgId);
      if (error) throw error;
      return data;
    },
    auditLogs: async (_parent: any, args: { startDate?: string, endDate?: string, action?: string, search?: string }, context: GraphQLContext) => {
      if (!context.orgId) return [];
      let query = context.supabase
        .from('audit_logs')
        .select('*')
        .eq('org_id', context.orgId);
      
      if (args.action) query = query.eq('action', args.action);
      if (args.startDate) query = query.gte('created_at', args.startDate);
      if (args.endDate) query = query.lte('created_at', args.endDate);
      if (args.search) {
        query = query.or(`entity_type.ilike.%${args.search}%,action.ilike.%${args.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    complianceMetrics: async (_parent: any, _args: any, context: GraphQLContext) => {
      if (!context.orgId) return null;
      return await getComplianceMetrics(context.supabase);
    }
  },
  Document: {
    versions: async (parent: any, _args: any, context: GraphQLContext) => {
      const { data, error } = await context.supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', parent.id)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return data;
    }
  },
  Mutation: {
    updateDocumentStatus: async (_parent: any, args: { id: string, status: string }, context: GraphQLContext) => {
      const { data, error } = await context.supabase
        .from('documents')
        .update({ status: args.status })
        .eq('id', args.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    logExport: async (_parent: any, args: { reportType: string, format: string, filters: string, mode: string }, context: GraphQLContext) => {
      if (!context.orgId || !context.user) return false;
      const { error } = await context.supabase
        .from('audit_logs')
        .insert({
          org_id: context.orgId,
          user_id: context.user.id,
          action: `EXPORT_${args.reportType.toUpperCase()}`,
          entity_type: 'REPORT',
          entity_id: args.reportType,
          new_data: JSON.stringify({
            format: args.format,
            filters: args.filters,
            mode: args.mode,
            timestamp: new Date().toISOString()
          })
        });
      if (error) throw error;
      return true;
    }
  }
};
