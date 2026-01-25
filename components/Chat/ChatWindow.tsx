"use client";

import { useEffect, useState, useRef } from "react";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    DocumentData,
    doc,
    setDoc,
    updateDoc,
    getDocs,
    writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import MessageBubble from "./MessageBubble";
import { Image as ImageIcon, Send, ArrowLeft } from "lucide-react";

interface ChatWindowProps {
    selectedUser: DocumentData;
    onBack: () => void;
}

export default function ChatWindow({ selectedUser, onBack }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<DocumentData[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const chatId =
        user && selectedUser
            ? [user.uid, selectedUser.uid].sort().join("_")
            : null;

    useEffect(() => {
        if (!chatId) return;

        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: DocumentData[] = [];
            snapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() });
            });
            setMessages(msgs);
            scrollToBottom();

            // Mark unread messages as read
            const unreadBatch = writeBatch(db);
            let hasUnread = false;
            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                if (data.receiverId === user?.uid && !data.read) {
                    unreadBatch.update(doc.ref, { read: true });
                    hasUnread = true;
                }
            });
            if (hasUnread) unreadBatch.commit();
        });

        return () => unsubscribe();
    }, [chatId, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    // Resize if too large (max 800px width)
                    const MAX_WIDTH = 800;
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                    setImage(dataUrl);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !image) || !user || !chatId) return;

        setSending(true);
        try {
            // Ensure chat document exists
            await setDoc(
                doc(db, "chats", chatId),
                {
                    participants: [user.uid, selectedUser.uid],
                    lastMessage: newMessage || "Image",
                    lastMessageTimestamp: serverTimestamp(),
                },
                { merge: true }
            );

            // Add message
            await addDoc(collection(db, "chats", chatId, "messages"), {
                senderId: user.uid,
                receiverId: selectedUser.uid,
                text: newMessage,
                image: image,
                timestamp: serverTimestamp(),
                read: false,
            });

            setNewMessage("");
            setImage(null);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-full flex-col bg-[#e5ded8]">
            {/* Header */}
            <div className="flex items-center space-x-3 bg-gray-50 p-3 border-b shadow-sm z-10">
                <button onClick={onBack} className="md:hidden text-gray-600">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-600 overflow-hidden">
                    {selectedUser.photoURL ? (
                        <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="h-full w-full object-cover" />
                    ) : (
                        <span className="font-bold">{selectedUser.displayName?.[0]?.toUpperCase()}</span>
                    )}
                </div>
                <div>
                    <h3 className="font-medium text-gray-900">{selectedUser.displayName}</h3>
                    {selectedUser.lastSeen && (
                        <p className="text-xs text-gray-500">
                            Last seen {selectedUser.lastSeen?.toDate ? new Date(selectedUser.lastSeen.toDate()).toLocaleTimeString() : ""}
                        </p>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-gray-50 p-3">
                {image && (
                    <div className="mb-2 relative inline-block">
                        <img src={image} alt="Preview" className="h-20 rounded-md border" />
                        <button
                            onClick={() => setImage(null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                        >
                            X
                        </button>
                    </div>
                )}
                <form onSubmit={handleSend} className="flex items-center space-x-2">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-500 hover:text-gray-700 p-2"
                    >
                        <ImageIcon size={24} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message"
                        className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={sending || (!newMessage && !image)}
                        className="rounded-full bg-green-600 p-2 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
