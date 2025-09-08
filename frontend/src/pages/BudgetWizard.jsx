// frontend/src/pages/BudgetWizard.jsx
import React, { useEffect, useState } from 'react';
import API from '../api';
import ServiceRow from '../components/ServiceRow';
import SignaturePad from '../components/SignaturePad';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from "qrcode.react";


export default function BudgetWizard(){
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    ID_Cliente: null,
    ClienteTemp: {},
    CheckList: {},
    Servicos: [],
    Valor_Total: 0,
    Valor_A_Vista: 0,
    Valor_A_Prazo: 0,
    Forma_Pagamento: 'Dinheiro',
    QR_Code_Pix: null,
    Data_Prevista_Conclusao: null,
    Status: 'Aberto',
    Observacoes: '',
    Assinatura_Cliente: null
  });
  const nav = useNavigate();

  useEffect(()=> {
    API.get('/clients').then(r=>setClients(r.data));
  },[]);

  function addService(){
    setForm(f => ({ ...f, Servicos: [...f.Servicos, {Descricao:'Desamassar', Descricao_Livre:'', Quantidade:1, Valor_Unitario:0, Valor_Total:0}]}))
  }
  function updateService(idx, data){
    const copy = [...form.Servicos]; copy[idx]=data;
    copy[idx].Valor_Total = (parseFloat(copy[idx].Quantidade)||0)*(parseFloat(copy[idx].Valor_Unitario)||0);
    const total = copy.reduce((s,x)=> s + (parseFloat(x.Valor_Total)||0), 0);
    setForm(f => ({ ...f, Servicos: copy, Valor_Total: total, Valor_A_Vista: total }));
  }
  function removeService(idx){
    const copy = form.Servicos.filter((_,i)=>i!==idx);
    const total = copy.reduce((s,x)=> s + (parseFloat(x.Valor_Total)||0), 0);
    setForm(f => ({ ...f, Servicos: copy, Valor_Total: total, Valor_A_Vista: total }));
  }

  async function gerarQRCode(){
    // For MVP: just use pix_key from settings concatenated with value to produce text; backend expects QR string in QR_Code_Pix
    const settings = (await API.get('/settings')).data;
    const pix = settings.pix_key || '00000000';
    const payload = `PIX|${pix}|VALOR:${form.Valor_A_Vista || form.Valor_Total}`;
    setForm(f => ({...f, QR_Code_Pix: payload}));
  }

  async function saveBudget(){
    // If client not selected, create new temp client
    let idCliente = form.ID_Cliente;
    if (!idCliente && form.ClienteTemp.Nome){
      const res = await API.post('/clients', {...form.ClienteTemp});
      idCliente = res.data.ID_Cliente;
    }
    const payload = {
      ID_Cliente: idCliente,
      Data_Prevista_Conclusao: form.Data_Prevista_Conclusao,
      Status: form.Status,
      Valor_Total: form.Valor_Total,
      Valor_A_Vista: form.Valor_A_Vista,
      Valor_A_Prazo: form.Valor_A_Prazo,
      Forma_Pagamento: form.Forma_Pagamento,
      QR_Code_Pix: form.QR_Code_Pix,
      Observacoes: form.Observacoes,
      Assinatura_Cliente: form.Assinatura_Cliente,
      Servicos: form.Servicos
    };
    const res = await API.post('/orcamentos', payload);
    // Save success
    alert('Orçamento salvo!');
    nav('/orcamentos');
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="font-bold text-lg mb-4">Criar Orçamento — Passo {step} de 6</h2>

      {step === 1 && (
        <div>
          <h3 className="font-semibold">Dados do Cliente</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm">Selecionar Cliente Existente</label>
              <select onChange={(e)=> setForm({...form, ID_Cliente: e.target.value || null})} className="w-full p-2 border rounded">
                <option value="">-- Novo cliente --</option>
                {clients.map(c => <option key={c.ID_Cliente} value={c.ID_Cliente}>{c.Nome} — {c.Telefone}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm">Ou preencher novo cliente</label>
              <input placeholder="Nome" onChange={e=> setForm({...form, ClienteTemp:{...form.ClienteTemp, Nome:e.target.value}})} className="w-full p-2 border rounded"/>
            </div>
            <div><input placeholder="Telefone" onChange={e=> setForm({...form, ClienteTemp:{...form.ClienteTemp, Telefone:e.target.value}})} className="w-full p-2 border rounded"/></div>
            <div><input placeholder="Chassi" onChange={e=> setForm({...form, ClienteTemp:{...form.ClienteTemp, Chassi:e.target.value}})} className="w-full p-2 border rounded"/></div>
            <div className="col-span-2 text-right">
              <button className="bg-primary text-white px-4 py-2 rounded" onClick={()=>setStep(2)}>Avançar</button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="font-semibold">Check-list do Veículo</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-4 border rounded">
              <div className="font-semibold">Frente / Lateral Esquerda / Traseira / Lateral Direita / Vista Superior (marcadores)</div>
              <div className="text-sm text-gray-500 mt-2">Clique nas áreas (MVP: descrição em texto)</div>
              <textarea placeholder="Observações do técnico" onChange={(e)=> setForm({...form, Observacoes:e.target.value})} className="w-full h-32 border p-2 rounded mt-2"/>
            </div>
            <div className="p-4 border rounded">
              <label>Pneus</label>
              <select onChange={e=> setForm({...form, CheckList:{...form.CheckList, Pneus:e.target.value}})} className="w-full p-2 border rounded mt-1">
                <option>Novos</option>
                <option>Bons</option>
                <option>Ruins</option>
              </select>

              <label className="mt-2 block">Combustível</label>
              <select onChange={e=> setForm({...form, CheckList:{...form.CheckList, Combustivel:e.target.value}})} className="w-full p-2 border rounded mt-1">
                <option>Cheio</option>
                <option>¾</option>
                <option>½</option>
                <option>¼</option>
                <option>Reserva</option>
              </select>
            </div>
            <div className="p-4 border rounded">
              <label>Chassi</label>
              <input className="w-full p-2 border rounded mt-1" onChange={e => setForm({...form, ClienteTemp:{...form.ClienteTemp, Chassi: e.target.value}})} value={form.ClienteTemp.Chassi || ''}/>
              <label className="mt-2">Motorista</label>
              <input className="w-full p-2 border rounded mt-1" onChange={e => setForm({...form, CheckList:{...form.CheckList, Motorista: e.target.value}})} />
            </div>

            <div className="col-span-3 text-right">
              <button className="px-3 py-2 mr-2" onClick={()=>setStep(1)}>Voltar</button>
              <button className="bg-primary text-white px-4 py-2 rounded" onClick={()=>setStep(3)}>Avançar</button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="font-semibold">Serviços e Peças</h3>
          <div className="space-y-2">
            {form.Servicos.map((s, i)=> (
              <ServiceRow key={i} idx={i} data={s} onChange={(d)=> updateService(i,d)} onRemove={removeService}/>
            ))}
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold">Total: R$ { (form.Valor_Total||0).toFixed(2) }</div>
              <div>
                <button className="px-3 py-2 mr-2" onClick={()=> setStep(2)}>Voltar</button>
                <button className="bg-white border px-3 py-2 mr-2" onClick={addService}>Adicionar Serviço/Peça</button>
                <button className="bg-primary text-white px-4 py-2 rounded" onClick={()=>setStep(4)}>Avançar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 className="font-semibold">Condições de Pagamento</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label>Valor Total</label>
              <input className="w-full p-2 border rounded" value={form.Valor_Total} readOnly />
            </div>
            <div>
              <label>Valor à Vista</label>
              <input className="w-full p-2 border rounded" value={form.Valor_A_Vista} onChange={(e)=> setForm({...form, Valor_A_Vista: e.target.value})}/>
            </div>
            <div>
              <label>Valor a Prazo</label>
              <input className="w-full p-2 border rounded" value={form.Valor_A_Prazo} onChange={(e)=> setForm({...form, Valor_A_Prazo: e.target.value})}/>
            </div>
            <div>
              <label>Forma de Pagamento</label>
              <select className="w-full p-2 border rounded" value={form.Forma_Pagamento} onChange={e=> setForm({...form, Forma_Pagamento: e.target.value})}>
                <option>Dinheiro</option>
                <option>PIX</option>
                <option>Cartão Débito</option>
                <option>Cartão Crédito</option>
                <option>Transferência</option>
                <option>Outro</option>
              </select>
            </div>

            <div className="col-span-2 flex items-center gap-4">
              <button className="bg-white border px-3 py-2" onClick={()=> setForm({...form, QR_Code_Pix: null})}>Remover QR</button>
              <button className="bg-primary text-white px-4 py-2 rounded" onClick={gerarQRCode}>Gerar QR Code PIX</button>
              {form.QR_Code_Pix && (
                <div className="ml-4">
                  <div className="text-sm">QR Code:</div>
                  <QRCodeSVG value={form.QR_Code_Pix} size={120} />
                </div>
              )}
            </div>

            <div className="col-span-2 text-right">
              <button className="px-3 py-2 mr-2" onClick={()=> setStep(3)}>Voltar</button>
              <button className="bg-primary text-white px-4 py-2 rounded" onClick={()=> setStep(5)}>Avançar</button>
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h3 className="font-semibold">Datas e Status</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label>Data de Emissão</label>
              <input readOnly value={ (new Date()).toLocaleDateString() } className="w-full p-2 border rounded"/>
            </div>
            <div>
              <label>Data de Vencimento (em 30 dias)</label>
              <input readOnly value={ new Date(Date.now()+30*24*60*60*1000).toLocaleDateString() } className="w-full p-2 border rounded"/>
            </div>
            <div>
              <label>Data Prevista de Conclusão</label>
              <input type="date" className="w-full p-2 border rounded" onChange={(e)=> setForm({...form, Data_Prevista_Conclusao: e.target.value})}/>
            </div>
            <div>
              <label>Status</label>
              <select value={form.Status} onChange={(e)=> setForm({...form, Status:e.target.value})} className="w-full p-2 border rounded">
                <option>Aberto</option>
                <option>Em andamento</option>
                <option>Concluído</option>
                <option>Entregue</option>
              </select>
            </div>

            <div className="col-span-2 text-right">
              <button className="px-3 py-2 mr-2" onClick={()=> setStep(4)}>Voltar</button>
              <button className="bg-primary text-white px-4 py-2 rounded" onClick={()=> setStep(6)}>Avançar</button>
            </div>
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          <h3 className="font-semibold">Finalização e Assinatura</h3>
          <div className="mb-4">
            <h4 className="font-bold">Resumo</h4>
            <div className="text-sm">Valor Total: R$ { (form.Valor_Total||0).toFixed(2) }</div>
            <div className="text-sm">Forma: {form.Forma_Pagamento}</div>
            <div className="text-sm">Data Prevista: {form.Data_Prevista_Conclusao}</div>
          </div>

          <div className="mb-4">
            <label className="font-semibold">Assinatura do cliente</label>
            <SignaturePad onChange={(data)=> setForm({...form, Assinatura_Cliente: data})} />
          </div>

          <div className="flex justify-end gap-2">
            <button className="px-3 py-2" onClick={()=> setStep(5)}>Voltar</button>
            <button className="bg-white border px-3 py-2" onClick={()=> { window.print(); }}>Imprimir (Preview)</button>
            <button className="bg-primary text-white px-4 py-2 rounded" onClick={saveBudget}>Salvar Orçamento</button>
          </div>
        </div>
      )}
    </div>
  );
}
