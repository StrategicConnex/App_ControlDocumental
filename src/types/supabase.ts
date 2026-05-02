export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_call_logs: {
        Row: {
          completion_tokens: number | null
          created_at: string | null
          endpoint: string
          error_message: string | null
          id: string
          model: string
          org_id: string
          prompt_tokens: number | null
          provider: string
          response_time_ms: number | null
          success: boolean | null
          total_tokens: number | null
        }
        Insert: {
          completion_tokens?: number | null
          created_at?: string | null
          endpoint: string
          error_message?: string | null
          id?: string
          model: string
          org_id: string
          prompt_tokens?: number | null
          provider: string
          response_time_ms?: number | null
          success?: boolean | null
          total_tokens?: number | null
        }
        Update: {
          completion_tokens?: number | null
          created_at?: string | null
          endpoint?: string
          error_message?: string | null
          id?: string
          model?: string
          org_id?: string
          prompt_tokens?: number | null
          provider?: string
          response_time_ms?: number | null
          success?: boolean | null
          total_tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_call_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          key: string
          name: string
          org_id: string
          permissions: string[] | null
          rate_limit: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          name: string
          org_id: string
          permissions?: string[] | null
          rate_limit?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          name?: string
          org_id?: string
          permissions?: string[] | null
          rate_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          org_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          org_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          org_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          approved_at: string | null
          approved_by: string
          comment: string | null
          document_id: string
          id: string
          status: string
          version_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by: string
          comment?: string | null
          document_id: string
          id?: string
          status: string
          version_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string
          comment?: string | null
          document_id?: string
          id?: string
          status?: string
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          budget_id: string | null
          description: string | null
          id: string
          quantity: number | null
          total: number | null
          unit_price: number | null
        }
        Insert: {
          budget_id?: string | null
          description?: string | null
          id: string
          quantity?: number | null
          total?: number | null
          unit_price?: number | null
        }
        Update: {
          budget_id?: string | null
          description?: string | null
          id?: string
          quantity?: number | null
          total?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          id: string
          org_id: string | null
          status: string | null
          title: string | null
          total_amount: number | null
        }
        Insert: {
          id: string
          org_id?: string | null
          status?: string | null
          title?: string | null
          total_amount?: number | null
        }
        Update: {
          id?: string
          org_id?: string | null
          status?: string | null
          title?: string | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          auto_renewal: boolean | null
          compliance_score: number | null
          contract_number: string
          contract_value: number | null
          counterparty: string
          created_at: string | null
          document_id: string
          end_date: string
          id: string
          last_alert_sent_at: string | null
          metadata: Json | null
          org_id: string
          renewal_notice_days: number | null
          start_date: string
          status: string | null
        }
        Insert: {
          auto_renewal?: boolean | null
          compliance_score?: number | null
          contract_number: string
          contract_value?: number | null
          counterparty: string
          created_at?: string | null
          document_id: string
          end_date: string
          id?: string
          last_alert_sent_at?: string | null
          metadata?: Json | null
          org_id: string
          renewal_notice_days?: number | null
          start_date: string
          status?: string | null
        }
        Update: {
          auto_renewal?: boolean | null
          compliance_score?: number | null
          contract_number?: string
          contract_value?: number | null
          counterparty?: string
          created_at?: string | null
          document_id?: string
          end_date?: string
          id?: string
          last_alert_sent_at?: string | null
          metadata?: Json | null
          org_id?: string
          renewal_notice_days?: number | null
          start_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_signatures: {
        Row: {
          created_at: string | null
          document_id: string
          id: string
          ip_address: unknown
          signature_hash: string
          signed_at: string
          signer_certificate_hash: string
          signer_id: string
          user_agent: string | null
          validation_provider: string | null
          validation_timestamp: string | null
          version_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: string
          ip_address?: unknown
          signature_hash: string
          signed_at?: string
          signer_certificate_hash: string
          signer_id: string
          user_agent?: string | null
          validation_provider?: string | null
          validation_timestamp?: string | null
          version_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: string
          ip_address?: unknown
          signature_hash?: string
          signed_at?: string
          signer_certificate_hash?: string
          signer_id?: string
          user_agent?: string | null
          validation_provider?: string | null
          validation_timestamp?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_signatures_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_signatures_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string
          embedding: string | null
          id: string
          summary: string | null
          version_id: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          document_id: string
          embedding?: string | null
          id?: string
          summary?: string | null
          version_id: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string
          embedding?: string | null
          id?: string
          summary?: string | null
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          org_id: string | null
          required_metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          org_id?: string | null
          required_metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string | null
          required_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_types_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          content_extracted: string | null
          created_at: string | null
          deleted_at: string | null
          document_id: string | null
          file_url: string | null
          id: string
          version_number: number
        }
        Insert: {
          content_extracted?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document_id?: string | null
          file_url?: string | null
          id?: string
          version_number: number
        }
        Update: {
          content_extracted?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document_id?: string | null
          file_url?: string | null
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          code: string | null
          created_at: string | null
          created_by: string | null
          current_version: number | null
          deleted_at: string | null
          description: string | null
          doc_type_id: string | null
          expiry_date: string | null
          file_url: string | null
          id: string
          metadata: Json | null
          org_id: string | null
          status: string | null
          title: string
          vendor_request_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          current_version?: number | null
          deleted_at?: string | null
          description?: string | null
          doc_type_id?: string | null
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          org_id?: string | null
          status?: string | null
          title: string
          vendor_request_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          current_version?: number | null
          deleted_at?: string | null
          description?: string | null
          doc_type_id?: string | null
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          org_id?: string | null
          status?: string | null
          title?: string
          vendor_request_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_doc_type_id_fkey"
            columns: ["doc_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string | null
          currency: string | null
          discrepancies: Json | null
          id: string
          invoice_number: string
          metadata: Json | null
          org_id: string
          po_number: string | null
          status: string | null
          validated_at: string | null
          validation_result: Json | null
          validation_status: string | null
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          discrepancies?: Json | null
          id?: string
          invoice_number: string
          metadata?: Json | null
          org_id: string
          po_number?: string | null
          status?: string | null
          validated_at?: string | null
          validation_result?: Json | null
          validation_status?: string | null
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          discrepancies?: Json | null
          id?: string
          invoice_number?: string
          metadata?: Json | null
          org_id?: string
          po_number?: string | null
          status?: string | null
          validated_at?: string | null
          validation_result?: Json | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      legajos: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          org_id: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          org_id?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          org_id?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          alert_documentos_vencidos: boolean | null
          alert_vencimientos_criticos: boolean | null
          alert_vencimientos_proximos: boolean | null
          created_at: string | null
          id: string
          org_id: string
          schedule_days: number[] | null
          updated_at: string | null
        }
        Insert: {
          alert_documentos_vencidos?: boolean | null
          alert_vencimientos_criticos?: boolean | null
          alert_vencimientos_proximos?: boolean | null
          created_at?: string | null
          id?: string
          org_id: string
          schedule_days?: number[] | null
          updated_at?: string | null
        }
        Update: {
          alert_documentos_vencidos?: boolean | null
          alert_vencimientos_criticos?: boolean | null
          alert_vencimientos_proximos?: boolean | null
          created_at?: string | null
          id?: string
          org_id?: string
          schedule_days?: number[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          metadata: Json | null
          org_id: string
          severity: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          metadata?: Json | null
          org_id: string
          severity?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          metadata?: Json | null
          org_id?: string
          severity?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string | null
          updated_at: string | null
          is_vendor: boolean | null
          parent_org_id: string | null
          contact_email: string | null
          tax_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
          is_vendor?: boolean | null
          parent_org_id?: string | null
          contact_email?: string | null
          tax_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
          is_vendor?: boolean | null
          parent_org_id?: string | null
          contact_email?: string | null
          tax_id?: string | null
        }
        Relationships: []
      }
      personnel: {
        Row: {
          cuil: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          org_id: string | null
          status: string | null
        }
        Insert: {
          cuil?: string | null
          first_name?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          org_id?: string | null
          status?: string | null
        }
        Update: {
          cuil?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          org_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personnel_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      personnel_docs: {
        Row: {
          document_id: string | null
          expiry_date: string | null
          id: string
          personnel_id: string | null
          status: string | null
        }
        Insert: {
          document_id?: string | null
          expiry_date?: string | null
          id: string
          personnel_id?: string | null
          status?: string | null
        }
        Update: {
          document_id?: string | null
          expiry_date?: string | null
          id?: string
          personnel_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personnel_docs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personnel_docs_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          org_id: string | null
          permissions: Json | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          org_id?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          org_id?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_logs: {
        Row: {
          answer: string
          created_at: string | null
          documents_used: string[] | null
          id: string
          org_id: string
          provider_used: string | null
          question: string
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          documents_used?: string[] | null
          id?: string
          org_id: string
          provider_used?: string | null
          question: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          documents_used?: string[] | null
          id?: string
          org_id?: string
          provider_used?: string | null
          question?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_score_history: {
        Row: {
          docs_score: number
          id: string
          legajos_score: number
          org_id: string
          personal_score: number
          recorded_at: string
          score: number
        }
        Insert: {
          docs_score: number
          id?: string
          legajos_score: number
          org_id: string
          personal_score: number
          recorded_at?: string
          score: number
        }
        Update: {
          docs_score?: number
          id?: string
          legajos_score?: number
          org_id?: string
          personal_score?: number
          recorded_at?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_score_history_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_reports: {
        Row: {
          created_at: string | null
          cron_expression: string
          filters: Json
          format: string
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          name: string
          org_id: string
          recipients: Json
        }
        Insert: {
          created_at?: string | null
          cron_expression: string
          filters: Json
          format: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          name: string
          org_id: string
          recipients: Json
        }
        Update: {
          created_at?: string | null
          cron_expression?: string
          filters?: Json
          format?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          name?: string
          org_id?: string
          recipients?: Json
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_docs: {
        Row: {
          document_id: string | null
          expiry_date: string | null
          id: string
          status: string | null
          vehicle_id: string | null
        }
        Insert: {
          document_id?: string | null
          expiry_date?: string | null
          id: string
          status?: string | null
          vehicle_id?: string | null
        }
        Update: {
          document_id?: string | null
          expiry_date?: string | null
          id?: string
          status?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_docs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_docs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string | null
          id: string
          license_plate: string | null
          model: string | null
          org_id: string | null
          status: string | null
          type: string | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          id: string
          license_plate?: string | null
          model?: string | null
          org_id?: string | null
          status?: string | null
          type?: string | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          id?: string
          license_plate?: string | null
          model?: string | null
          org_id?: string | null
          status?: string | null
          type?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_queue: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          last_attempt_at: string | null
          max_retries: number | null
          next_retry_at: string | null
          org_id: string
          payload: Json
          retries: number | null
          status: string | null
          target_url: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          last_attempt_at?: string | null
          max_retries?: number | null
          next_retry_at?: string | null
          org_id: string
          payload: Json
          retries?: number | null
          status?: string | null
          target_url: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          last_attempt_at?: string | null
          max_retries?: number | null
          next_retry_at?: string | null
          org_id?: string
          payload?: Json
          retries?: number | null
          status?: string | null
          target_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_queue_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          actions: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          trigger_event: string
          trigger_filters: Json | null
        }
        Insert: {
          actions: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          trigger_event: string
          trigger_filters?: Json | null
        }
        Update: {
          actions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          trigger_event?: string
          trigger_filters?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_document_requests: {
        Row: {
          client_org_id: string | null
          created_at: string | null
          doc_type_id: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          updated_at: string | null
          vendor_org_id: string | null
          org_id: string | null
          document_type: string | null
        }
        Insert: {
          client_org_id?: string | null
          created_at?: string | null
          doc_type_id?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          updated_at?: string | null
          vendor_org_id?: string | null
          org_id?: string | null
          document_type?: string | null
        }
        Update: {
          client_org_id?: string | null
          created_at?: string | null
          doc_type_id?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          updated_at?: string | null
          vendor_org_id?: string | null
          org_id?: string | null
          document_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_document_requests_client_org_id_fkey"
            columns: ["client_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_document_requests_doc_type_id_fkey"
            columns: ["doc_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_document_requests_vendor_org_id_fkey"
            columns: ["vendor_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_risk_snapshots: {
        Row: {
          captured_at: string | null
          id: string
          org_id: string
          risk_level: string
          score: number
        }
        Insert: {
          captured_at?: string | null
          id?: string
          org_id: string
          risk_level: string
          score: number
        }
        Update: {
          captured_at?: string | null
          id?: string
          org_id?: string
          risk_level?: string
          score?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_document_chunks: {
        Args: {
          match_count: number
          match_threshold: number
          p_org_id: string
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
          version_id: string
        }[]
      }
      match_document_chunks_hybrid: {
        Args: {
          match_count: number
          match_threshold: number
          p_org_id: string
          query_embedding: string
          query_text: string
        }
        Returns: {
          content: string
          document_id: string
          id: string
          metadata: Json
          similarity: number
          text_rank: number
          version_id: string
        }[]
      }
      restore_document_version: {
        Args: { p_document_id: string; p_target_version: number }
        Returns: string
      }
      process_full_compliance_automation_v3: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
