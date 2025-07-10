import { createContext, useContext, useState, useEffect } from "react";
import { getItem, setItem, removeItem } from "../service/StorageService";
import { clearAllSessions } from "../service/GameService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = getItem("user");
    if (savedUser) {
      setUserState(savedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username) => {
    try {
      const userData = {
        id: Date.now().toString(),
        username,
        createdAt: new Date().toISOString(),
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
      };

      setUserState(userData);
      setIsAuthenticated(true);
      setItem("user", userData);

      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    if (user?.id) {
      clearAllSessions(user.id);
    }
    setUserState(null);
    setIsAuthenticated(false);
    removeItem("user");
  };

  const updateUserStats = (gameResult) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: gameResult.won ? user.gamesWon + 1 : user.gamesWon,
      currentStreak: gameResult.won ? user.currentStreak + 1 : 0,
      maxStreak: gameResult.won
        ? Math.max(user.maxStreak, user.currentStreak + 1)
        : user.maxStreak,
    };

    setUserState(updatedUser);
    setItem("user", updatedUser);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUserStats,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
