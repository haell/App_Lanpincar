import { useStore, ServiceItem } from "@/lib/store";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ServicesPage() {
  const { services, addService, updateService, deleteService } = useStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "servico" as "servico" | "peca",
    defaultPrice: 0
  });

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ name: "", type: "servico", defaultPrice: 0 });
    setIsOpen(true);
  };

  const handleOpenEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setFormData({ 
      name: service.name, 
      type: service.type, 
      defaultPrice: service.defaultPrice 
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast({ title: "Erro", description: "O nome é obrigatório", variant: "destructive" });
      return;
    }

    if (editingId) {
      updateService(editingId, formData);
      toast({ title: "Sucesso", description: "Item atualizado." });
    } else {
      addService(formData);
      toast({ title: "Sucesso", description: "Item cadastrado." });
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      deleteService(id);
      toast({ title: "Removido", description: "Item excluído da tabela." });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">Tabela de Preços</h1>
          <p className="text-slate-500 mt-1">Gerencie serviços e peças para preenchimento automático</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Item" : "Novo Item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <RadioGroup 
                  value={formData.type} 
                  onValueChange={(val) => setFormData({...formData, type: val as any})}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="servico" id="t-servico" />
                    <Label htmlFor="t-servico" className="font-normal">Serviço de Mão de Obra</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="peca" id="t-peca" />
                    <Label htmlFor="t-peca" className="font-normal">Peça / Material</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Descrição</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: Pintura Porta Direita"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Valor Base (R$)</Label>
                <Input 
                  id="price" 
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.defaultPrice || ''} 
                  onChange={(e) => setFormData({...formData, defaultPrice: parseFloat(e.target.value) || 0})} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Buscar serviço ou peça..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm border-none shadow-none focus-visible:ring-0 px-0"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredServices.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Nenhum item encontrado.</div>
            ) : (
              filteredServices.map(item => (
                <div key={item.id} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mt-1 flex gap-2">
                      <span className={item.type === 'servico' ? 'text-blue-600' : 'text-amber-600'}>
                        {item.type === 'servico' ? '🔧 Serviço' : '📦 Peça'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-700">{formatCurrency(item.defaultPrice)}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => handleOpenEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}