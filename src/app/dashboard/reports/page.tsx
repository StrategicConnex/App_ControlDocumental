'use client';

import React, { useState, Suspense } from 'react';
import { ReportContainer } from '@/components/reports/ReportContainer';
import { ComplianceReport } from '@/components/reports/ComplianceReport';
import { FinancialReport } from '@/components/reports/FinancialReport';
import { PersonnelReport } from '@/components/reports/PersonnelReport';
import { VehicleReport } from '@/components/reports/VehicleReport';
import { AuditReport } from '@/components/reports/AuditReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, TrendingUp, Users, Truck, History } from 'lucide-react';

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ReportsContent />
    </Suspense>
  );
}

function ReportsContent() {
  const [activeTab, setActiveTab] = useState('compliance');

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Tabs defaultValue="compliance" onValueChange={setActiveTab} className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-sm p-2 rounded-xl border shadow-sm sticky top-4 z-20">
          <TabsList className="bg-transparent border-none">
            <TabsTrigger value="compliance" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 gap-2 font-bold transition-all">
              <ShieldCheck className="h-4 w-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 gap-2 font-bold transition-all">
              <TrendingUp className="h-4 w-4" />
              Financiero
            </TabsTrigger>
            <TabsTrigger value="personnel" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 gap-2 font-bold transition-all">
              <Users className="h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 gap-2 font-bold transition-all">
              <Truck className="h-4 w-4" />
              Vehículos
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 gap-2 font-bold transition-all">
              <History className="h-4 w-4" />
              Auditoría
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="compliance" className="mt-0 outline-none">
          <ComplianceReport />
        </TabsContent>
        
        <TabsContent value="financial" className="mt-0 outline-none">
          <FinancialReport />
        </TabsContent>

        <TabsContent value="personnel" className="mt-0 outline-none">
          <PersonnelReport />
        </TabsContent>

        <TabsContent value="vehicles" className="mt-0 outline-none">
          <VehicleReport />
        </TabsContent>

        <TabsContent value="audit" className="mt-0 outline-none">
          <AuditReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
