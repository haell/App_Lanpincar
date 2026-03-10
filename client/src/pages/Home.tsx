import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Wrench, FileText, CheckCircle, Settings } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { customers, orders, services } = useStore();

  const recentOrders = orders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  
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
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Visão geral do sistema da oficina</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total de OS</CardTitle>
            <FileText className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Em Execução</CardTitle>
            <Wrench className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {orders.filter(o => o.status === 'execucao').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Finalizados</CardTitle>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {orders.filter(o => o.status === 'finalizado').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Clientes Cadastrados</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Últimas Ordens de Serviço</CardTitle>
            <CardDescription>As ordens mais recentes registradas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma ordem de serviço cadastrada ainda.</p>
                <Link href="/orders/new" className="text-primary hover:underline mt-2 inline-block font-medium">
                  Criar a primeira OS
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => {
                  const customer = customers.find(c => c.id === order.customerId);
                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">
                          OS #{String(order.orderNumber).padStart(4, '0')} - {order.vehicle.brand} {order.vehicle.model}
                        </span>
                        <span className="text-sm text-slate-500">
                          {customer?.name || 'Cliente não encontrado'} • {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </div>
                        <Link href={`/orders/${order.id}`} className="text-primary hover:text-primary/80 font-medium text-sm">
                          Ver detalhes
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/orders/new" className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">
              <FileText className="w-5 h-5" />
              Nova Ordem de Serviço
            </Link>
            <Link href="/clients" className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium">
              <Users className="w-5 h-5" />
              Buscar Cliente
            </Link>
            <Link href="/services" className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium">
              <Wrench className="w-5 h-5" />
              Tabela de Preços
            </Link>
            <Link href="/settings" className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium">
              <Settings className="w-5 h-5" />
              Configurar Loja
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}