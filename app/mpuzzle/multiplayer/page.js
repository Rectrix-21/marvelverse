"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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

export default function MarvelPuzzle() {
  const TOTAL_ROUNDS = 5;
  const tileSize = 100; // pixels
  const ACCESS_TOKEN = "b7c79102f60865edb0f830afef67f183";
  const LOCK_PERCENTAGE = 0.3;
  const TIME_LIMIT = 30; // seconds

  // Puzzle States
  const [mode, setMode] = useState(null); // Selected difficulty: "easy", "medium", "hard"
  const [gridSize, setGridSize] = useState(null);
  const [round, setRound] = useState(1);
  const [superhero, setSuperhero] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);

  // Multiplayer Session States
  const [username, setUsername] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [updateMsg, setUpdateMsg] = useState("");
  // New state to control waiting for opponent
  const [gameStarted, setGameStarted] = useState(false);

  // NEW: State to toggle between session options (create or join)
  const [sessionOption, setSessionOption] = useState("create");

  const timerRef = useRef(null);

  // -------------------------------
  // Session Creation Functions
  // -------------------------------
  const generateFriendCode = async () => {
    if (!username.trim()) {
      alert("Please enter a username before generating a friend code.");
      return;
    }
    const newSessionId = uuidv4().slice(0, 6).toUpperCase();
    setSessionId(newSessionId);
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

  const joinSession = async () => {
    if (!friendCode.trim() || !username.trim()) {
      alert("Please enter both a friend code and a username.");
      return;
    }
    try {
      const sessionDocRef = doc(db, "multiplayerSessions", friendCode.toUpperCase());
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

  // Realtime subscription for session updates.
  useEffect(() => {
    if (sessionId) {
      const unsub = onSnapshot(doc(db, "multiplayerSessions", sessionId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSessionData(data);
          if (data.updateMsg) setUpdateMsg(data.updateMsg);
          // Wait until at least 2 players have joined (host + opponent)
          if (data.players && data.players.length >= 2) {
            setGameStarted(true);
          } else {
            setGameStarted(false);
          }
        }
      });
      return () => unsub();
    }
  }, [sessionId]);

  // -------------------------------
  // Puzzle Setup & Timer Logic
  // -------------------------------
  useEffect(() => {
    if (!mode) return;
    const MAX_ATTEMPTS = 3;
    async function fetchSuperhero(attempt = 0) {
      try {
        const res = await fetch(`https://www.superheroapi.com/api.php/${ACCESS_TOKEN}/search/a`);
        const data = await res.json();
        if (data.response === "success" && data.results) {
          const filtered = data.results.filter(
            (hero) =>
              hero.image &&
              hero.image.url &&
              hero.biography &&
              hero.biography.publisher &&
              (hero.biography.publisher.toLowerCase().includes("marvel") ||
                hero.name.toLowerCase().includes("deadpool"))
          );
          if (filtered.length === 0) {
            if (attempt < MAX_ATTEMPTS) {
              fetchSuperhero(attempt + 1);
            } else {
              setMessage("Error: No Marvel characters available. Please try again later.");
            }
            return;
          }
          const randomHero = filtered[Math.floor(Math.random() * filtered.length)];
          setSuperhero(randomHero);
        } else {
          setMessage("Error: Unable to load superhero. Please try again later.");
        }
      } catch (error) {
        console.error("Error fetching superhero", error);
        setMessage("Error: Unable to load superhero. Please try again later.");
      }
    }
    fetchSuperhero();
    // Reset timer for new round.
    setTimeLeft(TIME_LIMIT);
  }, [round, mode]);

  useEffect(() => {
    if (!mode || !gridSize || !superhero) return;
    const totalPieces = gridSize * gridSize;
    const lockedCount = Math.floor(LOCK_PERCENTAGE * totalPieces);
    const lockedIndices = [];
    while (lockedIndices.length < lockedCount) {
      const r = Math.floor(Math.random() * totalPieces);
      if (!lockedIndices.includes(r)) {
        lockedIndices.push(r);
      }
    }
    const piecesArray = new Array(totalPieces);
    const nonLockedPieces = [];
    for (let i = 0; i < totalPieces; i++) {
      if (lockedIndices.includes(i)) {
        piecesArray[i] = { id: i, order: i, locked: true };
      } else {
        nonLockedPieces.push({ id: i, order: i, locked: false });
      }
    }
    nonLockedPieces.sort(() => Math.random() - 0.5);
    let j = 0;
    for (let i = 0; i < totalPieces; i++) {
      if (!lockedIndices.includes(i)) {
        piecesArray[i] = nonLockedPieces[j];
        j++;
      }
    }
    setPieces(piecesArray);
    setMessage("");
  }, [superhero, gridSize, mode]);

  useEffect(() => {
    if (
      !gameStarted ||
      !superhero ||
      message.includes("Correct") ||
      message.includes("Game Over") ||
      message.includes("Time's up")
    )
      return;
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setMessage("Time's up! Round over.");
      if (round < TOTAL_ROUNDS) {
        setTimeout(() => {
          setRound((prev) => prev + 1);
          setSuperhero(null);
          setPieces([]);
          setMessage("");
          setTimeLeft(TIME_LIMIT);
        }, 2000);
      } else {
        setMessage("Game Over! You completed all rounds.");
      }
    }
  }, [timeLeft, superhero, message, round, gameStarted]);

  // Drag and drop handlers.
  const handleDragStart = (e, dragIndex) => {
    if (pieces[dragIndex].locked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("dragIndex", dragIndex);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData("dragIndex");
    if (dragIndex === "") return;
    e.preventDefault();
    const newPieces = [...pieces];
    if (newPieces[dropIndex].locked) return;
    const temp = newPieces[dragIndex];
    newPieces[dragIndex] = newPieces[dropIndex];
    newPieces[dropIndex] = temp;
    setPieces(newPieces);
  };

  const checkAnswer = async () => {
    let solved = true;
    for (let i = 0; i < pieces.length; i++) {
      if (pieces[i].order !== i) {
        solved = false;
        break;
      }
    }
    if (solved) {
      const newScore = score + timeLeft;
      await updateDoc(doc(db, "multiplayerSessions", sessionId), {
        scores: { ...sessionData?.scores, [username]: newScore },
      });
      setScore(newScore);
      if (round < TOTAL_ROUNDS) {
        setMessage("Correct! Moving to next round.");
        setTimeout(() => {
          setRound(round + 1);
          setSuperhero(null);
          setPieces([]);
          setMessage("");
          setTimeLeft(TIME_LIMIT);
        }, 2000);
      } else {
        setMessage("Game Over! You completed all rounds.");
      }
    } else {
      setMessage("Incorrect! Try Again.");
    }
  };

  const handleRestart = () => {
    setRound(1);
    setSuperhero(null);
    setPieces([]);
    setMessage("");
    setTimeLeft(TIME_LIMIT);
    setScore(0);
  };

  const containerStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    maxWidth: "1200px",
    margin: "40px auto",
    padding: "40px",
    background: "linear-gradient(0deg, rgb(0, 0, 0), rgb(37, 0, 0))",
    color: "#fff",
    borderRadius: "10px",
    boxShadow: "0px -2px 8px rgb(255, 0, 0)",
    lineHeight: "1.6",
  };

  // -------------------------------
  // Render Flow:
  // 1. If no difficulty is selected, show difficulty selection.
  // 2. If mode is chosen but session is not joined, show session creation UI with toggle.
  // 3. If joined but waiting for opponent, show waiting message.
  // 4. When gameStarted is true, display puzzle interface and final leaderboard.
  // -------------------------------

  if (!mode) {
    return (
      <div style={containerStyle}>
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
        <div style={{ textAlign: "center", width: "100%", color: "rgb(0, 144, 163)" }}>
          <h1>Select Difficulty</h1>
          <div style={{ margin: "20px" }}>
            <button
              onClick={() => {
                setMode("easy");
                setGridSize(3);
              }}
              style={{
                padding: "10px 20px",
                marginRight: "10px",
                cursor: "pointer",
                backgroundColor: "rgb(155,0,0)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "rgb(100,0,0)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "rgb(155,0,0)")
              }
            >
              Easy (3×3)
            </button>
            <button
              onClick={() => {
                setMode("medium");
                setGridSize(4);
              }}
              style={{
                padding: "10px 20px",
                marginRight: "10px",
                cursor: "pointer",
                backgroundColor: "rgb(155,0,0)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "rgb(100,0,0)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "rgb(155,0,0)")
              }
            >
              Medium (4×4)
            </button>
            <button
              onClick={() => {
                setMode("hard");
                setGridSize(5);
              }}
              style={{
                padding: "10px 20px",
                cursor: "pointer",
                backgroundColor: "rgb(155,0,0)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "rgb(100,0,0)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "rgb(155,0,0)")
              }
            >
              Hard (5×5)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode && !joined) {
    return (
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
        <div style={{ width: "100%", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.8rem", color: "rgb(0,144,163)" }}>
            Multiplayer Mode
          </h1>
          {/* Toggle Options for Session Creation */}
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setSessionOption("create")}
              style={{
                padding: "10px 20px",
                marginRight: "10px",
                backgroundColor:
                  sessionOption === "create" ? "rgb(155,0,0)" : "transparent",
                color: "#fff",
                border: "1px solid rgb(155,0,0)",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              Create
            </button>
            <button
              onClick={() => setSessionOption("join")}
              style={{
                padding: "10px 20px",
                backgroundColor:
                  sessionOption === "join" ? "rgb(155,0,0)" : "transparent",
                color: "#fff",
                border: "1px solid rgb(155,0,0)",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              Join
            </button>
          </div>
          {sessionOption === "create" && (
            <div>
              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  padding: "6px",
                  marginBottom: "10px",
                  width: "80%",
                  fontSize: "1rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <br />
              <button
                onClick={generateFriendCode}
                style={{
                  padding: "10px 20px",
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
                Generate Friend Code
              </button>
            </div>
          )}
          {sessionOption === "join" && (
            <div>
              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  padding: "6px",
                  marginBottom: "10px",
                  width: "80%",
                  fontSize: "1rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
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
                  fontSize: "1rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <br />
              <button
                onClick={joinSession}
                style={{
                  padding: "10px 20px",
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
                Join Session
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (joined && !gameStarted) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", width: "100%" }}>
          <h1 style={{ marginBottom: "20px" }}>Waiting for opponent to join...</h1>
          <p>
            Your Friend Code is: <strong>{sessionId}</strong>
          </p>
          {sessionData && sessionData.players && (
            <p>Players joined: {sessionData.players.join(", ")}</p>
          )}
        </div>
      </div>
    );
  }

  // Render: Puzzle UI when gameStarted is true.
  return (
    <div style={containerStyle}>
      <Link href="/">
        <button
          style={{
            padding: "10px 20px",
            marginBottom: "20px",
            backgroundColor: "rgb(155,0,0)",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
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
          Home
        </button>
      </Link>
      {/* Display session info */}
      <div style={{ width: "100%", textAlign: "left", marginBottom: "20px" }}>
        <h2>Session: {sessionId}</h2>
        {updateMsg && (
          <p style={{ color: "rgb(0,144,163)", fontSize: "1.2rem" }}>
            {updateMsg}
          </p>
        )}
        {joined && <p>Timer: {timeLeft} seconds</p>}
      </div>
      <div style={{ textAlign: "center", width: "100%" }}>
        <h1
          style={{
            fontSize: "2rem",
            color: "rgb(0,144,163)",
          }}
        >
          Marvel Puzzle - {mode ? mode.charAt(0).toUpperCase() + mode.slice(1) : "Select Difficulty"} Mode | Round {round} of {TOTAL_ROUNDS}
        </h1>
        <p style={{ fontSize: "1.3rem", marginBottom: "1.5rem" }}>
          Time Left: {timeLeft} seconds | Score: {score}
        </p>
      </div>
      {superhero ? (
        <div style={{ width: "100%", textAlign: "center" }}>
          <h2>{superhero.name}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)`,
              gridTemplateRows: `repeat(${gridSize}, ${tileSize}px)`,
              gap: "2px",
              margin: "20px auto",
              width: `${gridSize * tileSize}px`,
            }}
          >
            {pieces.map((piece, index) => {
              const correctRow = Math.floor(piece.order / gridSize);
              const correctCol = piece.order % gridSize;
              const bgPosX = -(correctCol * tileSize) + "px";
              const bgPosY = -(correctRow * tileSize) + "px";
              return (
                <div
                  key={piece.id}
                  draggable={!piece.locked}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  style={{
                    width: tileSize + "px",
                    height: tileSize + "px",
                    backgroundImage: `url(${superhero.image.url})`,
                    backgroundSize: `${gridSize * tileSize}px ${gridSize * tileSize}px`,
                    backgroundPosition: `${bgPosX} ${bgPosY}`,
                    border: piece.locked ? "2px solid green" : "1px solid #000",
                    boxSizing: "border-box",
                    cursor: piece.locked ? "default" : "move",
                    opacity: piece.locked ? 0.8 : 1,
                  }}
                ></div>
              );
            })}
          </div>
          {(message === "Game Over! You completed all rounds." ||
            message === "Time's up! Round over.") ? (
            <button
              onClick={handleRestart}
              style={{
                padding: "10px 20px",
                backgroundColor: "rgb(155,0,0)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "background-color 0.3s",
                marginTop: "20px",
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
          ) : (
            // Only show the Check Answer button if the answer has not been marked correct.
            message !== "Correct! Moving to next round." && (
              <button
                onClick={checkAnswer}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "rgb(155,0,0)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                  marginTop: "20px",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(100,0,0)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(155,0,0)")
                }
              >
                Check Answer
              </button>
            )
          )}
          {message && (
            <p style={{ fontSize: "1.2rem", marginTop: "10px", color: "rgb(0,144,163)" }}>
              {message}
            </p>
          )}
          {/* Final Leaderboard Panel */}
          {message === "Game Over! You completed all rounds." && sessionData?.scores && (
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
            </div>
          )}
        </div>
      ) : (
        <p style={{ textAlign: "center", width: "100%" }}>Loading superhero...</p>
      )}
    </div>
  );
}