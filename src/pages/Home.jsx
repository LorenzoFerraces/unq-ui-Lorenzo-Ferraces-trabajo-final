import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDifficulties,
  getAllActiveSessions,
  clearSession,
} from "../service/GameService";
import { useAuth } from "../context/AuthContext";
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
          <>
            <h1>Choose Your Difficulty</h1>
            <p>Select a difficulty level to start playing Wordle</p>
            <p
              style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "20px" }}
            >
              <em>Note: Login to save your progress and play multiple games</em>
            </p>

            <div className="difficulty-grid">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.id}
                  onClick={() => handleDifficultySelect(difficulty.id)}
                  className="difficulty-card"
                >
                  <h3>{difficulty.name}</h3>
                  <p>
                    {difficulty.id === "easy" && "Perfect for beginners"}
                    {difficulty.id === "medium" && "Classic Wordle experience"}
                    {difficulty.id === "hard" && "Challenge yourself"}
                  </p>
                </button>
              ))}
            </div>
          </>
        ) : showDifficulties || !hasActiveSessions ? (
          <>
            <h1>Choose Your Difficulty</h1>
            <p>Select a difficulty level to start playing Wordle</p>

            {hasActiveSessions && (
              <button
                onClick={handleBackToSessions}
                className="btn btn-secondary"
                style={{ marginBottom: "20px" }}
              >
                ← Back to Active Games
              </button>
            )}

            <div className="difficulty-grid">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.id}
                  onClick={() => handleDifficultySelect(difficulty.id)}
                  className="difficulty-card"
                >
                  <h3>{difficulty.name}</h3>
                  <p>
                    {difficulty.id === "easy" && "Perfect for beginners"}
                    {difficulty.id === "medium" && "Classic Wordle experience"}
                    {difficulty.id === "hard" && "Challenge yourself"}
                  </p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1>Your Active Games</h1>
            <p>Continue playing or start a new game</p>

            <button
              onClick={handleNewGame}
              className="btn btn-primary"
              style={{ marginBottom: "20px" }}
            >
              + New Game
            </button>

            <div className="sessions-grid">
              {Object.entries(activeSessions).map(([sessionId, session]) => (
                <div key={sessionId} className="session-card">
                  <h3>{session.difficulty.name}</h3>
                  <p>{session.wordLenght || session.wordLength}-letter word</p>
                  <p>Attempts: {session.attempts?.length || 0}/6</p>
                  <p>
                    Status:{" "}
                    {session.isCompleted
                      ? session.won
                        ? "Won"
                        : "Lost"
                      : "In Progress"}
                  </p>
                  <div className="session-actions">
                    <button
                      onClick={() => handleSessionSelect(sessionId)}
                      className="btn btn-primary"
                    >
                      {session.isCompleted ? "View" : "Continue"}
                    </button>
                    <button
                      onClick={() => handleClearSession(sessionId)}
                      className="btn btn-danger"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
