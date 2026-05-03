'use client';

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Printer, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ReportContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  data?: any[];
  filters?: any;
  onExportExcel?: (mode: 'vista' | 'compliance') => void;
  onExportCSV?: () => void;
}

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

export const ReportContainer: React.FC<ReportContainerProps> = ({
  title,
  description,
  children,
  data,
  filters,
  onExportExcel,
  onExportCSV
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: title,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-slate-200" onClick={() => handlePrint()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Download className="mr-2 h-4 w-4" />
                Exportar
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Formato Excel (.xlsx)</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onExportExcel?.('vista')}>
                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                Modo Vista Actual
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportExcel?.('compliance')}>
                <FileText className="mr-2 h-4 w-4 text-emerald-500" />
                Modo Completo (Compliance)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Otros Formatos</DropdownMenuLabel>
              <DropdownMenuItem onClick={onExportCSV}>
                <FileText className="mr-2 h-4 w-4 text-slate-500" />
                Exportar CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl ring-1 ring-slate-200">
        <CardContent className="p-0" ref={contentRef}>
          <div className="p-8 print:p-0">
            {/* Report Header for Print */}
            <div className="hidden print:block mb-8 border-b border-slate-200 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-1">{title}</h1>
                  <p className="text-sm text-slate-500">
                    Generado el: {new Date().toLocaleDateString('es-AR')} {new Date().toLocaleTimeString('es-AR')}
                  </p>
                  {filters && Object.keys(filters).length > 0 && (
                    <p className="text-xs text-slate-400 mt-2 italic">
                      Filtros: {Object.entries(filters).map(([k, v]) => `${k}=${v}`).join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-indigo-900 tracking-tighter italic">STRATEGIC CONNEX</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">DMS Enterprise Platform</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase">ISO 9001:2015 Compliance Audit</p>
                </div>
              </div>
            </div>
            
            <div className="min-h-[400px]">
              {children}
            </div>

            {/* Report Footer for Print */}
            <div className="hidden print:block mt-12 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <p>Este documento es confidencial y propiedad exclusiva de la organización emisora.</p>
                <p>Página 1 de 1</p>
              </div>
              <div className="mt-4 flex justify-center">
                <div className="px-4 py-1 border border-slate-200 rounded text-[9px] text-slate-300 uppercase tracking-tighter">
                  Documento validado por auditoría interna - SC Platform v2.0
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
