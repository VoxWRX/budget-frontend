import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
// import apiService from "../services/apiService";
import { Link } from "react-router-dom";
import "./ProfilePage.css";

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // États du formulaire
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || "");

  // NOUVEAUX ÉTATS (Remplacent l'ancien 'avatar')
  const [selectedFile, setSelectedFile] = useState(null);

  // États de personnalisation
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

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone_number || "");
      setPreviewUrl(user.avatar_url || "");
    }
  }, [user]);

  const adjustColor = (color, amount) => {
    const hex = color.replace("#", "");
    const r = Number.parseInt(hex.substring(0, 2), 16);
    const g = Number.parseInt(hex.substring(2, 4), 16);
    const b = Number.parseInt(hex.substring(4, 6), 16);

    const newR = Math.min(255, Math.max(0, r + amount));
    const newG = Math.min(255, Math.max(0, g + amount));
    const newB = Math.min(255, Math.max(0, b + amount));

    const rr = (newR.toString(16).length === 1 ? "0" : "") + newR.toString(16);
    const gg = (newG.toString(16).length === 1 ? "0" : "") + newG.toString(16);
    const bb = (newB.toString(16).length === 1 ? "0" : "") + newB.toString(16);

    return `#${rr}${gg}${bb}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (phone) formData.append("phone_number", phone);

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      } else {
        formData.append("avatar_url", user?.avatar_url || "");
      }

      const token = localStorage.getItem("token");
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
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
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" />
            ) : (
              <span>{name.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <label htmlFor="file-upload" className="upload-btn">
            Changer la photo
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {message && <div className="success-msg">{message}</div>}

        <form onSubmit={handleUpdateProfile}>
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
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="ex: +1 555 123 4567"
            />
          </div>

          {/* J'AI SUPPRIMÉ L'ANCIEN CHAMP INPUT URL ICI CAR IL CRÉAIT L'ERREUR */}

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
              aria-label="Activer le mode sombre"
            />
            <span className="slider round"></span>
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
