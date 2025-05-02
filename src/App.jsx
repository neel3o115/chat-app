import { useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
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
      setError("this name contains inappropriate or reserved words.");
      return;
    }

    const userRef = doc(db, "activeUsers", name);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const currentTime = Date.now();
      const userInactiveDuration = currentTime - userData.joinedAt;

      if (userInactiveDuration > 1 * 60 * 1000) {
        await deleteDoc(userRef);
      } else {
        setError("this username is already in use. try something else.");
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
      joinedAt: Date.now(),
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
        { status: "online", lastSeen: Date.now() },
        { merge: true }
      );
    };

    const interval = setInterval(updateOnlineStatus, 10000);
    window.addEventListener("beforeunload", () => deleteDoc(userRef));

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", () => deleteDoc(userRef));
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
                  {/* Welcome & CloakBot Guide Messages */}
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-lg bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p className="font-semibold mb-1">birajit</p>
                        <p>
                          Hey {username.split("-")[0]}! Welcome aboard! Wanna see who's online?
                          Just check the <strong>‘Online Users’</strong> section in the left
                          sidebar. You can click on any name to start a convo
                          instantly!
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-lg bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p className="font-semibold mb-1">devansh</p>
                        <p>
                          Not in the mood for 1-on-1? No worries! Jump into any
                          public chatroom from the <strong>‘Chatrooms’</strong> list. No invites,
                          no drama—just chat!
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-lg bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p className="font-semibold mb-1">abhey</p>
                        <p>
                          Need some privacy? Just <strong>create your own room </strong> and share
                          the name with your friends. It’s your space, your
                          rules!
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-lg bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p className="font-semibold mb-1">priyanshu</p>
                        <p>
                          One quick heads-up: all chats are temporary and
                          completely anonymous. So say what you feel but don’t
                          forget to be kind
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-lg bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p className="font-semibold mb-1">neel</p>
                        <p>
                          And that’s not all! We’re cooking up some cool updates
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-lg bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p>
                          Notifications, so you’ll know the moment someone texts
                          you!
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-lg bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p>Themes to match your vibe.</p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-lg bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p>Reactions to express yourself better.</p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-lg bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p>And much more on the way!</p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-xs md:max-w-lg bg-blue-100 text-blue-900 px-4 py-2 rounded-lg shadow">
                        <p>
                          P.S. There’s a chatroom just for feedback—we’d love to
                          hear what you think. Drop your thoughts there and help
                          us improve!
                        </p>
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
