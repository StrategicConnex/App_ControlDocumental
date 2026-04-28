import { createClient } from "@/utils/supabase/server";
import { Settings, User, Building2, Shield, Bell, Key } from "lucide-react";

export const metadata = {
  title: "Configuración | Strategic Connex",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500">Administra tu cuenta, organización y preferencias del sistema.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile */}
        <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900">Perfil de Usuario</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 font-mono">
                {user?.email ?? "—"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ID de Usuario</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-400 font-mono truncate">
                {user?.id ?? "—"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Último acceso</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700">
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString("es-AR")
                  : "—"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cuenta creada</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("es-AR")
                  : "—"}
              </div>
            </div>
          </div>
        </section>

        {/* Organisation */}
        <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <Building2 size={18} className="text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">Organización</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</label>
              <input
                type="text"
                defaultValue="Strategic Connex"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CUIT</label>
              <input
                type="text"
                placeholder="30-XXXXXXXX-X"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md">
              Guardar Cambios
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Bell size={18} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-900">Notificaciones</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Alertas de documentos vencidos", desc: "Recibir email cuando un documento vence" },
              { label: "Alertas de personal bloqueado", desc: "Notificación cuando un empleado pierde acreditación" },
              { label: "Alertas de flota inhabilitada", desc: "Notificación cuando un vehículo pierde habilitación" },
              { label: "Resumen semanal", desc: "Email con métricas del sistema cada lunes" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-rose-600" />
            </div>
            <h3 className="font-bold text-gray-900">Seguridad</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 text-left transition-colors group">
              <Key size={18} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Cambiar Contraseña</p>
                <p className="text-xs text-gray-400">Actualizar credenciales de acceso</p>
              </div>
            </button>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs font-semibold text-amber-700">
                🔒 La plataforma usa autenticación segura a través de Supabase Auth con encriptación de extremo a extremo.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
