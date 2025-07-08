
const API_BASE_URL = 'http://localhost:8080'; // TODO: Replace with actual API URL

const mockDifficulties = [
  { id: 'easy', name: 'Easy (4 letters)' },
  { id: 'medium', name: 'Medium (5 letters)' },
  { id: 'hard', name: 'Hard (6 letters)' },
];

const mockWords = {
  easy: ['WORD', 'GAME', 'PLAY', 'QUIZ', 'WINS', 'LUCK'],
  medium: ['WORDS', 'GAMES', 'PLAYS', 'QUIZZ', 'LUCKY', 'THINK'],
  hard: ['WORDLE', 'PUZZLE', 'MASTER', 'GENIUS', 'PLAYER', 'WINNER'],
};

let sessionCounter = 1;
const activeSessions = new Map();

export class GameService {
  static async getDifficulties() {
    try {
      // TODO: Replace with actual API call
      
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockDifficulties), 500);
      });
    } catch (error) {
      console.error('Error fetching difficulties:', error);
      throw error;
    }
  }

  static async startGameSession(difficultyId) {
    try {
      // TODO: Replace with actual API call
      
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const difficulty = mockDifficulties.find(d => d.id === difficultyId);
          if (!difficulty) {
            reject(new Error('Difficulty not found'));
            return;
          }

          const sessionId = `session_${sessionCounter++}`;
          const wordLength = this.getWordLengthForDifficulty(difficultyId);
          const secretWord = this.getRandomWord(difficultyId);
          
          const gameSession = {
            sessionId,
            difficulty,
            wordLength,
          };

          activeSessions.set(sessionId, {
            ...gameSession,
            secretWord,
            attempts: [],
            isCompleted: false,
          });

          resolve(gameSession);
        }, 500);
      });
    } catch (error) {
      console.error('Error starting game session:', error);
      throw error;
    }
  }

  static async checkWord(sessionId, word) {
    try {
      // TODO: Replace with actual API call
      
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const session = activeSessions.get(sessionId);
          if (!session) {
            reject(new Error('Session not found'));
            return;
          }

          if (session.isCompleted) {
            reject(new Error('Session already completed'));
            return;
          }

          if (word.length !== session.wordLength) {
            reject(new Error('Invalid word length'));
            return;
          }

          const difficultyWords = mockWords[session.difficulty.id];
          if (!difficultyWords.includes(word.toUpperCase())) {
            reject(new Error('Word not in dictionary'));
            return;
          }

          const result = this.analyzeWord(word.toUpperCase(), session.secretWord);
          
          session.attempts.push({
            word: word.toUpperCase(),
            result,
            timestamp: new Date().toISOString(),
          });

          if (word.toUpperCase() === session.secretWord) {
            session.isCompleted = true;
            session.won = true;
          } else if (session.attempts.length >= 6) {
            session.isCompleted = true;
            session.won = false;
          }

          resolve(result);
        }, 300);
      });
    } catch (error) {
      console.error('Error checking word:', error);
      throw error;
    }
  }

  static getWordLengthForDifficulty(difficultyId) {
    const lengthMap = {
      easy: 4,
      medium: 5,
      hard: 6,
    };
    return lengthMap[difficultyId] || 5;
  }

  static getRandomWord(difficultyId) {
    const words = mockWords[difficultyId];
    return words[Math.floor(Math.random() * words.length)];
  }

  static analyzeWord(guess, solution) {
    const result = [];
    const solutionLetters = solution.split('');
    const guessLetters = guess.split('');
    
    for (let i = 0; i < guessLetters.length; i++) {
      if (guessLetters[i] === solutionLetters[i]) {
        result[i] = {
          letter: guessLetters[i],
          solution: 'correct'
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
          solution: 'elsewhere'
        };
        solutionLetters[letterIndex] = null;
      } else {
        result[i] = {
          letter: guessLetters[i],
          solution: 'absent'
        };
      }
    }

    return result;
  }

  static getSessionData(sessionId) {
    return activeSessions.get(sessionId);
  }

  static clearSession(sessionId) {
    activeSessions.delete(sessionId);
  }
} 