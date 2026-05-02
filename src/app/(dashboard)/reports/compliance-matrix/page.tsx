'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Minus,
  FileSearch,
  Download,
  Filter,
  Users,
  FileText
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getComplianceMatrix } from '@/lib/services/vendors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ComplianceMatrixPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getComplianceMatrix(supabase);
        setData(result);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar la matriz de cumplimiento');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const generatePDF = () => {
    if (!data) return;
    const { vendors, docTypes, matrix } = data;

    const doc = new jsPDF('landscape');
    const today = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(63, 63, 191); // Indigo-600
    doc.text('Strategic Connex - Matriz de Cumplimiento', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de generación: ${today}`, 14, 28);
    doc.text('Estado documental consolidado de proveedores', 14, 33);

    // Prepare table data
    const head = [['Proveedor', ...docTypes]];
    const body = vendors.map((v: any) => {
      const row = [v.name];
      docTypes.forEach((dt: string) => {
        const cell = matrix[v.id][dt];
        let statusText = '';
        switch (cell.status) {
          case 'APROBADO':
          case 'VIGENTE': statusText = '[OK] Al día'; break;
          case 'VENCIDO':
          case 'EXPIRED': statusText = '[!] Vencido'; break;
          case 'PENDING': statusText = '[...] Pendiente'; break;
          case 'MISSING': statusText = '[X] Faltante'; break;
          case 'NOT_REQUIRED': statusText = 'N/A'; break;
          default: statusText = cell.status;
        }
        if (cell.expiryDate) {
          statusText += `\n(${new Date(cell.expiryDate).toLocaleDateString()})`;
        }
        row.push(statusText);
      });
      return row;
    });

    autoTable(doc, {
      startY: 40,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { 
        fillColor: [63, 63, 191], // Indigo-600
        textColor: 255, 
        fontSize: 8, 
        halign: 'center' 
      },
      bodyStyles: { fontSize: 7, valign: 'middle' },
      columnStyles: {
        0: { fontStyle: 'bold', minCellWidth: 40 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index > 0) {
          const text = data.cell.text[0] || '';
          if (text.includes('[OK]')) data.cell.styles.textColor = [16, 185, 129]; // Emerald-600
          if (text.includes('[!]')) data.cell.styles.textColor = [245, 158, 11]; // Amber-600
          if (text.includes('[X]')) data.cell.styles.textColor = [225, 29, 72]; // Rose-600
          if (text === 'N/A') data.cell.styles.textColor = [156, 163, 175]; // Gray-400
        }
      }
    });

    doc.save(`Matriz_Cumplimiento_${today.replace(/\//g, '-')}.pdf`);
    toast.success('Reporte PDF generado con éxito');
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APROBADO':
      case 'VIGENTE':
        return { 
          icon: <CheckCircle2 className="text-emerald-500" size={18} />, 
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          label: 'Al día' 
        };
      case 'VENCIDO':
      case 'EXPIRED':
        return { 
          icon: <XCircle className="text-rose-500" size={18} />, 
          bg: 'bg-rose-50',
          border: 'border-rose-100',
          label: 'Vencido' 
        };
      case 'PENDING':
        return { 
          icon: <Clock className="text-amber-500" size={18} />, 
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          label: 'Pendiente' 
        };
      case 'MISSING':
        return { 
          icon: <AlertTriangle className="text-gray-400" size={18} />, 
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          label: 'Faltante' 
        };
      case 'NOT_REQUIRED':
        return { 
          icon: <Minus className="text-gray-200" size={16} />, 
          bg: 'bg-transparent',
          border: 'border-transparent',
          label: 'N/A' 
        };
      default:
        return { 
          icon: <Clock className="text-gray-400" size={18} />, 
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          label: status 
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Clock className="animate-spin text-indigo-600" size={40} />
        <p className="text-gray-500 font-medium">Generando matriz de cumplimiento...</p>
      </div>
    );
  }

  const { vendors, docTypes, matrix } = data || { vendors: [], docTypes: [], matrix: {} };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <FileSearch className="text-indigo-600" /> Matriz de Cumplimiento
          </h1>
          <p className="text-gray-500 mt-1">Vista consolidada del estado documental de todos los proveedores.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="rounded-xl border-gray-200 text-gray-600 hover:text-indigo-600"
            onClick={generatePDF}
          >
            <Download size={18} className="mr-2" /> Exportar PDF
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200">
            <Filter size={18} className="mr-2" /> Filtrar Vista
          </Button>
        </div>
      </header>

      {vendors.length === 0 ? (
        <Card className="rounded-[2.5rem] border-dashed p-20 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No hay proveedores registrados</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            Una vez que des de alta proveedores y les asignes requerimientos, aparecerán aquí.
          </p>
        </Card>
      ) : (
        <Card className="rounded-[2.5rem] border-gray-100 overflow-hidden card-shadow bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="p-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest sticky left-0 bg-gray-50 z-10 w-[250px]">
                      Proveedor
                    </th>
                    {docTypes.map((dt: string) => (
                      <th key={dt} className="p-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider min-w-[120px] border-l border-gray-100">
                        {dt}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v: any) => (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                      <td className="p-6 font-bold text-gray-700 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-100">
                        {v.name}
                      </td>
                      {docTypes.map((dt: string) => {
                        const cell = matrix[v.id][dt];
                        const config = getStatusConfig(cell.status);
                        
                        return (
                          <td key={dt} className="p-4 text-center border-l border-gray-50">
                            <div className={cn(
                              "flex flex-col items-center justify-center p-2 rounded-xl transition-all border group relative",
                              config.bg,
                              config.border
                            )}>
                              {config.icon}
                              {cell.expiryDate && (
                                <span className="text-[9px] font-bold text-gray-400 mt-1">
                                  {new Date(cell.expiryDate).toLocaleDateString()}
                                </span>
                              )}
                              
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                                {config.label}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 p-6 bg-white rounded-2xl border border-gray-100 card-shadow">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Leyenda:</span>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="text-xs font-medium text-gray-600">Al día</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-500" />
          <span className="text-xs font-medium text-gray-600">Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle size={16} className="text-rose-500" />
          <span className="text-xs font-medium text-gray-600">Vencido / Rechazado</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-600">Faltante</span>
        </div>
      </div>
    </div>
  );
}

