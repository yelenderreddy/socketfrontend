import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://socketbackend-production-0ab5.up.railway.app", {
  transports: ["websocket"],
});

function App() {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && username) {
      socket.emit("send_message", { username, message });
      setMessage("");
    }
  };

  const handleJoin = () => {
    if (tempName.trim()) {
      setUsername(tempName.trim());
    }
  };

  if (!username) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Enter your name to join the chat</h2>
        <input
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          placeholder="Your name"
        />
        <button onClick={handleJoin}>Join</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Chatting as <strong>{username}</strong></h2>
      <div style={{ marginBottom: "1rem", border: "1px solid #ddd", padding: 10, maxHeight: 300, overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <div key={index}><strong>{msg.username}:</strong> {msg.message}</div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
