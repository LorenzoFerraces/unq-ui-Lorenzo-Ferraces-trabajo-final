import "./WordleBoard.css";

const WordleBoard = ({
  guesses,
  currentGuess,
  wordLength,
  maxGuesses,
  isSubmitting,
}) => {
  const emptyRows = Array(
    maxGuesses - guesses.length - (currentGuess ? 1 : 0)
  ).fill(null);

  const renderLetter = (letter, status, index) => {
    const className = `letter ${status ? `letter-${status}` : ""}`;
    return (
      <div key={index} className={className}>
        {letter}
      </div>
    );
  };

  const renderGuessRow = (guess, rowIndex) => {
    const letters = Array(wordLength).fill("");

    if (guess) {
      for (let i = 0; i < guess.word.length; i++) {
        letters[i] = guess.word[i];
      }
    }

    return (
      <div key={rowIndex} className="guess-row">
        {letters.map((letter, index) => {
          const status = guess?.result[index]?.solution;
          return renderLetter(letter, status, index);
        })}
      </div>
    );
  };

  const renderCurrentGuessRow = () => {
    const letters = Array(wordLength).fill("");

    for (let i = 0; i < currentGuess.length; i++) {
      letters[i] = currentGuess[i];
    }

    return (
      <div className={`guess-row current ${isSubmitting ? "submitting" : ""}`}>
        {letters.map((letter, index) => renderLetter(letter, null, index))}
      </div>
    );
  };

  const renderEmptyRow = (index) => {
    const letters = Array(wordLength).fill("");
    return (
      <div key={`empty-${index}`} className="guess-row">
        {letters.map((letter, letterIndex) =>
          renderLetter(letter, null, letterIndex)
        )}
      </div>
    );
  };

  return (
    <div className="wordle-board">
      {guesses.map((guess, index) => renderGuessRow(guess, index))}

      {currentGuess && renderCurrentGuessRow()}

      {emptyRows.map((_, index) => renderEmptyRow(index))}
    </div>
  );
};

export default WordleBoard;
