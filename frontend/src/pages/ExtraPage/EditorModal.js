import React, { useState } from "react";

const EditorModal = ({ data, onClose, onSave }) => {
  const [editData, setEditData] = useState({ ...data });

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleImageUpload = (field, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange(field, reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="editor-modal">
      <div className="editor-content">
        <h3>Editar Conteúdo</h3>

        {Object.keys(editData).map((key) => {
          if (key === "logo" || key === "img") {
            return (
              <div key={key} className="editor-field">
                <label>{key}</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(key, e.target.files[0])} />
                {editData[key] && <img src={editData[key]} alt="preview" style={{width:'80px', marginTop:'5px'}} />}
              </div>
            );
          } else {
            return (
              <div key={key} className="editor-field">
                <label>{key}</label>
                <input type="text" value={editData[key]} onChange={(e) => handleChange(key, e.target.value)} />
              </div>
            );
          }
        })}

        <div className="editor-actions">
          <button onClick={() => onSave(editData)}>Salvar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default EditorModal;
