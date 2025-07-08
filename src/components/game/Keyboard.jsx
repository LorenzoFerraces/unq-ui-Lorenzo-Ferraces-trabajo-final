import './Keyboard.css';

const Keyboard = ({ onKeyPress, letterStatus, disabled }) => {
    const topRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    const middleRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
    const bottomRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

    const handleKeyClick = (key) => {
        if (disabled) return;
        onKeyPress(key);
    };

    const renderKey = (key, isSpecial = false) => {
        const status = letterStatus[key];
        const className = `key ${status ? `key-${status}` : ''} ${isSpecial ? 'key-special' : ''}`;

        return (
            <button
                key={key}
                className={className}
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
            >
                {key === 'BACKSPACE' ? '⌫' : key}
            </button>
        );
    };

    return (
        <div className="keyboard">
            <div className="keyboard-row">
                {topRow.map(key => renderKey(key))}
            </div>

            <div className="keyboard-row">
                {middleRow.map(key => renderKey(key))}
            </div>

            <div className="keyboard-row">
                {renderKey('ENTER', true)}
                {bottomRow.map(key => renderKey(key))}
                {renderKey('BACKSPACE', true)}
            </div>
        </div>
    );
};

export default Keyboard; 