import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        setMsg("Lien invalide.");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setMsg(data.error);
        }
      } catch (err) {
        console.error("Erreur lors de la vérification :", err);

        setStatus("error");
        setMsg("Erreur de connexion.");
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        color: "white",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          padding: "2rem",
          borderRadius: "10px",
        }}
      >
        {status === "loading" && <h2>Vérification en cours... ⏳</h2>}

        {status === "success" && (
          <>
            <h2 style={{ color: "#4cc9f0" }}>Compte vérifié ! 🎉</h2>
            <p>Votre email a été confirmé avec succès.</p>
            <Link to="/auth" style={{ color: "white", fontWeight: "bold" }}>
              Se connecter
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h2 style={{ color: "#ff4d4d" }}>Échec de la vérification ❌</h2>
            <p>{msg}</p>
            <Link to="/auth" style={{ color: "white" }}>
              Retour à l'accueil
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
