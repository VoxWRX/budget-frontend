import React, { useEffect } from "react"; // Import useEffect
import "./App.css";
import { useAuth } from "./context/AuthContext";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import BudgetDetailPage from "./components/BudgetDetailPage";
import ProfilePage from "./components/ProfilePage";
import InvitationsPage from "./components/InvitationsPage";
import VerifyEmailPage from "./components/VerifyEmailPage";

function App() {
  const { token } = useAuth();

  // CORRECTION : Logique de thème globale
  // Elle s'exécute au lancement de l'application, quelle que soit la page
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedColor = localStorage.getItem("primaryColor");

    // Appliquer le mode sombre
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    // Appliquer la couleur personnalisée
    if (savedColor) {
      document.documentElement.style.setProperty(
        "--electric-sapphire",
        savedColor
      );

      // Fonction helper pour ajuster la couleur (la même que dans ProfilePage)
      const adjustColor = (color, amount) => {
        const hex = color.replace("#", "");
        const r = Number.parseInt(hex.substring(0, 2), 16);
        const g = Number.parseInt(hex.substring(2, 4), 16);
        const b = Number.parseInt(hex.substring(4, 6), 16);
        const newR = Math.min(255, Math.max(0, r + amount));
        const newG = Math.min(255, Math.max(0, g + amount));
        const newB = Math.min(255, Math.max(0, b + amount));
        const rr =
          (newR.toString(16).length === 1 ? "0" : "") + newR.toString(16);
        const gg =
          (newG.toString(16).length === 1 ? "0" : "") + newG.toString(16);
        const bb =
          (newB.toString(16).length === 1 ? "0" : "") + newB.toString(16);
        return `#${rr}${gg}${bb}`;
      };

      document.documentElement.style.setProperty(
        "--true-azure",
        adjustColor(savedColor, -20)
      );
    }
  }, []); // [] signifie "au chargement de l'app"

  return (
    <div className="App">
      <Routes>
        {/* Route publique pour la vérification d'email */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {token ? (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/budget/:budgetId" element={<BudgetDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/invitations" element={<InvitationsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
