import { createContext, useContext, useState, useEffect } from 'react';
import { GameService } from '../service/GameService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('wordleUser');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
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

            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('wordleUser', JSON.stringify(userData));

            return userData;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('wordleUser');
    };

    const updateUserStats = (gameResult) => {
        if (!user) return;

        const updatedUser = {
            ...user,
            gamesPlayed: user.gamesPlayed + 1,
            gamesWon: gameResult.won ? user.gamesWon + 1 : user.gamesWon,
            currentStreak: gameResult.won ? user.currentStreak + 1 : 0,
            maxStreak: gameResult.won ? Math.max(user.maxStreak, user.currentStreak + 1) : user.maxStreak,
        };

        setUser(updatedUser);
        localStorage.setItem('wordleUser', JSON.stringify(updatedUser));
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