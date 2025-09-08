// frontend/src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ settings }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {settings && settings.logo_path ? (
            <img src={`http://localhost:4000${settings.logo_path}`} alt="logo" className="h-12 object-contain"/>
          ) : (
            <div className="h-12 w-12 bg-primary text-white flex items-center justify-center rounded">OL</div>
          )}
          <div>
            <h1 className="font-bold text-xl">{settings?.nome_oficina || 'Oficina de Lanternagem'}</h1>
            <p className="text-sm text-gray-500">Sistema de orçamentos digitais</p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Link to="/" className="text-sm px-3 py-2 rounded hover:bg-gray-100">Dashboard</Link>
          <Link to="/orcamentos" className="text-sm px-3 py-2 rounded hover:bg-gray-100">Orçamentos</Link>
          <Link to="/clients" className="text-sm px-3 py-2 rounded hover:bg-gray-100">Clientes</Link>
          <Link to="/relatorios" className="text-sm px-3 py-2 rounded hover:bg-gray-100">Relatórios</Link>
          <Link to="/config" className="text-sm px-3 py-2 rounded hover:bg-gray-100">Config</Link>
        </nav>
      </div>
    </header>
  );
}
