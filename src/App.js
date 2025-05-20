import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Connect to backend
const socket = io("https://socketbackend-production-0ab5.up.railway.app", {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  timeout: 20000,
});

function App() {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  // Listen for events
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_typing", (user) => {
      setTypingUser(user);
    });

    socket.on("user_stop_typing", () => {
      setTypingUser(null);
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", { username, message });
      setMessage("");
      socket.emit("stop_typing");
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (e.target.value.length > 0) {
      socket.emit("typing", username);
    } else {
      socket.emit("stop_typing");
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

      <div style={{
        border: "1px solid #ddd",
        padding: 10,
        maxHeight: 300,
        overflowY: "auto",
        marginBottom: 10
      }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>

      {typingUser && <p><em>💬 {typingUser} is typing...</em></p>}

      <input
        value={message}
        onChange={handleTyping}
        placeholder="Type your message..."
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
