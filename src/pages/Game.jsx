import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  startGameSession,
  checkWord,
  getSessionData,
} from "../service/GameService";
import { useAuth } from "../context/AuthContext";
import WordleBoard from "../components/game/WordleBoard";
import Keyboard from "../components/game/Keyboard";
import GameResult from "../components/game/GameResult";
import "./Game.css";

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { updateUserStats, user } = useAuth();

  const [gameSession, setGameSession] = useState(null);
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [gameStatus, setGameStatus] = useState("playing");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [letterStatus, setLetterStatus] = useState({});

  const isStartingSession = useRef(false);
  const hasInitialized = useRef(false);

  const difficultyId = location.state?.difficultyId;

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    if (sessionId) {
      if (user?.id) {
        loadExistingSession();
      } else {
        navigate("/");
      }
    } else if (difficultyId) {
      startNewGame();
    } else {
      navigate("/");
    }
  }, [sessionId, difficultyId, navigate, user?.id]);

  const loadExistingSession = async () => {
    try {
      setIsLoading(true);
      const session = getSessionData(sessionId, user?.id);

      if (!session) {
        setMessage("Session not found");
        return;
      }

      setGameSession(session);
      setGuesses(session.attempts || []);
      setCurrentGuess("");
      setGameStatus(
        session.isCompleted ? (session.won ? "won" : "lost") : "playing"
      );
      setMessage("");

      const letterStatusMap = {};
      (session.attempts || []).forEach((attempt) => {
        attempt.result.forEach(({ letter, solution }) => {
          if (solution === "correct") {
            letterStatusMap[letter] = "correct";
          } else if (
            solution === "elsewhere" &&
            letterStatusMap[letter] !== "correct"
          ) {
            letterStatusMap[letter] = "elsewhere";
          } else if (solution === "absent" && !letterStatusMap[letter]) {
            letterStatusMap[letter] = "absent";
          }
        });
      });
      setLetterStatus(letterStatusMap);
    } catch (err) {
      setMessage("Failed to load session");
      console.error("Error loading session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewGame = async () => {
    if (isStartingSession.current) {
      return;
    }

    try {
      isStartingSession.current = true;
      setIsLoading(true);
      const session = await startGameSession(difficultyId, user?.id);
      console.log(session);
      setGameSession(session);
      setGuesses([]);
      setCurrentGuess("");
      setGameStatus("playing");
      setMessage("");
      setLetterStatus({});
    } catch (err) {
      setMessage("Failed to start game");
      console.error("Error starting game:", err);
    } finally {
      setIsLoading(false);
      isStartingSession.current = false;
    }
  };

  const handleKeyPress = useCallback(
    (key) => {
      if (gameStatus !== "playing") return;

      if (key === "ENTER") {
        handleSubmitGuess();
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (key.length === 1 && /^[A-Z]$/.test(key)) {
        if (currentGuess.length < (gameSession?.wordLenght || 5)) {
          setCurrentGuess((prev) => prev + key);
        }
      }
    },
    [gameStatus, currentGuess, gameSession]
  );

  const handleSubmitGuess = async () => {
    if (!gameSession || currentGuess.length !== gameSession.wordLenght) {
      setMessage(`Word must be ${gameSession?.wordLenght || 5} letters long`);
      return;
    }

    try {
      const result = await checkWord(
        gameSession.sessionId,
        currentGuess,
        user?.id
      );

      const newLetterStatus = { ...letterStatus };
      result.forEach(({ letter, solution }) => {
        if (solution === "correct") {
          newLetterStatus[letter] = "correct";
        } else if (
          solution === "elsewhere" &&
          newLetterStatus[letter] !== "correct"
        ) {
          newLetterStatus[letter] = "elsewhere";
        } else if (solution === "absent" && !newLetterStatus[letter]) {
          newLetterStatus[letter] = "absent";
        }
      });
      setLetterStatus(newLetterStatus);

      const newGuess = {
        word: currentGuess,
        result: result,
        timestamp: new Date().toISOString(),
      };
      setGuesses((prev) => [...prev, newGuess]);

      if (result.every((r) => r.solution === "correct")) {
        setGameStatus("won");
        setMessage("Congratulations! You won!");
        if (user?.id) {
          updateUserStats({ won: true, attempts: guesses.length + 1 });
        }
      } else if (guesses.length >= 5) {
        setGameStatus("lost");
        setMessage("Game over! Better luck next time.");
        if (user?.id) {
          updateUserStats({ won: false, attempts: guesses.length + 1 });
        }
      }

      setCurrentGuess("");
    } catch (err) {
      if (err.message.includes("dictionary")) {
        setMessage("Word not found in dictionary");
      } else {
        setMessage("Error checking word");
      }
      console.error("Error checking word:", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleKeyPress("ENTER");
      } else if (e.key === "Backspace") {
        handleKeyPress("BACKSPACE");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

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
        />

        <Keyboard
          onKeyPress={handleKeyPress}
          letterStatus={letterStatus}
          disabled={gameStatus !== "playing"}
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
