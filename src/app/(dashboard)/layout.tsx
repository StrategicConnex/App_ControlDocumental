import Sidebar from "@/components/layout/Sidebar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { createClient } from "@/utils/supabase/server";
import { NotificationBell } from "@/components/layout/NotificationBell";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let orgId = '';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();
    orgId = profile?.org_id || '';
  }

  return (
    <div className="flex min-h-screen bg-[#FDFDFF]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <span>Control Documental</span>
            <span className="w-1 h-1 bg-gray-200 rounded-full" />
            <span className="text-gray-900 font-bold tracking-tight">Industrial Command Console</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 font-bold text-xs">
              {user?.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
      <AIAssistant orgId={orgId} />
    </div>
  );
}
