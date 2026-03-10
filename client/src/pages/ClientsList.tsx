import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export default function ClientsList() {
  const { customers, orders } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm) ||
    c.whatsapp.includes(searchTerm)
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-900">Clientes</h1>
        <p className="text-slate-500 mt-1">Base de clientes cadastrados no sistema</p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Buscar por nome, documento ou telefone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md border-none shadow-none focus-visible:ring-0 px-0"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredCustomers.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <User className="w-12 h-12 mb-4 text-slate-300" />
                <p className="text-lg font-medium text-slate-700">Nenhum cliente encontrado.</p>
                <p className="text-sm mt-1">Os clientes são salvos automaticamente ao criar uma nova OS.</p>
              </div>
            ) : (
              filteredCustomers.map(customer => {
                const customerOrdersCount = orders.filter(o => o.customerId === customer.id).length;
                
                return (
                  <div key={customer.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-900 text-lg">{customer.name}</div>
                        <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <span className="flex items-center gap-1"><User className="w-3 h-3"/> CPF/CNPJ: {customer.document}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {customer.whatsapp}</span>
                          {customer.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {customer.address}</span>}
                        </div>
                      </div>
                      <div className="text-right flex flex-row md:flex-col items-center md:items-end gap-2 text-sm">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                          {customerOrdersCount} OS vinculadas
                        </span>
                        <span className="text-slate-400 text-xs">
                          Cliente desde {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}