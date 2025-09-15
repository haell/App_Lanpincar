import React from "react";

const SimplePage = ({ title, goBack }) => {
  return (
    <div className="simple-page">
      <button className="back-button" onClick={goBack}>← Voltar</button>
      <h1>{title}</h1>
      <p>Esta página é em branco com apenas o título.</p>
    </div>
  );
};

export default SimplePage;
