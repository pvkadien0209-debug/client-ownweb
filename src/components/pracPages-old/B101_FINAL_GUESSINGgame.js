import React, { useState } from "react";
import TablePUSH from "./B101_FINAL_TABLE-PUSHAW";
const GuessingGame = ({ maxGuesses }) => {
  const predefinedString = "HELLO12345"; // Updated to uppercase to match the uppercase input
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");
  const [guessCount, setGuessCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [finalGuess, setFinalGuess] = useState("");
  const [finalResult, setFinalResult] = useState("");
  const [guessedChars, setGuessedChars] = useState(new Set()); // Track guessed characters
  const [correctGuesses, setCorrectGuesses] = useState([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState([]);

  const handleGuessChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 1) {
      setGuess(value);
    }
  };

  const handleFinalGuessChange = (e) => {
    setFinalGuess(e.target.value.toUpperCase());
  };

  const checkGuess = () => {
    if (guessCount >= maxGuesses) {
      setResult("You've reached the maximum number of guesses.");
      return;
    }
    if (guessedChars.has(guess)) {
      setResult(`You already guessed '${guess}'. Try another character.`);
    } else {
      const originalArray = predefinedString.split("");
      if (originalArray.includes(guess)) {
        const count = originalArray.filter((char) => char === guess).length;
        setResult(`Exists: ${count} time(s)`);
        setCorrectGuesses([...correctGuesses, ...Array(count).fill(guess)]);
      } else {
        setResult("Does not exist");
        setIncorrectGuesses([...incorrectGuesses, guess]);
      }
      setGuessedChars(new Set([...guessedChars, guess])); // Add guess to guessed characters
      setGuessCount(guessCount + 1);
    }
  };

  const checkFinalGuess = () => {
    if (maxGuesses - guessCount < 5) {
      setFinalResult("You've reached the maximum number of guesses.");
    } else {
      setGuessCount(guessCount + 5);
      if (finalGuess === predefinedString) {
        setFinalResult("Congratulations! Correct guess.");
        setPoints(points + 1);
      } else {
        setFinalResult("Incorrect guess. Try again.");
      }
    }
  };

  const gameContainerStyle = {
    textAlign: "center",
    marginTop: "50px",
    height: "500px",
    border: "1px solid green",
    borderRadius: "5px",
  };

  const inputStyle = {
    margin: "10px",
    padding: "5px",
  };

  const buttonStyle = {
    padding: "5px 10px",
    cursor: "pointer",
  };

  const resultStyle = {
    marginTop: "20px",
    fontSize: "18px",
    color: "blue",
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    cursor: "not-allowed",
    opacity: "0.5",
  };

  return (
    <div style={gameContainerStyle}>
      <div className="row">
        <br />
        <div className="col-4">
          {" "}
          <h1>Guessing Game</h1>
          <div>Hoàn thành: {points}</div>
          <div>Còn lại: {maxGuesses - guessCount}</div>
        </div>
        <div className="col-4">
          {" "}
          <div>
            <i>Dùng 1 điểm để đoán 1 chữ có trong đáp án hay không?</i>
            <input
              type="text"
              value={guess}
              onChange={handleGuessChange}
              // placeholder="Enter a character or number"
              style={inputStyle}
            />
            <button
              onClick={checkGuess}
              disabled={guessCount >= maxGuesses}
              style={
                guessCount >= maxGuesses ? disabledButtonStyle : buttonStyle
              }
            >
              Check
            </button>
          </div>
          <div style={resultStyle}>{result}</div>
          <hr />
          <i>Từ có tồn tại trong đáp án</i>
          <TablePUSH data={correctGuesses} />
          <hr />
          <i>Từ không tồn tại trong đáp án</i>
          <TablePUSH data={incorrectGuesses} />
        </div>
        <div className="col-4">
          <div>
            <i>Dùng 5 điểm để đoán xem đáp án có đúng hay không? </i>
            <input
              type="text"
              value={finalGuess}
              onChange={handleFinalGuessChange}
              // placeholder="Enter your final guess"
              style={inputStyle}
            />
            <button onClick={checkFinalGuess} style={buttonStyle}>
              Submit Guess
            </button>
            <div style={resultStyle}>{finalResult}</div>
            <hr />

            {finalGuess.length > 0 ? (
              <TablePUSH data={finalGuess.split("")} />
            ) : null}
            <hr />
            <i>
              Từ hoặc câu cần tìm có {predefinedString.length} chữ (không có
              khoảng cách giữa các chữ)
            </i>
            <TablePUSH data={predefinedString.split("").map(() => "...")} />
            <hr />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuessingGame;
