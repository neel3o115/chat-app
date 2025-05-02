import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { getPrivateRoomId } from "./utils";
import { motion, AnimatePresence } from "framer-motion";
import { forbiddenRoomNames } from "./filterWords";

const Sidebar = ({ onSelectRoom, currentRoom, username }) => {
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [showRooms, setShowRooms] = useState(true);
  const [showUsers, setShowUsers] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "chatRooms"), (snapshot) => {
      const roomsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomsList);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "activeUsers"),
      (snapshot) => {
        const usersList = snapshot.docs.map((doc) => doc.data());
        setUsers(usersList.filter((u) => u.userId !== username));
      }
    );

    return () => unsubscribe();
  }, [username]);

  const createRoom = async () => {
    const trimmedName = newRoomName.trim();

    if (trimmedName === "") return;

    // Only allow letters (a-z, A-Z)
    const isValidName = /^[A-Za-z]+$/.test(trimmedName);
    if (!isValidName) {
      alert("Room name must only contain letters (A–Z, a–z).");
      return;
    }

    // Length check
    if (trimmedName.length < 3 || trimmedName.length > 20) {
      alert("Room name must be between 3 and 20 characters.");
      return;
    }

    // Check forbidden names
    if (forbiddenRoomNames.includes(trimmedName.toLowerCase())) {
      alert("This room name contains inappropriate or reserved words.");
      return;
    }

    // Check for duplicates
    const nameExists = rooms.some(
      (room) => room.name?.toLowerCase() === trimmedName.toLowerCase()
    );
    if (nameExists) {
      alert("A room with this name already exists.");
      return;
    }

    await addDoc(collection(db, "chatRooms"), {
      name: trimmedName,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    });

    setNewRoomName("");
  };

  const handlePrivateChat = (otherUserId) => {
    const privateRoomId = getPrivateRoomId(username, otherUserId);
    onSelectRoom(privateRoomId);
  };

  const publicRooms = rooms
    .filter((room) => !room.name?.startsWith("private-"))
    .sort((a, b) => a.name.localeCompare(b.name));

  const sortedUsers = [...users].sort((a, b) => {
    const nameA = a?.displayName || "";
    const nameB = b?.displayName || "";
    return nameA.localeCompare(nameB);
  });

  const sectionVariants = {
    collapsed: { height: 0, opacity: 0, overflow: "hidden" },
    expanded: { height: "auto", opacity: 1, overflow: "hidden" },
  };

  return (
    <div className="w-64 h-full flex flex-col border-r border-gray-300 bg-white">
      {/* Chat Rooms */}
      <div
        className="flex justify-between items-center px-4 pt-4 cursor-pointer select-none"
        onClick={() => setShowRooms(!showRooms)}
      >
        <h3 className="text-xl font-semibold mb-1">Chat Rooms</h3>
        <span className="text-lg">{showRooms ? "▾" : "▸"}</span>
      </div>

      <AnimatePresence initial={false}>
        {showRooms && (
          <motion.div
            key="rooms"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={sectionVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`flex flex-col ${showUsers ? "" : "flex-grow"} min-h-0`}
          >
            {/* This div becomes scrollable */}
            <div className="overflow-y-auto px-4 space-y-2 flex-grow scroll-smooth">
              <ul>
                {publicRooms.map((room) => (
                  <li
                    key={room.id}
                    className={`cursor-pointer px-3 py-2 rounded hover:bg-gray-200 ${
                      currentRoom === room.id ? "bg-gray-200" : ""
                    }`}
                    onClick={() => onSelectRoom(room.id)}
                  >
                    #{room.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 border-gray-200 flex flex-col gap-2">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => {
                  const value = e.target.value;
                  const filtered = value.replace(/[^A-Za-z]/g, "");
                  setNewRoomName(filtered);
                }}
                placeholder="new room name"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={createRoom}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Create
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online Users */}
      <div
        className="flex justify-between items-center px-4 pt-4 cursor-pointer select-none"
        onClick={() => setShowUsers(!showUsers)}
      >
        <h3 className="text-xl font-semibold mb-1">Online Users</h3>
        <span className="text-lg">{showUsers ? "▾" : "▸"}</span>
      </div>

      <AnimatePresence initial={false}>
        {showUsers && (
          <motion.div
            key="users"
            layout
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={sectionVariants}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="flex flex-col flex-grow min-h-0"
          >
            {/* Scrollable user list */}
            <div className="overflow-y-auto px-4 pb-4 space-y-2 flex-grow scroll-smooth">
              <ul>
                {sortedUsers.map((user) => {
                  const privateRoomId = getPrivateRoomId(username, user.userId);
                  const isActive = currentRoom === privateRoomId;

                  return (
                    <li
                      key={user.userId}
                      className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200 ${
                        isActive ? "bg-gray-200" : ""
                      }`}
                      onClick={() => handlePrivateChat(user.userId)}
                    >
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {user.displayName}
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logged in user info */}
      <div className="mt-auto px-4 py-3">
        <div className="bg-blue-100 mb-1 text-blue-800 text-md font-medium px-3 py-2 rounded-xl text-center shadow-sm">
          Logged in as: {username.split("-")[0]}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
