import React, { useEffect, useState } from "react";
import apiService from "../services/apiService";
import { useAuth } from "../context/AuthContext"; // Pour connaître l'utilisateur actuel
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "./InvitationsPage.css";

function InvitationsPage() {
  const { user } = useAuth(); // L'utilisateur connecté
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenInvite, setTokenInvite] = useState(null); // L'invitation spécifique du lien
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // CAS 1 : On arrive via un lien email
      checkToken(token);
    } else {
      // CAS 2 : On arrive normalement via le menu
      loadMyInvitations();
    }
  }, [searchParams]);

  // Fonction pour vérifier le lien spécifique
  const checkToken = async (token) => {
    try {
      // Note: On utilise fetch direct car cette route est publique (pas besoin de token utilisateur)
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/invitations/check/${token}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // VÉRIFICATION DE SÉCURITÉ CRUCIALE
      if (
        user &&
        user.email.toLowerCase() !== data.recipient_email.toLowerCase()
      ) {
        setError(
          `Attention : Cette invitation est destinée à ${data.recipient_email}, mais vous êtes connecté en tant que ${user.email}. Veuillez vous déconnecter pour l'accepter.`
        );
      } else {
        setTokenInvite(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMyInvitations = async () => {
    try {
      const data = await apiService("/invitations");
      setInvitations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (invitId, status) => {
    try {
      await apiService(`/invitations/${invitId}/respond`, "POST", { status });
      alert(
        status === "accepted"
          ? "Budget rejoint avec succès !"
          : "Invitation refusée."
      );

      // Si on vient d'accepter via le lien, on redirige vers le dashboard
      if (tokenInvite) {
        navigate("/");
      } else {
        // Sinon on rafraîchit la liste
        setInvitations(invitations.filter((i) => i.id !== invitId));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading-msg">Chargement...</div>;

  return (
    <div className="invitations-container">
      <Link to="/" className="back-link">
        &larr; Retour au Dashboard
      </Link>
      <h1>📬 Invitations</h1>

      {/* --- MESSAGE D'ERREUR (Mauvais compte) --- */}
      {error && (
        <div
          style={{
            background: "#ff4757",
            color: "white",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {/* --- CAS 1 : Affichage de l'invitation du LIEN --- */}
      {tokenInvite && !error && (
        <div className="invit-card highlight">
          <div className="invit-info">
            <strong>{tokenInvite.sender_name}</strong> vous invite à rejoindre{" "}
            <span className="budget-name"> "{tokenInvite.budget_name}"</span>.
          </div>
          <div className="invit-actions">
            <button
              onClick={() => handleRespond(tokenInvite.id, "accepted")}
              className="accept-btn"
            >
              Accepter maintenant
            </button>
            <button
              onClick={() => handleRespond(tokenInvite.id, "rejected")}
              className="reject-btn"
            >
              Refuser
            </button>
          </div>
        </div>
      )}

      {/* --- CAS 2 : Affichage de la liste classique --- */}
      {!tokenInvite && (
        <div className="invit-list">
          {invitations.length === 0 ? (
            <p className="no-invit">Aucune invitation en attente.</p>
          ) : (
            invitations.map((invit) => (
              <div key={invit.id} className="invit-card">
                <div className="invit-info">
                  <strong>{invit.sender_name}</strong> vous invite :{" "}
                  <span className="budget-name"> {invit.budget_name}</span>
                </div>
                <div className="invit-actions">
                  <button
                    onClick={() => handleRespond(invit.id, "accepted")}
                    className="accept-btn"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleRespond(invit.id, "rejected")}
                    className="reject-btn"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default InvitationsPage;
