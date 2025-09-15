import React, { useState } from "react";
import EditorModal from "./EditorModal";

const FirstScreen = ({ config, setConfig, onEnter }) => {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="extra-page first-screen">
      {config.logo ? <img src={config.logo} alt="Logo" className="extra-logo" /> : <div className="extra-logo placeholder">Logo</div>}
      <h1 className="extra-slogan">{config.slogan}</h1>
      <p className="extra-description">{config.description}</p>
      <button className="enter-button" onClick={onEnter}>{config.enterButton}</button>
      <button className="enter-button edit-button" onClick={() => setShowEditor(true)}>Editar Conteúdo</button>

      {showEditor && <EditorModal data={config} onClose={() => setShowEditor(false)} onSave={(newData) => { setConfig(prev => ({ ...prev, firstScreen: newData })); setShowEditor(false); }} />}
    </div>
  );
};

export default FirstScreen;
