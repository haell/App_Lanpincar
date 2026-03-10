import { useStore } from "@/lib/store";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, FileText } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OrdersList() {
  const { orders, customers } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const matchesSearch = 
      order.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toString().includes(searchTerm) ||
      (customer?.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => b.createdAt - a.createdAt);

  const statusColors = {
    'orcamento': 'bg-slate-100 text-slate-800 border-slate-200',
    'aprovado': 'bg-blue-100 text-blue-800 border-blue-200',
    'execucao': 'bg-amber-100 text-amber-800 border-amber-200',
    'finalizado': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'entregue': 'bg-zinc-100 text-zinc-800 border-zinc-200'
  };

  const statusLabels = {
    'orcamento': 'Orçamento',
    'aprovado': 'Aprovado',
    'execucao': 'Em Execução',
    'finalizado': 'Finalizado',
    'entregue': 'Entregue'
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">Ordens de Serviço</h1>
          <p className="text-slate-500 mt-1">Histórico completo de orçamentos e serviços</p>
        </div>
        
        <Link href="/orders/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
          <PlusCircle className="w-4 h-4" />
          Nova OS
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center gap-4 space-y-0">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Buscar por cliente, placa ou número..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md border-none shadow-none focus-visible:ring-0 px-0"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="orcamento">Orçamento</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="execucao">Em Execução</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <FileText className="w-12 h-12 mb-4 text-slate-300" />
                <p className="text-lg font-medium text-slate-700">Nenhuma ordem de serviço encontrada.</p>
                <p className="text-sm mt-1">Tente ajustar seus filtros de busca.</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const customer = customers.find(c => c.id === order.customerId);
                return (
                  <div key={order.id} className="flex flex-col md:flex-row justify-between md:items-center p-4 hover:bg-slate-50 transition-colors gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-lg text-slate-900">
                          #{String(order.orderNumber).padStart(4, '0')}
                        </span>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </div>
                      </div>
                      <div className="font-medium text-slate-700">
                        {customer?.name || 'Cliente removido'} • {order.vehicle.brand} {order.vehicle.model} ({order.vehicle.plate})
                      </div>
                      <div className="text-sm text-slate-500 mt-1 flex gap-4">
                        <span>Criado em: {new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span>Total: R$ {order.payment.total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={`/orders/${order.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                        Abrir Detalhes
                      </Link>
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