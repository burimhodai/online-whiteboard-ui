"use client";

import { useRef, useEffect } from "react";
import { MessageCircle, X, Send, MessageSquare } from "lucide-react";

export default function Chat({
  messages,
  chatInput,
  setChatInput,
  onSendMessage,
  currentUserId,
  setIsChatFocused,
  showChat,
  setShowChat,
  showLogin,
}) {
  const chatContainerRef = useRef(null);
  const chatInputRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (showLogin) return null;

  if (!showChat) {
    return (
      <button
        onClick={() => setShowChat(true)}
        className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-30"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-30 border border-gray-200">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Chat Room
        </h3>
        <button
          onClick={() => setShowChat(false)}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        ref={chatContainerRef}
        className="h-64 overflow-y-auto p-3 space-y-3 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.userId === currentUserId ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-[80%] shadow-sm ${
                  msg.userId === currentUserId
                    ? "bg-blue-500 text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                }`}
              >
                {msg.userId !== currentUserId && (
                  <div className="font-semibold text-xs mb-1 text-blue-600">
                    {msg.username}
                  </div>
                )}
                <p className="break-words">{msg.text}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1 px-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={onSendMessage}
        className="border-t border-gray-200 p-3 bg-white"
      >
        <div className="flex gap-2">
          <input
            ref={chatInputRef}
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onFocus={() => setIsChatFocused(true)}
            onBlur={() => setIsChatFocused(false)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Press Enter to send • {chatInput.length}/500 characters
        </div>
      </form>
    </div>
  );
}
