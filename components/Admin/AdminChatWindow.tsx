"use client";

import { useEffect, useState, useRef } from "react";
import { ref, onValue, get } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import ImageModal from "@/components/UI/ImageModal";

interface Message {
    id: string;
    senderId: string;
    text?: string;
    image?: string;
    timestamp: number;
}

interface AdminChatWindowProps {
    chatId: string;
    user1: { uid: string, name: string };
    user2: { uid: string, name: string };
}

export default function AdminChatWindow({ chatId, user1, user2 }: AdminChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chatId) return;

        const messagesRef = ref(rtdb, `chats/${chatId}/messages`);
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const loadedMessages = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => a.timestamp - b.timestamp);
                setMessages(loadedMessages);
            } else {
                setMessages([]);
            }
        });

        return () => unsubscribe();
    }, [chatId]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const getSenderName = (uid: string) => {
        if (uid === user1.uid) return user1.name;
        if (uid === user2.uid) return user2.name;
        return "Unknown";
    };

    return (
        <div className="flex flex-col h-full bg-[#0b141a]">
            {/* Header */}
            <div className="px-4 py-3 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between">
                <div>
                    <h3 className="text-[#e9edef] font-medium">Monitoring Chat</h3>
                    <p className="text-xs text-[#8696a0]">
                        Between <span className="text-blue-400">{user1.name}</span> and <span className="text-green-400">{user2.name}</span>
                    </p>
                </div>
                <div className="bg-red-900/30 border border-red-500/50 rounded px-2 py-1">
                    <span className="text-red-400 text-xs font-bold uppercase tracking-wider">ReadOnly</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b141a]">
                {messages.map((msg) => {
                    const isUser1 = msg.senderId === user1.uid;
                    return (
                        <div key={msg.id} className={cn("flex flex-col mb-4", isUser1 ? "items-start" : "items-end")}>
                            <div className={cn(
                                "max-w-[70%] rounded-lg px-3 py-1.5 text-sm shadow-md",
                                isUser1 ? "bg-[#202c33] rounded-tl-none" : "bg-[#005c4b] rounded-tr-none"
                            )}>
                                <div className="text-[10px] opacity-70 mb-0.5 text-blue-200">
                                    {getSenderName(msg.senderId)}
                                </div>

                                {msg.image && (
                                    <img
                                        src={msg.image}
                                        alt="Image"
                                        className="rounded-lg max-h-60 max-w-full object-cover mt-1 mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setViewingImage(msg.image || null)}
                                    />
                                )}

                                {msg.text && (
                                    <p className="text-[#e9edef] whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                )}

                                <div className="text-[10px] text-[#8696a0] text-right mt-1 select-none">
                                    {format(msg.timestamp, "h:mm a")}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <ImageModal
                src={viewingImage}
                onClose={() => setViewingImage(null)}
            />
        </div>
    );
}
