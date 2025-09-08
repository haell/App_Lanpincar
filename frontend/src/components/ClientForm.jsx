// frontend/src/components/ClientForm.jsx
import React, { useState } from 'react';
import API from '../api';

export default function ClientForm({ defaultData, onSaved }) {
  const [form, setForm] = useState(defaultData || { Nome:'', Endereco:'', Bairro:'', Telefone:'', Chassi:'' });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      if (form.ID_Cliente) {
        const res = await API.put(`/clients/${form.ID_Cliente}`, form);
        onSaved && onSaved(res.data);
      } else {
        const res = await API.post('/clients', form);
        onSaved && onSaved(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-2">
      <input value={form.Nome} onChange={(e)=>setForm({...form, Nome:e.target.value})} placeholder="Nome" className="w-full p-2 border rounded"/>
      <input value={form.Endereco} onChange={(e)=>setForm({...form, Endereco:e.target.value})} placeholder="Endereço" className="w-full p-2 border rounded"/>
      <div className="flex gap-2">
        <input value={form.Bairro} onChange={(e)=>setForm({...form, Bairro:e.target.value})} placeholder="Bairro" className="flex-1 p-2 border rounded"/>
        <input value={form.Telefone} onChange={(e)=>setForm({...form, Telefone:e.target.value})} placeholder="Telefone" className="w-48 p-2 border rounded"/>
      </div>
      <input value={form.Chassi} onChange={(e)=>setForm({...form, Chassi:e.target.value})} placeholder="Chassi" className="w-full p-2 border rounded"/>
      <div className="flex justify-end">
        <button className="bg-primary text-white px-4 py-2 rounded" onClick={save} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Cliente'}
        </button>
      </div>
    </div>
  );
}
