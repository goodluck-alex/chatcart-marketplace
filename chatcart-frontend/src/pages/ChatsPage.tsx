import { useState } from "react";
import { Search, ArrowLeft, Send, Phone, Video, MoreVertical } from "lucide-react";


interface Props {
  onNavigate?: (page: string) => void;
}

const mockChats = [
  {
    id: "c1",
    sellerName: "Trendify Store",
    listingTitle: "MacBook Pro M2 2022",
    lastMessage: "Thank you for your interest! This MacBook is available. Would you like to confirm?",
    time: "10:31 AM",
    unread: 2,
    online: true,
    listingId: "1",
    messages: [
      { from: "me", text: "Hello Trendify Store 👋\nI'm interested in:\n\nMacBook Pro M2 2022\nPrice: UGX 2,500,000\nPlease provide more details.", time: "10:30 AM" },
      { from: "them", text: "Hello Alex 👋\nThank you for your interest!\nThis MacBook is available.\nWould you like to:\n1. Ask a question\n2. Confirm order", time: "10:31 AM" },
      { from: "me", text: "Does it come with the original box and charger?", time: "10:33 AM" },
      { from: "them", text: "Yes! It comes with:\n✅ Original box\n✅ Charger\n✅ Warranty card\n\nShall I arrange delivery to your location?", time: "10:35 AM" },
    ]
  },
  {
    id: "c2",
    sellerName: "AutoDeals Uganda",
    listingTitle: "Toyota Premio 2018",
    lastMessage: "You can come for a test drive anytime from 9AM - 5PM",
    time: "Yesterday",
    unread: 0,
    online: false,
    listingId: "3",
    messages: [
      { from: "me", text: "Hi, I'm interested in the Toyota Premio 2018. Is it still available?", time: "Yesterday" },
      { from: "them", text: "Yes it's available! Clean car, all documents ready.", time: "Yesterday" },
      { from: "me", text: "Can I arrange a test drive?", time: "Yesterday" },
      { from: "them", text: "You can come for a test drive anytime from 9AM - 5PM", time: "Yesterday" },
    ]
  },
  {
    id: "c3",
    sellerName: "Prime Homes Uganda",
    listingTitle: "2 Bedroom Apartment – Kiwatule",
    lastMessage: "We have a viewing slot on Saturday 10AM",
    time: "Mon",
    unread: 1,
    online: true,
    listingId: "2",
    messages: [
      { from: "me", text: "Hello, I'm interested in the 2BR apartment in Kiwatule. Is water included?", time: "Mon" },
      { from: "them", text: "Yes, water and security are included in the rent price.", time: "Mon" },
      { from: "me", text: "Can I schedule a viewing?", time: "Mon" },
      { from: "them", text: "We have a viewing slot on Saturday 10AM", time: "Mon" },
    ]
  },
];

export default function ChatsPage({ onNavigate: _onNavigate }: Props) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState(mockChats);

  const activeChat = chats.find(c => c.id === selectedChat);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    setChats(prev => prev.map(c => {
      if (c.id === selectedChat) {
        return {
          ...c,
          messages: [...c.messages, { from: "me" as const, text: newMessage, time: "Now" }],
          lastMessage: newMessage,
          time: "Now",
        };
      }
      return c;
    }));
    setNewMessage("");
  };

  const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0);

  if (selectedChat && activeChat) {
    return (
      <div className="flex flex-col h-screen md:h-[calc(100vh-4rem)] max-w-2xl mx-auto bg-white">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white shadow-sm">
          <button onClick={() => setSelectedChat(null)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
            {activeChat.sellerName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">{activeChat.sellerName}</p>
            <p className="text-xs text-gray-500 truncate">{activeChat.listingTitle}</p>
            <p className={`text-xs font-medium ${activeChat.online ? "text-green-500" : "text-gray-400"}`}>
              {activeChat.online ? "● Online" : "Last seen recently"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Phone className="w-4 h-4 text-gray-600" />
            </button>
            <button className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Video className="w-4 h-4 text-gray-600" />
            </button>
            <button className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Listing Context Card */}
        <div className="mx-4 mt-3 bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center text-lg shrink-0">🛒</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">{activeChat.listingTitle}</p>
            <p className="text-xs text-purple-600 font-semibold">View listing →</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]">
          {activeChat.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm text-sm whitespace-pre-wrap ${
                  msg.from === "me"
                    ? "bg-[#dcf8c6] text-gray-800 rounded-tr-sm"
                    : "bg-white text-gray-800 rounded-tl-sm"
                }`}
              >
                {msg.text}
                <div className={`text-[10px] mt-1 ${msg.from === "me" ? "text-gray-500 text-right" : "text-gray-400"}`}>
                  {msg.time} {msg.from === "me" && "✓✓"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-white flex items-center gap-2 pb-20 md:pb-4">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center hover:bg-[#1da851] transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 md:pb-8">
      <div className="py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Chats</h1>
          <p className="text-sm text-gray-500">{totalUnread > 0 ? `${totalUnread} unread messages` : "All caught up!"}</p>
        </div>
        {totalUnread > 0 && (
          <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{totalUnread} new</span>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Chat List */}
      <div className="space-y-2">
        {chats.map(chat => (
          <button
            key={chat.id}
            onClick={() => setSelectedChat(chat.id)}
            className="w-full flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all text-left"
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {chat.sellerName[0]}
              </div>
              {chat.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-sm">{chat.sellerName}</span>
                <span className="text-xs text-gray-400">{chat.time}</span>
              </div>
              <p className="text-xs text-purple-600 font-medium mb-0.5 truncate">{chat.listingTitle}</p>
              <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
            {chat.unread > 0 && (
              <div className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                {chat.unread}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Empty state info */}
      <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 text-center border border-purple-100">
        <div className="text-3xl mb-2">💬</div>
        <p className="font-bold text-gray-800 text-sm mb-1">Chats sync from WhatsApp</p>
        <p className="text-xs text-gray-500">When buyers contact you via "Buy on WhatsApp", conversations appear here automatically.</p>
      </div>
    </div>
  );
}
