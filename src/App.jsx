import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import Sidebar from "./Sidebar";
import ChatRoom from "./ChatRoom";
import { generateUniqueId } from "./utils";
import { forbiddenSubstrings } from "./filterWords";

function App() {
  const [nameInput, setNameInput] = useState("");
  const [username, setUsername] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;

    if (!/^[a-zA-Z0-9]+$/.test(name)) {
      setError(
        "Username must only contain letters and numbers (no spaces or symbols)."
      );
      return;
    }

    const loweredName = name.toLowerCase();
    if (forbiddenSubstrings.some((str) => loweredName.includes(str))) {
      setError("This name contains inappropriate or reserved words.");
      return;
    }

    const userRef = doc(db, "activeUsers", name);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const lastSeen = userData.lastSeen?.toDate().getTime() || 0;
      const currentTime = Date.now();
      const userInactiveDuration = currentTime - lastSeen;

      if (userInactiveDuration > 2 * 60 * 1000) {
        await deleteDoc(userRef);
      } else {
        setError("This username is already in use. Try something else.");
        return;
      }
    }

    const uniqueId = generateUniqueId();
    const uniqueUsername = `${name}-${uniqueId}`;
    setUsername(uniqueUsername);
    setNameSubmitted(true);
    setError("");

    await setDoc(userRef, {
      displayName: name,
      userId: uniqueUsername,
      lastSeen: serverTimestamp(),
      status: "online",
    });
  };

  useEffect(() => {
    if (!username) return;

    const originalName = username.split("-")[0];
    const userRef = doc(db, "activeUsers", originalName);

    const updateOnlineStatus = () => {
      setDoc(
        userRef,
        { status: "online", lastSeen: serverTimestamp() },
        { merge: true }
      );
    };

    const interval = setInterval(updateOnlineStatus, 10000);
    const deleteUserDoc = () => deleteDoc(userRef);

    window.addEventListener("beforeunload", deleteUserDoc);
    window.addEventListener("pagehide", deleteUserDoc);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", deleteUserDoc);
      window.removeEventListener("pagehide", deleteUserDoc);
      deleteUserDoc();
    };
  }, [username]);

  return (
    <div className="flex h-screen bg-gray-100">
      {!nameSubmitted ? (
        <form
          onSubmit={handleSubmit}
          className="m-auto p-8 bg-white shadow-lg rounded-lg text-center"
        >
          <h2 className="text-2xl font-semibold mb-6">Enter a username</h2>
          <div className="flex flex-col items-center">
            <div className="flex">
              <input
                value={nameInput}
                onChange={(e) => {
                  const lettersOnly = e.target.value.replace(
                    /[^a-zA-Z0-9]/g,
                    ""
                  );
                  setNameInput(lettersOnly);
                }}
                placeholder="username"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="ml-4 px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                Join
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </form>
      ) : (
        <>
          <Sidebar
            onSelectRoom={setSelectedRoom}
            currentRoom={selectedRoom}
            username={username}
          />
          <div className="flex-1 overflow-hidden">
            {selectedRoom ? (
              <ChatRoom roomId={selectedRoom} username={username} />
            ) : (
              <div className="flex flex-col h-screen p-4 bg-gray-100">
                <div className="flex-1 overflow-y-auto border border-gray-300 rounded-md p-4 bg-white shadow-sm">
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-md bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold">AppTeam</span>
                          <span className="text-xs text-blue-700">
                            • Just now
                          </span>
                        </div>
                        <p>Hey {username.split("-")[0]}! Let's get started:</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-md bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p>
                          <strong>Find Friends</strong>
                          <br />
                          Click the{" "}
                          <span className="font-semibold">"Users"</span> button
                          in the sidebar → See who's here right now!
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-md bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p>
                          <strong>Join the Party</strong>
                          <br />
                          Switch to{" "}
                          <span className="font-semibold">"Rooms"</span> in the
                          sidebar → Try #memes or #feedback!
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-md bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p>
                          <strong>Create Your Space</strong>
                          <br />
                          Use the{" "}
                          <span className="font-semibold">"Create"</span> button
                          at the bottom of Rooms list → Friends can join with
                          the room name!
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-md bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p>
                          PS: Found a bug? Have ideas? We're all ears in{" "}
                          <span className="font-semibold">#feedback</span>!
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-start relative mb-6">
                      <div className="max-w-xs md:max-w-md bg-blue-900 text-white px-4 py-2 rounded-lg shadow-lg border border-blue-700">
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-semibold text-blue-200">
                            Coming Soon!
                          </p>

                          <img
                            src="https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif"
                            alt="Excited animation"
                            className="w-full rounded-lg max-w-[200px] h-auto mb-2"
                          />

                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-blue-800 rounded-full text-sm text-blue-100">
                              Themes
                            </span>
                            <span className="px-3 py-1 bg-blue-800 rounded-full text-sm text-blue-100">
                              GIFs
                            </span>
                            <span className="px-3 py-1 bg-blue-800 rounded-full text-sm text-blue-100">
                              Reactions
                            </span>
                          </div>
                        </div>

                        <div className="absolute left-60 bottom-17">
                          <button
                            onClick={() => setLiked(!liked)}
                            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-200 ${
                              liked
                                ? "bg-blue-100 hover:bg-blue-200"
                                : "bg-blue-100 hover:bg-blue-100"
                            }`}
                          >
                            {liked ? (
                              <svg
                                className="w-10 h-10 text-red-500"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            ) : (
                              <svg
                                className="w-8 h-8 text-red-500"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
