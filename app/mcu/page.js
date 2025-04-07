"use client";

import React, { useState, useEffect } from "react";
// Import your champion class mapping from your JSON file
import championData from "./class.json";

const ACCESS_TOKEN = "b7c79102f60865edb0f830afef67f183";

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

// Helper: find champion class from the JSON data.
const getChampionClass = (name) => {
  const entry = championData.characters.find(
    (item) => item.name.toLowerCase() === name.toLowerCase()
  );
  return entry ? entry.class : "Unknown";
};

export default function MCUGuesser() {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentGuess, setCurrentGuess] = useState("");
  const [guessedCharacter, setGuessedCharacter] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(15);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundEnded, setRoundEnded] = useState(false);
  const [clues, setClues] = useState([]);
  const [clueIndex, setClueIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [finalAnswer, setFinalAnswer] = useState("");

  // Comparison table properties including a new "Guess" property and "Place of Birth"
  const comparisonProperties = [
    { label: "Guess", custom: true, type: "text" },
    { label: "Full Name", parentKey: "biography", type: "text" },
    { label: "Gender", parentKey: "appearance", type: "text" },
    { label: "Race", parentKey: "appearance", type: "text" },
    { label: "Place of Birth", parentKey: "biography", type: "text" },
    { label: "Base", parentKey: "work", type: "text" },
    { label: "Class", parentKey: "custom", type: "text" },
    { label: "Intelligence", parentKey: "powerstats", type: "number" },
    { label: "Strength", parentKey: "powerstats", type: "number" },
    { label: "Speed", parentKey: "powerstats", type: "number" },
    { label: "Durability", parentKey: "powerstats", type: "number" },
    { label: "Power", parentKey: "powerstats", type: "number" },
    { label: "Combat", parentKey: "powerstats", type: "number" },
  ];

  const fetchURL = `https://www.superheroapi.com/api.php/${ACCESS_TOKEN}/search/a`;

  // Fetch character data on mount.
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(fetchURL);
        const data = await res.json();
        if (data.response !== "success" || !data.results) {
          throw new Error("Invalid API response structure");
        }
        const chars = data.results;
        if (!Array.isArray(chars) || chars.length === 0) {
          throw new Error("No characters returned from Superhero API");
        }
        const marvelChars = chars.filter((char) => {
          return (
            char.biography &&
            char.biography.publisher &&
            (char.biography.publisher.toLowerCase().includes("marvel") ||
              char.name.toLowerCase().includes("deadpool"))
          );
        });
        if (marvelChars.length === 0) {
          throw new Error("No Marvel characters returned from Superhero API");
        }
        setCharacters(marvelChars);
        const randomChar =
          marvelChars[Math.floor(Math.random() * marvelChars.length)];
        setSelectedCharacter(randomChar);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Superhero data", err);
        setErrorMsg(
          "Error fetching Superhero data. Please check your access token or try again later."
        );
        setLoading(false);
      }
    }
    fetchData();
  }, [fetchURL]);

  // Fetch suggestions based on current guess.
  useEffect(() => {
    async function fetchSuggestions() {
      if (!currentGuess.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `https://www.superheroapi.com/api.php/${ACCESS_TOKEN}/search/${currentGuess}`
        );
        const data = await res.json();
        if (data.response !== "success" || !data.results) {
          setSuggestions([]);
          return;
        }
        const marvelChars = data.results.filter((char) => {
          return (
            char.biography &&
            char.biography.publisher &&
            (char.biography.publisher.toLowerCase().includes("marvel") ||
              char.name.toLowerCase().includes("deadpool"))
          );
        });
        setSuggestions(marvelChars);
      } catch (err) {
        console.error("Error fetching suggestions", err);
        setSuggestions([]);
      }
    }
    fetchSuggestions();
  }, [currentGuess]);

  // When selectedCharacter changes, attach its champion class and set clues.
  useEffect(() => {
    if (selectedCharacter) {
      if (!selectedCharacter.custom) {
        selectedCharacter.custom = {};
      }
      selectedCharacter.custom.class = getChampionClass(selectedCharacter.name);
      const bio = selectedCharacter.biography || {};

      // Determine pronouns based on gender.
      const gender =
        selectedCharacter.appearance && selectedCharacter.appearance.gender
          ? selectedCharacter.appearance.gender.toLowerCase()
          : "";
      const pronoun =
        gender === "female"
          ? { subject: "She", possessive: "Her" }
          : { subject: "He", possessive: "His" };

      const newClues = [];
      if (mcuMovieClues[selectedCharacter.name]) {
        newClues.push(mcuMovieClues[selectedCharacter.name]);
      } else {
        newClues.push(
          "This character is part of the Marvel Cinematic Universe."
        );
      }
      if (bio["first-appearance"] && bio["first-appearance"] !== "-") {
        newClues.push(
          `${
            pronoun.subject
          } made ${pronoun.possessive.toLowerCase()} debut in ${
            bio["first-appearance"]
          }.`
        );
      }
      if (bio["place-of-birth"] && bio["place-of-birth"] !== "-") {
        newClues.push(
          `${pronoun.subject} was born in ${bio["place-of-birth"]}.`
        );
      }
      if (bio["full-name"] && bio["full-name"] !== "-") {
        newClues.push(
          `${pronoun.possessive} full name is ${bio["full-name"]}.`
        );
      }
      setClues(newClues);
      setClueIndex(0);
    }
  }, [selectedCharacter]);

  // Helper: record the comparison of the current guess.
  const recordComparison = (guess) => {
    const rowData = comparisonProperties.map((prop) => {
      let guessedVal;
      let actualVal;
      if (prop.custom) {
        // For the "Guess" property, use the text from the input.
        guessedVal = currentGuess || "N/A";
        actualVal = selectedCharacter ? selectedCharacter.name : "N/A";
      } else if (
        prop.parentKey === "custom" &&
        prop.label.toLowerCase() === "class"
      ) {
        guessedVal = guess ? getChampionClass(guess.name) : "N/A";
        actualVal = selectedCharacter.custom?.class || "N/A";
      } else {
        guessedVal =
          guess &&
          guess[prop.parentKey] &&
          guess[prop.parentKey][prop.label.toLowerCase().replace(/ /g, "-")];
        actualVal =
          selectedCharacter &&
          selectedCharacter[prop.parentKey] &&
          selectedCharacter[prop.parentKey][
            prop.label.toLowerCase().replace(/ /g, "-")
          ]
            ? selectedCharacter[prop.parentKey][
                prop.label.toLowerCase().replace(/ /g, "-")
              ]
            : "N/A";
      }
      return {
        label: prop.label,
        guessedVal: guessedVal || "N/A",
        actualVal,
        type: prop.type,
      };
    });
    setComparisons((prev) => [rowData, ...prev]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
        // Save the final answer so it can be displayed in the round over UI.
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
    setFinalAnswer(""); // clear the final answer for the new round
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
    return (
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
          backgroundColor: "#2a2a2a",
          color: "#fff",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#444" }}>
            {comparisonProperties.map((prop) => (
              <th
                key={prop.label}
                style={{
                  border: "1px solid #666",
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
                backgroundColor: rowIndex % 2 === 0 ? "#333" : "#2a2a2a",
              }}
            >
              {rowData.map((cell) => {
                let cellStyle = {
                  border: "1px solid #666",
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
    );
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          fontSize: "22px",
          background: "#1b1b1b",
          color: "#fff",
        }}
      >
        Loading MCU Character Guesser...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          color: "tomato",
          fontSize: "22px",
        }}
      >
        {errorMsg}
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
        background: "linear-gradient(135deg, #1b1b1b, #3b3b3b)",
        color: "#fff",
        borderRadius: "10px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        lineHeight: "1.6",
      }}
    >
      {/* Main game panel */}
      <div
        style={{
          flex: "2 1 600px",
          padding: "20px",
          backgroundColor: "#262626",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.7)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "2.8rem",
            marginBottom: "1rem",
            color: "#ffcc00",
          }}
        >
          Marvel Guesser
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
          {selectedCharacter.image && selectedCharacter.image.url ? (
            <img
              src={selectedCharacter.image.url}
              alt="Guess the Marvel character"
              style={{
                width: "100%",
                maxWidth: "500px",
                borderRadius: "8px",
                filter: "brightness(0.8)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.8)",
              }}
            />
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
                      border: "1px solid #555",
                      marginBottom: "10px",
                      outline: "none",
                      backgroundColor: "#333",
                      color: "#fff",
                    }}
                  />
                  <br />
                  <button
                    type="submit"
                    style={{
                      padding: "14px 30px",
                      backgroundColor: "#e62429",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      marginTop: "20px",
                      marginBottom: "20px",
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#c31f23")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e62429")
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
                      backgroundColor: "#333",
                      borderRadius: "6px",
                      maxWidth: "400px",
                      margin: "0 auto",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.7)",
                    }}
                  >
                    {suggestions.slice(0, 5).map((char) => (
                      <li
                        key={char.id}
                        onClick={() => setCurrentGuess(char.name)}
                        style={{
                          padding: "10px 14px",
                          cursor: "pointer",
                          backgroundColor: "#444",
                          borderRadius: "6px",
                          marginBottom: "8px",
                          fontSize: "1rem",
                          transition: "background-color 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "#555")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "#444")
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
                      color: "#ffcc00",
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
                    backgroundColor: "#e62429",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#c31f23")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e62429")
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
                backgroundColor: "#e62429",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "1.1rem",
                cursor: "pointer",
                marginTop: "10px",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#c31f23")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#e62429")
              }
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      {/* Comparison Table Panel */}
      <div
        style={{
          flex: "1 1 300px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "1rem",
            fontSize: "1.6rem",
            color: "#ffcc00",
          }}
        ></h2>
        {comparisons.length > 0 ? (
          renderComparisonTable()
        ) : (
          <p
            style={{
              textAlign: "center",
              fontSize: "1.2rem",
              paddingLeft: "30px",
            }}
          >
            After your guess, comparisons will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
