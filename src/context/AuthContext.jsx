// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useMemo } from "react"; // Import useMemo
import PropTypes from "prop-types"; // Import PropTypes

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // CORRECTION : On renomme pour respecter la convention [valeur, setValeur]
  // On utilise "authToken" au lieu de "token" pour l'état interne
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));

  // Idem pour user -> authUser
  const [authUser, setAuthUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (data) => {
    const { token: newToken, user: newUser } = data;
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    // Mise à jour avec les nouveaux noms
    setAuthToken(newToken);
    setAuthUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
    setAuthUser(null);
  };

  const updateUser = (updatedUserData) => {
    const newUser = { ...authUser, ...updatedUserData }; // note: utilisation de authUser
    localStorage.setItem("user", JSON.stringify(newUser));
    setAuthUser(newUser);
  };

  const contextValue = useMemo(
    () => ({
      token: authToken, // On expose "authToken" sous le nom "token" vers l'extérieur
      user: authUser, // On expose "authUser" sous le nom "user"
      login,
      logout,
      updateUser,
    }),
    [authToken, authUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
// CORRECTION S6754 : Validation des props
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  return useContext(AuthContext);
}
