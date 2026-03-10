import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Wrench, Settings, Users, FileText, PlusCircle, LayoutDashboard } from "lucide-react";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import SettingsPage from "@/pages/Settings";
import ServicesPage from "@/pages/Services";
import NewOrder from "@/pages/NewOrder";
import OrderView from "@/pages/OrderView";
import OrdersList from "@/pages/OrdersList";
import ClientsList from "@/pages/ClientsList";

function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/orders/new", icon: PlusCircle, label: "Nova OS" },
    { href: "/orders", icon: FileText, label: "Ordens de Serviço" },
    { href: "/clients", icon: Users, label: "Clientes" },
    { href: "/services", icon: Wrench, label: "Tabela de Preços" },
    { href: "/settings", icon: Settings, label: "Configurações da Loja" },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen hidden md:flex no-print">
      <div className="p-4 bg-slate-950 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <h1 className="font-heading font-bold text-xl tracking-wide">OFICINA OS</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                active 
                  ? "bg-primary text-white font-medium shadow-sm" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 text-xs text-slate-500 border-t border-slate-800">
        Modo Offline • Sistema Local
      </div>
    </div>
  );
}

function MobileNav() {
  const [location] = useLocation();
  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Home" },
    { href: "/orders/new", icon: PlusCircle, label: "Nova" },
    { href: "/orders", icon: FileText, label: "OS" },
    { href: "/settings", icon: Settings, label: "Ajustes" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50 no-print">
      {navItems.map((item) => {
        const active = location === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex flex-col items-center p-2 rounded-lg ${
              active ? "text-primary" : "text-slate-500"
            }`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isPrintView = location.includes('/print');

  if (isPrintView) {
    return <div className="min-h-screen bg-white print-container">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col md:pb-0 pb-16 h-screen overflow-y-auto">
        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home}/>
        <Route path="/settings" component={SettingsPage}/>
        <Route path="/services" component={ServicesPage}/>
        <Route path="/orders/new" component={NewOrder}/>
        <Route path="/orders/:id" component={OrderView}/>
        <Route path="/orders/:id/print" component={OrderView}/>
        <Route path="/orders" component={OrdersList}/>
        <Route path="/clients" component={ClientsList}/>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;