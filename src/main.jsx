// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext"; // 1. Importer le fournisseur de contexte
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        {" "}
        {/* 2. Envelopper l'application */}
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
