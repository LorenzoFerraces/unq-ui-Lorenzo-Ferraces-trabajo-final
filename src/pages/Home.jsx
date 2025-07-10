import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDifficulties } from "../service/GameService";
import "./Home.css";

const Home = () => {
  const [difficulties, setDifficulties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadDifficulties();
  }, []);

  const loadDifficulties = async () => {
    try {
      setIsLoading(true);
      const data = await getDifficulties();
      setDifficulties(data);
    } catch (err) {
      setError("Failed to load difficulties");
      console.error("Error loading difficulties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDifficultySelect = (difficultyId) => {
    navigate("/game", { state: { difficultyId } });
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
        <button onClick={loadDifficulties} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-container">
        <h1>Choose Your Difficulty</h1>
        <p>Select a difficulty level to start playing Wordle</p>

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
      </div>
    </div>
  );
};

export default Home;
