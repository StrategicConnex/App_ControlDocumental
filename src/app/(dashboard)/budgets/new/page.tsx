"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Save, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export default function NewBudgetPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<BudgetItem[]>([
    { id: "1", description: "", quantity: 1, unit_price: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", quantity: 1, unit_price: 0 }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent, status: 'borrador' | 'enviado') => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Por favor ingrese un título para el presupuesto");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // In a real scenario, we'd send this to an API endpoint that handles Supabase insertion
      // For this MVP UI, we'll simulate a save and redirect
      console.log("Saving budget...", { title, items, total: calculateTotal(), status });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      router.push("/budgets");
      router.refresh();
    } catch (error) {
      console.error("Error saving budget", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <header className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <Link href="/budgets" className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Propuesta Económica</h1>
          <p className="text-sm text-gray-500">Cree un nuevo presupuesto dinámico.</p>
        </div>
      </header>

      <div className="bg-white p-6 md:p-8 rounded-[2rem] card-shadow border border-gray-100">
        <form className="space-y-8">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-900">Título de la Propuesta</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Provisión de Servicios HSE Q3"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Items Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">Ítems a Cotizar</h3>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500 uppercase">Descripción</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500 uppercase w-32">Cantidad</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500 uppercase w-48">Precio Unitario</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500 uppercase w-48 text-right">Subtotal</th>
                    <th className="py-3 px-4 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Descripción del servicio..."
                          className="w-full px-3 py-2 border-0 bg-transparent focus:ring-2 focus:ring-indigo-500/20 rounded-lg"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </td>
                      <td className="p-4">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium text-gray-900">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="text-gray-400 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              <Plus size={16} /> Agregar Ítem
            </button>
          </div>

          {/* Totals & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-6 border-t border-gray-100">
            <div className="flex gap-3 w-full md:w-auto order-2 md:order-1">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'borrador')}
                disabled={isSubmitting}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                <Save size={18} /> Guardar Borrador
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'enviado')}
                disabled={isSubmitting}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-md disabled:opacity-50"
              >
                <Send size={18} /> Emitir Propuesta
              </button>
            </div>
            
            <div className="w-full md:w-auto text-right order-1 md:order-2">
              <p className="text-sm text-gray-500 mb-1 font-medium">Total Estimado</p>
              <p className="text-4xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(calculateTotal())}
              </p>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
