import React, { useState, useEffect } from "react";
import FirstScreen from "./FirstScreen";
import SecondScreen from "./SecondScreen";
import "./ExtraPage.css";

const defaultConfig = {
  firstScreen: {
    logo: null,
    slogan: "O melhor app de controle de orçamentos",
    description: "Controle completo para serviços de Oficinas",
    enterButton: "Entrar",
  },
  secondScreen: {
    header: {
      logo: null,
      name: "Nome Alterável",
      description: "Descrição alterável a qualquer momento",
    },
    buttons: [
      { title: "Serviço 1", img: null },
      { title: "Serviço 2", img: null },
      { title: "Serviço 3", img: null },
      { title: "Serviço 4", img: null },
      { title: "Serviço 5", img: null },
      { title: "Serviço 6", img: null },
      { title: "Serviço 7", img: null },
      { title: "Serviço 8", img: null },
      { title: "Serviço 9", img: null },
    ],
  },
  footerText: "© 2025 App Lanpincar - Todos os direitos reservados",
};

const ExtraPage = () => {
  const [showSecondScreen, setShowSecondScreen] = useState(false);
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    const saved = localStorage.getItem("extraPageConfig");
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("extraPageConfig", JSON.stringify(config));
  }, [config]);

  return (
    <>
      {!showSecondScreen ? (
        <FirstScreen
          config={config.firstScreen}
          setConfig={setConfig}
          onEnter={() => setShowSecondScreen(true)}
        />
      ) : (
        <SecondScreen config={config} setConfig={setConfig} />
      )}
    </>
  );
};

export default ExtraPage;
