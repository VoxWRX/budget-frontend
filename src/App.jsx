// src/App.jsx

import "./App.css";
import { useAuth } from "./context/AuthContext";
import { Routes, Route, Navigate } from "react-router-dom"; // 1. Importer les outils de routage
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard"; // 1. Importer le Dashboard
import BudgetDetailPage from "./components/BudgetDetailPage";
import ProfilePage from "./components/ProfilePage";
import VerifyEmailPage from "./components/VerifyEmailPage";
import InvitationsPage from "./components/InvitationsPage";

function App() {
  const { token } = useAuth();

  return (
    <div className="App">
      <Routes>
        {/* CORRECTION S7735 : On teste la condition positive d'abord */}
        {token ? (
          // SI CONNECTÉ
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/budget/:budgetId" element={<BudgetDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/invitations" element={<InvitationsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          // SI NON CONNECTÉ
          <>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
