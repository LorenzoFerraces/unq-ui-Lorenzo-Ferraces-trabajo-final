const SessionsGrid = ({
  activeSessions,
  onSessionSelect,
  onClearSession,
  onNewGame,
}) => {
  return (
    <>
      <h1>Your Active Games</h1>
      <p>Continue playing or start a new game</p>

      <button
        onClick={onNewGame}
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
                onClick={() => onSessionSelect(sessionId)}
                className="btn btn-primary"
              >
                {session.isCompleted ? "View" : "Continue"}
              </button>
              <button
                onClick={() => onClearSession(sessionId)}
                className="btn btn-danger"
              >
                Clear
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default SessionsGrid;
