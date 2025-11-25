// src/components/BudgetDetailPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import apiService from "../services/apiService";
import "./BudgetDetailPage.css";
import BudgetCharts from "./BudgetCharts";
import "./BudgetCharts.css";
import { generateTransactionsCSV } from "../utils/csvHelper";

function BudgetDetailPage() {
  const { budgetId } = useParams();

  const [budget, setBudget] = useState(null);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  // Correction 1 : On s'assure que 'error' est bien utilisé dans le JSX plus bas
  const [error, setError] = useState("");

  // États formulaires
  const [catName, setCatName] = useState("");
  const [catLimit, setCatLimit] = useState("");

  // --- NOUVEAUX ÉTATS POUR ÉDITION CATÉGORIE ---
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatLimit, setEditCatLimit] = useState("");

  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txType, setTxType] = useState("expense");
  const [txCatId, setTxCatId] = useState("");

  const [editingTxId, setEditingTxId] = useState(null);

  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState(""); // pour afficher le succès/erreur

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // On réinitialise l'erreur à chaque chargement
      setError("");
      const [budgetData, catData, txData, membersData] = await Promise.all([
        apiService(`/budgets/${budgetId}`),
        apiService(`/budgets/${budgetId}/categories`),
        apiService(`/budgets/${budgetId}/transactions`),
        apiService(`/budgets/${budgetId}/members`),
      ]);
      setBudget(budgetData);
      setCategories(catData);
      setTransactions(txData);
      setMembers(membersData);
      if (catData.length > 0) setTxCatId(catData[0].id);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!showHistory) {
      const data = await apiService(`/budgets/${budgetId}/history`);
      setHistory(data);
    }
    setShowHistory(!showHistory);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const newCat = await apiService(
        `/budgets/${budgetId}/categories`,
        "POST",
        {
          name: catName,
          // Correction 2 : Utilisation de Number.parseFloat
          monthly_budget: Number.parseFloat(catLimit),
        }
      );
      setCategories([...categories, newCat]);
      setCatName("");
      setCatLimit("");
    } catch (err) {
      alert(err.message);
    }
  };

  // --- NOUVELLES FONCTIONS ---
  const startEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatLimit(cat.monthly_budget);
  };

  const saveCategory = async () => {
    try {
      const updatedCat = await apiService(
        `/categories/${editingCatId}`,
        "PUT",
        {
          name: editCatName,
          monthly_budget: Number.parseFloat(editCatLimit),
        }
      );

      // Mise à jour locale
      setCategories(
        categories.map((c) => (c.id === editingCatId ? updatedCat : c))
      );
      setEditingCatId(null); // Fin du mode édition
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    const payload = {
      description: txDesc,
      // Correction 2 : Utilisation de Number.parseFloat
      amount: Number.parseFloat(txAmount),
      type: txType,
      transaction_date: txDate,
      category_id: txType === "expense" ? txCatId : null,
    };

    try {
      if (editingTxId) {
        const updatedTx = await apiService(
          `/transactions/${editingTxId}`,
          "PUT",
          payload
        );
        setTransactions(
          transactions.map((tx) => (tx.id === editingTxId ? updatedTx : tx))
        );
        setEditingTxId(null);
      } else {
        const newTx = await apiService(
          `/budgets/${budgetId}/transactions`,
          "POST",
          payload
        );
        setTransactions([newTx, ...transactions]);
      }
      setTxDesc("");
      setTxAmount("");
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (tx) => {
    setEditingTxId(tx.id);
    setTxDesc(tx.description);
    setTxAmount(tx.amount);
    setTxDate(tx.transaction_date.split("T")[0]);
    setTxType(tx.type);
    if (tx.category_id) setTxCatId(tx.category_id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingTxId(null);
    setTxDesc("");
    setTxAmount("");
  };

  const formatCurrency = (amount) => {
    const currency = budget?.currency || "EUR";
    return new Intl.NumberFormat("default", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // 2. Fonction de gestion de l'export
  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
      alert("Aucune transaction à exporter.");
      return;
    }
    // CORRECTION : On passe le 4ème argument (la devise du budget)
    generateTransactionsCSV(
      transactions,
      categories,
      budget?.name || "Budget",
      budget?.currency || "EUR" // <-- ICI
    );
  };

  // NOUVELLE FONCTION : Envoyer une invitation
  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteStatus("Envoi...");
    try {
      await apiService(`/budgets/${budgetId}/invite`, "POST", {
        email: inviteEmail,
      });
      setInviteStatus(`Invitation envoyée à ${inviteEmail} !`);
      setInviteEmail("");
    } catch (err) {
      setInviteStatus(`Erreur : ${err.message}`);
    }
  };

  if (isLoading) return <div className="loading-message">Chargement...</div>;

  return (
    <div className="budget-detail-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <Link to="/" className="back-link">
          &larr; Dashboard
        </Link>

        {/* Groupe de boutons d'action */}
        <div className="action-buttons">
          {/* 3. Bouton Export Accessible */}
          <button
            onClick={handleExport}
            className="secondary-btn"
            type="button" // Toujours spécifier le type pour l'accessibilité
          >
            📄 Exporter CSV
          </button>

          <button
            onClick={fetchHistory}
            className="secondary-btn"
            type="button"
          >
            {showHistory ? "Masquer Historique" : "🕒 Voir Historique"}
          </button>
        </div>
      </div>

      {/* Correction 1 : Affichage de l'erreur ici pour supprimer le warning "unused var" */}
      {error && <p className="error-message">{error}</p>}

      {showHistory && (
        <div className="history-panel">
          <h3>Historique des modifications</h3>
          <ul>
            {history.map((h) => (
              <li key={h.id}>
                <strong>{new Date(h.created_at).toLocaleString()}</strong> -{" "}
                {h.user_name} a modifié{" "}
                {h.entity_type === "TRANSACTION"
                  ? "une transaction"
                  : "le budget"}
                .
                <br />
                <span className="history-details">{h.details}</span>
              </li>
            ))}
            {history.length === 0 && <li>Aucun historique récent.</li>}
          </ul>
        </div>
      )}

      <div className="budget-header">
        <h1 className="budget-title">{budget?.name}</h1>
        <span className="currency-badge">{budget?.currency}</span>
      </div>

      {/* --- NOUVEAU : SECTION GRAPHIQUES --- */}
      <BudgetCharts
        transactions={transactions}
        categories={categories}
        currency={budget?.currency}
      />
      {/* ----------------------------------- */}

      {/* --- SECTION MEMBRES --- */}
      <div className="members-section">
        <div className="members-header">
          <h3>👥 Membres du budget</h3>
          <span className="member-count">{members.length} participant(s)</span>
        </div>

        <div className="members-list">
          {members.map((member) => (
            <div key={member.id} className="member-chip" title={member.email}>
              <div className="member-avatar-small">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.name} />
                ) : (
                  member.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="member-name">
                {member.name} {member.role === "owner" && "👑"}
              </span>
            </div>
          ))}
        </div>

        {/* Formulaire d'invitation */}
        <form onSubmit={handleInvite} className="invite-form">
          <input
            type="email"
            placeholder="Inviter par email (ex: ami@test.com)"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <button type="submit">Inviter</button>
        </form>
        {inviteStatus && <p className="invite-status">{inviteStatus}</p>}
      </div>
      {/* ----------------------- */}

      <div className="columns-container">
        <div className="column">
          <h2>Catégories</h2>
          <form onSubmit={handleAddCategory} className="inline-form">
            <input
              type="text"
              placeholder="Nom"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Budget"
              value={catLimit}
              onChange={(e) => setCatLimit(e.target.value)}
              required
            />
            <button type="submit">+</button>
          </form>
          <ul className="categories-list">
            {categories.map((cat) => {
              // 1. Calculer le montant dépensé pour cette catégorie
              const spent = transactions
                .filter((t) => t.category_id === cat.id && t.type === "expense")
                .reduce((acc, t) => acc + Number(t.amount), 0);

              // 2. Calculer le reste
              const remaining = cat.monthly_budget - spent;

              // 3. Couleur d'alerte (Rouge si dépassé, Vert si ok)
              const statusColor = remaining < 0 ? "#ff4757" : "#2ed573";
              return (
                <li key={cat.id} className="category-item">
                  {editingCatId === cat.id ? (
                    /* --- MODE ÉDITION --- */
                    <div className="cat-edit-mode">
                      {/* ... (inputs restent pareils) ... */}
                      <input
                        type="text"
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="edit-input-mini"
                      />
                      <input
                        type="number"
                        value={editCatLimit}
                        onChange={(e) => setEditCatLimit(e.target.value)}
                        className="edit-input-mini"
                      />
                      <button onClick={saveCategory} className="save-mini-btn">
                        OK
                      </button>
                      <button
                        onClick={() => setEditingCatId(null)}
                        className="cancel-mini-btn"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    /* ... MODE AFFICHAGE AMÉLIORÉ ... */
                    <button
                      className="cat-display-mode"
                      onClick={() => startEditCategory(cat)}
                      title="Cliquez pour modifier"
                      style={{ display: "block", textAlign: "left" }} // Changement de style pour la disposition
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>{cat.name}</span>
                        <span>{formatCurrency(cat.monthly_budget)}</span>
                      </div>

                      {/* Barre de progression visuelle */}
                      <div
                        style={{
                          width: "100%",
                          height: "6px",
                          background: "#eee",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(
                              100,
                              (spent / cat.monthly_budget) * 100
                            )}%`,
                            height: "100%",
                            background: statusColor,
                            transition: "width 0.3s",
                          }}
                        ></div>
                      </div>

                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#666",
                          marginTop: "2px",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Dépensé: {formatCurrency(spent)}</span>
                        <span
                          style={{ color: statusColor, fontWeight: "bold" }}
                        >
                          Reste: {formatCurrency(remaining)}
                        </span>
                      </div>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="column">
          <h2>Transactions</h2>

          <form
            onSubmit={handleSubmitTransaction}
            className={`transaction-form ${editingTxId ? "editing-mode" : ""}`}
          >
            {editingTxId && (
              <div className="editing-badge">
                Modification en cours...
                {/* Correction 3 : Remplacement du span par un bouton accessible */}
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="cancel-edit-link"
                >
                  Annuler
                </button>
              </div>
            )}

            <div className="form-row">
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
              >
                <option value="expense">Dépense</option>
                <option value="income">Revenu</option>
              </select>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Description"
                value={txDesc}
                onChange={(e) => setTxDesc(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Montant"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                required
              />
            </div>
            {txType === "expense" && (
              <select
                value={txCatId}
                onChange={(e) => setTxCatId(e.target.value)}
                className="full-width-select"
              >
                <option value="">Choisir une catégorie...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            <button type="submit" className="btn-add-tx">
              {editingTxId ? "Sauvegarder Modification" : "Ajouter Transaction"}
            </button>
          </form>
          <ul className="transactions-list">
            {transactions.map((tx) => (
              <li key={tx.id} className={`transaction-item ${tx.type}`}>
                {/* NOUVEAU : Un vrai bouton qui englobe tout le contenu */}
                <button
                  onClick={() => startEdit(tx)}
                  className="tx-row-button"
                  title="Cliquez pour modifier"
                >
                  {/* On ajoute une colonne pour l'auteur */}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="tx-desc">{tx.description}</span>
                    {/* NOUVEAU : Affichage de l'auteur */}
                    <span style={{ fontSize: "0.75rem", color: "#888" }}>
                      Par {tx.user_name || "Inconnu"}
                    </span>
                  </div>

                  <span className="tx-date">
                    {new Date(tx.transaction_date).toLocaleDateString()}
                  </span>

                  <span className="tx-amount">
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default BudgetDetailPage;
