'use client';

import { useState } from 'react';
import { 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  ShieldCheck, 
  History,
  TrendingUp,
  ExternalLink,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InvoiceValidator() {
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Mock data for demo
  const invoices = [
    { id: '1', number: 'INV-2024-001', vendor: 'TechServices S.A.', amount: 15400.50, status: 'pendiente', po: 'PO-9921' },
    { id: '2', number: 'FAC-8829-X', vendor: 'Logistics Pro', amount: 8200.00, status: 'aprobada', po: 'PO-1102' },
    { id: '3', number: '2024-QX-11', vendor: 'Energy Solutions', amount: 45000.00, status: 'observada', po: 'PO-5542' },
  ];

  const handleValidate = async (id: string) => {
    setSelectedInvoice(id);
    setIsValidating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsValidating(false);
      setValidationResult({
        score: id === '3' ? 45 : 98,
        isValid: id !== '3',
        observations: id === '3' 
          ? ['Monto supera el límite contractual del 15%.', 'El número de PO no coincide con el registro en SAP.', 'Falta firma digital del responsable de obra.']
          : ['Todos los campos coinciden con el contrato marco.', 'PO validada correctamente.'],
        mismatches: id === '3' ? [
          { field: 'Monto Total', invoice: '45,000.00', contract: '38,000.00', severity: 'high' },
          { field: 'Orden de Compra', invoice: 'PO-5542', contract: 'PO-5540', severity: 'medium' }
        ] : []
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoría de Facturas IA</h1>
          <p className="text-sm text-gray-500 mt-1">Validación automática contra contratos y órdenes de compra (PO).</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
          <Zap size={16} className="animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">Motor DeepSeek Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Invoice List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-700">Facturas Pendientes</h2>
              <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
            </div>
            <div className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <div 
                  key={inv.id} 
                  onClick={() => !isValidating && handleValidate(inv.id)}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:bg-purple-50/30 group",
                    selectedInvoice === inv.id && "bg-purple-50 ring-1 ring-inset ring-purple-100"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-400 group-hover:text-purple-400">{inv.number}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                      inv.status === 'aprobada' ? "bg-emerald-100 text-emerald-600" :
                      inv.status === 'observada' ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-600"
                    )}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{inv.vendor}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-gray-900">${inv.amount.toLocaleString()}</span>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Search size={10} />
                      <span>{inv.po}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-xl shadow-indigo-600/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs opacity-80 font-medium">Cumplimiento Auditoría</p>
                <p className="text-xl font-bold">92.4%</p>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed opacity-70">
              El motor de IA ha procesado 124 facturas este mes, detectando 12 discrepancias críticas que ahorraron un estimado de $14,200.
            </p>
          </div>
        </div>

        {/* Right: Validation Details */}
        <div className="lg:col-span-2">
          {isValidating ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm h-[500px] flex flex-col items-center justify-center p-12 text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                <Zap size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-6">Validando con Inteligencia Artificial</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">
                Estamos analizando el documento contra el contrato marco, verificando montos, fechas y cruzando el número de PO con el sistema central...
              </p>
            </div>
          ) : validationResult ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              {/* Result Header */}
              <div className={cn(
                "p-6 text-white flex items-center justify-between",
                validationResult.isValid ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-gradient-to-r from-rose-500 to-orange-600"
              )}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    {validationResult.isValid ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {validationResult.isValid ? 'Factura Validada Correctamente' : 'Discrepancias Detectadas'}
                    </h2>
                    <p className="text-sm opacity-90">
                      Score de Confianza: <span className="font-bold">{validationResult.score}%</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Fecha Auditoría</p>
                  <p className="font-mono text-sm">28-04-2026 13:45</p>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Observations */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <TrendingUp size={16} className="text-purple-600" />
                      Análisis de Riesgo IA
                    </h3>
                    <div className="space-y-3">
                      {validationResult.observations.map((obs: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                            validationResult.isValid ? "bg-emerald-500" : "bg-rose-500"
                          )} />
                          <p className="text-xs text-gray-700 leading-relaxed">{obs}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mismatches Table */}
                {validationResult.mismatches.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <History size={16} className="text-rose-500" />
                      Inconsistencias
                    </h3>
                    <div className="border border-rose-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-rose-50 text-rose-700 font-bold">
                          <tr>
                            <th className="px-4 py-3">Campo</th>
                            <th className="px-4 py-3">Factura</th>
                            <th className="px-4 py-3">Contrato</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rose-50 bg-rose-50/20">
                          {validationResult.mismatches.map((m: any, i: number) => (
                            <tr key={i}>
                              <td className="px-4 py-3 font-semibold text-gray-700">{m.field}</td>
                              <td className="px-4 py-3 text-rose-600 font-bold">{m.invoice}</td>
                              <td className="px-4 py-3 text-gray-500">{m.contract}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white transition-colors">
                  Ignorar y Archivar
                </button>
                <button className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2",
                  validationResult.isValid ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                )}>
                  {validationResult.isValid ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  {validationResult.isValid ? 'Aprobar Pago' : 'Notificar Proveedor'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-gray-200 h-[500px] flex flex-col items-center justify-center p-12 text-center group hover:border-purple-300 transition-colors">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileCheck size={32} className="text-gray-300 group-hover:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                Selecciona una factura para auditar
              </h3>
              <p className="text-sm text-gray-400 mt-2 max-w-xs">
                El asistente cruzará automáticamente los datos del documento con los contratos firmados y POs en el sistema.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
