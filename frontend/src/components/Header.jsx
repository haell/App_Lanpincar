// frontend/src/components/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header({ settings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/extra', label: 'Extra' },
    { to: '/orcamentos', label: 'Orçamentos' },
    { to: '/clients', label: 'Clientes' },
    { to: '/relatorios', label: 'Relatórios' },
    { to: '/config', label: 'Config' },
  ];

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
        {/* Desktop menu */}
        <nav className="hidden md:flex flex-wrap items-center gap-2 min-w-0">
          {links.map(link => (
            <Link key={link.to} to={link.to} className="text-sm px-3 py-2 rounded hover:bg-gray-100">{link.label}</Link>
          ))}
        </nav>
        {/* Hamburger button for mobile */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-100 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {/* Mobile menu dropdown */}
      {menuOpen && (
        <nav className="md:hidden bg-white border-t shadow px-4 py-2 flex flex-col gap-2 z-50">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-base px-3 py-2 rounded hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
