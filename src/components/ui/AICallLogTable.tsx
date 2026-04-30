'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Log {
  id: string;
  provider: string;
  model: string;
  success: boolean;
  response_time_ms: number;
  total_tokens: number;
  created_at: string;
  error_message?: string;
}

export default function AICallLogTable({ logs }: { logs: Log[] }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Proveedor</TableHead>
            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Modelo</TableHead>
            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Tokens</TableHead>
            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Latencia</TableHead>
            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Estado</TableHead>
            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider text-right">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="border-border hover:bg-muted/50 transition-colors">
              <TableCell className="font-semibold text-foreground">
                {log.provider === 'google' ? '🚀 Gemini' : log.provider === 'openai' ? '🧠 OpenAI' : log.provider}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs font-mono">
                {log.model}
              </TableCell>
              <TableCell>
                <span className="font-bold text-primary">{log.total_tokens.toLocaleString()}</span>
              </TableCell>
              <TableCell>
                <span className={log.response_time_ms > 5000 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'}>
                  {log.response_time_ms}ms
                </span>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={log.success ? "secondary" : "destructive"}
                  className={log.success ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20" : ""}
                >
                  {log.success ? 'Éxito' : 'Error'}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-[10px] font-medium">
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
