import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  startGameSession,
  checkWord,
  getSessionData,
} from "../service/GameService";

export const useGame = (sessionId, difficultyId, user, updateUserStats) => {
  const navigate = useNavigate();

  // State
  const [gameSession, setGameSession] = useState(null);
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [gameStatus, setGameStatus] = useState("playing");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [letterStatus, setLetterStatus] = useState({});

  // Refs
  const isStartingSession = useRef(false);
  const hasInitialized = useRef(false);

  // Load existing session
  const loadExistingSession = useCallback(async () => {
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

      // Build letter status from previous attempts
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
  }, [sessionId, user?.id]);

  // Start new game
  const startNewGame = useCallback(async () => {
    if (isStartingSession.current) {
      return;
    }

    try {
      isStartingSession.current = true;
      setIsLoading(true);
      const session = await startGameSession(difficultyId, user?.id);
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
  }, [difficultyId, user?.id]);

  // Submit guess
  const submitGuess = useCallback(async () => {
    if (!gameSession || currentGuess.length !== gameSession.wordLenght) {
      setMessage(`Word must be ${gameSession?.wordLenght || 5} letters long`);
      return;
    }

    if (isSubmitting) {
      return; // Prevent multiple concurrent submissions
    }

    setIsSubmitting(true);
    setMessage(""); // Clear any previous messages

    try {
      const result = await checkWord(
        gameSession.sessionId,
        currentGuess,
        user?.id
      );

      // Update letter status
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

      // Add new guess
      const newGuess = {
        word: currentGuess,
        result: result,
        timestamp: new Date().toISOString(),
      };
      setGuesses((prev) => [...prev, newGuess]);

      // Check win/loss conditions
      if (result.every((r) => r.solution === "correct")) {
        setGameStatus("won");
        setMessage("Congratulations! You won!");
        if (user?.id && updateUserStats) {
          updateUserStats({ won: true, attempts: guesses.length + 1 });
        }
      } else if (guesses.length >= 5) {
        setGameStatus("lost");
        setMessage("Game over! Better luck next time.");
        if (user?.id && updateUserStats) {
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
    } finally {
      setIsSubmitting(false);
    }
  }, [
    gameSession,
    currentGuess,
    isSubmitting,
    letterStatus,
    guesses,
    user?.id,
    updateUserStats,
  ]);

  // Input handling
  const handleKeyPress = useCallback(
    (key) => {
      if (gameStatus !== "playing" || isSubmitting) return;

      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (key.length === 1 && /^[A-Z]$/.test(key)) {
        if (currentGuess.length < (gameSession?.wordLenght || 5)) {
          setCurrentGuess((prev) => prev + key);
        }
      }
    },
    [gameStatus, currentGuess, gameSession, isSubmitting, submitGuess]
  );

  // Initialize game
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
  }, [
    sessionId,
    difficultyId,
    navigate,
    user?.id,
    loadExistingSession,
    startNewGame,
  ]);

  return {
    // State
    gameSession,
    currentGuess,
    guesses,
    gameStatus,
    message,
    isLoading,
    isSubmitting,
    letterStatus,

    // Actions
    setCurrentGuess,
    handleKeyPress,
    submitGuess,
    startNewGame,
    loadExistingSession,
  };
};
