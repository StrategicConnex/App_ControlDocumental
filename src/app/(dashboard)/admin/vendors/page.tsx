'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  ExternalLink, 
  MoreVertical,
  ShieldCheck,
  AlertCircle,
  Clock,
  Filter
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  createVendor, 
  assignDocumentToVendor,
  getVendorComplianceSummary 
} from '@/lib/services/vendors';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export default function VendorsAdminPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState('');
  
  // New Vendor Form
  const [newVendor, setNewVendor] = useState({ name: '', tax_id: '', contact_email: '' });
  const [isNewVendorOpen, setIsNewVendorOpen] = useState(false);

  // Assign Document Form
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignData, setAssignData] = useState({ doc_type_id: '', frequency: 'ONCE' });

  const supabase = createClient();

  async function loadData() {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
    const orgId = profile?.org_id;

    if (orgId) {
      // Load Vendors
      const { data: vendorData } = await supabase
        .from('organizations')
        .select('*')
        .eq('parent_org_id', orgId)
        .eq('is_vendor', true);
      
      if (vendorData) {
        // Fetch compliance stats for each vendor
        const vendorsWithStats = await Promise.all(vendorData.map(async (v) => {
          const stats = await getVendorComplianceSummary(supabase, v.id);
          // Also get total requested documents
          const { count } = await supabase.from('vendor_document_requests').select('*', { count: 'exact', head: true }).eq('vendor_org_id', v.id);
          return { ...v, stats, requestedCount: count || 0 };
        }));
        setVendors(vendorsWithStats);
      }

      // Load Doc Types
      const { data: types } = await supabase.from('document_types').select('*').order('name');
      if (types) setDocTypes(types);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
      
      if (!profile?.org_id) {
        toast.error('No se encontró la organización asociada a tu perfil');
        return;
      }
      
      await createVendor(supabase, profile.org_id, newVendor);
      toast.success('Proveedor creado exitosamente');
      setIsNewVendorOpen(false);
      setNewVendor({ name: '', tax_id: '', contact_email: '' });
      loadData();
    } catch (error: any) {
      toast.error('Error al crear proveedor: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAssignDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || !assignData.doc_type_id) return;
    
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();

      if (!profile?.org_id) {
        toast.error('No se encontró la organización asociada a tu perfil');
        return;
      }

      await assignDocumentToVendor(
        supabase, 
        profile.org_id, 
        selectedVendor.id, 
        assignData.doc_type_id, 
        assignData.frequency as any
      );
      
      toast.success('Requerimiento asignado correctamente');
      setIsAssignOpen(false);
      loadData();
    } catch (error: any) {
      toast.error('Error al asignar documento: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.tax_id?.includes(search)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Proveedores</h1>
          <p className="text-gray-500 mt-1">Controla y audita la documentación de tus contratistas externos.</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isNewVendorOpen} onOpenChange={setIsNewVendorOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20">
                <Plus size={18} className="mr-2" /> Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Agregar Proveedor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateVendor} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Nombre de la Empresa</label>
                  <Input 
                    required
                    placeholder="Ej: Logística Express S.A." 
                    className="rounded-xl border-gray-200"
                    value={newVendor.name}
                    onChange={e => setNewVendor({...newVendor, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">CUIT / ID Fiscal</label>
                  <Input 
                    placeholder="Ej: 30-71234567-8" 
                    className="rounded-xl border-gray-200"
                    value={newVendor.tax_id}
                    onChange={e => setNewVendor({...newVendor, tax_id: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Email de Contacto</label>
                  <Input 
                    type="email"
                    placeholder="contacto@proveedor.com" 
                    className="rounded-xl border-gray-200"
                    value={newVendor.contact_email}
                    onChange={e => setNewVendor({...newVendor, contact_email: e.target.value})}
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={isCreating} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11">
                    {isCreating ? 'Guardando...' : 'Crear Proveedor'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Proveedores" value={vendors.length} icon={<Users className="text-indigo-600" />} />
        <StatCard title="Cumplimiento Promedio" value={
          vendors.length > 0 
            ? Math.round(vendors.reduce((acc, v) => acc + (v.stats?.total > 0 ? (v.stats.approved / v.requestedCount) * 100 : 0), 0) / vendors.length) + '%'
            : '0%'
        } icon={<ShieldCheck className="text-emerald-600" />} />
        <StatCard title="Documentos Pendientes" value={vendors.reduce((acc, v) => acc + (v.requestedCount - (v.stats?.approved || 0)), 0)} icon={<AlertCircle className="text-amber-600" />} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl card-shadow border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Buscar por nombre o CUIT..." 
            className="pl-10 rounded-xl border-gray-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} className="rounded-xl border-gray-200">
            <Clock size={16} className="mr-2" /> Actualizar
          </Button>
        </div>
      </div>

      {/* Vendor Grid */}
      {isLoading ? (
        <div className="flex justify-center p-20">
          <Clock className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="bg-white p-20 rounded-[2.5rem] text-center border border-dashed border-gray-200">
          <p className="text-gray-500">No se encontraron proveedores vinculados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="rounded-[2rem] card-shadow border-gray-100 hover:border-indigo-200 transition-all group">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                    {vendor.name.charAt(0)}
                  </div>
                  <Badge variant="outline" className={`rounded-lg ${
                    vendor.requestedCount > 0 && vendor.stats.approved === vendor.requestedCount
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {vendor.requestedCount > 0 && vendor.stats.approved === vendor.requestedCount ? 'Cumple' : 'Pendiente'}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">{vendor.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{vendor.tax_id || 'Sin CUIT'}</p>
                
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cumplimiento</span>
                    <span className="font-bold text-gray-700">{vendor.stats?.approved || 0} / {vendor.requestedCount}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${vendor.requestedCount > 0 ? (vendor.stats.approved / vendor.requestedCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setIsAssignOpen(true);
                    }}
                    className="rounded-xl border-gray-200 text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                  >
                    Asignar Pedidos
                  </Button>
                  <Button variant="ghost" className="rounded-xl text-indigo-600 text-xs font-bold">
                    Ver Legajo <ExternalLink size={12} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Document Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Asignar Requerimiento</DialogTitle>
            <p className="text-sm text-gray-500">Solicita un nuevo documento a {selectedVendor?.name}</p>
          </DialogHeader>
          <form onSubmit={handleAssignDocument} className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Tipo de Documento</label>
              <Select onValueChange={(val) => setAssignData({...assignData, doc_type_id: val})}>
                <SelectTrigger className="rounded-xl border-gray-200 h-11">
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {docTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Frecuencia de Renovación</label>
              <Select defaultValue="ONCE" onValueChange={(val) => setAssignData({...assignData, frequency: val})}>
                <SelectTrigger className="rounded-xl border-gray-200 h-11">
                  <SelectValue placeholder="Seleccionar frecuencia..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ONCE">Una sola vez</SelectItem>
                  <SelectItem value="MONTHLY">Mensual</SelectItem>
                  <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                  <SelectItem value="YEARLY">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-indigo-50 p-4 rounded-2xl flex gap-3 border border-indigo-100">
              <AlertCircle size={20} className="text-indigo-600 shrink-0" />
              <p className="text-xs text-indigo-800">
                El proveedor recibirá una notificación y verá este pedido en su panel principal para cargarlo.
              </p>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isCreating} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11">
                {isCreating ? 'Procesando...' : 'Confirmar Asignación'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


function StatCard({ title, value, icon }: any) {
  return (
    <Card className="rounded-[2rem] card-shadow border-gray-100">
      <CardContent className="p-8 flex items-center gap-6">
        <div className="p-4 bg-gray-50 rounded-2xl">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h4 className="text-3xl font-bold text-gray-900">{value}</h4>
        </div>
      </CardContent>
    </Card>
  );
}
