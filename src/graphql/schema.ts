import { createSchema } from 'graphql-yoga';

export const typeDefs = /* GraphQL */ `
  type Organization {
    id: ID!
    name: String!
    slug: String!
    logo_url: String
    is_vendor: Boolean
    created_at: String
  }

  type Profile {
    id: ID!
    org_id: ID
    email: String
    first_name: String
    last_name: String
    full_name: String
    role: String
    created_at: String
  }

  type Document {
    id: ID!
    org_id: ID!
    doc_type_id: ID
    title: String!
    code: String
    category: String
    description: String
    file_url: String
    status: String
    expiry_date: String
    current_version: Int
    created_by: ID
    created_at: String
    versions: [DocumentVersion]
  }

  type DocumentVersion {
    id: ID!
    document_id: ID!
    version_number: Int!
    version_label: String
    file_url: String
    change_description: String
    created_at: String
  }

  type Personnel {
    id: ID!
    org_id: ID!
    first_name: String
    last_name: String
    cuil: String
    job_title: String
    status: String
    created_at: String
  }

  type Vehicle {
    id: ID!
    org_id: ID!
    license_plate: String
    type: String
    brand: String
    model: String
    year: Int
    status: String
    created_at: String
  }

  type Invoice {
    id: ID!
    org_id: ID!
    document_id: ID
    po_id: ID
    invoice_number: String
    amount_total: Float
    ai_validation_score: Int
    ai_discrepancy_notes: String
    status: String
    created_at: String
  }

  type PurchaseOrder {
    id: ID!
    org_id: ID!
    po_number: String!
    supplier_name: String
    total_amount: Float
    status: String
    created_at: String
  }

  type AuditLog {
    id: ID!
    org_id: ID!
    user_id: ID
    action: String!
    entity_type: String!
    entity_id: ID!
    old_data: String
    new_data: String
    created_at: String
  }

  type ComplianceMetrics {
    total_documents: Int
    expired_documents: Int
    pending_approvals: Int
    risk_score: Float
  }

  type Query {
    me: Profile
    organization: Organization
    documents(startDate: String, endDate: String, status: String, category: String, search: String): [Document]
    document(id: ID!): Document
    personnel(status: String, search: String): [Personnel]
    vehicles(status: String, search: String): [Vehicle]
    invoices(startDate: String, endDate: String, status: String): [Invoice]
    purchaseOrders: [PurchaseOrder]
    auditLogs(startDate: String, endDate: String, action: String, search: String): [AuditLog]
    complianceMetrics: ComplianceMetrics
  }

  type Mutation {
    updateDocumentStatus(id: ID!, status: String!): Document
    logExport(reportType: String!, format: String!, filters: String!, mode: String!): Boolean
  }
`;
