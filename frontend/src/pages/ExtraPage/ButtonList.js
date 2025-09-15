import React, { useState } from "react";
import EditorModal from "./EditorModal";

const ButtonList = ({ buttons, onSelectPage, setConfig }) => {
  const [editIndex, setEditIndex] = useState(null);

  const handleSaveButton = (newData, idx) => {
    const newButtons = [...buttons];
    newButtons[idx] = newData;
    setConfig(prev => ({ ...prev, secondScreen: { ...prev.secondScreen, buttons: newButtons } }));
    setEditIndex(null);
  };

  return (
    <div className="button-grid">
      {buttons.map((btn, idx) => (
        <div key={idx} className="button-card">
          {btn.img ? <img src={btn.img} alt={btn.title} onClick={() => onSelectPage(btn.title)} /> : <div className="button-card placeholder" onClick={() => onSelectPage(btn.title)}>Img</div>}
          <p>{btn.title}</p>
          <button style={{marginTop:'5px'}} onClick={() => setEditIndex(idx)}>Editar</button>
          {editIndex === idx && <EditorModal data={btn} onClose={() => setEditIndex(null)} onSave={(newData) => handleSaveButton(newData, idx)} />}
        </div>
      ))}
    </div>
  );
};

export default ButtonList;
