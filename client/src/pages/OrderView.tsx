import { useStore } from "@/lib/store";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Printer, Share2, ChevronLeft, ArrowLeft, Edit2 } from "lucide-react";
import { Link } from "wouter";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function OrderView() {
  const [, params] = useRoute("/orders/:id");
  const [, paramsPrint] = useRoute("/orders/:id/print");
  const orderId = params?.id || paramsPrint?.id;
  const [isEditing, setIsEditing] = useState(false);
  
  const { orders, customers, settings } = useStore();
  const printRef = useRef<HTMLDivElement>(null);
  
  const order = orders.find(o => o.id === orderId);
  const customer = order ? customers.find(c => c.id === order.customerId) : null;

  if (!order || !customer) {
    return <div className="p-8 text-center">Ordem de Serviço não encontrada.</div>;
  }

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('pt-BR');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    
    // Quick and dirty PDF generation via canvas
    const canvas = await html2canvas(printRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`OS-${order.orderNumber.toString().padStart(4, '0')}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center no-print">
        <Link href="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="space-x-2 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-2 text-slate-600 hover:text-primary">
            <Edit2 className="w-4 h-4" /> {isEditing ? "Pronto" : "Editar"}
          </Button>
          <div className="w-px h-6 bg-slate-200"></div>
          <Button variant="outline" onClick={handleDownloadPDF} className="gap-2 border-primary text-primary hover:bg-primary/5">
            <Share2 className="w-4 h-4" /> Exportar PDF
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
        </div>
      </div>

      {/* A4 Document Container */}
      <div 
        ref={printRef}
        className="bg-white border shadow-lg mx-auto print-container"
        style={{ width: '210mm', minHeight: '297mm', padding: '15mm', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex gap-4 items-center">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="max-h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 bg-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs text-center border border-slate-300">LOGO DA<br/>EMPRESA</div>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase uppercase">{settings.name}</h1>
              <div className="text-xs text-slate-700 mt-1 space-y-0.5">
                <p>{settings.address}</p>
                <p>Tel: {settings.phone} / Cel-WhatsApp: {settings.whatsapp}</p>
                <p>E-mail: {settings.email}</p>
                {settings.instagram && <p>Instagram: {settings.instagram}</p>}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-slate-100 border border-slate-300 px-4 py-2 rounded-lg inline-block">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {order.status === 'orcamento' ? 'Orçamento Nº' : 'Ordem de Serviço Nº'}
              </div>
              <div className="text-2xl font-black text-red-600">
                {String(order.orderNumber).padStart(4, '0')}
              </div>
            </div>
            <div className="text-xs mt-3">
              Data: <span className="font-semibold">{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* CLIENTE INFO */}
        <div className="mb-6">
          <div className="bg-slate-800 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 mb-2">
            Dados do Cliente
          </div>
          <div className="border border-slate-300 rounded text-sm grid grid-cols-4 gap-0 divide-y divide-x divide-slate-200">
            <div className="col-span-3 p-2 flex"><span className="font-semibold w-24">Nome:</span> <span>{customer.name}</span></div>
            <div className="col-span-1 p-2 flex"><span className="font-semibold w-16">CPF/RG:</span> <span>{customer.document}</span></div>
            <div className="col-span-4 p-2 flex"><span className="font-semibold w-24">Endereço:</span> <span>{customer.address || '-'}</span></div>
            <div className="col-span-2 p-2 flex"><span className="font-semibold w-24">WhatsApp:</span> <span>{customer.whatsapp}</span></div>
            <div className="col-span-2 p-2 flex"><span className="font-semibold w-16">Email:</span> <span>{customer.email || '-'}</span></div>
          </div>
        </div>

        {/* VEICULO INFO */}
        <div className="mb-6">
          <div className="bg-slate-800 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 mb-2 flex justify-between">
            <span>Dados do Veículo</span>
            <span>Entrada: {formatDate(order.details.entryDate)}</span>
          </div>
          <div className="border border-slate-300 rounded text-sm grid grid-cols-4 gap-0 divide-y divide-x divide-slate-200">
            <div className="col-span-2 p-2 flex"><span className="font-semibold w-20">Veículo:</span> <span>{order.vehicle.brand} {order.vehicle.model}</span></div>
            <div className="col-span-1 p-2 flex"><span className="font-semibold w-12">Cor:</span> <span>{order.vehicle.color}</span></div>
            <div className="col-span-1 p-2 flex"><span className="font-semibold w-12">Ano:</span> <span>{order.vehicle.year}</span></div>
            <div className="col-span-1 p-2 flex"><span className="font-semibold w-16">Placa:</span> <span className="font-bold">{order.vehicle.plate}</span></div>
            <div className="col-span-3 p-2 flex"><span className="font-semibold w-16">Chassi:</span> <span className="font-mono text-xs mt-0.5">{order.vehicle.chassis || '-'}</span></div>
            <div className="col-span-2 p-2 flex"><span className="font-semibold w-20">Combustível:</span> <span className="uppercase">{order.details.fuelLevel}</span></div>
            <div className="col-span-2 p-2 flex"><span className="font-semibold w-20">Pneus:</span> <span className="uppercase">{order.details.tires}</span></div>
            {order.details.driver && (
              <div className="col-span-4 p-2 flex"><span className="font-semibold w-24">Responsável:</span> <span>{order.details.driver}</span></div>
            )}
          </div>
        </div>

        {/* SERVICOS / PECAS */}
        <div className="mb-6 min-h-[150px]">
          <div className="bg-slate-800 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 mb-2">
            Descrição de Peças e Serviços
          </div>
          <table className="w-full border-collapse border border-slate-300 text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-300 p-2 text-center w-12">QTD</th>
                <th className="border border-slate-300 p-2 text-center w-20">TIPO</th>
                <th className="border border-slate-300 p-2 text-left">DESCRIÇÃO</th>
                <th className="border border-slate-300 p-2 text-right w-28">V. UNIT.</th>
                <th className="border border-slate-300 p-2 text-right w-32">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-200">
                  <td className="border-x border-slate-300 p-2 text-center">{item.quantity}</td>
                  <td className="border-x border-slate-300 p-2 text-center text-xs uppercase text-slate-500">{item.type}</td>
                  <td className="border-x border-slate-300 p-2 text-left font-medium">{item.name}</td>
                  <td className="border-x border-slate-300 p-2 text-right">{formatMoney(item.unitPrice)}</td>
                  <td className="border-x border-slate-300 p-2 text-right font-bold">{formatMoney(item.total)}</td>
                </tr>
              ))}
              {/* Fill empty rows to make it look like a standard form */}
              {Array.from({ length: Math.max(0, 8 - order.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-slate-200">
                  <td className="border-x border-slate-300 p-2 h-8"></td>
                  <td className="border-x border-slate-300 p-2 h-8"></td>
                  <td className="border-x border-slate-300 p-2 h-8"></td>
                  <td className="border-x border-slate-300 p-2 h-8"></td>
                  <td className="border-x border-slate-300 p-2 h-8"></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-800">
                <td colSpan={4} className="border border-slate-300 p-2 text-right font-bold text-slate-700">VALOR TOTAL:</td>
                <td className="border border-slate-300 p-2 text-right font-black text-lg">{formatMoney(order.payment.total)}</td>
              </tr>
              {order.items.reduce((acc, item) => acc + item.discount, 0) > 0 && (
                <tr>
                  <td colSpan={4} className="border border-slate-300 p-2 text-right text-xs text-red-600 font-semibold">Desconto Total:</td>
                  <td className="border border-slate-300 p-2 text-right text-xs font-bold text-red-600">-{formatMoney(order.items.reduce((acc, item) => acc + item.discount, 0))}</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>

        {/* PAGAMENTO E OBS */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <div className="bg-slate-800 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 mb-2">
              Condições de Pagamento
            </div>
            <div className="border border-slate-300 rounded p-3 text-sm h-28">
              <p><strong>Forma:</strong> Pagamento à {order.payment.type}</p>
              <p><strong>Meio Preferencial:</strong> {order.payment.method}</p>
              <p><strong>Validade do Orçamento:</strong> {order.validityDays} dias</p>
            </div>
          </div>
          <div>
            <div className="bg-slate-800 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 mb-2">
              Observações / Declarações
            </div>
            <div className="border border-slate-300 rounded p-3 text-sm h-28 text-slate-600 text-xs">
              {order.payment.notes ? (
                <p>{order.payment.notes}</p>
              ) : (
                <p className="italic">Declaro que os serviços e peças listados acima foram analisados e os valores apresentados conferem com o acordado para a execução do serviço proposto.</p>
              )}
            </div>
          </div>
        </div>

        {/* ASSINATURAS */}
        <div className="grid grid-cols-2 gap-12 mt-16 px-8">
          <div className="text-center">
            <div className="border-t border-black pt-2 text-sm font-semibold uppercase">
              {settings.name}
            </div>
            <div className="text-xs text-slate-500 mt-1">Empresa / Responsável</div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2 text-sm font-semibold uppercase">
              {customer.name}
            </div>
            <div className="text-xs text-slate-500 mt-1">Cliente / Autorização</div>
          </div>
        </div>

      </div>
    </div>
  );
}