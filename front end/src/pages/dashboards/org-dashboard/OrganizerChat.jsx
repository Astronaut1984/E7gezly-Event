import { useEffect, useState } from "react";

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [currentConvo, setCurrentConvo] = useState(null);
  const [text, setText] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function getMessages() {
      try {
        const res = await fetch(
          "http://localhost:8000/messages/getorgmessages",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log(data['conversations']);
        if (isMounted) {
          setConversations(data["conversations"]);
          // Add any new messages to the current Convo's messages if available
          if(currentConvo) {
            const updatedConvo = data["conversations"].find(
              (conv) => conv.attendee.username === currentConvo.attendee.username
            );
            if (updatedConvo) {
              setCurrentConvo(updatedConvo);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }

    getMessages();
    const intervalId = setInterval(getMessages, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const attendeeNames = conversations.flatMap((conv) =>
    conv.attendee?.name ? [conv.attendee.name] : []
  );

  function handleOnClickConversation(index) {
    setCurrentConvo(conversations[index]);
    console.log(currentConvo);
  }

  async function sendMessage() {
    const reciever = currentConvo.attendee.username;

    // Create the new message object
    const newMessage = {
      content: text,
      sender_type: "owner",
      message_date: new Date().toISOString(),
    };

    // Optimistically update the UI
    setCurrentConvo({
      ...currentConvo,
      messages: [...currentConvo.messages, newMessage],
    });

    // Also update in conversations array
    setConversations(
      conversations.map((conv) =>
        conv.attendee.username === reciever
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      )
    );

    setText(""); // Clear input

    const res = await fetch("http://localhost:8000/messages/sendmessage/", {
      method: "POST",
      body: JSON.stringify({
        content: text,
        attendee_username: reciever,
      }),
      credentials: "include",
    });

    const data = await res.json();
  }

  function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  return (
    <div className="flex">
      <ul className="w-1/4 bg-card min-h-screen flex items-center flex-col">
        <li className="w-full h-10"></li>
        {attendeeNames.map((att, index) => {
          return (
            <li
              className="w-full h-15 pl-5 cursor-pointer bg-card border flex items-center border-border"
              key={index}
              onClick={() => handleOnClickConversation(index)}
            >
              {att}
            </li>
          );
        })}
      </ul>
      {currentConvo && (
        <div className="flex flex-col w-3/4 h-screen p-4">
          <div className="flex-1 justify-between overflow-y-auto space-y-2">
            {currentConvo.messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-xs flex justify-between items-center p-2 rounded-lg ${
                  msg.sender_type === "owner"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-card text-foreground"
                }`}
              >
                {msg.content}
                <p className="text-sm text-card-foreground-muted">{formatDateTime(msg.message_date)}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 border rounded px-3 py-2"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
      {!currentConvo && (
        <div className="flex flex-col w-3/4 h-screen p-4 items-center justify-center">
          <h2 className="text-2xl font-semibold">
            Select a conversation to start chatting
          </h2>
        </div>
      )}
    </div>
  );
}
