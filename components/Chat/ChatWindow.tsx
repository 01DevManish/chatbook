"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ref, onValue, push, set, update, remove } from "firebase/database";
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
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Listen for messages
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
                msgs.sort((a, b) => a.timestamp - b.timestamp);

                msgs.forEach((msg) => {
                    if (msg.receiverId === user.uid && !msg.read) {
                        update(ref(rtdb, `chats/${chatId}/messages/${msg.id}`), { read: true });
                    }
                });
            }
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [chatId, user]);

    // Listen for typing status
    useEffect(() => {
        if (!chatId || !user) return;

        const typingRef = ref(rtdb, `chats/${chatId}/typing/${selectedUser.uid}`);

        const unsubscribe = onValue(typingRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                // Check if typing timestamp is recent (within 5 seconds)
                if (data.timestamp && Date.now() - data.timestamp < 5000) {
                    setIsOtherTyping(true);
                } else {
                    setIsOtherTyping(false);
                }
            } else {
                setIsOtherTyping(false);
            }
        });

        return () => unsubscribe();
    }, [chatId, selectedUser.uid, user]);

    // Clean up typing status when leaving
    useEffect(() => {
        return () => {
            if (chatId && user) {
                remove(ref(rtdb, `chats/${chatId}/typing/${user.uid}`));
            }
        };
    }, [chatId, user]);

    const scrollToBottom = () => {
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({
                    behavior: "auto",
                    block: "end"
                });
            }
        }, 100);
    };

    const scrollToMessage = (messageId: string) => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            // Optional: Highlight effect
            element.classList.add("bg-[#2a3942]");
            setTimeout(() => {
                element.classList.remove("bg-[#2a3942]");
            }, 1000);
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle mobile keyboard open/resize
    useEffect(() => {
        if (window.visualViewport) {
            const handleResize = () => {
                scrollToBottom();
            };
            window.visualViewport.addEventListener('resize', handleResize);
            return () => window.visualViewport?.removeEventListener('resize', handleResize);
        }
    }, []);

    // Update typing status
    const updateTypingStatus = useCallback((isTyping: boolean) => {
        if (!chatId || !user) return;

        const typingRef = ref(rtdb, `chats/${chatId}/typing/${user.uid}`);

        if (isTyping) {
            set(typingRef, {
                isTyping: true,
                timestamp: Date.now(),
            });
        } else {
            remove(typingRef);
        }
    }, [chatId, user]);

    // Handle input change with typing indicator
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        // Update typing status
        updateTypingStatus(true);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to clear typing status after 2 seconds of no typing
        typingTimeoutRef.current = setTimeout(() => {
            updateTypingStatus(false);
        }, 2000);
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
        updateTypingStatus(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            updateTypingStatus(false);
        }, 2000);
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

                    const MAX_WIDTH = 800;
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

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
        updateTypingStatus(false);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        try {
            await set(ref(rtdb, `chats/${chatId}/metadata`), {
                participants: [user.uid, selectedUser.uid],
                lastMessage: newMessage || "Image",
                lastMessageTimestamp: Date.now(),
            });

            const messageData: any = {
                senderId: user.uid,
                receiverId: selectedUser.uid,
                text: newMessage,
                image: image || null,
                timestamp: Date.now(),
                read: false,
            };

            if (replyingTo) {
                messageData.replyTo = {
                    id: replyingTo.id,
                    text: replyingTo.text || (replyingTo.image ? "📷 Image" : ""),
                    senderId: replyingTo.senderId,
                };
            }

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
        <div className="flex flex-col h-full bg-[#0b141a] overflow-hidden">
            {/* Header - WhatsApp Style - Fixed */}
            <div className="flex-shrink-0 flex items-center space-x-3 bg-[#202c33] px-4 py-2.5 z-10">
                <button onClick={onBack} className="sm:hidden text-[#aebac1] p-1 -ml-2 active:bg-[#374248] rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6b7c85] overflow-hidden flex-shrink-0">
                    {selectedUser.photoURL ? (
                        <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="h-full w-full object-cover" />
                    ) : (
                        <span className="font-medium text-[#cfd8dc] text-lg">{selectedUser.displayName?.[0]?.toUpperCase()}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#e9edef] truncate">{selectedUser.displayName}</h3>
                    {isOtherTyping ? (
                        <p className="text-xs text-[#25d366] font-medium">
                            typing...
                        </p>
                    ) : selectedUser.lastSeen ? (
                        <p className="text-xs text-[#8696a0]">
                            last seen {new Date(selectedUser.lastSeen).toLocaleTimeString()}
                        </p>
                    ) : (
                        <p className="text-xs text-[#8696a0]">online</p>
                    )}
                </div>
            </div>

            {/* Messages - WhatsApp Dark Pattern - Scrollable */}
            <div
                className="flex-1 overflow-y-auto overscroll-contain px-3 py-2 sm:px-6 lg:px-12"
                style={{
                    backgroundColor: '#0b141a',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            >
                <div className="flex flex-col justify-end min-h-full">
                    <div className="space-y-1">
                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                onReply={handleReply}
                                getReplyName={getReplyPreviewName}
                                onReplyClick={scrollToMessage}
                            />
                        ))}
                    </div>
                    <div ref={messagesEndRef} className="h-2" />
                </div>
            </div>

            {/* Reply Preview - WhatsApp Style */}
            {replyingTo && (
                <div className="bg-[#1f2c33] border-l-4 border-[#25d366] px-4 py-2 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm text-[#25d366] font-medium">
                            <Reply size={14} />
                            Replying to {getReplyPreviewName(replyingTo.senderId)}
                        </div>
                        <p className="text-sm text-[#8696a0] truncate">
                            {replyingTo.text || (replyingTo.image ? "📷 Image" : "")}
                        </p>
                    </div>
                    <button onClick={cancelReply} className="text-[#8696a0] hover:text-[#e9edef] p-1">
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Emoji Picker - Dark Theme */}
            {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute bottom-20 left-4 z-50">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme={Theme.DARK}
                        width={320}
                        height={350}
                        searchPlaceholder="Search emoji..."
                        previewConfig={{ showPreview: false }}
                    />
                </div>
            )}

            {/* Input - WhatsApp Style - Fixed at Bottom */}
            <div className="flex-shrink-0 bg-[#202c33] px-3 py-2 sm:px-4 sm:py-3 relative safe-area-bottom">
                {image && (
                    <div className="mb-3 relative inline-block">
                        <img src={image} alt="Preview" className="h-20 rounded-lg border border-[#2a3942]" />
                        <button
                            onClick={() => setImage(null)}
                            className="absolute -top-2 -right-2 bg-[#ea4335] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                        >
                            ✕
                        </button>
                    </div>
                )}
                <form onSubmit={handleSend} className="flex items-center gap-2">
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
                        className={`p-2 rounded-full transition-colors flex-shrink-0 ${showEmojiPicker ? 'text-[#25d366]' : 'text-[#8696a0] hover:text-[#e9edef]'}`}
                        title="Emoji"
                    >
                        <Smile size={24} />
                    </button>

                    {/* Image Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[#8696a0] hover:text-[#e9edef] p-2 rounded-full transition-colors flex-shrink-0"
                        title="Attach Image"
                    >
                        <ImageIcon size={24} />
                    </button>

                    {/* Input Field */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder={replyingTo ? "Type your reply..." : "Type a message"}
                        className="flex-1 min-w-0 rounded-lg bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] px-4 py-2.5 text-sm focus:outline-none"
                    />

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={sending || (!newMessage && !image)}
                        className="rounded-full bg-[#00a884] p-2.5 text-[#111b21] hover:bg-[#06cf9c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
