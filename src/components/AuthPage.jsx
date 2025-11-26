// src/components/AuthPage.jsx

import React, { useState } from "react";
import "./AuthPage.css";
import { useAuth } from "../context/AuthContext"; // 1. Importer le hook

// L'URL de base de notre API
const API_URL = import.meta.env.VITE_API_URL;

// 1. Accepter "setToken" en tant que "prop" (propriété)
function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(""); // Pour afficher les erreurs

  // 1. Récupérer "login" au lieu de "setToken"
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Réinitialiser les erreurs

    // Déterminer l'URL et le corps de la requête
    const url = isLogin ? `${API_URL}/login` : `${API_URL}/register`;
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      // Envoyer la requête au backend
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      // Récupérer la réponse (même si c'est une erreur)
      const data = await response.json();

      // Si la réponse n'est pas OK (status 400, 401, 500...)
      if (!response.ok) {
        // 'data.error' vient de notre backend (ex: "Email ou mot de passe incorrect.")
        throw new Error(data.error || "Une erreur est survenue.");
      }

      // --- Si tout s'est bien passé ---

      if (isLogin) {
        // 4. On passe tout l'objet data
        login(data);
      } else {
        alert(data.message); // "Veuillez vérifier vos emails..."
        setIsLogin(true); // On renvoie vers le login
      }
    } catch (err) {
      // Attraper les erreurs (réseau ou celles qu'on a "lancées")
      setError(err.message);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError(""); // Effacer les erreurs en changeant de formulaire
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="logo-container">
          <img
            src="/bplan(1).svg"
            alt="Budget Planner Logo"
            className="auth-logo"
          />
        </div>
        <h2>{isLogin ? "Connexion" : "Inscription"}</h2>

        {!isLogin && (
          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Afficher le message d'erreur s'il existe */}
        {error && <p className="error-message">{error}</p>}

        <button type="submit">{isLogin ? "Se connecter" : "S'inscrire"}</button>

        <button
          type="button" // Important pour ne pas soumettre le formulaire
          onClick={toggleForm}
          className="toggle-link"
        >
          {isLogin
            ? "Pas de compte ? Inscrivez-vous"
            : "Vous avez déjà un compte ? Connectez-vous"}
        </button>
      </form>
    </div>
  );
}

export default AuthPage;
