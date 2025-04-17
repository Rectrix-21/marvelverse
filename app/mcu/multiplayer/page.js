"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import championData from "../class.json";
import { db } from "../../../firebase/firebase";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

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

export default function MCUGuesser() {
  // Multiplayer Session State
  const [sessionId, setSessionId] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [timer, setTimer] = useState(30);
  const [updateMsg, setUpdateMsg] = useState("");

  // Username State (for both host and guest)
  const [username, setUsername] = useState("");

  // NEW: Multiplayer Mode (create or join)
  const [mode, setMode] = useState("create"); // "create" or "join"

  // Game State
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentGuess, setCurrentGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(15);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  // Clues, Suggestions & Comparison Table
  const [suggestions, setSuggestions] = useState([]);
  const [clues, setClues] = useState([]);
  const [clueIndex, setClueIndex] = useState(0);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [roundEnded, setRoundEnded] = useState(false);
  const [comparisons, setComparisons] = useState([]);

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

  // NEW: Loading & error states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const timerRef = useRef(null);
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
        const marvelChars = data.results.filter((char) => {
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
        setErrorMsg("Error fetching Superhero data. Please try again later.");
        setLoading(false);
      }
    }
    fetchData();
  }, [fetchURL]);

  // Realtime subscription for session updates.
  useEffect(() => {
    if (sessionId) {
      const unsub = onSnapshot(doc(db, "multiplayerSessions", sessionId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSessionData(data);
          if (data.updateMsg) setUpdateMsg(data.updateMsg);
        }
      });
      return () => unsub();
    }
  }, [sessionId]);

  // Timer starts only after both players have joined.
  useEffect(() => {
    if (
      joined &&
      sessionData &&
      sessionData.players &&
      sessionData.players.length >= 2
    ) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            updateDoc(doc(db, "multiplayerSessions", sessionId), {
              updateMsg: `Time is up for round ${currentRound}`,
              roundCompleted: true,
              lastUpdated: serverTimestamp(),
            });
            if (currentRound < 10) {
              handleNextRound();
            } else {
              setGameOver(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [joined, sessionData, currentRound, sessionId]);

  // Fetch suggestions based on the current guess.
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

  // When selectedCharacter changes, set its champion class and clues.
  useEffect(() => {
    if (selectedCharacter) {
      if (!selectedCharacter.custom) {
        selectedCharacter.custom = {};
      }
      selectedCharacter.custom.class = getChampionClass(selectedCharacter.name);
      const bio = selectedCharacter.biography || {};
      const gender = selectedCharacter.appearance?.gender
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
        newClues.push("This character is part of the Marvel Cinematic Universe.");
      }
      if (bio["first-appearance"] && bio["first-appearance"] !== "-") {
        newClues.push(
          `${pronoun.subject} made ${pronoun.possessive.toLowerCase()} debut in ${bio["first-appearance"]}.`
        );
      }
      if (bio["place-of-birth"] && bio["place-of-birth"] !== "-") {
        newClues.push(`${pronoun.subject} was born in ${bio["place-of-birth"]}.`);
      }
      if (bio["full-name"] && bio["full-name"] !== "-") {
        newClues.push(`${pronoun.possessive} full name is ${bio["full-name"]}.`);
      }
      setClues(newClues);
      setClueIndex(0);
    }
  }, [selectedCharacter]);

  // Multiplayer logic: Generate a friend code (host).
  const generateFriendCode = async () => {
    if (!username.trim()) {
      alert("Please enter a username before generating a friend code.");
      return;
    }
    const newSessionId = uuidv4().slice(0, 6).toUpperCase();
    setSessionId(newSessionId);
    setIsHost(true);
    setJoined(true);
    await setDoc(doc(db, "multiplayerSessions", newSessionId), {
      host: username,
      players: [username],
      currentRound: 1,
      roundCompleted: false,
      scores: {},
      createdAt: serverTimestamp(),
      updateMsg: "",
    });
    setFriendCode(newSessionId);
  };

  // Multiplayer logic: Guest joins session using a friend code.
  const joinSession = async () => {
    if (!friendCode.trim() || !username.trim()) {
      alert("Please enter both a friend code and a username.");
      return;
    }
    try {
      const sessionDocRef = doc(
        db,
        "multiplayerSessions",
        friendCode.toUpperCase()
      );
      const docSnap = await getDoc(sessionDocRef);
      if (docSnap.exists()) {
        setSessionId(friendCode.toUpperCase());
        setJoined(true);
        await updateDoc(sessionDocRef, {
          players: [...docSnap.data().players, username],
        });
      } else {
        alert("Session not found. Please check your friend code.");
      }
    } catch (error) {
      console.error("Error joining session:", error);
    }
  };

  // Helper: Record the comparison for the comparison table.
  const recordComparison = (guess) => {
    const rowData = comparisonProperties.map((prop) => {
      let guessedVal, actualVal;
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

  // When a guess is submitted.
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

    recordComparison(guess);

    if (
      currentGuess.trim().toLowerCase() ===
      selectedCharacter.name.trim().toLowerCase()
    ) {
      const updatedScore = score + attemptsLeft;
      setFeedback("Correct! You guessed the character.");
      setScore(updatedScore);
      if (sessionId) {
        updateDoc(doc(db, "multiplayerSessions", sessionId), {
          updateMsg: `${username} has completed round ${currentRound}`,
          scores: { ...sessionData?.scores, [username]: updatedScore },
          lastUpdated: serverTimestamp(),
        });
      }
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
    setComparisons([]);
    setFinalAnswer("");
    setTimer(30);
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
    setComparisons([]);
    setFinalAnswer("");
    setTimer(30);
  };

  const renderComparisonTable = () => {
    return (
      <table
        style={{
          width: "100%",
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
    );
  };

  // If session exists but less than 2 players, show waiting screen.
  if (joined && sessionData && sessionData.players?.length < 2) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#fff",
          fontSize: "1.2rem",
        }}
      >
        <p>Session: {sessionId}</p>
        <p>Waiting for another player to join...</p>
      </div>
    );
  }

  // Loading and error handling.
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
    <div style={{ padding: "20px" }}>
      <Link href="/">
        <button
          style={{
            padding: "10px 20px",
            marginBottom: "20px",
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

      {/* If not joined, show multiplayer session controls */}
      {!joined ? (
        <div
          style={{
            backgroundColor: "rgb(5, 0, 0)",
            padding: "20px",
            borderRadius: "8px",
            maxWidth: "500px",
            margin: "0 auto",
            textAlign: "center",
            border: "1px solid rgb(156, 0, 0)",
          }}
        >
          <h2 style={{ fontSize: "1.8rem", color: "rgb(0,144,163)" }}>
            Multiplayer Mode
          </h2>
          {/* Toggle Options */}
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setMode("create")}
              style={{
                padding: "10px 20px",
                marginRight: "10px",
                backgroundColor: mode === "create" ? "rgb(155, 0, 0)" : "transparent",
                color: "#fff",
                border: "1px solid rgb(155, 0, 0)",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              Create
            </button>
            <button
              onClick={() => setMode("join")}
              style={{
                padding: "10px 20px",
                backgroundColor: mode === "join" ? "rgb(155, 0, 0)" : "transparent",
                color: "#fff",
                border: "1px solid rgb(155, 0, 0)",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              Join
            </button>
          </div>
          {mode === "create" && (
            <div>
              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ padding: "6px", marginBottom: "10px", width: "80%" }}
              />
              <br />
              <button
                onClick={generateFriendCode}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "rgb(155, 0, 0)",
                  color: "#fff",
                  borderRadius: "6px",
                  border: "none",
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
                Generate Friend Code
              </button>
            </div>
          )}
          {mode === "join" && (
            <div>
              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ padding: "6px", marginBottom: "10px", width: "80%" }}
              />
              <br />
              <input
                type="text"
                placeholder="Enter Friend Code"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
                style={{
                  padding: "6px",
                  marginTop: "10px",
                  marginBottom: "10px",
                  width: "80%",
                }}
              />
              <br />
              <button
                onClick={joinSession}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "rgb(155, 0, 0)",
                  color: "#fff",
                  borderRadius: "6px",
                  border: "none",
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
                Join Session
              </button>
            </div>
          )}
        </div>
      ) : (
        // Main game panel (multiplayer mode)
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
          <div style={{ width: "100%", textAlign: "left", marginBottom: "20px" }}>
            <h2>Session: {sessionId}</h2>
            {updateMsg && (
              <p style={{ color: "rgb(0,144,163)", fontSize: "1.2rem" }}>
                {updateMsg}
              </p>
            )}
            {joined && <p>Timer: {timer} seconds</p>}
          </div>
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
                color: "rgb(0,144,163)",
              }}
            >
              Unmasked
            </h1>
            <p
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                fontSize: "1.3rem",
              }}
            >
              Round: {currentRound} of 10 | Attempts Left: {attemptsLeft} | Score: {score}
            </p>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              {selectedCharacter.image && selectedCharacter.image.url ? (
                <div
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    borderRadius: "8px",
                    filter: "brightness(0.8)",
                    boxShadow: "0 4px 12px rgba(206,0,0,0.8)",
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
                          border: "1px solid rgb(0,144,163)",
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
                          backgroundColor: "rgb(155,0,0)",
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
                          (e.currentTarget.style.backgroundColor = "rgb(100,0,0)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgb(155,0,0)")
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
                          color: "rgb(0,144,163)",
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
                        <span style={{ fontWeight: "bold" }}>
                          {finalAnswer}
                        </span>
                        .
                      </p>
                    ) : (
                      <p>Round {currentRound} completed.</p>
                    )}
                    <button
                      onClick={handleNextRound}
                      style={{
                        padding: "14px 30px",
                        backgroundColor: "rgb(155,0,0)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgb(100,0,0)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgb(155,0,0)")
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
                    backgroundColor: "rgb(155,0,0)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    marginTop: "10px",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgb(100,0,0)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgb(155,0,0)")
                  }
                >
                  Play Again
                </button>
                {/* Final Leaderboard Card */}
                <div
                  style={{
                    margin: "30px auto",
                    maxWidth: "500px",
                    background: "linear-gradient(135deg, rgb(59, 0, 0), rgba(49, 41, 41, 0.61))",
                    borderRadius: "10px",
                    padding: "20px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.8rem",
                      textAlign: "center",
                      marginTop: "-10px",
                      marginBottom: "25px",
                      color: "rgb(0,144,163)",
                    }}
                  >
                    Final Leaderboard
                  </h3>
                  {sessionData?.scores && (
                    <ol
                      style={{
                        listStyleType: "none",
                        fontSize: "1.2rem",
                        color: "#fff",
                        margin: "0 auto",
                        padding: "0",
                      }}
                    >
                      {Object.entries(sessionData.scores)
                        .sort((a, b) => Number(b[1]) - Number(a[1]))
                        .map(([player, score]) => (
                          <li
                            key={player}
                            style={{
                              marginBottom: "10px",
                              textAlign: "center",
                              padding: "5px 0",
                              borderBottom: "2px solid rgba(0, 0, 0, 0.75)",
                            }}
                          >
                            <span style={{ fontWeight: "bold", color: "#ffcc00" }}>
                              {player}
                            </span>
                            : {score}
                          </li>
                        ))}
                    </ol>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Comparison Table Panel */}
      <div>{comparisons.length > 0 ? renderComparisonTable() : null}</div>
    </div>
  );
}