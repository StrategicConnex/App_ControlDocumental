'use client';

import React from 'react';
import { 
  Upload, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface VendorDashboardProps {
  orgName: string;
  requests: any[];
  summary: {
    approved: number;
    pending: number;
    expired: number;
    total: number;
  };
}

export default function VendorDashboard({ orgName, requests, summary }: VendorDashboardProps) {
  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Portal de Proveedores</h1>
          <p className="text-gray-500 mt-1">Bienvenido, {orgName}. Gestiona tu documentación de cumplimiento aquí.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/documents/upload">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20">
              <Upload size={18} className="mr-2" /> Subir Documento
            </Button>
          </Link>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Documentos" 
          value={summary.total} 
          icon={<FileText className="text-blue-600" />}
          color="blue"
        />
        <SummaryCard 
          title="Aprobados" 
          value={summary.approved} 
          icon={<CheckCircle2 className="text-emerald-600" />}
          color="emerald"
        />
        <SummaryCard 
          title="Pendientes" 
          value={summary.pending} 
          icon={<Clock className="text-amber-600" />}
          color="amber"
        />
        <SummaryCard 
          title="Vencidos" 
          value={summary.expired} 
          icon={<AlertCircle className="text-rose-600" />}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Requests */}
        <div className="lg:col-span-2">
          <Card className="rounded-[2.5rem] card-shadow border-gray-100 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock size={20} className="text-indigo-600" /> Solicitudes Pendientes
              </CardTitle>
              <p className="text-sm text-gray-500">Documentos requeridos por tus clientes.</p>
            </CardHeader>
            <CardContent className="p-0">
              {requests.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="font-bold text-gray-900">¡Todo al día!</h4>
                  <p className="text-sm text-gray-500">No tienes solicitudes pendientes en este momento.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {requests.map((req) => (
                    <div key={req.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex gap-4 items-start">
                        <div className="mt-1 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900">{req.document_type?.name}</h5>
                          <p className="text-xs text-gray-500 mt-0.5">Solicitado por: <span className="font-semibold">{req.client?.name}</span></p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              {req.frequency}
                            </span>
                            {req.is_required && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full">
                                Requerido
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link href={`/documents/new?request=${req.id}`}>
                        <Button variant="ghost" className="text-indigo-600 font-bold group">
                          Subir <ArrowUpRight size={16} className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <div className="space-y-6">
          <Card className="rounded-[2.5rem] bg-indigo-900 text-white p-8 border-none overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-4">Estado de Acreditación</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl font-bold">{Math.round((summary.approved / (summary.total || 1)) * 100)}%</div>
                <div className="text-xs text-indigo-200">De cumplimiento global con tus clientes.</div>
              </div>
              <p className="text-sm text-indigo-100 mb-6 leading-relaxed">
                Mantener tus documentos al día te permite operar sin interrupciones en los yacimientos.
              </p>
              <Button className="w-full bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-xl">
                Ver Guía de Cumplimiento
              </Button>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }: any) {
  const bgMap: any = {
    blue: 'bg-blue-50 border-blue-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    amber: 'bg-amber-50 border-amber-100',
    rose: 'bg-rose-50 border-rose-100',
  };

  return (
    <Card className={`rounded-[2rem] border-2 ${bgMap[color]} card-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            {icon}
          </div>
          <span className="text-xs font-bold text-gray-400">En tiempo real</span>
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
      </CardContent>
    </Card>
  );
}
