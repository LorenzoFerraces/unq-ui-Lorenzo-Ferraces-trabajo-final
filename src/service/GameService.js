import { API_BASE_URL } from "./constants";

let sessionCounter = 0;
const activeSessions = new Map();

export const getDifficulties = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/difficulties`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching difficulties:", error);
    throw error;
  }
};

export const startGameSession = async (difficultyId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/difficulties/${difficultyId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Difficulty not found");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log(data);

    activeSessions.set(data.sessionId, {
      ...data,
      attempts: [],
      isCompleted: false,
    });

    return data;
  } catch (error) {
    console.error("Error starting game session:", error);
    throw error;
  }
};

export const checkWord = async (sessionId, word) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/checkWord`, {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        word: word.toLowerCase(),
      }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error("Word not in dictionary");
      }
      if (response.status === 404) {
        throw new Error("Session not found");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const session = activeSessions.get(sessionId);
    if (session) {
      session.attempts.push({
        word: word.toUpperCase(),
        result: data,
        timestamp: new Date().toISOString(),
      });

      if (data.every((r) => r.solution === "correct")) {
        session.isCompleted = true;
        session.won = true;
      } else if (session.attempts.length >= 6) {
        session.isCompleted = true;
        session.won = false;
      }
    }

    return data;
  } catch (error) {
    console.error("Error checking word:", error);
    throw error;
  }
};

const getWordLengthForDifficulty = (difficultyId) => {
  const lengthMap = {
    easy: 4,
    medium: 5,
    hard: 6,
  };
  return lengthMap[difficultyId] || 5;
};

const getRandomWord = (difficultyId) => {
  const words = mockWords[difficultyId];
  return words[Math.floor(Math.random() * words.length)];
};

const analyzeWord = (guess, solution) => {
  const result = [];
  const solutionLetters = solution.split("");
  const guessLetters = guess.split("");

  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === solutionLetters[i]) {
      result[i] = {
        letter: guessLetters[i],
        solution: "correct",
      };
      solutionLetters[i] = null;
    }
  }

  for (let i = 0; i < guessLetters.length; i++) {
    if (result[i]) continue;

    const letterIndex = solutionLetters.indexOf(guessLetters[i]);
    if (letterIndex !== -1) {
      result[i] = {
        letter: guessLetters[i],
        solution: "elsewhere",
      };
      solutionLetters[letterIndex] = null;
    } else {
      result[i] = {
        letter: guessLetters[i],
        solution: "absent",
      };
    }
  }

  return result;
};

export const getSessionData = (sessionId) => {
  return activeSessions.get(sessionId);
};

export const clearSession = (sessionId) => {
  activeSessions.delete(sessionId);
};
