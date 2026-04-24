import { createClient } from "@/utils/supabase/server";
import { getVehicleById } from "@/lib/services/vehicles";
import { ArrowLeft, Truck, FileText, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Ficha de Vehículo | BordUp",
};

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  let vehicle: any = null;
  try {
    vehicle = await getVehicleById(supabase, params.id);
  } catch (e) {
    console.error("Error fetching vehicle details", e);
  }

  if (!vehicle) {
    return <div className="p-8 text-center">Vehículo no encontrado.</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprobado':
      case 'vigente': return <CheckCircle className="text-emerald-500" size={20} />;
      case 'por_vencer': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'vencido':
      case 'bloqueado': return <XCircle className="text-rose-500" size={20} />;
      default: return <FileText className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/vehicles" className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm",
              vehicle.status === 'vencido' || vehicle.status === 'bloqueado' ? "bg-rose-100 text-rose-700" :
              vehicle.status === 'por_vencer' ? "bg-amber-100 text-amber-700" :
              "bg-emerald-100 text-emerald-700"
            )}>
              <Truck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 font-mono tracking-wider">{vehicle.license_plate}</h1>
              </div>
              <p className="text-sm text-gray-500">{vehicle.brand} {vehicle.model} • {vehicle.type}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck size={18} className="text-purple-600" /> Información del Vehículo
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Estado de Habilitación</p>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusIcon(vehicle.status)}
                  <span className="font-medium capitalize">{vehicle.status === 'aprobado' || vehicle.status === 'vigente' ? 'Habilitado' : vehicle.status}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Año</p>
                <p className="text-sm font-medium">{vehicle.year || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Categoría</p>
                <p className="text-sm font-medium">{vehicle.type}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText size={18} className="text-purple-600" /> Documentación Requerida
            </h3>
            
            <div className="space-y-4">
              {vehicle.vehicle_docs?.length > 0 ? (
                vehicle.vehicle_docs.map((vdoc: any) => (
                  <div key={vdoc.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(vdoc.status || vdoc.documents?.status)}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {vdoc.documents?.title || 'Documento Referenciado'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Vencimiento: {vdoc.expiry_date ? new Date(vdoc.expiry_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Link href={`/documents/${vdoc.document_id}`} className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                      Ver Documento
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay documentos asociados a este vehículo.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
