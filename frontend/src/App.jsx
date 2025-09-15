// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import BudgetWizard from './pages/BudgetWizard';
import BudgetList from './pages/BudgetList';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Footer from './components/Footer';
import Header from './components/Header';
import API from './api';
import ExtraPage from "./pages/ExtraPage";

export default function App(){
  const [settings, setSettings] = useState(null);

  useEffect(()=> {
    API.get('/settings').then(r => setSettings(r.data)).catch(()=>{});
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header settings={settings} />
        <main className="flex-1 max-w-6xl mx-auto p-4 w-full">
          <Routes>
            <Route path="/" element={<Dashboard settings={settings} />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/extra" element={<ExtraPage />} />
            <Route path="/orcamentos/novo" element={<BudgetWizard />} />
            <Route path="/orcamentos" element={<BudgetList />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/config" element={<Settings settings={settings} setSettings={setSettings} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}