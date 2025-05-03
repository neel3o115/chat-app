import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, serverTimestamp, query, where, Timestamp } from "firebase/firestore";
import { getPrivateRoomId } from "./utils";
import { motion, AnimatePresence } from "framer-motion";
import { forbiddenRoomNames } from "./filterWords";

const Sidebar = ({ onSelectRoom, currentRoom, username }) => {
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [activeView, setActiveView] = useState("rooms");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "chatRooms"), (snapshot) => {
      const roomsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRooms(roomsList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "activeUsers"),
      where("lastSeen", ">", Timestamp.fromDate(new Date(Date.now() - 120000)))
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map((doc) => doc.data());
      setUsers(usersList.filter((u) => u.userId !== username));
    });
    return () => unsubscribe();
  }, [username]);

  const createRoom = async () => {
    const trimmedName = newRoomName.trim();
    if (!trimmedName) return;

    if (!/^[A-Za-z]+$/.test(trimmedName)) {
      alert("Room name must only contain letters.");
      return;
    }

    if (trimmedName.length < 3 || trimmedName.length > 20) {
      alert("Room name must be between 3 and 20 characters.");
      return;
    }

    const lowerTrimmed = trimmedName.toLowerCase();
    if (forbiddenRoomNames.some((word) => lowerTrimmed.includes(word))) {
      alert("This room name contains inappropriate words.");
      return;
    }

    if (rooms.some((room) => room.name?.toLowerCase() === trimmedName.toLowerCase())) {
      alert("Room name already exists.");
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

  return (
    <div className="w-64 h-full flex flex-col border-r border-gray-300 bg-white">
      <div className="flex p-2 m-2 rounded-lg bg-gray-100">
        <button
          onClick={() => setActiveView("rooms")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${activeView === "rooms" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
        >
          Rooms
        </button>
        <button
          onClick={() => setActiveView("users")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${activeView === "users" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
        >
          Users
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence initial={false} mode="wait">
          {activeView === "rooms" ? (
            <motion.div
              key="rooms"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute w-full h-full flex flex-col"
            >
              <div className="flex-1 overflow-y-auto px-2 pb-2">
                <ul className="space-y-1">
                  {publicRooms.map((room) => (
                    <li
                      key={room.id}
                      className={`cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 ${currentRoom === room.id ? "bg-gray-100" : ""}`}
                      onClick={() => onSelectRoom(room.id)}
                    >
                      #{room.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2 border-t border-gray-100">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value.replace(/[^A-Za-z]/g, ""))}
                    placeholder="New room"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 truncate"
                  />
                  <button
                    onClick={createRoom}
                    className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition whitespace-nowrap"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="users"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute w-full h-full flex flex-col"
            >
              <div className="flex-1 overflow-y-auto px-2 pb-2">
                <ul className="space-y-1">
                  {sortedUsers.map((user) => {
                    const privateRoomId = getPrivateRoomId(username, user.userId);
                    return (
                      <li
                        key={user.userId}
                        className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 ${currentRoom === privateRoomId ? "bg-gray-100" : ""}`}
                        onClick={() => handlePrivateChat(user.userId)}
                      >
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="truncate">{user.displayName}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-2 rounded-lg text-center truncate">
          logged in as @{username.split("-")[0]}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;