import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";
import { Link } from "react-router-dom";
import "./ProfilePage.css";

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [avatar, setAvatar] = useState(user?.avatar_url || "");

  const [darkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#4361ee");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedColor = localStorage.getItem("primaryColor");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }

    if (savedColor) {
      setPrimaryColor(savedColor);
      document.documentElement.style.setProperty(
        "--electric-sapphire",
        savedColor
      );
      document.documentElement.style.setProperty(
        "--true-azure",
        adjustColor(savedColor, -20)
      );
    }
  }, []);

  // CORRECTION : Fonction moderne sans méthodes dépréciées
  const adjustColor = (color, amount) => {
    const hex = color.replace("#", "");
    // On sépare R, G, B proprement
    const r = Number.parseInt(hex.substring(0, 2), 16);
    const g = Number.parseInt(hex.substring(2, 4), 16);
    const b = Number.parseInt(hex.substring(4, 6), 16);

    const newR = Math.min(255, Math.max(0, r + amount));
    const newG = Math.min(255, Math.max(0, g + amount));
    const newB = Math.min(255, Math.max(0, b + amount));

    // Convertir en hex et ajouter des zéros si nécessaire (padEnd/slice)
    const rr = (newR.toString(16).length === 1 ? "0" : "") + newR.toString(16);
    const gg = (newG.toString(16).length === 1 ? "0" : "") + newG.toString(16);
    const bb = (newB.toString(16).length === 1 ? "0" : "") + newB.toString(16);

    return `#${rr}${gg}${bb}`;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const updatedUser = await apiService("/users/profile", "PUT", {
        name,
        phone_number: phone,
        avatar_url: avatar,
      });
      updateUser(updatedUser);
      setMessage("Profil mis à jour avec succès !");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  };

  const changeColor = (e) => {
    const color = e.target.value;
    setPrimaryColor(color);
    localStorage.setItem("primaryColor", color);
    document.documentElement.style.setProperty("--electric-sapphire", color);
    document.documentElement.style.setProperty(
      "--true-azure",
      adjustColor(color, -40)
    );
  };

  return (
    <div className="profile-container">
      <Link to="/" className="back-link">
        &larr; Retour au Dashboard
      </Link>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-circle">
            {avatar ? (
              <img src={avatar} alt="Avatar" />
            ) : (
              <span>{name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h2>Mon Profil</h2>
        </div>

        {message && <div className="success-msg">{message}</div>}

        <form onSubmit={handleUpdateProfile}>
          {/* CORRECTION S6853 : Ajout de htmlFor et id */}
          <div className="form-group">
            <label htmlFor="profile-name">Nom complet</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-email">Email (non modifiable)</label>
            <input
              id="profile-email"
              type="email"
              value={user?.email}
              disabled
              className="disabled-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-phone">Numéro de téléphone</label>
            {/* CORRECTION TÉLÉPHONE : type="tel", pas de regex stricte */}
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="ex: +1 555 123 4567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-avatar">URL Photo de profil</label>
            <input
              id="profile-avatar"
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <button type="submit" className="save-btn" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Sauvegarder les modifications"}
          </button>
        </form>

        <hr className="divider" />

        <h3>Personnalisation</h3>

        <div className="custom-row">
          <span>Mode Sombre</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
              // Bonne pratique : ajouter aria-label sur l'input aussi
              aria-label="Activer le mode sombre"
            />
            <span className="slider round"></span>

            {/* CORRECTION S6853 : Texte caché mais accessible pour le label */}
            <span
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                padding: "0",
                margin: "-1px",
                overflow: "hidden",
                clip: "rect(0,0,0,0)",
                whiteSpace: "nowrap",
                border: "0",
              }}
            >
              Basculer le mode sombre
            </span>
          </label>
        </div>
        <div className="custom-row">
          <label htmlFor="color-picker">Couleur Principale</label>
          <input
            id="color-picker"
            type="color"
            value={primaryColor}
            onChange={changeColor}
            className="color-picker"
          />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
