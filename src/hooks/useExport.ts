'use client';

import * as XLSX from 'xlsx';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';

const LOG_EXPORT = gql`
  mutation LogExport($reportType: String!, $format: String!, $filters: String!, $mode: String!) {
    logExport(reportType: $reportType, format: $format, filters: $filters, mode: $mode)
  }
`;

interface ExportOptions {
  data: any[];
  reportType: string;
  filename: string;
  filters: any;
  mode: 'vista' | 'compliance';
}

export function useExport() {
  const [logExport] = useMutation(LOG_EXPORT);

  const exportToExcel = async ({ data, reportType, filename, filters, mode }: ExportOptions) => {
    try {
      if (data.length > 10000) {
        toast.warning('El resultado excede los 10,000 registros. Por favor aplique filtros más restrictivos.');
        return;
      }

      // 1. Prepare Data
      const processedData = data.map(item => {
        // Exclude sensitive/technical fields
        const { id, org_id, organization_id, signature_hash, password, ...rest } = item;
        
        if (mode === 'vista') {
          // Additional filtering could be done here if we only want "table columns"
          // For now, we'll keep it simple as recommended
          return rest;
        }
        
        return rest;
      });

      // 2. Create Workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(processedData);
      
      // 3. Add Audit Sheet
      const auditData = [
        ['ESTRATEGIC CONNEX - REPORTE DE AUDITORÍA'],
        [''],
        ['Fecha de Generación:', new Date().toLocaleString()],
        ['Reporte:', reportType],
        ['Modo de Exportación:', mode === 'vista' ? 'Vista de Usuario' : 'Compliance Legal'],
        ['Filtros Aplicados:', JSON.stringify(filters)],
        ['Total Registros:', data.length],
        [''],
        ['CONFIDENCIALIDAD: Este documento contiene información sensible protegida por RLS.'],
      ];
      const wsAudit = XLSX.utils.aoa_to_sheet(auditData);
      
      XLSX.utils.book_append_sheet(wb, ws, 'Datos');
      XLSX.utils.book_append_sheet(wb, wsAudit, '_Auditoría');

      // 4. Download File
      XLSX.writeFile(wb, `${filename}_${mode}_${new Date().getTime()}.xlsx`);

      // 5. Log Action in Audit Log
      await logExport({
        variables: {
          reportType,
          format: 'XLSX',
          filters: JSON.stringify(filters),
          mode
        }
      });

      toast.success(`Reporte ${filename} exportado correctamente.`);
    } catch (error) {
      console.error('Export Error:', error);
      toast.error('Error al generar la exportación a Excel.');
    }
  };

  const exportToCSV = async ({ data, reportType, filename, filters, mode }: ExportOptions) => {
    try {
      if (data.length > 10000) {
        toast.warning('El resultado excede los 10,000 registros.');
        return;
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${filename}_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await logExport({
        variables: {
          reportType,
          format: 'CSV',
          filters: JSON.stringify(filters),
          mode
        }
      });

      toast.success('CSV generado correctamente.');
    } catch (error) {
      toast.error('Error al generar CSV.');
    }
  };

  return { exportToExcel, exportToCSV };
}
