import { useStore } from "@/lib/store";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, Image as ImageIcon, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { settings, updateSettings } = useStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: settings.name || "",
    phone: settings.phone || "",
    whatsapp: settings.whatsapp || "",
    email: settings.email || "",
    address: settings.address || "",
    instagram: settings.instagram || "",
  });

  const [methods, setMethods] = useState(settings.paymentMethods.join(", "));
  const [logoUrl, setLogoUrl] = useState(settings.logo || "");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setLogoUrl(dataUrl);
        toast({
          title: "Logo carregada!",
          description: "A imagem será salva quando você clicar em 'Salvar Alterações'."
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateSettings({
      ...formData,
      paymentMethods: methods.split(",").map(m => m.trim()).filter(Boolean),
      logo: logoUrl
    });
    
    toast({
      title: "Configurações salvas!",
      description: "Os dados da loja foram atualizados com sucesso.",
    });
  };

  const handleExport = () => {
    const data = localStorage.getItem("oficina-storage");
    if (data) {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-oficina-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">Configurações da Loja</h1>
          <p className="text-slate-500 mt-1">Dados que aparecerão no cabeçalho dos orçamentos e O.S.</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Dados Básicos</CardTitle>
            <CardDescription>Informações de contato e endereço da oficina</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Loja</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Endereço Completo</Label>
              <Textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={2} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone Fixo</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 0000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="(00) 90000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" value={formData.email} onChange={handleChange} type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@sualoja" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logotipo</CardTitle>
              <CardDescription>Upload local ou URL externa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="flex justify-center p-4 border-2 border-dashed rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoUrl ? (
                  <div className="text-center">
                    <img src={logoUrl} alt="Logo" className="max-h-24 object-contain mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Clique para trocar a imagem</p>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-4">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span className="text-sm">Clique para fazer upload ou arraste uma imagem</span>
                  </div>
                )}
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload} 
                className="hidden" 
              />
              
              <div className="space-y-2">
                <Label htmlFor="logo">Ou Cole URL da Imagem</Label>
                <div className="flex gap-2">
                  <Input 
                    id="logo" 
                    value={logoUrl} 
                    onChange={(e) => setLogoUrl(e.target.value)} 
                    placeholder="https://exemplo.com/logo.png" 
                  />
                  {logoUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLogoUrl("")}
                      className="px-3 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formas de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="methods">Opções (separadas por vírgula)</Label>
                <Textarea 
                  id="methods" 
                  value={methods} 
                  onChange={(e) => setMethods(e.target.value)} 
                  rows={3}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {methods.split(",").map(m => m.trim()).filter(Boolean).map((m, i) => (
                    <Badge key={i} variant="secondary">{m}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backup</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={handleExport}>
                Exportar Dados (Backup)
              </Button>
              <p className="text-xs text-slate-500 mt-2 text-center">
                Salva todas as O.S., clientes e configurações em um arquivo no seu computador.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}