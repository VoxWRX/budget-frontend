// src/components/Dashboard.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService"; // On importe notre nouvel assistant !
import "./Dashboard.css"; // On va créer ce fichier
import { Link } from "react-router-dom";

function Dashboard() {
  const { user, logout } = useAuth(); // On récupère la fonction de déconnexion

  // États pour stocker nos données
  const [budgets, setBudgets] = useState([]); // Pour la liste des budgets
  const [isLoading, setIsLoading] = useState(true); // Pour l'indicateur de chargement
  const [error, setError] = useState(""); // Pour les erreurs

  const [invitCount, setInvitCount] = useState(0);

  const [newBudgetName, setNewBudgetName] = useState(""); // Pour le champ du formulaire

  // NOUVEL ÉTAT pour la devise
  const [newBudgetCurrency, setNewBudgetCurrency] = useState("EUR");

  // useEffect est un hook qui se lance au "montage" du composant
  // C'est l'endroit parfait pour charger des données
  useEffect(() => {
    // On définit une fonction pour charger les budgets
    const fetchBudgets = async () => {
      try {
        // On utilise notre service ! Plus besoin de gérer le token ici.
        const data = await apiService("/budgets", "GET");
        setBudgets(data); // On stocke les budgets dans l'état
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false); // Dans tous les cas, on arrête de charger
      }
    };

    fetchBudgets(); // On appelle la fonction
  }, []); // Le tableau vide [] signifie "ne faire ça qu'une seule fois"

  // Gère la soumission du formulaire de création de budget
  const handleCreateBudget = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    if (!newBudgetName) return; // Ne rien faire si le champ est vide

    try {
      // 1. On appelle notre API (endpoint, méthode, corps)
      const newBudget = await apiService("/budgets", "POST", {
        name: newBudgetName,
        currency: newBudgetCurrency, // On envoie aussi la devise
      });

      // 2. On met à jour notre liste de budgets SANS recharger la page
      // On ajoute le nouveau budget à la liste existante
      setBudgets((prevBudgets) => [...prevBudgets, newBudget]);

      // 3. On réinitialise le champ du formulaire
      setNewBudgetName("");
      setNewBudgetCurrency("EUR"); // Réinitialiser le formulaire
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // --- NOUVELLE FONCTION : SUPPRESSION ---
  const handleDeleteBudget = async (e, budgetId) => {
    e.preventDefault();

    // CORRECTION S7764 : globalThis au lieu de window
    if (
      !globalThis.confirm(
        "Êtes-vous sûr de vouloir supprimer ce budget définitivement ?"
      )
    ) {
      return;
    }

    try {
      await apiService(`/budgets/${budgetId}`, "DELETE");
      // On met à jour la liste locale en filtrant le budget supprimé
      setBudgets(budgets.filter((b) => b.id !== budgetId));
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // On lance les deux requêtes en parallèle pour aller plus vite
        const [budgetsData, invitsData] = await Promise.all([
          apiService("/budgets", "GET"),
          apiService("/invitations", "GET"), // On récupère les invitations
        ]);

        setBudgets(budgetsData);
        // On compte combien d'invitations sont reçues
        setInvitCount(invitsData.length);

        setError("");
      } catch (err) {
        // Si l'une des requêtes échoue, on affiche l'erreur
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Affichage pendant le chargement
  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        {/* 3. Afficher le nom de l'utilisateur ! */}
        <div className="header-title">
          {/* user?.name utilise "l'optional chaining" au cas où user est null */}
          <h1>Bonjour, {user?.name} !</h1>
          <p>Bienvenue sur votre tableau de bord.</p>
        </div>
        <div className="header-actions">
          <Link to="/invitations" className="profile-link-btn relative-btn">
            💌 Invitations
            {invitCount > 0 && (
              <span className="notification-badge">{invitCount}</span>
            )}
          </Link>
          <Link to="/profile" className="profile-link-btn">
            Mon Profil 👤
          </Link>
          <button onClick={logout} className="logout-button">
            Se déconnecter
          </button>
        </div>
      </header>

      {/* Afficher l'erreur si elle existe */}
      {error && <p className="error-message">{error}</p>}

      <main>
        {/* --- NOUVEAU FORMULAIRE --- */}
        <div className="budget-creator">
          <h2>Créer un nouveau budget</h2>
          <form onSubmit={handleCreateBudget}>
            <input
              type="text"
              value={newBudgetName}
              onChange={(e) => setNewBudgetName(e.target.value)}
              placeholder="Nom du budget (ex: Vacances 2026)"
            />
            {/* 5. LE NOUVEAU MENU DÉROULANT */}
            <select
              value={newBudgetCurrency}
              onChange={(e) => setNewBudgetCurrency(e.target.value)}
            >
              <option value="EUR">€ EUR</option>
              <option value="USD">$ USD</option>
              <option value="CAD">$ CAD</option>
              <option value="GBP">£ GBP</option>
              <option value="JPY">¥ JPY</option>
              <option value="MAD">MAD</option>
            </select>
            <button type="submit">Créer</button>
          </form>
        </div>
        {/* --- FIN DU NOUVEAU FORMULAIRE --- */}
        <h2 className="budget-list-title">Mes Budgets</h2>
        <div className="budgets-list">
          {budgets.length > 0 ? (
            budgets.map((budget) => (
              // 2. ENVELOPPER LA CARTE AVEC <Link>
              <Link
                to={`/budget/${budget.id}`}
                key={budget.id}
                className="budget-card" // <-- CHANGEMENT ICI
              >
                <div className="card-content">
                  <h3>{budget.name}</h3>

                  {/* BOUTON SUPPRIMER */}
                  <button
                    className="delete-budget-btn"
                    onClick={(e) => handleDeleteBudget(e, budget.id)}
                    title="Supprimer ce budget"
                  >
                    &times;{" "}
                    {/* C'est le symbole "Multiplication" qui fait une jolie croix */}
                  </button>
                </div>
              </Link>
            ))
          ) : (
            <p>Vous n'avez pas encore de budget.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
