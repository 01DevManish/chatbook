"use client";

import { useState, useRef, useEffect } from "react";
import {
    Search, Send, Paperclip, Smile, MoreVertical, Phone, Video,
    CheckCheck, Clock, ArrowLeft, Users, Star, Tag, Bot, Filter,
    Image as ImageIcon, Mic, MessageSquare
} from "lucide-react";

interface Message {
    id: number;
    text: string;
    time: string;
    sender: "customer" | "agent";
    status?: "sent" | "delivered" | "read";
}

interface Conversation {
    id: number;
    name: string;
    phone: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    status: "active" | "waiting" | "resolved";
    assignedTo: string;
    tags: string[];
    messages: Message[];
}

const conversations: Conversation[] = [
    {
        id: 1, name: "Rahul Sharma", phone: "+91 98765 43210", avatar: "RS",
        lastMessage: "Thanks for the quick response!", time: "2m",
        unread: 2, status: "active", assignedTo: "You", tags: ["VIP"],
        messages: [
            { id: 1, text: "Hi, I placed an order #4521 yesterday but haven't received any confirmation.", time: "10:30 AM", sender: "customer" },
            { id: 2, text: "Hello Rahul! Let me check your order status right away. 🔍", time: "10:31 AM", sender: "agent", status: "read" },
            { id: 3, text: "Your order #4521 has been confirmed and is being packed. You should receive it by tomorrow!", time: "10:32 AM", sender: "agent", status: "read" },
            { id: 4, text: "That's great! Can I also change the delivery address?", time: "10:35 AM", sender: "customer" },
            { id: 5, text: "Of course! Please share the new address and I'll update it for you.", time: "10:36 AM", sender: "agent", status: "read" },
            { id: 6, text: "123 MG Road, Bangalore - 560001", time: "10:38 AM", sender: "customer" },
            { id: 7, text: "Updated! Your order will be delivered to 123 MG Road, Bangalore. ✅", time: "10:39 AM", sender: "agent", status: "delivered" },
            { id: 8, text: "Thanks for the quick response!", time: "10:40 AM", sender: "customer" },
            { id: 9, text: "Is there anything else you need?", time: "10:41 AM", sender: "customer" },
        ]
    },
    {
        id: 2, name: "Priya Patel", phone: "+91 87654 32109", avatar: "PP",
        lastMessage: "When will my order be delivered?", time: "15m",
        unread: 1, status: "waiting", assignedTo: "Unassigned", tags: ["New"],
        messages: [
            { id: 1, text: "Hello! I ordered a laptop last week. Order #3892", time: "11:00 AM", sender: "customer" },
            { id: 2, text: "When will my order be delivered?", time: "11:01 AM", sender: "customer" },
        ]
    },
    {
        id: 3, name: "Amit Kumar", phone: "+91 76543 21098", avatar: "AK",
        lastMessage: "I'd like to know about premium plans", time: "1h",
        unread: 0, status: "active", assignedTo: "Rahul", tags: ["Premium"],
        messages: [
            { id: 1, text: "Hi! I'm interested in upgrading to a premium plan.", time: "09:15 AM", sender: "customer" },
            { id: 2, text: "Hello Amit! Great to hear that. Let me share the premium plan details with you.", time: "09:20 AM", sender: "agent", status: "read" },
            { id: 3, text: "Our Premium plan includes:\n✅ Unlimited messages\n✅ 10 agents\n✅ Advanced analytics\n✅ Priority support\n\nAll for just ₹4,999/month!", time: "09:21 AM", sender: "agent", status: "read" },
            { id: 4, text: "I'd like to know about premium plans", time: "09:30 AM", sender: "customer" },
        ]
    },
    {
        id: 4, name: "Sneha Gupta", phone: "+91 65432 10987", avatar: "SG",
        lastMessage: "Payment confirmed ✅", time: "2h",
        unread: 0, status: "resolved", assignedTo: "Priya", tags: [],
        messages: [
            { id: 1, text: "I'm having trouble making a payment.", time: "08:00 AM", sender: "customer" },
            { id: 2, text: "Let me help you with that. Which payment method are you using?", time: "08:05 AM", sender: "agent", status: "read" },
            { id: 3, text: "UPI", time: "08:06 AM", sender: "customer" },
            { id: 4, text: "Please try again now. We've resolved the UPI gateway issue.", time: "08:15 AM", sender: "agent", status: "read" },
            { id: 5, text: "Payment confirmed ✅", time: "08:20 AM", sender: "customer" },
        ]
    },
    {
        id: 5, name: "Vikash Singh", phone: "+91 54321 09876", avatar: "VS",
        lastMessage: "Can you help me with returns?", time: "3h",
        unread: 1, status: "waiting", assignedTo: "Unassigned", tags: ["Returns"],
        messages: [
            { id: 1, text: "Hi, I received a damaged product. Order #5123", time: "07:30 AM", sender: "customer" },
            { id: 2, text: "Can you help me with returns?", time: "07:31 AM", sender: "customer" },
        ]
    },
    {
        id: 6, name: "Deepak Joshi", phone: "+91 43210 98765", avatar: "DJ",
        lastMessage: "Sure, I'll share the feedback form", time: "5h",
        unread: 0, status: "resolved", assignedTo: "You", tags: ["VIP", "Premium"],
        messages: [
            { id: 1, text: "Great experience with your service!", time: "05:00 AM", sender: "customer" },
            { id: 2, text: "Thank you so much Deepak! We're glad you had a great experience. Would you like to leave a review?", time: "05:10 AM", sender: "agent", status: "read" },
            { id: 3, text: "Yes, please!", time: "05:12 AM", sender: "customer" },
            { id: 4, text: "Sure, I'll share the feedback form", time: "05:15 AM", sender: "agent", status: "read" },
        ]
    },
];

const statusColors: Record<string, string> = {
    active: "bg-green-500",
    waiting: "bg-amber-500",
    resolved: "bg-slate-300",
};

const tagColors: Record<string, string> = {
    VIP: "bg-amber-50 text-amber-700",
    New: "bg-blue-50 text-blue-700",
    Premium: "bg-purple-50 text-purple-700",
    Returns: "bg-red-50 text-red-700",
};

export default function ChatInboxPage() {
    const [selectedChat, setSelectedChat] = useState<number>(1);
    const [message, setMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [mobileShowChat, setMobileShowChat] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentConvo = conversations.find(c => c.id === selectedChat);

    const filteredConversations = conversations.filter(c =>
        (statusFilter === "all" || c.status === statusFilter) &&
        (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery))
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedChat]);

    const handleSend = () => {
        if (!message.trim()) return;
        setMessage("");
    };

    return (
        <div className="flex h-[calc(100vh-theme(spacing.14)-theme(spacing.8)-theme(spacing.8))] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden -mx-4 lg:-mx-8 -mb-4 lg:-mb-8">
            {/* Conversations List */}
            <div className={`w-full sm:w-[360px] border-r border-slate-100 flex flex-col flex-shrink-0 ${mobileShowChat ? 'hidden sm:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-slate-900">Inbox</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="bg-[#25d366] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                                {conversations.reduce((a, c) => a + c.unread, 0)}
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 focus:border-[#25d366]"
                        />
                    </div>
                    {/* Status Filters */}
                    <div className="flex gap-1.5 mt-3">
                        {["all", "active", "waiting", "resolved"].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors ${statusFilter === s ? 'bg-[#25d366] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map(c => (
                        <div
                            key={c.id}
                            onClick={() => { setSelectedChat(c.id); setMobileShowChat(true); }}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50 ${selectedChat === c.id ? 'bg-[#f0fdf4]' : 'hover:bg-slate-50'
                                }`}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">{c.avatar}</span>
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusColors[c.status]}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-900 truncate">{c.name}</span>
                                    <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">{c.time}</span>
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                    <p className="text-xs text-slate-500 truncate pr-2">{c.lastMessage}</p>
                                    {c.unread > 0 && (
                                        <span className="bg-[#25d366] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                                            {c.unread}
                                        </span>
                                    )}
                                </div>
                                {c.tags.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                        {c.tags.map(tag => (
                                            <span key={tag} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${tagColors[tag] || 'bg-slate-100 text-slate-600'}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col ${!mobileShowChat ? 'hidden sm:flex' : 'flex'}`}>
                {currentConvo ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white">
                            <button
                                onClick={() => setMobileShowChat(false)}
                                className="sm:hidden p-1 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center">
                                <span className="text-white text-sm font-bold">{currentConvo.avatar}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 text-sm">{currentConvo.name}</p>
                                <p className="text-xs text-slate-500">{currentConvo.phone} · {currentConvo.assignedTo}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Voice call">
                                    <Phone className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Video call">
                                    <Video className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="More">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
                            style={{
                                backgroundColor: '#efeae2',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 200 200'%3E%3Cdefs%3E%3Cpattern id='a' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='10' cy='10' r='0.5' fill='%23ccc' fill-opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23a)'/%3E%3C/svg%3E")`,
                            }}
                        >
                            {currentConvo.messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[75%] px-3 py-2 rounded-xl shadow-sm ${msg.sender === "agent"
                                                ? "bg-[#d9fdd3] rounded-tr-none"
                                                : "bg-white rounded-tl-none"
                                            }`}
                                    >
                                        <p className="text-[13px] text-slate-800 whitespace-pre-line leading-relaxed">{msg.text}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <span className="text-[10px] text-slate-500">{msg.time}</span>
                                            {msg.sender === "agent" && msg.status && (
                                                <CheckCheck className={`w-3.5 h-3.5 ${msg.status === "read" ? "text-blue-500" : "text-slate-400"}`} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies */}
                        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto">
                            {["Thanks for reaching out!", "Let me check that for you", "Is there anything else?", "Your order is confirmed ✅"].map((qr, i) => (
                                <button
                                    key={i}
                                    onClick={() => setMessage(qr)}
                                    className="flex-shrink-0 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-[#25d366] hover:text-white hover:border-[#25d366] transition-all"
                                >
                                    {qr}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="px-4 py-3 bg-white border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                                    <Smile className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 focus:border-[#25d366]"
                                />
                                {message.trim() ? (
                                    <button
                                        onClick={handleSend}
                                        className="p-2.5 bg-[#25d366] text-white rounded-full hover:bg-[#1da851] transition-colors shadow-lg shadow-green-500/20"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button className="p-2.5 bg-[#25d366] text-white rounded-full hover:bg-[#1da851] transition-colors shadow-lg shadow-green-500/20">
                                        <Mic className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
                        <p className="text-lg font-medium">Select a conversation</p>
                        <p className="text-sm">Choose a customer chat to start messaging</p>
                    </div>
                )}
            </div>

            {/* Right Panel — Customer Info (Desktop only) */}
            {currentConvo && (
                <div className="hidden xl:flex w-[280px] border-l border-slate-100 flex-col bg-white">
                    <div className="p-5 text-center border-b border-slate-100">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center mx-auto mb-3">
                            <span className="text-white text-xl font-bold">{currentConvo.avatar}</span>
                        </div>
                        <h3 className="font-bold text-slate-900">{currentConvo.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{currentConvo.phone}</p>
                        <div className="flex justify-center gap-2 mt-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${currentConvo.status === 'active' ? 'bg-green-50 text-green-700' :
                                    currentConvo.status === 'waiting' ? 'bg-amber-50 text-amber-700' :
                                        'bg-slate-100 text-slate-600'
                                }`}>
                                {currentConvo.status}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 space-y-4 text-sm overflow-y-auto flex-1">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assigned To</p>
                            <p className="text-slate-900 font-medium">{currentConvo.assignedTo}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tags</p>
                            <div className="flex flex-wrap gap-1.5">
                                {currentConvo.tags.length > 0 ? currentConvo.tags.map(tag => (
                                    <span key={tag} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tagColors[tag] || 'bg-slate-100 text-slate-600'}`}>
                                        {tag}
                                    </span>
                                )) : <span className="text-slate-400 text-xs">No tags</span>}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Actions</p>
                            <div className="space-y-1.5">
                                <button className="w-full text-left px-3 py-2 bg-slate-50 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2">
                                    <Star className="w-3.5 h-3.5 text-amber-500" /> Mark as VIP
                                </button>
                                <button className="w-full text-left px-3 py-2 bg-slate-50 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5 text-blue-500" /> Assign Agent
                                </button>
                                <button className="w-full text-left px-3 py-2 bg-slate-50 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2">
                                    <Bot className="w-3.5 h-3.5 text-purple-500" /> Enable Bot
                                </button>
                                <button className="w-full text-left px-3 py-2 bg-green-50 rounded-lg text-xs font-medium text-green-700 hover:bg-green-100 transition-colors flex items-center gap-2">
                                    <CheckCheck className="w-3.5 h-3.5" /> Mark Resolved
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
