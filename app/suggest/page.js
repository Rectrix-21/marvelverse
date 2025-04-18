"use client";

import { useState } from "react";
import Link from "next/link";
// removed Firestore imports
// import { db } from "../../../../firebase/firebase";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Suggest() {
  const [gameName, setGameName]     = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus]         = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameName, description })
      });
      if (res.ok) {
        setStatus("Thanks for your suggestion!");
        setGameName("");
        setDescription("");
      } else {
        throw new Error("Mail failed");
      }
    } catch {
      setStatus("Error sending suggestion—please try again.");
    }
  };

  return (
    <div style={{
      position: "relative",
      padding: "40px",
      maxWidth: "800px",
      margin: "0 auto",
      color: "#fff",
      backgroundColor: "rgba(2, 0, 0, 0.75)",
      minHeight: "100vh",
      boxSizing: "border-box",
      textAlign: "center",
    }}>
      <Link href="/" legacyBehavior>
        <button style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          padding: "10px 20px",
          backgroundColor: "rgb(155, 0, 0)",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          transition: "background-color 0.3s",
          zIndex: 1000,
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)"}
        onMouseOut={e => e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)"}
        >Back to Home</button>
      </Link>

      <h1>Suggest a Game</h1>
      <p style={{
        margin: "20px auto 40px",
        fontSize: "1rem",
        maxWidth: "600px",
        lineHeight: 1.5,
      }}>
        Fill out the form below to propose a new game. Provide a brief description so we can evaluate and implement it!
      </p>

      <div style={{
        textAlign: "left",
        maxWidth: "600px",
        margin: "0 auto 40px",
        lineHeight: 1.6,
      }}>
        <p><strong style={{ color: "rgb(0, 176, 199)" }}>Marvel-Themed Only</strong><br/>
          Your idea must revolve around Marvel characters, stories, or visuals.</p>
        <p><strong style={{ color: "rgb(0, 176, 199)" }}>Web-Friendly Concepts</strong><br/>
          Only suggest browser‑feasible games (no VR, console‑level graphics).</p>
        <p><strong style={{ color: "rgb(0, 176, 199)" }}>Keep It Simple</strong><br/>
          Quizzes, puzzles, click‑based or drag‑and‑drop mechanics work best.</p>
        <p><strong style={{ color: "rgb(0, 176, 199)" }}>Be Clear and Concise</strong><br/>
          Describe your idea in 1–2 short sentences. No need for full game designs.</p>
        <p><strong style={{ color: "rgb(0, 176, 199)" }}>No Repeats</strong><br/>
          Check existing games first to avoid duplicates.</p>
        <p><strong style={{ color: "rgb(0, 176, 199)" }}>One Game Per Submission</strong><br/>
          Submit each idea separately.</p>
      </div>

      {status && <p style={{ color: "rgb(0,176,199)", marginBottom: "20px" }}>{status}</p>}

      <form onSubmit={handleSubmit} style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}>
        <input
          type="text"
          placeholder="Game Name"
          required
          value={gameName}
          onChange={e => setGameName(e.target.value)}
          style={{
            width: "100%", maxWidth: "400px",
            padding: "10px", borderRadius: "4px",
            border: "1px solid #ccc", boxSizing: "border-box",
          }}
        />
        <textarea
          placeholder="Short Description"
          required
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{
            width: "100%", maxWidth: "400px",
            height: "80px", padding: "10px",
            borderRadius: "4px", border: "1px solid #ccc",
            boxSizing: "border-box", resize: "vertical",
          }}
        />
        <button type="submit" style={{
          padding: "10px 20px",
          backgroundColor: "rgb(155, 0, 0)",
          color: "#fff", border: "none",
          borderRadius: "4px", cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)"}
        onMouseOut={e => e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)"}
        >Submit Suggestion</button>
      </form>
    </div>
  );
}