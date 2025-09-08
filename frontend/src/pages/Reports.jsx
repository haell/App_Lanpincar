// frontend/src/pages/Reports.jsx
import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Reports(){
  const [orc, setOrc] = useState([]);
  useEffect(() => {
  let isMounted = true;
  API.get('/orcamentos').then(r => {
    if (isMounted) setOrc(r.data);
  });
  return () => { isMounted = false }; // cleanup válido
}, []);

  const month = new Date().getMonth()+1;
  const thisMonth = orc.filter(o => new Date(o.Data_Emissao).getMonth()+1 === month);
  const totalValor = thisMonth.reduce((s,x)=> s + parseFloat(x.Valor_Total || 0),0);
  const open = thisMonth.filter(x=> x.Status==='Aberto').length;
  const concl = thisMonth.filter(x=> x.Status==='Concluído').length;
  const ent = thisMonth.filter(x=> x.Status==='Entregue').length;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold">Relatórios Simples — Mês Atual</h2>
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="p-4 bg-gray-50 rounded"><div>Orçamentos</div><div className="text-xl font-bold">{thisMonth.length}</div></div>
        <div className="p-4 bg-gray-50 rounded"><div>Em aberto</div><div className="text-xl font-bold">{open}</div></div>
        <div className="p-4 bg-gray-50 rounded"><div>Concluídos</div><div className="text-xl font-bold">{concl}</div></div>
        <div className="p-4 bg-gray-50 rounded"><div>Entregues</div><div className="text-xl font-bold">{ent}</div></div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Valores</h3>
        <div className="text-lg font-bold">R$ {totalValor.toFixed(2)}</div>
      </div>
    </div>
  );
}
