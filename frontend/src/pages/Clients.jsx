// frontend/src/pages/Clients.jsx
import React, { useEffect, useState } from 'react';
import API from '../api';
import ClientForm from '../components/ClientForm';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);

  const fetchClients = ()=> {
    API.get('/clients', { params: { q }}).then(r => setClients(r.data));
  };

  useEffect(()=> fetchClients(), []);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 bg-white p-4 rounded shadow">
        <div className="flex justify-between mb-2">
          <h3 className="font-bold">Clientes</h3>
          <div>
            <input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)} className="p-2 border rounded mr-2"/>
            <button className="bg-primary text-white px-3 py-1 rounded" onClick={fetchClients}>Pesquisar</button>
          </div>
        </div>
        <div>
          {clients.map(c => (
            <div key={c.ID_Cliente} className="flex items-center justify-between border-b py-2">
              <div>
                <div className="font-bold">{c.Nome}</div>
                <div className="text-sm text-gray-500">{c.Telefone} • {c.Bairro}</div>
              </div>
              <div className="flex gap-2">
                <button className="text-sm" onClick={()=> setEditing(c)}>Editar</button>
                <button className="text-sm text-red-600" onClick={async ()=> { if(window.confirm('Remover?')) { await API.delete(`/clients/${c.ID_Cliente}`); fetchClients(); }}}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">{editing ? 'Editar Cliente' : 'Novo Cliente'}</h3>
        <ClientForm defaultData={editing} onSaved={(c)=> { setEditing(null); fetchClients(); }} />
      </div>
    </div>
  );
}
