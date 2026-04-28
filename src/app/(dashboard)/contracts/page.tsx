import { FileText, Plus, Search, Filter } from 'lucide-react';

export default function ContractsPage() {
  const contracts = [
    { id: '1', number: 'CONT-2026-001', vendor: 'Servicios Petroleros del Sur', status: 'Vigente', end: '2027-12-31', value: '$1.2M' },
    { id: '2', number: 'MRO-882-2024', vendor: 'Mantenimiento Industrial S.A.', status: 'Por Vencer', end: '2026-06-15', value: '$450K' },
    { id: '3', number: 'LEGAL-XP-99', vendor: 'Estudio Jurídico & Asociados', status: 'Vigente', end: '2028-01-20', value: '$85K' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Contratos</h1>
          <p className="text-sm text-gray-500 mt-1">Control de contratos marco, vigencias y cumplimiento contractual.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
          <Plus size={18} />
          Nuevo Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por número, proveedor o palabra clave..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
          <Filter size={18} />
          Filtros
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Número</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vencimiento</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {contracts.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                      <FileText size={16} />
                    </div>
                    <span className="text-sm font-bold text-gray-900">{c.number}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.vendor}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    c.status === 'Vigente' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{c.end}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{c.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
