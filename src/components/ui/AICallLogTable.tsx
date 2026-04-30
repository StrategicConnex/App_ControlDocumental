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
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Proveedor</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Modelo</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Tokens</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Latencia</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Estado</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px] text-right">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors">
              <TableCell className="font-medium text-white">
                {log.provider === 'google' ? '🚀 Gemini' : log.provider}
              </TableCell>
              <TableCell className="text-gray-300 text-xs font-mono">
                {log.model}
              </TableCell>
              <TableCell className="text-gray-300">
                <span className="font-bold text-indigo-400">{log.total_tokens}</span>
              </TableCell>
              <TableCell className="text-gray-300">
                <span className={log.response_time_ms > 5000 ? 'text-amber-400' : 'text-emerald-400'}>
                  {log.response_time_ms}ms
                </span>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={log.success ? "default" : "destructive"}
                  className={log.success ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}
                >
                  {log.success ? 'Éxito' : 'Error'}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-gray-500 text-[10px]">
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
