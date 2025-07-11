import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../hooks/useGame";
import { useKeyboard } from "../hooks/useKeyboard";
import WordleBoard from "../components/game/WordleBoard";
import Keyboard from "../components/game/Keyboard";
import GameResult from "../components/game/GameResult";
import "./Game.css";

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { updateUserStats, user } = useAuth();
  const difficultyId = location.state?.difficultyId;

  const {
    gameSession,
    currentGuess,
    guesses,
    gameStatus,
    message,
    isLoading,
    isSubmitting,
    letterStatus,
    handleKeyPress,
    startNewGame,
  } = useGame(sessionId, difficultyId, user, updateUserStats);

  // Handle keyboard input
  const isKeyboardDisabled = gameStatus !== "playing" || isSubmitting;
  useKeyboard(handleKeyPress, isKeyboardDisabled);

  if (isLoading) {
    return (
      <div className="game-page">
        <div className="loading">Starting game...</div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="game-page">
        <div className="error-message">Failed to load game</div>
        <button onClick={() => navigate("/")} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="game-page">
      <div className="game-container">
        <div className="game-header">
          <h1>Wordle - {gameSession.difficulty.name}</h1>
          <p>Guess the {gameSession.wordLenght}-letter word</p>
          {!user?.id && (
            <p
              style={{ fontSize: "0.9rem", opacity: 0.7, fontStyle: "italic" }}
            >
              Playing as guest - progress won't be saved
            </p>
          )}
        </div>

        {message && (
          <div
            className={`game-message ${
              gameStatus === "won" ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        <WordleBoard
          guesses={guesses}
          currentGuess={currentGuess}
          wordLength={gameSession.wordLenght}
          maxGuesses={6}
          isSubmitting={isSubmitting}
        />

        <Keyboard
          onKeyPress={handleKeyPress}
          letterStatus={letterStatus}
          disabled={isKeyboardDisabled}
        />

        {gameStatus !== "playing" && (
          <GameResult
            gameStatus={gameStatus}
            guesses={guesses}
            onPlayAgain={startNewGame}
            onGoHome={() => navigate("/")}
            isLoggedIn={!!user?.id}
          />
        )}
      </div>
    </div>
  );
};

export default Game;
