import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

export default function AttendeeChat() {
  const [conversations, setConversations] = useState([]);
  const [currentConvo, setCurrentConvo] = useState(null);
  const [text, setText] = useState("");
  const [totalUnread, setTotalUnread] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function getMessages() {
      try {
        const res = await fetch(
          "http://localhost:8000/messages/getattendeemessages",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (isMounted) {
          setConversations(data["conversations"]);
          setTotalUnread(data["total_unread"] || 0);
          // Add any new messages to the current Convo's messages if available
          if (currentConvo) {
            const updatedConvo = data["conversations"].find(
              (conv) =>
                conv.organizer.username === currentConvo.organizer.username
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
  }, [currentConvo]);

  async function handleOnClickConversation(index) {
    const selectedConvo = conversations[index];
    setCurrentConvo(selectedConvo);

    // Mark messages as read
    if (selectedConvo.unread_count > 0) {
      try {
        await fetch("http://localhost:8000/messages/markmessagesasread/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            other_user_username: selectedConvo.organizer.username,
          }),
          credentials: "include",
        });

        // Update local state to reflect read messages
        setConversations(
          conversations.map((conv, i) =>
            i === index ? { ...conv, unread_count: 0 } : conv
          )
        );
        setTotalUnread(Math.max(0, totalUnread - selectedConvo.unread_count));
      } catch (error) {
        console.error("Failed to mark messages as read:", error);
      }
    }
  }

  async function sendMessage() {
    if (!text.trim()) return;

    const receiver = currentConvo.organizer.username;

    // Create the new message object
    const newMessage = {
      content: text,
      sender_type: "attendee",
      message_date: new Date().toISOString(),
      is_read: false,
    };

    // Optimistically update the UI
    setCurrentConvo({
      ...currentConvo,
      messages: [...currentConvo.messages, newMessage],
    });

    // Also update in conversations array
    setConversations(
      conversations.map((conv) =>
        conv.organizer.username === receiver
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      )
    );

    const messageText = text; // Save before clearing
    setText(""); // Clear input

    try {
      const res = await fetch("http://localhost:8000/messages/sendmessage/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageText,
          organizer_username: receiver,
        }),
        credentials: "include",
      });

      const data = await res.json();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  async function handleDeleteConversation() {
    if (!currentConvo) return;

    try {
      const res = await fetch(
        "http://localhost:8000/messages/deleteconversation/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organizer_username: currentConvo.organizer.username,
          }),
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        // Remove conversation from list
        setConversations(
          conversations.filter(
            (conv) =>
              conv.organizer.username !== currentConvo.organizer.username
          )
        );
        setCurrentConvo(null);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
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
    <div className="flex h-screen">
      <div className="w-1/4 bg-card flex flex-col border-r border-border">
        {/* Title Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-border bg-card">
          <h2 className="font-semibold text-lg">Followed Organizers</h2>
          {totalUnread > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 min-w-6 flex items-center justify-center px-2">
              {totalUnread}
            </span>
          )}
        </div>

        {/* Conversations List */}
        <ul className="flex-1 overflow-y-auto">
          {conversations.map((conv, index) => (
            <li
              className={`w-full px-5 py-3 cursor-pointer border-b border-border hover:bg-accent transition-colors relative ${
                currentConvo?.organizer.username === conv.organizer.username
                  ? "bg-accent"
                  : ""
              }`}
              key={index}
              onClick={() => handleOnClickConversation(index)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{conv.organizer.name}</span>
                {conv.unread_count > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                    {conv.unread_count}
                  </span>
                )}
              </div>
              {conv.last_message_date && (
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(conv.last_message_date)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {currentConvo && (
        <div className="flex flex-col w-3/4 h-full">
          {/* Chat Header with Resolve Button */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-border bg-card">
            <h3 className="font-semibold text-lg">
              {currentConvo.organizer.name}
            </h3>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-md transition-colors border border-green-200 dark:border-green-800"
            >
              <Trash2 className="h-4 w-4" />
              Mark as Resolved
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {currentConvo.messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-xs flex flex-col gap-1 p-3 rounded-lg ${
                  msg.sender_type === "attendee"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-card text-foreground border border-border"
                }`}
              >
                <p>{msg.content}</p>
                <p className="text-xs opacity-70 text-right">
                  {formatDateTime(msg.message_date)}
                </p>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <input
                className="flex-1 border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {!currentConvo && (
        <div className="flex flex-col w-3/4 h-full items-center justify-center bg-muted/20">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Select a conversation to start chatting
          </h2>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">Mark as Resolved?</h3>
            <p className="text-muted-foreground mb-6">
              This will delete all messages with{" "}
              <span className="font-medium text-foreground">
                {currentConvo?.organizer.name}
              </span>
              . This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}