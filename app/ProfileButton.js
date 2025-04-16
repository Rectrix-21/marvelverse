"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";

export default function ProfileButton() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhotoFile, setNewPhotoFile] = useState(null); // no longer used

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign In Error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Helper: Check if newName is unique across users collection.
  const checkNameUnique = async (name) => {
    const q = query(
      collection(db, "users"),
      where("displayName", "==", name)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    // Ensure name is not empty
    if (!newName.trim()) return;
    try {
      // Check if the name is unique
      const isUnique = await checkNameUnique(newName);
      if (!isUnique) {
        alert("Name already in use. Please choose a different name.");
        return;
      }
      // Update profile displayName
      await updateProfile(auth.currentUser, {
        displayName: newName || auth.currentUser.displayName,
      });
      // Save the new name to Firestore under "users" using uid as doc id.
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        displayName: newName,
      });
      setUser({ ...auth.currentUser });
      setEditing(false);
      setDropdownOpen(false);
      setNewPhotoFile(null);
      setNewName("");
    } catch (error) {
      console.error("Update Profile Error:", error);
    }
  };

  const handleDeleteAccount = async () => {
    // Ask the user for confirmation
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        // Delete the user from Firebase Auth.
        await auth.currentUser.delete();
        // Optionally, delete the user's document from Firestore:
        // await deleteDoc(doc(db, "users", auth.currentUser.uid));
      } catch (error) {
        console.error("Delete Account Error:", error);
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        zIndex: 1000,
      }}
    >
      {user ? (
        <>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={toggleDropdown}
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
              {user.displayName || "Profile"}
            </button>
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  right: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                  borderRadius: "4px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  padding: "10px",
                  paddingRight: "20px",
                  width: "220px",
                }}
              >
                {!editing ? (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "8px",
                        background: "none",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0)")
                      }
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "8px",
                        background: "none",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0)")
                      }
                    >
                      Log Out
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "8px",
                        background: "none",
                        color: "tomato",
                        border: "none",
                        borderRadius: "4px",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                        marginTop: "8px",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(255, 0, 0, 0.2)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0)")
                      }
                    >
                      Delete Account
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleEditProfile}>
                    <label style={{ color: "rgb(0, 175, 137)", fontSize: "0.9rem" }}>
                      Name:
                      <input
                        type="text"
                        placeholder={user.displayName || "New Name"}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px",
                          marginTop: "4px",
                          borderRadius: "4px",
                          border: "1px solid rgb(0, 175, 137)",
                        }}
                      />
                    </label>
                    <br />
                    <br />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="submit"
                        style={{
                          padding: "8px",
                          marginLeft: "10px",
                          backgroundColor: "rgb(155, 0, 0)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          flex: "1",
                          transition: "background-color 0.3s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgb(100, 0, 0)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgb(155, 0, 0)")
                        }
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        style={{
                          padding: "8px",
                          marginLeft: "10px",
                          backgroundColor: "rgb(150, 128, 128)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          flex: "1",
                          transition: "background-color 0.3s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgb(51, 38, 38)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgb(150, 128, 128)")
                        }
                      >
                        Back
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <button
          onClick={handleGoogleSignIn}
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
          Sign In / Sign Up
        </button>
      )}
    </div>
  );
}