"use client";
import Link from "next/link";

export default function About() {
  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "800px",
        margin: "0px auto",
        color: "#fff",
        backgroundColor: "rgba(2, 0, 0, 0.75)",
        minHeight: "100vh",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
        <Link href="/" legacyBehavior>
        <button
          style={{
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
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")}
        >
          Back to Home
        </button>
      </Link>

      <h1>About</h1>
      <h2 style={{ marginTop: "50px" }}>What is <span style={{ color: "rgb(155, 0, 0)" }}>Marvelverse</span>?</h2>
      <p>
        Marvelverse is a Marvel-themed website designed for fans who know their heroes, villains, and everything in between.
      </p>
      <p>
        Test your knowledge across multiple games. <span style={{ color: "rgb(0, 176, 199)" }}>Unmasked</span> shows you a picture of a Marvel character—can you guess who it is?
      </p>
      <p>
        <span style={{ color: "rgb(0, 176, 199)" }}>Fragmentum</span> challenges you to piece together scattered image fragments to reveal iconic Marvel faces. Whether you're into comics, movies, or both, it's time to prove how well you really know the Marvel Universe.
      </p>

      <h2 style={{ marginTop: "50px" }}>Who Am I?</h2>
      <p>
      I&apos;m a game enthusiast and a lifelong Marvel fan, AK, who combined both passions to build this project. This started as a college assignment, but instead of going the usual route, I wanted to create something fun and interactive—a game I&rsquo;d actually want to play. I&rsquo;ve always loved coding games, and with Marvel being a huge part of what I enjoy, this was an opportunity to bring both worlds together.</p>
    </div>

    
  );
}