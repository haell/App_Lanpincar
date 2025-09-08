// frontend/src/components/LogoUploader.jsx
import React, { useState } from 'react';
import API from '../api';

export default function LogoUploader({ onSaved }) {
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!file) return;
    setSending(true);
    const fd = new FormData();
    fd.append('logo', file);
    // other fields can be appended
    const res = await API.put('/settings', fd, { headers: {'Content-Type': 'multipart/form-data'} });
    setSending(false);
    onSaved && onSaved(res.data);
  };

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
      <button className="bg-primary text-white px-4 py-2 rounded" onClick={submit} disabled={sending}>
        {sending ? 'Enviando...' : 'Salvar Logo'}
      </button>
    </div>
  );
}
