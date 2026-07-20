"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import marvelCharacters from "../data/marvelCharacters.json";

const mcuMovieClues = {
  "Iron Man": "He starred in the 2008 blockbuster 'Iron Man.'",
  "Captain America":
    "He led the Avengers and had a film titled 'Captain America: The First Avenger.'",
  Thor: "This Asgardian first appeared in 'Thor' (2011).",
  Hulk: "This green powerhouse featured in 'The Incredible Hulk' (2008).",
  "Black Widow":
    "A key spy in the Avengers, she had her own story in 'Black Widow' (2021).",
  Hawkeye: "This master archer appears throughout the Avengers films.",
};

export default function Unmasked() {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentGuess, setCurrentGuess] = useState("");
  const [guessedCharacter, setGuessedCharacter] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(15);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundEnded, setRoundEnded] = useState(false);
  const [clues, setClues] = useState([]);
  const [clueIndex, setClueIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [imgErrorCount, setImgErrorCount] = useState(0);

  // State for rules popup
  const [showRules, setShowRules] = useState(false);
  const toggleRulesPopup = () => {
    setShowRules((prev) => !prev);
  };

  // Comparison table properties
  const comparisonProperties = [
    { label: "Guess", custom: true, type: "text" },
    { label: "Real Name", key: "realName", type: "text" },
    { label: "Gender", key: "gender", type: "text" },
    { label: "Origin", key: "origin", type: "text" },
    { label: "Class", key: "characterClass", type: "text" },
    { label: "Issue Appearances", key: "issueAppearances", type: "number" },
  ];

  // Pick the round's character from the local Marvel roster on mount.
  useEffect(() => {
    setCharacters(marvelCharacters);
    const randomChar =
      marvelCharacters[Math.floor(Math.random() * marvelCharacters.length)];
    setSelectedCharacter(randomChar);
    setLoading(false);
  }, []);

  // Suggestions are filtered client-side from the local roster (no network call).
  useEffect(() => {
    const q = currentGuess.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }
    setSuggestions(
      characters.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 5)
    );
  }, [currentGuess, characters]);

  useEffect(() => {
    setImgErrorCount(0);
  }, [selectedCharacter]);

  // called if <Image> fails to load
  const handleImageError = () => {
    if (imgErrorCount < 3 && characters.length > 1) {
      setImgErrorCount((c) => c + 1);
      // pick a different random character
      let other;
      do {
        other = characters[
          Math.floor(Math.random() * characters.length)
        ];
      } while (other.name === selectedCharacter.name);
      setSelectedCharacter(other);
    }
  };

  useEffect(() => {
    if (selectedCharacter) {
      const gender = (selectedCharacter.gender || "").toLowerCase();
      const pronoun =
        gender === "female"
          ? { subject: "She", possessive: "Her" }
          : { subject: "He", possessive: "His" };

      const newClues = [];
      if (mcuMovieClues[selectedCharacter.baseName]) {
        newClues.push(mcuMovieClues[selectedCharacter.baseName]);
      } else {
        newClues.push("This character is part of the Marvel Universe.");
      }
      if (selectedCharacter.firstAppearance) {
        const firstTitle = selectedCharacter.firstAppearance
          .split(";")[0]
          .trim();
        newClues.push(
          `${pronoun.subject} first appeared in the issue "${firstTitle}".`
        );
      }
      if (selectedCharacter.origin && selectedCharacter.origin !== "Unknown") {
        newClues.push(
          `${pronoun.possessive} origin is classified as "${selectedCharacter.origin}".`
        );
      }
      if (selectedCharacter.realName) {
        newClues.push(
          `${pronoun.possessive} real name is ${selectedCharacter.realName}.`
        );
      }
      setClues(newClues);
      setClueIndex(0);
    }
  }, [selectedCharacter]);

  const recordComparison = (guess) => {
    const rowData = comparisonProperties.map((prop) => {
      let guessedVal;
      let actualVal;
      if (prop.custom) {
        guessedVal = currentGuess || "N/A";
        actualVal = selectedCharacter ? selectedCharacter.name : "N/A";
      } else {
        guessedVal = guess && guess[prop.key] != null ? guess[prop.key] : "N/A";
        actualVal =
          selectedCharacter && selectedCharacter[prop.key] != null
            ? selectedCharacter[prop.key]
            : "N/A";
      }
      return {
        label: prop.label,
        guessedVal,
        actualVal,
        type: prop.type,
      };
    });
    setComparisons((prev) => [rowData, ...prev]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentGuess.trim() === "") {
      setFeedback("Please provide a guess!");
      return;
    }
    if (!selectedCharacter || gameOver || roundEnded) return;

    const guess = suggestions.find(
      (char) =>
        char.name.trim().toLowerCase() === currentGuess.trim().toLowerCase()
    );

    setGuessedCharacter(guess);
    recordComparison(guess);

    if (
      currentGuess.trim().toLowerCase() ===
      selectedCharacter.name.trim().toLowerCase()
    ) {
      setFeedback("Correct! You guessed the character.");
      setScore((prev) => prev + attemptsLeft);
      if (currentRound === 10) {
        setGameOver(true);
      } else {
        setRoundEnded(true);
      }
    } else {
      const newAttempts = attemptsLeft - 1;
      setAttemptsLeft(newAttempts);
      if (newAttempts <= 0) {
        setFinalAnswer(selectedCharacter.name);
        setFeedback(
          `Round Over! The correct answer was ${selectedCharacter.name}.`
        );
        if (currentRound === 10) {
          setGameOver(true);
        } else {
          setRoundEnded(true);
        }
      } else {
        if (clueIndex < clues.length) {
          const recentClue = clues[clueIndex];
          setFeedback(`Wrong! Here's a clue: ${recentClue}`);
          setClueIndex(clueIndex + 1);
        } else {
          setFeedback("Wrong! No more clues available.");
        }
      }
    }
  };

  const handleNextRound = () => {
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    setSelectedCharacter(
      characters[Math.floor(Math.random() * characters.length)]
    );
    setCurrentGuess("");
    setFeedback("");
    setAttemptsLeft(15);
    setRoundEnded(false);
    setClueIndex(0);
    setGuessedCharacter(null);
    setComparisons([]);
    setFinalAnswer("");
  };

  const handleRestart = () => {
    if (characters.length === 0) return;
    setCurrentRound(1);
    setScore(0);
    setSelectedCharacter(
      characters[Math.floor(Math.random() * characters.length)]
    );
    setCurrentGuess("");
    setFeedback("");
    setAttemptsLeft(15);
    setGameOver(false);
    setRoundEnded(false);
    setClueIndex(0);
    setGuessedCharacter(null);
    setComparisons([]);
    setFinalAnswer("");
  };

  const renderComparisonTable = () => {
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          fontSize: "22px",
          color: "#fff",
        }}
      >
        Loading MCU Character Guesser...
      </div>
    );
  }

  if (!selectedCharacter) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          fontSize: "22px",
          color: "#fff",
        }}
      >
        No character available. Please try again later.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-around",
        maxWidth: "1200px",
        margin: "40px auto",
        padding: "40px",
        background: "linear-gradient(0deg, rgb(0, 0, 0), rgb(37, 0, 0))",
        color: "#fff",
        borderRadius: "10px",
        boxShadow: "0px -2px -8px rgb(255, 0, 0)",
        lineHeight: "1.6",
      }}
    >
      {/* Home Button on top left */}
      <div style={{ width: "100%", textAlign: "left", marginBottom: "20px" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "rgb(155, 0, 0)",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
            }
          >
            Home
          </button>
        </Link>
      </div>

      {/* Main game panel */}
      <div
        style={{
          flex: "2 1 600px",
          padding: "20px",
          background: "linear-gradient(180deg, rgb(10, 0, 0), rgb(37, 0, 0))",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgb(255, 0, 0)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "2.8rem",
            marginBottom: "1rem",
            color: "rgb(0, 144, 163)",
          }}
        >
          Unmasked{" "}
          <span
            onClick={toggleRulesPopup}
            title="How to play"
            style={{
              marginLeft: "10px",
              boxSizing: "border-box",
              cursor: "pointer",
              fontSize: "1rem",
              display: "inline-flex", // keeps it inline with text
              alignItems: "center",
              justifyContent: "center",
              color: "#000", // Black text
              backgroundColor: "#fff", // White background
              borderRadius: "50%",
              width: "2em",
              height: "2em",
              userSelect: "none",
              verticalAlign: "middle",
            }}
          >
            ?
          </span>
        </h1>
        <p
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            fontSize: "1.3rem",
          }}
        >
          Round: {currentRound} of 10 | Attempts Left: {attemptsLeft} | Score:{" "}
          {score}
        </p>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          {selectedCharacter.imageUrl ? (
            <div
              style={{
                width: "100%",
                maxWidth: "500px",
                borderRadius: "8px",
                filter: "brightness(0.8)",
                boxShadow: "0 4px 12px rgba(206, 0, 0, 0.8)",
                margin: "0 auto",
                position: "relative",
              }}
            >
              <Image
                src={selectedCharacter.imageUrl}
                alt="Guess the Marvel character"
                layout="responsive"
                width={500}
                height={500}
                onError={handleImageError}
                objectFit="cover"
                quality={75}
              />
            </div>
          ) : (
            <p style={{ fontSize: "1.2rem" }}>
              No image available for this character.
            </p>
          )}
        </div>
        {!gameOver && (
          <>
            {!roundEnded ? (
              <>
                <form
                  onSubmit={handleSubmit}
                  style={{ textAlign: "center", marginBottom: "20px" }}
                >
                  <input
                    type="text"
                    placeholder="Search or guess character"
                    value={currentGuess}
                    onChange={(e) => setCurrentGuess(e.target.value)}
                    style={{
                      width: "80%",
                      maxWidth: "400px",
                      padding: "14px",
                      fontSize: "1.1rem",
                      borderRadius: "6px",
                      border: "1px solid rgb(0, 144, 163)",
                      marginBottom: "10px",
                      outline: "none",
                      background:
                        "linear-gradient(90deg, rgb(10, 0, 0), rgb(0, 0, 0))",
                      color: "#fff",
                    }}
                  />
                  <br />
                  <button
                    type="submit"
                    style={{
                      padding: "14px 30px",
                      backgroundColor: "rgb(155, 0, 0)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "1rem",
                      cursor: "pointer",
                      marginTop: "20px",
                      marginBottom: "20px",
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
                    }
                  >
                    Submit Guess
                  </button>
                </form>
                {currentGuess && suggestions.length > 0 && (
                  <ul
                    style={{
                      listStyleType: "none",
                      padding: "12px",
                      marginTop: "10px",
                      marginBottom: "1.5rem",
                      textAlign: "left",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      borderRadius: "6px",
                      maxWidth: "400px",
                      margin: "0 auto",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.7)",
                    }}
                  >
                    {suggestions.slice(0, 5).map((char) => (
                      <li
                        key={char.cvId}
                        onClick={() => setCurrentGuess(char.name)}
                        style={{
                          padding: "10px 14px",
                          cursor: "pointer",
                          backgroundColor: "rgba(43, 0, 0, 0.75)",
                          borderRadius: "6px",
                          marginTop: "5px",
                          marginBottom: "5px",
                          fontSize: "1rem",
                          transition: "background-color 0.3s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "rgba(107, 0, 0, 0.8)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "rgba(0, 0, 0, 0.8)")
                        }
                      >
                        {char.name}
                      </li>
                    ))}
                  </ul>
                )}
                {feedback && (
                  <p
                    style={{
                      marginTop: "20px",
                      textAlign: "center",
                      fontSize: "1.2rem",
                      color: "rgb(0, 144, 163)",
                    }}
                  >
                    {feedback}
                  </p>
                )}
              </>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "30px",
                  fontSize: "1.3rem",
                }}
              >
                {finalAnswer ? (
                  <p>
                    Round Over! The correct answer was{" "}
                    <span style={{ fontWeight: "bold" }}>{finalAnswer}</span>.
                  </p>
                ) : (
                  <p>Round {currentRound} completed.</p>
                )}
                <button
                  onClick={handleNextRound}
                  style={{
                    padding: "14px 30px",
                    backgroundColor: "rgb(155, 0, 0)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
                  }
                >
                  Next Round
                </button>
              </div>
            )}
          </>
        )}
        {gameOver && (
          <div
            style={{
              textAlign: "center",
              marginTop: "30px",
              fontSize: "1.3rem",
            }}
          >
            <p style={{ fontSize: "1.6rem", marginBottom: "10px" }}>
              Game Over! You scored {score} points in 10 rounds.
            </p>
            {finalAnswer && (
              <p style={{ fontSize: "1.3rem", marginTop: "10px" }}>
                The correct answer was{" "}
                <span style={{ fontWeight: "bold" }}>{finalAnswer}</span>.
              </p>
            )}
            <button
              onClick={handleRestart}
              style={{
                padding: "14px 30px",
                backgroundColor: "rgb(155, 0, 0)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                cursor: "pointer",
                marginTop: "10px",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
              }
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      {/* Comparison Table Panel */}
      {comparisons.length > 0 && (
        <div className="table-responsive">
        <table
          style={{
            borderCollapse: "collapse",
            marginTop: "20px",
            color: "#fff",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}>
              {comparisonProperties.map((prop) => (
                <th
                  key={prop.label}
                  style={{
                    border: "1px solid rgba(0, 200, 214, 0.75)",
                    padding: "10px 15px",
                    textAlign: "center",
                    fontSize: "1rem",
                  }}
                >
                  {prop.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisons.map((rowData, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  backgroundColor:
                    rowIndex % 2 === 0
                      ? "rgba(10, 0, 0, 0.75)"
                      : "rgba(10, 0, 0, 0.8)",
                }}
              >
                {rowData.map((cell) => {
                  let cellStyle = {
                    border: "1px solid rgba(0, 200, 214, 0.75)",
                    padding: "10px 15px",
                    textAlign: "center",
                    fontSize: "0.95rem",
                    color: "tomato",
                  };
                  let content = cell.guessedVal;
                  if (
                    cell.guessedVal !== "N/A" &&
                    cell.actualVal &&
                    cell.type === "text" &&
                    cell.guessedVal.toLowerCase() === cell.actualVal.toLowerCase()
                  ) {
                    cellStyle.color = "lightgreen";
                  }
                  if (cell.type === "number") {
                    const guessedNum = Number(cell.guessedVal);
                    const actualNum = Number(cell.actualVal);
                    let arrow = "";
                    if (!isNaN(guessedNum) && !isNaN(actualNum)) {
                      if (guessedNum < actualNum) arrow = " ⬆️";
                      else if (guessedNum > actualNum) arrow = " ⬇️";
                      else cellStyle.color = "lightgreen";
                    }
                    content = `${cell.guessedVal}${arrow}`;
                  }
                  return (
                    <td key={cell.label} style={cellStyle}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* Rules Popup */}
      {showRules && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "rgba(0, 0, 0, 0.9)",
              color: "rgba(255, 255, 255, 0.9)",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "90%",
              maxHeight: "80%",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              onClick={toggleRulesPopup}
              style={{
                position: "absolute",
                color: "rgba(255, 255, 255, 0.9)",
                top: "10px",
                right: "10px",
                border: "none",
                background: "transparent",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <h2>Game Rules</h2>
            <ul>
              <li>Guess the correct Marvel character.</li>
              <li>You have 15 attempts per round.</li>
              <li>Clues will appear on incorrect guesses.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
