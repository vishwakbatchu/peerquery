import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setToken(null);
    setUser(null);
  }

  function setAuth(authToken, authUser) {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("authUser", JSON.stringify(authUser));
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        logout,
        setAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
