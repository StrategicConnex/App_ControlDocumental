import Sidebar from "@/components/layout/Sidebar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { createClient } from "@/utils/supabase/server";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { SidebarProvider } from "@/components/layout/SidebarProvider";
import { SidebarTrigger } from "@/components/layout/SidebarTrigger";

import { CommandMenu } from "@/components/layout/CommandMenu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
          <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mr-4">
                <span className="hidden xs:inline">Control Documental</span>
                <span className="w-1 h-1 bg-border rounded-full hidden xs:inline" />
                <span className="text-foreground font-bold tracking-tight">Command Console</span>
              </div>
              <div className="hidden md:block">
                <CommandMenu />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
        <AIAssistant orgId={orgId || ''} />
      </div>
    </SidebarProvider>
  );
}
