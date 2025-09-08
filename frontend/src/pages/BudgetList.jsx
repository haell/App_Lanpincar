// frontend/src/pages/BudgetList.jsx
import React, { useEffect, useState } from 'react';
import API from '../api';

export default function BudgetList(){
  const [orc, setOrc] = useState([]);
  useEffect(()=> { API.get('/orcamentos').then(r=> setOrc(r.data)); }, []);

  async function openPdf(id){
    const url = `http://localhost:4000/api/orcamentos/${id}/pdf`;
    window.open(url, '_blank');
  }

  async function toggleStatus(item){
    const next = prompt('Digite novo status (Aberto|Em andamento|Concluído|Entregue):', item.Status);
    if (!next) return;
    await API.put(`/orcamentos/${item.ID_Orcamento}`, { Status: next });
    setOrc(o => o.map(x => x.ID_Orcamento===item.ID_Orcamento ? {...x, Status: next} : x));
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-4">Histórico de Orçamentos</h2>
      <table className="w-full">
        <thead>
          <tr className="text-left">
            <th>Cliente</th><th>Data</th><th>Status</th><th>Valor</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {orc.map(o => (
            <tr key={o.ID_Orcamento} className="border-t">
              <td>{o.Nome_Cliente}</td>
              <td>{new Date(o.Data_Emissao).toLocaleString()}</td>
              <td>{o.Status}</td>
              <td>R$ {Number(o.Valor_Total||0).toFixed(2)}</td>
              <td className="space-x-2">
                <button className="text-sm" onClick={()=> openPdf(o.ID_Orcamento)}>Imprimir</button>
                <button className="text-sm" onClick={()=> toggleStatus(o)}>Alterar Status</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
