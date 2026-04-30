"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Filter, MoreVertical, FileText, Check, X, Archive, Loader2, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";

import { useRouter } from "next/navigation";

export type DocumentStatus = 'borrador' | 'revision' | 'aprobado' | 'vencido' | 'por_vencer';

export interface DocumentProps {
  id: string;
  title: string;
  code: string;
  category: string;
  status: DocumentStatus;
  version: number;
  expiryDate: string | null;
  uploadedBy: { first_name: string; last_name: string } | null;
  createdAt: string;
  fileUrl?: string;
  approvalCount?: number;
}

const statusConfig: Record<DocumentStatus, { variant: "default" | "secondary" | "destructive" | "outline", colorClass: string, label: string }> = {
  borrador: { variant: "secondary", colorClass: "text-muted-foreground", label: 'Borrador' },
  revision: { variant: "outline", colorClass: "text-blue-600 border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-400", label: 'En Revisión' },
  aprobado: { variant: "outline", colorClass: "text-emerald-600 border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-400", label: 'Aprobado' },
  por_vencer: { variant: "outline", colorClass: "text-amber-600 border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-400", label: 'Por Vencer' },
  vencido: { variant: "destructive", colorClass: "", label: 'Vencido' },
};

export default function DocumentTable({ documents: initialDocuments }: { documents: DocumentProps[] }) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentProps[]>(initialDocuments);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelected(newSelected);
  };

  const selectAll = () => {
    if (selected.size === filteredDocs.length) setSelected(new Set());
    else setSelected(new Set(filteredDocs.map(d => d.id)));
  };

  // Optimistic UI Actions
  const handleOptimisticAction = (id: string, newStatus: DocumentStatus) => {
    setProcessingId(id);
    
    // Simulate API Delay
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? { ...doc, status: newStatus } : doc
      ));
      setProcessingId(null);
    }, 600);
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase()) || 
    doc.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar documento o código..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter size={16} /> <span className="hidden sm:inline">Filtros</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {selected.size > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2 mr-2"
              >
                <span className="text-sm text-muted-foreground font-medium">
                  {selected.size} seleccionados
                </span>
                <Button size="sm" variant="secondary">Acción masiva</Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Link href="/documents/new">
            <Button>Nuevo Documento</Button>
          </Link>
        </div>
      </div>
      
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-center">
                <Checkbox 
                  checked={filteredDocs.length > 0 && selected.size === filteredDocs.length}
                  onCheckedChange={selectAll}
                />
              </TableHead>
              <TableHead>Código & Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Versión</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No se encontraron documentos.
                </TableCell>
              </TableRow>
            ) : (
              filteredDocs.map((doc) => {
                const config = statusConfig[doc.status];
                const isProcessing = processingId === doc.id;
                
                return (
                  <TableRow 
                    key={doc.id} 
                    onClick={() => router.push(`/documents/${doc.id}`)}
                    className={cn(
                      "group cursor-pointer transition-colors hover:bg-muted/50",
                      selected.has(doc.id) ? "bg-primary/5 hover:bg-primary/10" : "",
                      isProcessing ? "opacity-50 pointer-events-none" : ""
                    )}
                  >
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selected.has(doc.id)}
                        onCheckedChange={() => handleSelect(doc.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          {doc.fileUrl ? (
                            <a 
                              href={doc.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {doc.title}
                            </a>
                          ) : (
                            <p className="text-sm font-semibold text-foreground truncate">
                              {doc.title}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground font-mono truncate">{doc.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{doc.category}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant={config.variant} className={cn("font-medium", config.colorClass)}>
                          {config.label}
                        </Badge>
                        {doc.status === 'revision' && (
                          <div className="flex items-center gap-1.5 ml-1 mt-1">
                            <div className="flex gap-0.5">
                              {[1, 2].map((step) => (
                                <div 
                                  key={step}
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    (doc.approvalCount || 0) >= step ? "bg-blue-500" : "bg-blue-500/20"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-bold text-blue-500">
                              {doc.approvalCount || 0}/2
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground">v{doc.version}.0</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {doc.uploadedBy ? `${doc.uploadedBy.first_name} ${doc.uploadedBy.last_name}` : 'Sistema'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      {isProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground ml-auto mr-2" />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                            <MoreVertical size={16} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {doc.status === 'revision' && (
                              <>
                                <DropdownMenuItem onClick={() => handleOptimisticAction(doc.id, 'aprobado')}>
                                  <Check className="mr-2 h-4 w-4 text-emerald-500" /> Aprobar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOptimisticAction(doc.id, 'borrador')}>
                                  <X className="mr-2 h-4 w-4 text-destructive" /> Rechazar
                                </DropdownMenuItem>
                              </>
                            )}
                            {doc.status === 'aprobado' && (
                              <DropdownMenuItem onClick={() => handleOptimisticAction(doc.id, 'borrador')}>
                                <Archive className="mr-2 h-4 w-4" /> Mover a borrador
                              </DropdownMenuItem>
                            )}
                            {doc.fileUrl && (
                              <DropdownMenuItem asChild>
                                <a href={doc.fileUrl} download target="_blank" rel="noopener noreferrer">
                                  <Download className="mr-2 h-4 w-4" /> Descargar
                                </a>
                              </DropdownMenuItem>
                            )}
                            <Link href={`/documents/${doc.id}`}>
                              <DropdownMenuItem>
                                <ExternalLink className="mr-2 h-4 w-4" /> Ver detalles
                              </DropdownMenuItem>
                            </Link>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
