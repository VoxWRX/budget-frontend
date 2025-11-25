import React, { useEffect, useState } from "react";
import apiService from "../services/apiService";
import { Link } from "react-router-dom";
import "./InvitationsPage.css"; // À créer

function InvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
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
      // Enlever l'invitation de la liste
      setInvitations(invitations.filter((i) => i.id !== invitId));
      alert(
        status === "accepted"
          ? "Invitation acceptée ! Le budget est maintenant dans votre Dashboard."
          : "Invitation refusée."
      );
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
      <h1>📬 Invitations Reçues</h1>

      {invitations.length === 0 ? (
        <p className="no-invit">Aucune invitation en attente.</p>
      ) : (
        <div className="invit-list">
          {invitations.map((invit) => (
            <div key={invit.id} className="invit-card">
              <div className="invit-info">
                <strong>{invit.sender_name}</strong> vous invite à rejoindre le
                budget{" "}
                <span className="budget-name">"{invit.budget_name}"</span>.
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
          ))}
        </div>
      )}
    </div>
  );
}

export default InvitationsPage;
