// frontend/src/components/ServiceRow.jsx
import React from 'react';

export default function ServiceRow({ idx, data, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center border-b py-2">
      <div className="col-span-4">
        <select value={data.Descricao} onChange={(e)=>onChange({...data, Descricao:e.target.value})} className="w-full p-2 border rounded">
          <option>Desamassar</option>
          <option>Troca de peça</option>
          <option>Solda</option>
          <option>Pintura</option>
          <option>Polimento</option>
        </select>
        <input placeholder="Descrição livre" value={data.Descricao_Livre||''} onChange={(e)=>onChange({...data, Descricao_Livre:e.target.value})} className="w-full p-1 mt-1 text-sm"/>
      </div>
      <div className="col-span-2">
        <input type="number" min="1" value={data.Quantidade} onChange={(e)=>onChange({...data, Quantidade:e.target.value})} className="w-full p-2 border rounded"/>
      </div>
      <div className="col-span-2">
        <input type="number" min="0" step="0.01" value={data.Valor_Unitario} onChange={(e)=>onChange({...data, Valor_Unitario:e.target.value})} className="w-full p-2 border rounded"/>
      </div>
      <div className="col-span-2">
        <div className="p-2">R$ { ( (parseFloat(data.Quantidade)||0) * (parseFloat(data.Valor_Unitario)||0) ).toFixed(2) }</div>
      </div>
      <div className="col-span-2 text-right">
        <button className="text-red-600" onClick={()=>onRemove(idx)}>Remover</button>
      </div>
    </div>
  );
}
