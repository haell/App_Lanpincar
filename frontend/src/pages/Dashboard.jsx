// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

export default function Dashboard({ settings }) {
  const [overview, setOverview] = useState({});

  useEffect(()=> {
    // fetch simple stats: we'll reuse /orcamentos and compute metrics client-side
    API.get('/orcamentos').then(r => {
      const orc = r.data;
      const total = orc.length;
      const abertos = orc.filter(x=>x.Status==='Aberto').length;
      const concluidos = orc.filter(x=>x.Status==='Concluído').length;
      const entregues = orc.filter(x=>x.Status==='Entregue').length;
      const soma = orc.reduce((s, o)=> s + parseFloat(o.Valor_Total || 0), 0);
      setOverview({ total, abertos, concluidos, entregues, soma, vencendo: orc.filter(o => {
        const venc = new Date(o.Data_Vencimento);
        const diff = (venc - new Date())/ (1000*60*60*24);
        return diff >=0 && diff <=5;
      }) });
    });
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Técnico</h2>
          <p className="text-sm text-gray-500">Bem-vindo ao painel da oficina.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/orcamentos/novo" className="bg-primary text-white px-4 py-2 rounded">➕ Novo Orçamento</Link>
          <Link to="/orcamentos" className="bg-white border px-4 py-2 rounded">📂 Orçamentos</Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total orçamentos</div>
          <div className="text-xl font-bold">{overview.total || 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Em aberto</div>
          <div className="text-xl font-bold">{overview.abertos || 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Concluídos</div>
          <div className="text-xl font-bold">{overview.concluidos || 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Valor total (R$)</div>
          <div className="text-xl font-bold">R$ {(overview.soma||0).toFixed(2)}</div>
        </div>
        <Link to="/extra">Nova Extra</Link>

      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Orçamentos vencendo em até 5 dias</h3>
        {overview.vencendo && overview.vencendo.length>0 ? (
          overview.vencendo.map(v => (
            <div key={v.ID_Orcamento} className="flex justify-between py-2 border-b">
              <div><strong>{v.Nome_Cliente}</strong><div className="text-sm text-gray-500">{new Date(v.Data_Vencimento).toLocaleDateString()}</div></div>
              <div>R$ {(v.Valor_Total||0).toFixed(2)}</div>
            </div>
          ))
        ) : <div className="text-sm text-gray-500">Nenhum orçamento próximo do vencimento.</div>}
      </div>
    </div>
  );
}
