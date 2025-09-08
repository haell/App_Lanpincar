// frontend/src/components/SignaturePad.jsx
import React, { useRef, useEffect, useState } from 'react';
import SignaturePadLib from 'signature_pad';

export default function SignaturePad({ onChange }) {
  const ref = useRef();
  const [pad, setPad] = useState(null);

  useEffect(()=> {
    const sp = new SignaturePadLib(ref.current, { backgroundColor: 'rgba(255,255,255,0)' });
    setPad(sp);
    return () => sp.off();
  }, []);

  const clear = () => { pad && pad.clear(); onChange && onChange(null); };
  const save = () => {
    if (!pad) return;
    if (pad.isEmpty()) return alert('Assine antes');
    const data = pad.toDataURL('image/png');
    onChange && onChange(data);
  };

  return (
    <div className="border rounded p-2">
      <canvas ref={ref} className="w-full h-48 bg-white"></canvas>
      <div className="flex gap-2 mt-2">
        <button className="px-3 py-1 bg-gray-200 rounded" onClick={clear}>Limpar</button>
        <button className="px-3 py-1 bg-primary text-white rounded" onClick={save}>Salvar Assinatura</button>
      </div>
    </div>
  );
}
