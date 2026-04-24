import { Upload, FilePlus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Nuevo Documento | BordUp",
};

export default function NewDocumentPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/documents" className="hover:text-purple-600 transition-colors">Documentos</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Nuevo</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Cargar Documento</h1>
        <p className="text-sm text-gray-500">Agrega un nuevo archivo al repositorio central.</p>
      </header>

      <section className="bg-white p-8 rounded-[2rem] card-shadow border border-gray-100">
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-semibold text-gray-700">Título del Documento</label>
              <input 
                type="text" 
                placeholder="Ej: Manual de Procedimientos" 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-semibold text-gray-700">Código (opcional)</label>
              <input 
                type="text" 
                placeholder="Ej: ISO-9001-2026" 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Categoría</label>
            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
              <option value="ISO/Ingeniería">ISO/Ingeniería</option>
              <option value="Legajos">Legajos</option>
              <option value="Presupuestos">Presupuestos</option>
              <option value="Personal">Personal</option>
              <option value="Vehículos">Vehículos</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Archivo</label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-gray-50 hover:bg-purple-50/50 hover:border-purple-300 transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:text-purple-600 transition-colors">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">Haz clic o arrastra un archivo aquí</p>
                <p className="text-xs text-gray-500 mt-1">Soporta PDF, DOCX, DWG hasta 200MB.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <Link href="/documents" className="px-6 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
              Cancelar
            </Link>
            <button type="button" className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20">
              <FilePlus size={18} /> Crear Documento
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
