// src/components/BudgetCharts.jsx

import React from "react";
// 1. IMPORTER PROP-TYPES
import PropTypes from "prop-types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid, // <-- NOUVEAUX IMPORTS
} from "recharts";

function BudgetCharts({ transactions, categories, currency }) {
  // CORRECTION : On ajoute Number() ou parseFloat() pour convertir le texte en chiffre
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0); // <-- Ici

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0); // <-- Et ici

  const balance = totalIncome - totalExpenses;

  const pieData = categories
    .map((cat) => {
      const catTotal = transactions
        .filter((t) => t.category_id === cat.id && t.type === "expense")
        // CORRECTION ICI AUSSI pour le graphique
        .reduce((acc, t) => acc + Number(t.amount), 0);

      return { name: cat.name, value: catTotal };
    })
    .filter((item) => item.value > 0);

  const COLORS = [
    "#4361ee",
    "#f72585",
    "#7209b7",
    "#4cc9f0",
    "#b5179e",
    "#3f37c9",
  ];

  // PRÉPARATION DU GRAPHIQUE LINÉAIRE (Evolution)
  // 1. On ne garde que les dépenses, triées par date (la plus ancienne d'abord)
  const expenseTx = transactions
    .filter((t) => t.type === "expense")
    .sort(
      (a, b) => new Date(a.transaction_date) - new Date(b.transaction_date)
    );

  // 2. On calcule le cumul progressif
  let cumulative = 0;
  const lineData = expenseTx.map((t) => {
    cumulative += Number(t.amount);
    return {
      date: new Date(t.transaction_date).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
      }),
      amount: cumulative,
      description: t.description,
    };
  });

  // Si pas de données, on met un point à 0 pour ne pas casser le graph
  if (lineData.length === 0) {
    lineData.push({ date: "Début", amount: 0 });
  }

  const formatCurrency = (amount) => {
    // On met une valeur par défaut 'EUR' si currency est undefined
    return new Intl.NumberFormat("default", {
      style: "currency",
      currency: currency || "EUR",
    }).format(amount);
  };

  return (
    <div className="charts-container">
      <div className="summary-cards">
        <div className="card income">
          <h4>Revenus</h4>
          <p>+{formatCurrency(totalIncome)}</p>
        </div>
        <div className="card expense">
          <h4>Dépenses</h4>
          <p>-{formatCurrency(totalExpenses)}</p>
        </div>
        <div
          className={`card balance ${balance >= 0 ? "positive" : "negative"}`}
        >
          <h4>Solde Restant</h4>
          <p>{formatCurrency(balance)}</p>
        </div>
      </div>

      <div className="chart-wrapper" style={{ marginTop: "1.5rem" }}>
        <h3>Évolution des Dépenses</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={lineData}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" style={{ fontSize: "0.8rem" }} />
              <YAxis style={{ fontSize: "0.8rem" }} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelStyle={{ color: "#333" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                name="Dépenses Cumulées"
                stroke="#f72585"
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-wrapper">
        <h3>Répartition des Dépenses</h3>

        {pieData.length > 0 ? (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    // 2. CORRECTION CLÉ (S6479) : On utilise le nom unique au lieu de l'index
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="no-data-text">
            Aucune dépense à afficher pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}

// CORRECTION : On enlève ".isRequired" car on a des defaultProps juste en dessous.
BudgetCharts.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      category_id: PropTypes.number,
    })
  ), // <-- J'ai enlevé .isRequired ici
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ), // <-- J'ai enlevé .isRequired ici
  currency: PropTypes.string,
};

// Ces valeurs par défaut protègent ton composant contre les crashs
BudgetCharts.defaultProps = {
  transactions: [],
  categories: [],
  currency: "EUR",
};

export default BudgetCharts;
