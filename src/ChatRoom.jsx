import { useEffect, useRef, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

function ChatRoom({ roomId, username }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    const messagesRef = collection(db, "rooms", roomId, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesList = [];
      querySnapshot.forEach((doc) => {
        messagesList.push(doc.data());
      });
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (newMessage.trim()) {
      const messageData = {
        text: newMessage,
        sender: username,
        displayName: username.split("-")[0],
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, "rooms", roomId, "messages"), messageData);
      setNewMessage("");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chadainary");
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "https://api.cloudinary.com/v1_1/dc2fkolap/image/upload");
    setUploadProgress(0);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded * 100) / e.total);
        setUploadProgress(progress);
        console.log("Upload progress:", progress);
      }
    });

    xhr.onload = async () => {
      const response = JSON.parse(xhr.responseText);
      console.log("Upload response:", response);

      const imageUrl = response.secure_url;

      const messageData = {
        imageUrl,
        sender: username,
        displayName: username.split("-")[0],
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, "rooms", roomId, "messages"), messageData);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
      }, 800);
    };

    xhr.onerror = () => {
      console.error("Upload failed");
      setUploadProgress(0);
    };

    xhr.send(formData);
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 border border-gray-300 rounded-md p-4 bg-white shadow-sm">
        {messages.map((msg, index) => {
          const isOwnMessage = msg.sender === username;
          const prevMsg = messages[index - 1];
          const isSameSenderAsPrevious =
            prevMsg && prevMsg.sender === msg.sender;
          const isImage = !!msg.imageUrl;

          return (
            <div
              key={index}
              className={`flex mb-2 ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative ${isImage ? "" : "max-w-xs md:max-w-md"} `}
              >
                {!isImage ? (
                  <div
                    className={`px-4 py-2 rounded-lg shadow ${
                      isOwnMessage
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {!isOwnMessage && !isSameSenderAsPrevious && (
                      <p className="font-semibold mb-1">{msg.displayName}</p>
                    )}
                    <p className="break-words">{msg.text}</p>
                    {msg.timestamp?.toDate && (
                      <p
                        className={`text-xs mt-1 text-right ${
                          isOwnMessage ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {msg.timestamp.toDate().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={msg.imageUrl}
                      alt="uploaded"
                      className="max-w-xs md:max-w-md rounded-lg shadow"
                    />
                    {msg.timestamp?.toDate && (
                      <p className="absolute bottom-1 right-2 text-xs text-white bg-black/60 px-1.5 py-0.5 rounded">
                        {msg.timestamp.toDate().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input & Upload */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder=" type a message..."
          className="flex-1 p-2 mr-1 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white shadow-sm"
        />

        {/* Upload Button / Progress */}
        <div className="relative">
          <label htmlFor="file-upload">
            <div
              className={`overflow-hidden h-10 rounded-md border-2 border-blue-500 bg-white relative cursor-pointer transition-all w-24 hover:bg-blue-500 hover:scale-105 duration-200`}
            >
              <div
                className={`absolute top-0 left-0 h-full ${
                  uploadProgress === 100 ? "bg-blue-500" : "bg-blue-500"
                }`}
                style={{ width: `${uploadProgress}%` }}
              />
              <p className="relative text-center leading-9 text-blue-500 font-medium hover:text-white transition">
                image
              </p>
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Send Text Button */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:scale-105 duration-200"
        >
          send
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;
