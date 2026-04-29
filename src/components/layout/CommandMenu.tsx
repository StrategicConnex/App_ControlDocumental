"use client";

import * as React from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  FileText,
  AlertTriangle,
  FileCheck2,
  Mic
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="w-full sm:w-64 justify-start text-sm text-muted-foreground bg-muted/50 hover:bg-muted/80 shadow-none border-0"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Buscar comandos o documentos...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Escribe un comando o busca un documento..." />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          <CommandGroup heading="Búsqueda Rápida">
            <CommandItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>Contrato PAE 2026</span>
              <CommandShortcut>CT-019</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <FileCheck2 className="mr-2 h-4 w-4" />
              <span>Póliza Flota Toyota</span>
              <CommandShortcut>SE-002</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
              <span>Documentos por vencer</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Acciones">
            <CommandItem>
              <Mic className="mr-2 h-4 w-4 text-blue-500" />
              <span>Búsqueda por Voz (Beta)</span>
              <CommandShortcut>⌘+Space</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Ver Calendario</span>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
