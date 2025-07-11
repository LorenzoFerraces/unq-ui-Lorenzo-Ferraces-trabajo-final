const DifficultyGrid = ({
  difficulties,
  onDifficultySelect,
  showBackButton = false,
  onBackToSessions = null,
  isGuest = false,
}) => {
  const getDifficultyDescription = (difficultyId) => {
    switch (difficultyId) {
      case "easy":
        return "Perfect for beginners";
      case "medium":
        return "Classic Wordle experience";
      case "hard":
        return "Challenge yourself";
      default:
        return "";
    }
  };

  return (
    <>
      <h1>Choose Your Difficulty</h1>
      <p>Select a difficulty level to start playing Wordle</p>

      {isGuest && (
        <p style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "20px" }}>
          <em>Note: Login to save your progress and play multiple games</em>
        </p>
      )}

      {showBackButton && onBackToSessions && (
        <button
          onClick={onBackToSessions}
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
            onClick={() => onDifficultySelect(difficulty.id)}
            className="difficulty-card"
          >
            <h3>{difficulty.name}</h3>
            <p>{getDifficultyDescription(difficulty.id)}</p>
          </button>
        ))}
      </div>
    </>
  );
};

export default DifficultyGrid;
