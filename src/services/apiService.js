// src/services/apiService.js

const API_URL = "http://localhost:3000/api";

// Notre "assistant"
const apiService = async (endpoint, method = "GET", body = null) => {
  // 1. Récupérer le token
  const token = localStorage.getItem("token");

  // 2. Préparer les en-têtes (headers)
  const headers = {
    "Content-Type": "application/json",
  };

  // 3. Si on a un token, on l'ajoute !
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 4. Préparer la configuration pour fetch
  const config = {
    method: method,
    headers: headers,
  };

  // 5. Si c'est un 'POST' ou 'PUT', ajouter le corps (body)
  if (body) {
    config.body = JSON.stringify(body);
  }

  // 6. Lancer la requête
  const response = await fetch(`${API_URL}${endpoint}`, config);

  // 7. Gérer la réponse
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erreur de l'API");
  }

  return data; // Renvoyer les données en cas de succès
};

export default apiService;
