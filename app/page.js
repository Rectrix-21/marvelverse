"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Head from "next/head";
import styles from "./Marvelverse.module.css";
import ProfileButton from "./ProfileButton";

// Dynamically import the Marvel Guesser component if you wish to embed it
const Quiz = dynamic(() => import("./unmasked/page.js"), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <meta name="color-scheme" content="light" />
      </Head>
      {/* The global background video is now rendered via layout */}
      <ProfileButton />
      <div
        style={{
          background: "transparent",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          color: "#fff",
          boxSizing: "border-box", // ensures padding doesn't add extra scrollable space
          overflowY: "auto",       // only show vertical scrolling if needed
        }}
      >
        <h1 className={styles.header}>Marvelversed</h1>
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "20px",
            color: "rgb(0, 176, 199)",
          }}
        >
          Welcome Summoner
        </h1>
        <h2
          style={{
            fontSize: "2rem",
            marginBottom: "150px",
            color: "rgb(0, 176, 199)",
          }}
        >
          Choose a Game Mode:
        </h2>
        {/* Wrap the game mode cards in a flex row container */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "40px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              flex: "1 1 300px",
              maxWidth: "500px",
              padding: "20px",
              border: "1px solid rgb(156, 0, 0)",
              borderRadius: "8px",
              backgroundColor: "rgba(5, 0, 0, 0.8)",
            }}
          >
            <h3 style={{ fontSize: "1.8rem", color: "rgb(0, 144, 163)" }}>
              Unmasked
            </h3>
            <p
              style={{
                fontSize: "1rem",
                textAlign: "center",
                marginTop: "-20px",
              }}
            >
              Test your knowledge of Marvel characters.
            </p>
            <div style={{ display: "flex", gap: "20px" }}>
              <Link href="/unmasked" legacyBehavior>
                <a
                  style={{
                    textDecoration: "none",
                    padding: "15px 20px",
                    backgroundColor: "rgb(155, 0, 0)",
                    color: "#fff",
                    borderRadius: "6px",
                    fontSize: "1.2rem",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
                  }
                >
                  Single Player
                </a>
              </Link>
              <Link href="/unmasked/multiplayer" legacyBehavior>
                <a
                  style={{
                    textDecoration: "none",
                    padding: "15px 20px",
                    backgroundColor: "rgb(155, 0, 0)",
                    color: "#fff",
                    borderRadius: "6px",
                    fontSize: "1.2rem",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
                  }
                >
                  Multiplayer
                </a>
              </Link>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              flex: "1 1 300px",
              maxWidth: "500px",
              padding: "20px",
              border: "1px solid rgb(156, 0, 0)",
              borderRadius: "8px",
              backgroundColor: "rgba(5, 0, 0, 0.8)",
            }}
          >
            <h3 style={{ fontSize: "1.8rem", color: "rgb(0, 144, 163)" }}>
              Fragmentum
            </h3>
            <p
              style={{
                fontSize: "1rem",
                textAlign: "center",
                marginTop: "-20px",
              }}
            >
              Assemble the puzzle pieces to form the character image.
            </p>
            <div style={{ display: "flex", gap: "20px" }}>
              <Link href="/fragmentum" legacyBehavior>
                <a
                  style={{
                    textDecoration: "none",
                    padding: "15px 20px",
                    backgroundColor: "rgb(155, 0, 0)",
                    color: "#fff",
                    borderRadius: "6px",
                    fontSize: "1.2rem",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
                  }
                >
                  Single Player
                </a>
              </Link>
              <Link href="/fragmentum/multiplayer" legacyBehavior>
                <a
                  style={{
                    textDecoration: "none",
                    padding: "15px 20px",
                    backgroundColor: "rgb(155, 0, 0)",
                    color: "#fff",
                    borderRadius: "6px",
                    fontSize: "1.2rem",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
                  }
                >
                  Multiplayer
                </a>
              </Link>
            </div>
          </div>
        </div>
        {/* Optionally embed the Quiz component: <Quiz /> */}
      </div>
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          textAlign: "center",
          padding: "15px",
          color: "#fff",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
        }}
      >
        <Link href="/about" legacyBehavior>
          <a
            style={{
              color: "rgb(0, 176, 199)",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
            onMouseOver={e => (e.currentTarget.style.textDecoration = "underline")}
            onMouseOut={e => (e.currentTarget.style.textDecoration = "none")}
          >
            About
          </a>
        </Link>
        <span style={{ margin: "0 15px", color: "#fff" }}>|</span>
        <Link href="/contact" legacyBehavior>
          <a
            style={{
              color: "rgb(0, 176, 199)",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
            onMouseOver={e => (e.currentTarget.style.textDecoration = "underline")}
            onMouseOut={e => (e.currentTarget.style.textDecoration = "none")}
          >
            Contact
          </a>
        </Link>
        <span style={{ margin: "0 15px", color: "#fff" }}>|</span>
        <Link href="/suggest" legacyBehavior>
          <a
            style={{
              color: "rgb(0, 176, 199)",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
            onMouseOver={e => (e.currentTarget.style.textDecoration = "underline")}
            onMouseOut={e => (e.currentTarget.style.textDecoration = "none")}
          >
            Suggest a Game
          </a>
        </Link>
      </footer>
    </>
  );
}