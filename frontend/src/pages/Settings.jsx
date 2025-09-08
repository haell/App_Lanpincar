// frontend/src/pages/Settings.jsx
import React, { useState } from 'react';
import LogoUploader from '../components/LogoUploader';
import API from '../api';

export default function Settings({ settings, setSettings }){
  const [form, setForm] = useState(settings || {});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await API.put('/settings', form);
      setSettings && setSettings(res.data);
      alert('Salvo!');
    } catch (err) {
      console.error(err);
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-4">Configurações</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Nome da Oficina</label>
          <input value={form.nome_oficina||''} onChange={e=>setForm({...form, nome_oficina:e.target.value})} className="w-full p-2 border rounded"/>
        </div>
        <div>
          <label>Telefone</label>
          <input value={form.telefone||''} onChange={e=>setForm({...form, telefone:e.target.value})} className="w-full p-2 border rounded"/>
        </div>
        <div>
          <label>E-mail</label>
          <input value={form.email||''} onChange={e=>setForm({...form, email:e.target.value})} className="w-full p-2 border rounded"/>
        </div>
        <div>
          <label>Endereço</label>
          <input value={form.endereco||''} onChange={e=>setForm({...form, endereco:e.target.value})} className="w-full p-2 border rounded"/>
        </div>
        <div>
          <label>Chave PIX</label>
          <input value={form.pix_key||''} onChange={e=>setForm({...form, pix_key:e.target.value})} className="w-full p-2 border rounded"/>
        </div>
        <div>
          <label>Preferências de Impressão</label>
          <select value={form.preferencias_impressao||'ambas'} onChange={e=>setForm({...form, preferencias_impressao:e.target.value})} className="w-full p-2 border rounded">
            <option value="com_fotos">Com fotos</option>
            <option value="sem_fotos">Sem fotos</option>
            <option value="ambas">Ambas</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <h4>Logo atual</h4>
        {settings?.logo_path ? <img src={`http://localhost:4000${settings.logo_path}`} alt="logo" className="h-24 object-contain" /> : <div className="text-gray-500">Sem logo</div>}
        <LogoUploader onSaved={(s)=> setSettings(s)} />
      </div>

      <div className="mt-4 text-right">
        <button className="bg-primary text-white px-4 py-2 rounded" onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar Configurações'}</button>
      </div>
    </div>
  );
}
