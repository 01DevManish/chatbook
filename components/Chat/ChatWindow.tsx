"use client";

import { useEffect, useState, useRef } from "react";
import { ref, onValue, push, set, update } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import MessageBubble from "./MessageBubble";
import { Image as ImageIcon, Send, ArrowLeft, X, Reply, Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

interface UserData {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    username?: string;
    lastSeen?: number;
}

interface ChatWindowProps {
    selectedUser: UserData;
    onBack: () => void;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    image?: string | null;
    timestamp: number;
    read: boolean;
    replyTo?: {
        id: string;
        text: string;
        senderId: string;
    } | null;
}

export default function ChatWindow({ selectedUser, onBack }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    const chatId =
        user && selectedUser
            ? [user.uid, selectedUser.uid].sort().join("_")
            : null;

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!chatId || !user) return;

        const messagesRef = ref(rtdb, `chats/${chatId}/messages`);

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const msgs: Message[] = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach((key) => {
                    msgs.push({ id: key, ...data[key] });
                });
                // Sort by timestamp
                msgs.sort((a, b) => a.timestamp - b.timestamp);

                // Mark unread messages as read
                msgs.forEach((msg) => {
                    if (msg.receiverId === user.uid && !msg.read) {
                        update(ref(rtdb, `chats/${chatId}/messages/${msg.id}`), { read: true });
                    }
                });
            }
            setMessages(msgs);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [chatId, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleReply = (message: Message) => {
        setReplyingTo(message);
        inputRef.current?.focus();
    };

    const cancelReply = () => {
        setReplyingTo(null);
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage((prev) => prev + emojiData.emoji);
        inputRef.current?.focus();
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker((prev) => !prev);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                const img = new window.Image();
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
        setShowEmojiPicker(false);

        try {
            // Update chat metadata
            await set(ref(rtdb, `chats/${chatId}/metadata`), {
                participants: [user.uid, selectedUser.uid],
                lastMessage: newMessage || "Image",
                lastMessageTimestamp: Date.now(),
            });

            // Build message object
            const messageData: any = {
                senderId: user.uid,
                receiverId: selectedUser.uid,
                text: newMessage,
                image: image || null,
                timestamp: Date.now(),
                read: false,
            };

            // Add reply data if replying
            if (replyingTo) {
                messageData.replyTo = {
                    id: replyingTo.id,
                    text: replyingTo.text || (replyingTo.image ? "📷 Image" : ""),
                    senderId: replyingTo.senderId,
                };
            }

            // Add message
            const messagesRef = ref(rtdb, `chats/${chatId}/messages`);
            await push(messagesRef, messageData);

            setNewMessage("");
            setImage(null);
            setReplyingTo(null);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const getReplyPreviewName = (senderId: string) => {
        if (senderId === user?.uid) return "You";
        return selectedUser.displayName || "User";
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
                            Last seen {new Date(selectedUser.lastSeen).toLocaleTimeString()}
                        </p>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        onReply={handleReply}
                        getReplyName={getReplyPreviewName}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyingTo && (
                <div className="bg-gray-100 border-l-4 border-green-500 px-4 py-2 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                            <Reply size={14} />
                            Replying to {getReplyPreviewName(replyingTo.senderId)}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                            {replyingTo.text || (replyingTo.image ? "📷 Image" : "")}
                        </p>
                    </div>
                    <button onClick={cancelReply} className="text-gray-500 hover:text-gray-700 p-1">
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute bottom-20 left-4 z-50">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme={Theme.LIGHT}
                        width={320}
                        height={400}
                        searchPlaceholder="Search emoji..."
                        previewConfig={{ showPreview: false }}
                    />
                </div>
            )}

            {/* Input */}
            <div className="bg-gray-50 p-3 relative">
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

                    {/* Emoji Button */}
                    <button
                        type="button"
                        onClick={toggleEmojiPicker}
                        className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'bg-green-100 text-green-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                        title="Emoji"
                    >
                        <Smile size={24} />
                    </button>

                    {/* Image Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                        title="Attach Image"
                    >
                        <ImageIcon size={24} />
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={replyingTo ? "Type your reply..." : "Type a message"}
                        className="flex-1 rounded-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                    <button
                        type="submit"
                        disabled={sending || (!newMessage && !image)}
                        className="rounded-full bg-green-600 p-2 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
