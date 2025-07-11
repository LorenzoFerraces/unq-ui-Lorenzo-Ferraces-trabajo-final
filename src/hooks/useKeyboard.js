import { useEffect } from "react";

/**
 * Custom hook for handling keyboard events in the Wordle game
 * @param {Function} onKeyPress - Callback function to handle key presses
 * @param {boolean} disabled - Whether keyboard handling is disabled
 */
export const useKeyboard = (onKeyPress, disabled = false) => {
  useEffect(() => {
    if (disabled || !onKeyPress) {
      return;
    }

    const handleKeyDown = (e) => {
      // Prevent default behavior for game keys
      if (
        e.key === "Enter" ||
        e.key === "Backspace" ||
        /^[a-zA-Z]$/.test(e.key)
      ) {
        e.preventDefault();
      }

      // Convert browser key events to standardized format
      if (e.key === "Enter") {
        onKeyPress("ENTER");
      } else if (e.key === "Backspace") {
        onKeyPress("BACKSPACE");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        onKeyPress(e.key.toUpperCase());
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onKeyPress, disabled]);
};
