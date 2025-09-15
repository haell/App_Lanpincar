import React, { useState } from "react";
import ButtonList from "./ButtonList";
import SimplePage from "./SimplePage";
import EditorModal from "./EditorModal";

const SecondScreen = ({ config, setConfig }) => {
  const [selectedPage, setSelectedPage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  if (selectedPage) return <SimplePage title={selectedPage} goBack={() => setSelectedPage(null)} />;

  return (
    <div className="extra-page second-screen">
      <header className="extra-header">
        {config.secondScreen.header.logo ? <img src={config.secondScreen.header.logo} alt="Logo" className="header-logo" /> : <div className="header-logo placeholder">Logo</div>}
        <div className="header-texts">
          <h2>{config.secondScreen.header.name}</h2>
          <p>{config.secondScreen.header.description}</p>
        </div>
        <button className="enter-button edit-button" onClick={() => setShowEditor(true)}>Editar Cabeçalho</button>
      </header>

      <main className="extra-main">
        <ButtonList buttons={config.secondScreen.buttons} onSelectPage={setSelectedPage} setConfig={setConfig} />
      </main>

      <footer className="extra-footer">{config.footerText}</footer>

      {showEditor && <EditorModal data={config.secondScreen.header} onClose={() => setShowEditor(false)} onSave={(newData) => { setConfig(prev => ({ ...prev, secondScreen: { ...prev.secondScreen, header: newData } })); setShowEditor(false); }} />}
    </div>
  );
};

export default SecondScreen;
