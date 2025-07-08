import './GameResult.css';

const GameResult = ({ gameStatus, guesses, onPlayAgain, onGoHome }) => {
    const isWon = gameStatus === 'won';
    const attempts = guesses.length;

    return (
        <div className="game-result">
            <div className="result-content">
                <h2 className={`result-title ${isWon ? 'won' : 'lost'}`}>
                    {isWon ? '🎉 Congratulations!' : '😞 Game Over'}
                </h2>

                <p className="result-message">
                    {isWon
                        ? `You guessed it in ${attempts} attempt${attempts !== 1 ? 's' : ''}!`
                        : `Better luck next time! You used all 6 attempts.`
                    }
                </p>

                {guesses.length > 0 && (
                    <div className="result-stats">
                        <h3>Your Guesses:</h3>
                        <div className="guesses-list">
                            {guesses.map((guess, index) => (
                                <div key={index} className="guess-item">
                                    <span className="guess-number">{index + 1}.</span>
                                    <span className="guess-word">{guess.word}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="result-actions">
                    <button onClick={onPlayAgain} className="btn btn-primary">
                        Play Again
                    </button>
                    <button onClick={onGoHome} className="btn btn-secondary">
                        Choose Difficulty
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameResult; 