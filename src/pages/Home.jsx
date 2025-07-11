import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDifficulties,
  getAllActiveSessions,
  clearSession,
} from "../service/GameService";
import { useAuth } from "../context/AuthContext";
import SessionsGrid from "../components/common/SessionsGrid";
import DifficultyGrid from "../components/common/DifficultyGrid";
import "./Home.css";

const Home = () => {
  const [difficulties, setDifficulties] = useState([]);
  const [activeSessions, setActiveSessions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDifficulties, setShowDifficulties] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setActiveSessions({});
      setError("");
      loadData();
    } else {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) {
      try {
        setIsLoading(true);
        const difficultiesData = await getDifficulties();
        setDifficulties(difficultiesData);
        setActiveSessions({});
        setShowDifficulties(true);
      } catch (err) {
        setError("Failed to load difficulties");
        console.error("Error loading difficulties:", err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      setIsLoading(true);
      const [difficultiesData, sessionsData] = await Promise.all([
        getDifficulties(),
        Promise.resolve(getAllActiveSessions(user.id)),
      ]);
      setDifficulties(difficultiesData);
      setActiveSessions(sessionsData);

      // Show difficulties if no active sessions or if user clicked "New Game"
      const hasActiveSessions = Object.keys(sessionsData).length > 0;
      setShowDifficulties(!hasActiveSessions || showDifficulties);
    } catch (err) {
      setError("Failed to load game data");
      console.error("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDifficultySelect = (difficultyId) => {
    navigate("/game", { state: { difficultyId } });
  };

  const handleSessionSelect = (sessionId) => {
    navigate(`/game/${sessionId}`);
  };

  const handleClearSession = async (sessionId) => {
    if (!user?.id) return;

    try {
      clearSession(sessionId, user.id);

      setActiveSessions((prevSessions) => {
        const updatedSessions = { ...prevSessions };
        delete updatedSessions[sessionId];

        if (Object.keys(updatedSessions).length === 0) {
          setShowDifficulties(true);
        }

        return updatedSessions;
      });
    } catch (err) {
      console.error("Error clearing session:", err);
    }
  };

  const handleNewGame = () => {
    setShowDifficulties(true);
  };

  const handleBackToSessions = () => {
    setShowDifficulties(false);
  };

  if (isLoading) {
    return (
      <div className="home-page">
        <div className="loading">Loading difficulties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="error-message">{error}</div>
        <button onClick={loadData} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const hasActiveSessions = user?.id && Object.keys(activeSessions).length > 0;

  return (
    <div className="home-page">
      <div className="home-container">
        {!user?.id ? (
          <DifficultyGrid
            difficulties={difficulties}
            onDifficultySelect={handleDifficultySelect}
            isGuest={true}
          />
        ) : showDifficulties || !hasActiveSessions ? (
          <DifficultyGrid
            difficulties={difficulties}
            onDifficultySelect={handleDifficultySelect}
            showBackButton={hasActiveSessions}
            onBackToSessions={handleBackToSessions}
            isGuest={false}
          />
        ) : (
          <SessionsGrid
            activeSessions={activeSessions}
            onSessionSelect={handleSessionSelect}
            onClearSession={handleClearSession}
            onNewGame={handleNewGame}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
