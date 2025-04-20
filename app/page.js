"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Head from "next/head";
import ProfileButton from "./ProfileButton";

// Dynamically import the Quiz component if needed
const Quiz = dynamic(() => import("./unmasked/page.js"), { ssr: false });

// toggle switch component using styled-jsx
function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="slider"></span>
      <style jsx>{`
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 24px;
          margin-right: 8px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 5px;
          left: 0;
          right: 0;
          bottom: 5px;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: -2px;
          bottom: -3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: rgb(0, 176, 199);
        }
        input:focus + .slider {
          box-shadow: 0 0 1px rgb(0, 176, 199);
        }
        input:checked + .slider:before {
          transform: translateX(25px);
        }
        input:disabled + .slider {
          background-color: rgb(0, 176, 199);
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </label>
  );
}

export default function Home() {
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [cookieBannerMode, setCookieBannerMode] = useState("consent"); // "consent" or "details"
  const [cookiePrefs, setCookiePrefs] = useState({
    necessary: true,
    cookiesPolicy: true,
    functionality: false,
    analysis: false,
  });

  // On first load, check for existing cookie preferences
  useEffect(() => {
    const storedPrefs = localStorage.getItem("cookiePrefs");
    if (storedPrefs) {
      setCookiePrefs(JSON.parse(storedPrefs));
    } else {
      // No prefs stored; show the cookie banner
      setShowCookieBanner(true);
      setCookieBannerMode("consent");
    }
  }, []);

  const handleToggle = (key) => {
    setCookiePrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookiePrefs", JSON.stringify(cookiePrefs));
    setShowCookieBanner(false);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      cookiesPolicy: true,
      functionality: true,
      analysis: true,
    };
    setCookiePrefs(allAccepted);
    localStorage.setItem("cookiePrefs", JSON.stringify(allAccepted));
    setShowCookieBanner(false);
  };

  const handleDeclineAll = () => {
    // Keep necessary true and disable all others
    const prefs = {
      necessary: true,
      cookiesPolicy: true,
      functionality: false,
      analysis: false,
    };
    setCookiePrefs(prefs);
    localStorage.setItem("cookiePrefs", JSON.stringify(prefs));
    setShowCookieBanner(false);
  };

  // Function to close detailed view
  const handleCloseDetails = () => {
    setShowCookieBanner(false);
  };

  const buttonStyle = {
    padding: "5px 8px",
    cursor: "pointer",
    fontSize: "0.8rem",
    backgroundColor: "rgb(155, 0, 0)",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    transition: "background-color 0.3s",
  };

  return (
    <>
      <Head>
        <meta name="color-scheme" content="light" />
      </Head>
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
          boxSizing: "border-box",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Link href="/" legacyBehavior>
          <a>
            <img
              src="/logo-title.svg"
              alt="Marvelversed Logo"
              style={{
                position: "absolute",
                top: "200px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "700px",
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </a>
        </Link>
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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "40px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Unmasked option */}
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
          {/* Fragmentum option */}
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
        {/* Optionally embed the Quiz component */}
        {/* <Quiz /> */}
      </div>
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          textAlign: "center",
          padding: "15px",
          color: "#fff",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Link href="/about" legacyBehavior>
          <a
            style={{
              color: "rgb(0, 176, 199)",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
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
            onMouseOver={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
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
            onMouseOver={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Suggest a Game
          </a>
        </Link>
        <span style={{ margin: "0 15px", color: "#fff" }}>|</span>
        <Link href="/privacy-policy" legacyBehavior>
          <a
            style={{
              color: "rgb(0, 176, 199)",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Privacy Policy
          </a>
        </Link>
        <span style={{ margin: "0 15px", color: "#fff" }}>|</span>
        <a
          href="#"
          style={{
            color: "rgb(0, 176, 199)",
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.textDecoration = "underline")
          }
          onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
          onClick={(e) => {
            e.preventDefault();
            setCookieBannerMode("consent");
            setShowCookieBanner(true);
          }}
        >
          Manage Cookies
        </a>
      </footer>
      {showCookieBanner &&
        (cookieBannerMode === "consent" ? (
          <div
            style={{
              position: "fixed",
              bottom: "50px",
              right: "20px",
              backgroundColor: "rgba(0,0,0,0.85)",
              color: "#fff",
              padding: "15px",
              borderRadius: "8px",
              zIndex: 1100,
              width: "320px",
            }}
          >
            <p
              style={{
                fontSize: "0.9rem",
                marginBottom: "20px",
                marginTop: "5px",
              }}
            >
              We use cookies to ensure the smooth operation of our website and
              to gather statistical insights.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setCookieBannerMode("details")}
                style={buttonStyle}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
                }
              >
                Manage
              </button>
              <button
                onClick={handleDeclineAll}
                style={buttonStyle}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
                }
              >
                Decline All
              </button>
              <button
                onClick={handleAcceptAll}
                style={buttonStyle}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
                }
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          // Detailed banner view (existing toggles view)
          <div
            style={{
              position: "fixed",
              bottom: "50px",
              right: "20px",
              backgroundColor: "rgba(0,0,0,0.85)",
              color: "#fff",
              padding: "20px",
              borderRadius: "8px",
              zIndex: 1100,
              width: "320px",
            }}
          >
            {/* Detailed banner content with toggles */}
            <p
              style={{
                fontSize: "0.9rem",
                marginBottom: "20px",
                marginTop: "5px",
              }}
            >
              Customize your cookie preferences:
            </p>
            <div style={{ marginBottom: "20px", fontSize: "0.85rem" }}>
              <div style={{ marginBottom: "10px" }}>
                <strong>Necessary / Essential Cookies</strong>
                <p style={{ margin: "3px 0" }}>
                  These cookies are essential for the operation of the website:
                  they keep you logged in and keep your current game session
                  active.
                </p>
                <ToggleSwitch
                  checked={cookiePrefs.necessary}
                  onChange={() => handleToggle("necessary")}
                  disabled
                />
                <span
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginTop: "4px",
                  }}
                >
                  {cookiePrefs.necessary ? "On" : "Off"}
                </span>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <strong>Cookies Policy / Notice Acceptance Cookies</strong>
                <p style={{ margin: "3px 0" }}>
                  These cookies track your acceptance of our cookies policy.
                </p>
                <ToggleSwitch
                  checked={cookiePrefs.cookiesPolicy}
                  onChange={() => handleToggle("cookiesPolicy")}
                  disabled
                />
                <span
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginTop: "4px",
                  }}
                >
                  {cookiePrefs.cookiesPolicy ? "On" : "Off"}
                </span>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <strong>Functionality Cookies</strong>
                <p style={{ margin: "3px 0" }}>
                  These cookies enhance the functionality of the website and
                  pre-save some pages to load them faster.
                </p>
                <ToggleSwitch
                  checked={cookiePrefs.functionality}
                  onChange={() => handleToggle("functionality")}
                />
                <span
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginTop: "4px",
                  }}
                >
                  {cookiePrefs.functionality ? "On" : "Off"}
                </span>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <strong>Analysis Cookies</strong>
                <p style={{ margin: "3px 0" }}>
                  These cookies collect statistical data using Google Analytics
                  to help us improve user experience.
                </p>
                <ToggleSwitch
                  checked={cookiePrefs.analysis}
                  onChange={() => handleToggle("analysis")}
                />
                <span
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginTop: "4px",
                  }}
                >
                  {cookiePrefs.analysis ? "On" : "Off"}
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", marginTop: "5px" }}>
                Read more about cookies on our{" "}
                <Link href="/privacy-policy#tracking-cookies" legacyBehavior>
                  <a style={{ color: "rgb(0, 176, 199)" }}>Privacy Policy</a>
                </Link>
                .
              </p>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={handleCloseDetails}
                style={buttonStyle}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
                }
              >
                Close Details
              </button>
              <button
                onClick={handleSavePreferences}
                style={buttonStyle}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
                }
              >
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                style={buttonStyle}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
                }
              >
                Accept All
              </button>
            </div>
          </div>
        ))}
    </>
  );
}
