"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Fragmentum() {
  const TOTAL_ROUNDS = 5;
  const tileSize = 100; // pixels
  const ACCESS_TOKEN = "b7c79102f60865edb0f830afef67f183";
  const LOCK_PERCENTAGE = 0.3;

  // State hooks
  const [mode, setMode] = useState(null);
  const [gridSize, setGridSize] = useState(null);
  const [round, setRound] = useState(1);
  const [superhero, setSuperhero] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [message, setMessage] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [imgErrorCount, setImgErrorCount] = useState(0);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [dragIndex, setDragIndex] = useState(null);
  const [touchOverIndex, setTouchOverIndex] = useState(null);

  function handleSwipeStart(e) {
    const t = e.touches[0];
    setTouchStart({ x: t.clientX, y: t.clientY });
  }
  // 2) on lift, compute delta and pick a direction
  function handleSwipeEnd(e, idx) {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.hypot(dx, dy) < 30) return; // no big swipe → ignore
    const dir =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
        ? "down"
        : "up";
    slideTile(idx, dir);
  }
  // 3) swap with the neighbor in that direction
  function slideTile(idx, dir) {
    const row = Math.floor(idx / gridSize),
      col = idx % gridSize;
    let target;
    if (dir === "left" && col > 0) target = idx - 1;
    if (dir === "right" && col < gridSize - 1) target = idx + 1;
    if (dir === "up" && row > 0) target = idx - gridSize;
    if (dir === "down" && row < gridSize - 1) target = idx + gridSize;
    if (target == null) return;
    if (pieces[target].locked || pieces[idx].locked) return;
    const newPieces = [...pieces];
    [newPieces[idx], newPieces[target]] = [newPieces[target], newPieces[idx]];
    setPieces(newPieces);
  }

  function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    // figure out which tile is under the finger
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const idx = el?.dataset?.index;
    if (idx != null) setTouchOverIndex(Number(idx));
  }

  const toggleRulesPopup = () => {
    setShowRules((prev) => !prev);
  };

  const handleTouchStart = (e, index) => {
    e.preventDefault();
    setDragIndex(index);
  };
  const handleTouchEnd = (e) => {
    e.preventDefault();
    const dropIndex = touchOverIndex ?? dragIndex;
    if (dragIndex == null || pieces[dropIndex].locked) {
      setDragIndex(null);
      setTouchOverIndex(null);
      return;
    }
    const newPieces = [...pieces];
    [newPieces[dragIndex], newPieces[dropIndex]] = [
      newPieces[dropIndex],
      newPieces[dragIndex],
    ];
    setPieces(newPieces);
    setDragIndex(null);
    setTouchOverIndex(null);
  };

  // Fetch superhero – only if mode is selected.
  useEffect(() => {
    if (!mode) return;
    const MAX_ATTEMPTS = 3;
    async function fetchSuperhero(attempt = 0) {
      try {
        const res = await fetch(
          `https://www.superheroapi.com/api.php/${ACCESS_TOKEN}/search/a`
        );
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
              console.warn(`No valid superhero found, attempt ${attempt + 1}`);
              fetchSuperhero(attempt + 1);
            } else {
              console.error("No valid Marvel characters returned from API.");
              setMessage(
                "Error: No Marvel characters available. Please try again later."
              );
            }
            return;
          }
          const randomHero =
            filtered[Math.floor(Math.random() * filtered.length)];
          setSuperhero(randomHero);
        } else {
          console.error("Superhero API did not return a success response.");
          setMessage(
            "Error: Unable to load superhero. Please try again later."
          );
        }
      } catch (error) {
        console.error("Error fetching superhero", error);
        setMessage("Error: Unable to load superhero. Please try again later.");
      }
    }
    fetchSuperhero();
  }, [round, mode, imgErrorCount]);

  useEffect(() => {
    if (!superhero?.image?.url) return;
    const img = new Image();
    img.src = superhero.image.url;
    img.onerror = () => {
      if (imgErrorCount < 3) {
        setImgErrorCount((c) => c + 1);
      }
    };
  }, [superhero]);

  // Generate puzzle pieces – only if mode, gridSize, and superhero exist.
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

  // Check answer.
  const checkAnswer = () => {
    let solved = true;
    for (let i = 0; i < pieces.length; i++) {
      if (pieces[i].order !== i) {
        solved = false;
        break;
      }
    }
    if (solved) {
      setMessage("Correct! Moving to next round.");
      if (round < TOTAL_ROUNDS) {
        setTimeout(() => {
          setRound(round + 1);
          setSuperhero(null);
          setPieces([]);
          setMessage("");
        }, 2000);
      } else {
        setMessage("Game Over! You completed all rounds.");
      }
    } else {
      setMessage("Incorrect! Try Again.");
    }
  };

  // Reset the game when "Play Again" is clicked.
  const handleRestart = () => {
    setRound(1);
    setSuperhero(null);
    setPieces([]);
    setMessage("");
  };

  // Main container style matching Marvel Guesser design.
  const containerStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    maxWidth: "1200px",
    margin: "40px auto",
    marginTop: "100px",
    padding: "40px",
    background: "linear-gradient(0deg, rgb(0, 0, 0), rgb(37, 0, 0))",
    color: "#fff",
    borderRadius: "10px",
    boxShadow: "0px -2px 8px rgb(255, 0, 0)",
    lineHeight: "1.6",
  };

  // Difficulty selection UI.
  if (!mode) {
    return (
      <div style={containerStyle}>
        <Link href="/">
          <button
            style={{
              position: "fixed",
              top: "10px",
              left: "10px",
              padding: "10px 20px",
              backgroundColor: "rgb(155,0,0)",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background-color 0.3s",
              zIndex: 1000,
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
        <div
          style={{
            width: "100%",
            textAlign: "center",
            color: "rgb(0, 144, 163)",
          }}
        >
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
                marginBottom: "20px",
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
                marginBottom: "20px",
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

  // Puzzle UI.
  return (
    <div style={containerStyle}>
      <Link href="/">
        <button
          style={{
            position: "fixed",
            top: "10px",
            left: "10px",
            padding: "10px 20px",
            backgroundColor: "rgb(155,0,0)",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "background-color 0.3s",
            zIndex: 1000,
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
      <div style={{ textAlign: "center", width: "100%" }}>
        <h1
          style={{
            fontSize: "2rem",
            color: "rgb(0, 144, 163)",
            textAlign: "center",
          }}
        >
          Fragmentum - {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode |
          Round {round} of {TOTAL_ROUNDS}
          <span
            onClick={toggleRulesPopup}
            title="How to play"
            style={{
              marginLeft: "20px",
              boxSizing: "border-box",
              cursor: "pointer",
              fontSize: "1rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
              backgroundColor: "#fff",
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
              const bgPosX = `-${correctCol * tileSize}px`;
              const bgPosY = `-${correctRow * tileSize}px`;
              return (
                <div
                  data-index={index}
                  key={piece.id}
                  draggable={!piece.locked}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  // preserve your existing touch‐DnD
                  onTouchStart={(e) => {
                    handleTouchStart(e, index);
                    handleSwipeStart(e);
                  }}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={(e) => {
                    handleTouchEnd(e, index);
                    handleSwipeEnd(e, index);
                  }}
                  style={{
                    width: `${tileSize}px`,
                    height: `${tileSize}px`,
                    backgroundImage: `url(${superhero.image.url})`,
                    backgroundSize: `${gridSize * tileSize}px ${
                      gridSize * tileSize
                    }px`,
                    backgroundPosition: `${bgPosX} ${bgPosY}`,
                    border: piece.locked ? "2px solid green" : "1px solid #000",
                    boxSizing: "border-box",
                    cursor: piece.locked ? "default" : "move",
                    opacity: piece.locked ? 0.8 : 1,
                    touchAction: "none", // prevents page scrolling during swipe
                  }}
                ></div>
              );
            })}
          </div>
          {message === "Game Over! You completed all rounds." ? (
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
            <p
              style={{
                fontSize: "1.2rem",
                marginTop: "10px",
                color: "rgb(0,144,163)",
              }}
            >
              {message}
            </p>
          )}
        </div>
      ) : (
        <p style={{ textAlign: "center", width: "100%" }}>
          Loading character...
        </p>
      )}
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
                top: "10px",
                right: "10px",
                border: "none",
                background: "transparent",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              ×
            </button>
            <h2>Puzzle Game Rules</h2>
            <ul>
              <li>Solve the puzzle by rearranging the tiles.</li>
              <li>Some tiles are locked and cannot be moved.</li>
              <li>Drag and drop movable tiles to reassemble the image.</li>
              <li>The game advances rounds when the puzzle is solved.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
