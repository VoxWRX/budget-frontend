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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || "");

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Créer une URL temporaire pour voir l'image tout de suite
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // IMPORTANT : On utilise FormData pour envoyer des fichiers
      const formData = new FormData();
      formData.append("name", name);
      if (phone) formData.append("phone_number", phone);

      // Si un nouveau fichier est choisi, on l'ajoute
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      } else {
        // Sinon on renvoie l'ancienne URL pour ne pas la perdre
        formData.append("avatar_url", user?.avatar_url || "");
      }

      // Note: On doit modifier apiService pour accepter FormData,
      // ou faire un fetch manuel ici. Faisons un fetch manuel pour simplifier ce cas spécifique.
      const token = localStorage.getItem("token");
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // NE PAS METTRE 'Content-Type': 'application/json' !
          // Le navigateur le mettra automatiquement en 'multipart/form-data'
        },
        body: formData,
      });

      const updatedUser = await response.json();

      if (!response.ok) throw new Error(updatedUser.error);

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
            {/* On affiche la prévisualisation */}
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" />
            ) : (
              <span>{name.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* NOUVEAU : Bouton caché pour changer l'image */}
          <label htmlFor="file-upload" className="upload-btn">
            Changer la photo
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }} // On cache l'input moche
          />
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
