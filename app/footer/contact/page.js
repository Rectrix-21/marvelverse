"use client";

import { useState } from "react";
import Link from "next/link";

export default function Contact() {
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, subject, message }),
        });
        if (res.ok) {
          setStatus("Message sent!");
          setEmail(""); setSubject(""); setMessage("");
        } else {
          setStatus("Error sending message. Please try again.");
        }
      };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "800px",
        margin: "0 auto",
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
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
          }
        >
          Back to Home
        </button>
      </Link>
      <h1>Contact</h1>
      <p
        style={{
          marginTop: "15px",
          fontSize: "1rem",
          maxWidth: "500px",
          margin: "50px auto",
        }}
      >
        Want to get in touch or found a bug? Fill out the form below—we’d love
        to hear from you!

        {status && (
        <p style={{ color: "rgb(0,176,199)", marginBottom: "1rem", marginTop: "40px" }}>
          {status}
        </p>
      )}

      </p>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <input
          type="email"
          placeholder="Your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="text"
          placeholder="Subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <textarea
          placeholder="Your message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            height: "120px",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            resize: "vertical",
          }}
        />

        <button
          type="submit"
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
          Send Message
        </button>
      </form>
    </div>
  );
}
