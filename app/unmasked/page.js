"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import championData from "./class.json";
import Image from "next/image";

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

const getChampionClass = (name) => {
  const entry = championData.characters.find(
    (item) => item.name.toLowerCase() === name.toLowerCase()
  );
  return entry ? entry.class : "Unknown";
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
  const [errorMsg, setErrorMsg] = useState("");
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
      if (!selectedCharacter.custom) {
        selectedCharacter.custom = {};
      }
      selectedCharacter.custom.class = getChampionClass(selectedCharacter.name);
      const bio = selectedCharacter.biography || {};

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

  const recordComparison = (guess) => {
    const rowData = comparisonProperties.map((prop) => {
      let guessedVal;
      let actualVal;
      if (prop.custom) {
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
          {selectedCharacter.image && selectedCharacter.image.url ? (
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
                src={selectedCharacter.image.url}
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
                        key={char.id}
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
