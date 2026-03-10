import { useStore, Order, OrderItem, Customer } from "@/lib/store";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, ChevronLeft, Save, Plus, Trash2, Search, Car, User, ListChecks } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function NewOrder() {
  const [, setLocation] = useLocation();
  const { customers, services, addCustomer, addOrder } = useStore();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [existingCustomerSearch, setExistingCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Form State
  const [customerForm, setCustomerForm] = useState({
    name: "", document: "", address: "", whatsapp: "", phone: "", email: ""
  });

  const [vehicleForm, setVehicleForm] = useState({
    type: "carro" as "carro" | "moto",
    brand: "", model: "", year: "", color: "", chassis: "", plate: "",
    entryDate: new Date().toISOString().split('T')[0],
    driver: "",
    fuelLevel: "1/2" as any,
    tires: "bons" as any
  });

  const [items, setItems] = useState<OrderItem[]>([]);
  
  const [paymentForm, setPaymentForm] = useState({
    method: "Dinheiro",
    type: "vista" as "vista" | "prazo",
    notes: "",
    validityDays: 15
  });

  // Calculate Total
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);

  // Auto-fill from selected customer
  const handleSelectCustomer = (id: string) => {
    const c = customers.find(c => c.id === id);
    if (c) {
      setSelectedCustomerId(id);
      setCustomerForm({
        name: c.name, document: c.document, address: c.address, 
        whatsapp: c.whatsapp, phone: c.phone || "", email: c.email || ""
      });
    }
  };

  const handleAddItem = () => {
    setItems([...items, {
      id: crypto.randomUUID(),
      name: "",
      type: "servico",
      quantity: 1,
      unitPrice: 0,
      total: 0
    }]);
  };

  const handleUpdateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Auto-fill from catalog
        if (field === 'serviceId' && value) {
          const svc = services.find(s => s.id === value);
          if (svc) {
            updated.name = svc.name;
            updated.type = svc.type;
            updated.unitPrice = svc.defaultPrice;
          }
        }
        
        // Recalculate total
        if (field === 'quantity' || field === 'unitPrice' || field === 'serviceId') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSaveOrder = () => {
    // Validate
    if (!customerForm.name || !customerForm.document) {
      toast({ title: "Erro", description: "Nome e documento do cliente são obrigatórios.", variant: "destructive" });
      setStep(1);
      return;
    }
    if (!vehicleForm.brand || !vehicleForm.model || !vehicleForm.plate) {
      toast({ title: "Erro", description: "Marca, modelo e placa do veículo são obrigatórios.", variant: "destructive" });
      setStep(2);
      return;
    }
    if (items.length === 0) {
      toast({ title: "Aviso", description: "Adicione pelo menos um serviço ou peça.", variant: "destructive" });
      setStep(3);
      return;
    }

    // Save/Update Customer First
    let customerId = selectedCustomerId;
    if (!customerId) {
      customerId = addCustomer(customerForm);
    }

    // Prepare Order
    const orderData: Omit<Order, 'id' | 'createdAt' | 'orderNumber'> = {
      customerId: customerId!,
      vehicle: {
        type: vehicleForm.type,
        brand: vehicleForm.brand,
        model: vehicleForm.model,
        year: vehicleForm.year,
        color: vehicleForm.color,
        chassis: vehicleForm.chassis,
        plate: vehicleForm.plate,
      },
      details: {
        entryDate: new Date(vehicleForm.entryDate).getTime(),
        driver: vehicleForm.driver,
        fuelLevel: vehicleForm.fuelLevel,
        tires: vehicleForm.tires,
      },
      items,
      payment: {
        method: paymentForm.method,
        type: paymentForm.type,
        total: subtotal,
        notes: paymentForm.notes,
      },
      status: "orcamento",
      validityDays: paymentForm.validityDays
    };

    const newOrderId = addOrder(orderData);
    toast({ title: "Orçamento Criado!", description: "A OS foi gerada com sucesso." });
    setLocation(`/orders/${newOrderId}`);
  };

  const steps = [
    { num: 1, title: "Cliente", icon: User },
    { num: 2, title: "Veículo", icon: Car },
    { num: 3, title: "Serviços", icon: ListChecks },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-slate-900">Nova Ordem de Serviço</h1>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mt-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          
          {steps.map(s => (
            <div 
              key={s.num} 
              className={`relative z-10 flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                step >= s.num ? "bg-primary border-primary text-white" : "bg-white border-slate-300 text-slate-400"
              }`}
            >
              <s.icon className="w-5 h-5" />
              <span className={`absolute -bottom-6 text-xs font-semibold whitespace-nowrap ${
                step >= s.num ? "text-primary" : "text-slate-400"
              }`}>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* STEP 1: CLIENTE */}
        {step === 1 && (
          <div className="p-6 md:p-8 animate-in slide-in-from-right-4">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="text-primary w-6 h-6" /> Dados do Cliente
            </h2>
            
            <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Buscar cliente já cadastrado</Label>
              <Select onValueChange={handleSelectCustomer}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} - {c.document}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="c-name">Nome Completo *</Label>
                <Input id="c-name" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-doc">CPF/CNPJ *</Label>
                <Input id="c-doc" value={customerForm.document} onChange={e => setCustomerForm({...customerForm, document: e.target.value})} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="c-addr">Endereço Completo</Label>
                <Input id="c-addr" value={customerForm.address} onChange={e => setCustomerForm({...customerForm, address: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-wpp">WhatsApp *</Label>
                <Input id="c-wpp" value={customerForm.whatsapp} onChange={e => setCustomerForm({...customerForm, whatsapp: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email">E-mail</Label>
                <Input id="c-email" type="email" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: VEÍCULO */}
        {step === 2 && (
          <div className="p-6 md:p-8 animate-in slide-in-from-right-4">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Car className="text-primary w-6 h-6" /> Dados do Veículo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={vehicleForm.type} onValueChange={v => setVehicleForm({...vehicleForm, type: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carro">Carro</SelectItem>
                    <SelectItem value="moto">Moto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Placa *</Label>
                <Input value={vehicleForm.plate} onChange={e => setVehicleForm({...vehicleForm, plate: e.target.value.toUpperCase()})} placeholder="AAA-0000" />
              </div>
              <div className="space-y-2">
                <Label>Chassi</Label>
                <Input value={vehicleForm.chassis} onChange={e => setVehicleForm({...vehicleForm, chassis: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Marca *</Label>
                <Input value={vehicleForm.brand} onChange={e => setVehicleForm({...vehicleForm, brand: e.target.value})} placeholder="Ex: Chevrolet" />
              </div>
              <div className="space-y-2">
                <Label>Modelo *</Label>
                <Input value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})} placeholder="Ex: Onix 1.0" />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <Input value={vehicleForm.color} onChange={e => setVehicleForm({...vehicleForm, color: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Input value={vehicleForm.year} onChange={e => setVehicleForm({...vehicleForm, year: e.target.value})} placeholder="2020/2021" />
              </div>
              <div className="space-y-2">
                <Label>Data de Entrada</Label>
                <Input type="date" value={vehicleForm.entryDate} onChange={e => setVehicleForm({...vehicleForm, entryDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Motorista/Responsável</Label>
                <Input value={vehicleForm.driver} onChange={e => setVehicleForm({...vehicleForm, driver: e.target.value})} />
              </div>
            </div>

            <div className="mt-8 border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Condição dos Pneus</Label>
                <Select value={vehicleForm.tires} onValueChange={v => setVehicleForm({...vehicleForm, tires: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novos">Novos</SelectItem>
                    <SelectItem value="bons">Bons / Usados</SelectItem>
                    <SelectItem value="ruins">Ruins / Carecas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nível de Combustível</Label>
                <Select value={vehicleForm.fuelLevel} onValueChange={v => setVehicleForm({...vehicleForm, fuelLevel: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reserva">Reserva</SelectItem>
                    <SelectItem value="1/4">1/4 Tanque</SelectItem>
                    <SelectItem value="1/2">Meio Tanque</SelectItem>
                    <SelectItem value="3/4">3/4 Tanque</SelectItem>
                    <SelectItem value="cheio">Cheio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SERVIÇOS & FECHAMENTO */}
        {step === 3 && (
          <div className="p-6 md:p-8 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ListChecks className="text-primary w-6 h-6" /> Peças e Serviços
              </h2>
              <Button onClick={handleAddItem} size="sm" variant="outline" className="gap-2 border-primary text-primary">
                <Plus className="w-4 h-4" /> Adicionar Item
              </Button>
            </div>

            <div className="bg-slate-50 border rounded-lg overflow-x-auto mb-8">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3 min-w-[200px]">Descrição do Item (Tabela)</th>
                    <th className="px-4 py-3 w-24">Qtd</th>
                    <th className="px-4 py-3 w-32">Valor Unit.</th>
                    <th className="px-4 py-3 w-32 text-right">Total</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        Nenhum item adicionado ao orçamento ainda.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id} className="border-b bg-white hover:bg-slate-50">
                        <td className="px-4 py-2">
                          <Select value={item.type} onValueChange={v => handleUpdateItem(item.id, 'type', v)}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="servico">Serviço</SelectItem>
                              <SelectItem value="peca">Peça</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2">
                          <Select value={item.serviceId || "custom"} onValueChange={v => {
                            if (v !== "custom") handleUpdateItem(item.id, 'serviceId', v);
                          }}>
                            <SelectTrigger className="h-8 mb-1"><SelectValue placeholder="Selecione da tabela..." /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="custom">-- Item Manual --</SelectItem>
                              {services.filter(s => s.type === item.type).map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name} - R$ {s.defaultPrice}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input 
                            value={item.name} 
                            onChange={e => handleUpdateItem(item.id, 'name', e.target.value)}
                            placeholder="Ou digite a descrição..."
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" min="1" value={item.quantity} onChange={e => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value)||0)} className="h-8" />
                        </td>
                        <td className="px-4 py-2">
                          <Input type="number" step="0.01" value={item.unitPrice} onChange={e => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value)||0)} className="h-8" />
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          R$ {item.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {items.length > 0 && (
                  <tfoot className="bg-slate-100 font-bold">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right">TOTAL GERAL:</td>
                      <td className="px-4 py-3 text-right text-primary text-lg">R$ {subtotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700">Condições de Pagamento</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Forma</Label>
                    <Select value={paymentForm.type} onValueChange={v => setPaymentForm({...paymentForm, type: v as any})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vista">À Vista</SelectItem>
                        <SelectItem value="prazo">A Prazo/Parcelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Validade (Dias)</Label>
                    <Input type="number" value={paymentForm.validityDays} onChange={e => setPaymentForm({...paymentForm, validityDays: parseInt(e.target.value)||15})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Método Preferencial</Label>
                  <Select value={paymentForm.method} onValueChange={v => setPaymentForm({...paymentForm, method: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                      <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-700">Observações / Declarações</h3>
                <Textarea 
                  value={paymentForm.notes} 
                  onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
                  placeholder="Informações adicionais para constar na OS..."
                  className="h-32 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION */}
        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setStep(step - 1)} 
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </Button>
          
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="gap-2">
              Próximo Passo <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSaveOrder} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Save className="w-4 h-4" /> Salvar Orçamento
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}