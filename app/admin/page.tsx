"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ref, onValue, get } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import AdminChatWindow from "@/components/Admin/AdminChatWindow";
import { Lock, User } from "lucide-react";

interface UserData {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
}

interface ChatSession {
    id: string; // uid1_uid2
    participants: [string, string];
    lastMessageTime?: number;
}

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [allUsers, setAllUsers] = useState<Record<string, UserData>>({});
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(true); // Open for now as requested

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
        // Ideally checking for specific email here:
        // if (user?.email !== "admin@chatbook.com") setIsAuthorized(false);
    }, [user, loading, router]);

    // Fetch All Users
    useEffect(() => {
        const usersRef = ref(rtdb, "users");
        onValue(usersRef, (snap) => {
            if (snap.exists()) {
                setAllUsers(snap.val());
            }
        });
    }, []);

    // Fetch All Chats
    useEffect(() => {
        const chatsRef = ref(rtdb, "chats");
        onValue(chatsRef, (snap) => {
            if (snap.exists()) {
                const data = snap.val();
                const sessionList: ChatSession[] = Object.keys(data).map(key => {
                    const parts = key.split("_"); // Assumes keys are like uid1_uid2
                    if (parts.length === 2) {
                        return {
                            id: key,
                            participants: [parts[0], parts[1]],
                            lastMessageTime: data[key].lastMessage?.timestamp || 0
                        };
                    }
                    return null;
                }).filter(x => x !== null) as ChatSession[];

                // Sort by recent
                sessionList.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
                setChats(sessionList);
            }
        });
    }, []);

    if (loading) return <div className="text-white p-10">Loading...</div>;

    if (!isAuthorized) {
        return (
            <div className="h-screen flex items-center justify-center bg-black text-red-500">
                <Lock size={48} className="mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#111b21] text-white">
            {/* Sidebar: All Chats */}
            <div className="w-1/3 border-r border-[#2a3942] flex flex-col">
                <div className="p-4 bg-[#202c33] font-bold text-lg flex items-center gap-2">
                    <Lock size={20} className="text-yellow-500" />
                    Admin Panel
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => {
                        const user1 = allUsers[chat.participants[0]];
                        const user2 = allUsers[chat.participants[1]];
                        const label1 = user1?.displayName || chat.participants[0].slice(0, 5);
                        const label2 = user2?.displayName || chat.participants[1].slice(0, 5);

                        return (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedChat(chat.id)}
                                className={`p-4 border-b border-[#2a3942] cursor-pointer hover:bg-[#202c33] transition-colors ${selectedChat === chat.id ? 'bg-[#2a3942]' : ''}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="font-semibold text-sm text-blue-300">{label1}</div>
                                    <span className="text-xs text-gray-500">↔</span>
                                    <div className="font-semibold text-sm text-green-300">{label2}</div>
                                </div>
                                <div className="text-xs text-gray-500 font-mono">
                                    ID: {chat.id}
                                </div>
                            </div>
                        );
                    })}
                    {chats.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No active chats found.</div>
                    )}
                </div>
            </div>

            {/* Main Area: Chat Content */}
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <AdminChatWindow
                        chatId={selectedChat}
                        user1={{
                            uid: selectedChat.split('_')[0],
                            name: allUsers[selectedChat.split('_')[0]]?.displayName || "User 1"
                        }}
                        user2={{
                            uid: selectedChat.split('_')[1],
                            name: allUsers[selectedChat.split('_')[1]]?.displayName || "User 2"
                        }}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 flex-col">
                        <User size={64} className="mb-4 opacity-50" />
                        <p>Select a conversation to inspect.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
