"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ref, onValue, push, set, update, remove, query, limitToLast } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useCall } from "@/context/CallContext";
import MessageBubble from "./MessageBubble";
import { Image as ImageIcon, Send, ArrowLeft, X, Reply, Smile, MoreVertical, Video, Phone } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import PinModal from "@/components/UI/PinModal";
import MediaGallery from "./MediaGallery";
import ImageModal from "@/components/UI/ImageModal";
import WallpaperModal from "./WallpaperModal";
import { uploadToCloudinary } from "@/lib/cloudinary";

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
    const { startCall } = useCall();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [chatSettings, setChatSettings] = useState<{ lastClearedTimestamp?: number } | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [showMediaGallery, setShowMediaGallery] = useState(false);
    const [showWallpaperModal, setShowWallpaperModal] = useState(false);
    const [wallpaper, setWallpaper] = useState<string>("");
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [messageLimit, setMessageLimit] = useState(50);
    const [loadingMore, setLoadingMore] = useState(false);
    const scrollPosRef = useRef<number>(0);
    const scrollHeightRef = useRef<number>(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const chatId =
        user && selectedUser
            ? [user.uid, selectedUser.uid].sort().join("_")
            : null;

    // Close menu/picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Listen for messages
    useEffect(() => {
        if (!chatId || !user) return;

        const messagesRef = query(ref(rtdb, `chats/${chatId}/messages`), limitToLast(messageLimit));

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const msgs: Message[] = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach((key) => {
                    msgs.push({ id: key, ...data[key] });
                });
                msgs.sort((a, b) => a.timestamp - b.timestamp);

                // Mark my unread messages as read
                msgs.forEach((msg) => {
                    if (msg.receiverId === user.uid && !msg.read) {
                        update(ref(rtdb, `chats/${chatId}/messages/${msg.id}`), { read: true });
                    }
                });
            }
            setMessages(msgs);
            setLoadingMore(false);
        });

        return () => unsubscribe();
    }, [chatId, user, messageLimit]);

    // Maintain scroll position when loading more
    useEffect(() => {
        if (!loadingMore) {
            // Standard behavior: scroll to bottom if we are near bottom or it's initial load
            // For simplicity in this iteration, we trigger scroll bottom on new messages if NOT loading history
            // But wait, "messages" dependency triggers this.
            // If we just loaded history, we DO NOT want to scroll to bottom.
            return;
        }

        // If we were loading more, restore position
        const container = document.getElementById("messages-container");
        if (container && scrollHeightRef.current) {
            const newScrollHeight = container.scrollHeight;
            const diff = newScrollHeight - scrollHeightRef.current;
            container.scrollTop = diff; // Jump to previous visual position
        }
    }, [messages]); // This runs AFTER render

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight } = e.currentTarget;

        // Detect scroll to top (with small buffer)
        if (scrollTop < 50 && !loadingMore && messages.length >= messageLimit) {
            setLoadingMore(true);
            scrollHeightRef.current = scrollHeight;
            setMessageLimit(prev => prev + 50);
        }
    };
    // Listen for chat settings (last cleared)
    useEffect(() => {
        if (!chatId || !user) return;
        const settingsRef = ref(rtdb, `users/${user.uid}/chatSettings/${chatId}`);
        const unsubscribe = onValue(settingsRef, (snapshot) => {
            setChatSettings(snapshot.val());
        });
        return () => unsubscribe();
    }, [chatId, user]);

    // Fetch Wallpaper Preference
    useEffect(() => {
        if (!user) return;
        const wallpaperRef = ref(rtdb, `users/${user.uid}/settings/wallpaper`);
        const unsubscribe = onValue(wallpaperRef, (snapshot) => {
            if (snapshot.exists()) {
                setWallpaper(snapshot.val());
            } else {
                setWallpaper("");
            }
        });
        return () => unsubscribe();
    }, [user]);

    // Handle Actions
    const handleClearChat = async () => {
        if (!user || !chatId) return;
        try {
            await update(ref(rtdb, `users/${user.uid}/chatSettings/${chatId}`), {
                lastClearedTimestamp: Date.now()
            });
            setShowMenu(false);
        } catch (error) {
            console.error("Error clearing chat:", error);
        }
    };

    const handleRetrieveChat = () => {
        setShowMenu(false);
        setShowPinModal(true);
    };

    const onPinSuccess = async () => {
        if (!user || !chatId) return;
        try {
            await remove(ref(rtdb, `users/${user.uid}/chatSettings/${chatId}/lastClearedTimestamp`));
            setShowPinModal(false);
        } catch (error) {
            console.error("Error retrieving chat:", error);
        }
    };

    const handleWallpaperSelect = async (url: string) => {
        if (!user) return;
        setWallpaper(url); // Optimistic
        try {
            await set(ref(rtdb, `users/${user.uid}/settings/wallpaper`), url);
        } catch (error) {
            console.error("Error setting wallpaper:", error);
        }
    };

    // Filter messages based on cleared timestamp
    const visibleMessages = messages.filter(msg => {
        if (!chatSettings?.lastClearedTimestamp) return true;
        return msg.timestamp > chatSettings.lastClearedTimestamp;
    });

    // Listen for typing status
    useEffect(() => {
        if (!chatId || !user) return;

        const typingRef = ref(rtdb, `chats/${chatId}/typing/${selectedUser.uid}`);

        const unsubscribe = onValue(typingRef, (snapshot) => {
            if (snapshot.exists()) {
                // If the node exists, they are typing. We rely on the sender to remove it.
                // We can keeping a loose timestamp check (e.g. 30s) just in case of stale data, 
                // but for now, simple existence is more reliable for testing.
                setIsOtherTyping(true);
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

    // Scroll to bottom when messages change (Initial / New Message)
    useEffect(() => {
        // Only scroll to bottom if NOT loading history
        if (!loadingMore && messagesEndRef.current) {
            const container = document.getElementById("messages-container");
            // If user is already near bottom, auto-scroll. Else, maybe show "new message" indicator?
            // For now, simpler: auto-scroll if it's not history load
            scrollToBottom();
        }
    }, [messages, loadingMore]);

    // Handle mobile keyboard open/resize
    useEffect(() => {
        if (window.visualViewport) {
            const handleResize = () => {
                if (!loadingMore) scrollToBottom();
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
            setSelectedFile(file);
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

        // Capture State Locally
        const msgText = newMessage;
        const msgImage = image; // Base64 preview
        const fileToUpload = selectedFile; // Real file
        const currentReply = replyingTo;

        if ((!msgText.trim() && !msgImage) || !user || !chatId) return;

        // 🚀 Optimistic UI: Update UI Immediately
        setNewMessage("");
        setImage(null);
        setSelectedFile(null);
        setReplyingTo(null);
        setShowEmojiPicker(false);
        updateTypingStatus(false);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        try {
            // 1. Upload to Cloudinary if file exists
            let imageUrl = null;
            if (msgImage) {
                if (fileToUpload) {
                    try {
                        const secureUrl = await uploadToCloudinary(fileToUpload);
                        imageUrl = secureUrl;
                    } catch (err) {
                        console.error("Cloudinary upload failed", err);
                        imageUrl = msgImage; // Fallback to base64
                    }
                } else {
                    imageUrl = msgImage; // Fallback
                }
            }

            await set(ref(rtdb, `chats/${chatId}/metadata`), {
                participants: [user.uid, selectedUser.uid],
                lastMessage: msgText || (imageUrl ? "📷 Image" : ""),
                lastMessageTimestamp: Date.now(),
            });

            const messageData: any = {
                senderId: user.uid,
                receiverId: selectedUser.uid,
                text: msgText,
                image: imageUrl || null,
                timestamp: Date.now(),
                read: false,
            };

            if (currentReply) {
                messageData.replyTo = {
                    id: currentReply.id,
                    text: currentReply.text || (currentReply.image ? "📷 Image" : ""),
                    senderId: currentReply.senderId,
                };
            }

            const messagesRef = ref(rtdb, `chats/${chatId}/messages`);
            await push(messagesRef, messageData);

        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const getReplyPreviewName = (senderId: string) => {
        if (senderId === user?.uid) return "You";
        return selectedUser.displayName || "User";
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-[#0b141a] overflow-hidden relative">
            {/* Header - WhatsApp Style - Fixed */}
            <div className="flex-shrink-0 flex items-center space-x-3 bg-[#202c33] px-3 py-3 sm:px-4 sm:py-3 z-50 border-b border-[#2a3942]/50 shadow-sm">
                <button
                    onClick={onBack}
                    className="sm:hidden text-[#e9edef] p-2 -ml-2 active:bg-[#374248] rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#6b7c85] overflow-hidden flex-shrink-0">
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
                {/* Call Buttons */}
                <div className="flex items-center gap-1 sm:gap-4 mr-0 sm:mr-2">
                    <button
                        onClick={() => startCall(selectedUser, 'video')}
                        className="p-2 text-[#aebac1] hover:bg-[#374248] rounded-full transition-colors"
                        title="Video Call"
                    >
                        <Video size={24} />
                    </button>
                    <button
                        onClick={() => startCall(selectedUser, 'audio')}
                        className="p-2 text-[#aebac1] hover:bg-[#374248] rounded-full transition-colors"
                        title="Voice Call"
                    >
                        <Phone size={22} />
                    </button>
                </div>
                {/* Menu Button */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 text-[#aebac1] hover:bg-[#374248] rounded-full transition-colors"
                    >
                        <MoreVertical size={24} />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-12 w-48 bg-[#233138] rounded-md shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-100 origin-top-right">
                            <button
                                onClick={handleClearChat}
                                className="w-full text-left px-4 py-3 text-[#e9edef] hover:bg-[#182229] transition-colors text-sm"
                            >
                                Clear Chat
                            </button>
                            {chatSettings?.lastClearedTimestamp && (
                                <button
                                    onClick={handleRetrieveChat}
                                    className="w-full text-left px-4 py-3 text-[#e9edef] hover:bg-[#182229] transition-colors text-sm"
                                >
                                    Retrieve Messages
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    setShowMediaGallery(true);
                                }}
                                className="w-full text-left px-4 py-3 text-[#e9edef] hover:bg-[#182229] transition-colors text-sm border-t border-[#2a3942]"
                            >
                                Media, Links, and Docs
                            </button>
                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    setShowWallpaperModal(true);
                                }}
                                className="w-full text-left px-4 py-3 text-[#e9edef] hover:bg-[#182229] transition-colors text-sm"
                            >
                                Change Wallpaper
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages - WhatsApp Dark Pattern - Scrollable */}
            <div
                id="messages-container"
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto overscroll-contain px-3 py-2 sm:px-6 lg:px-12"
                style={{
                    backgroundColor: '#0b141a',
                    backgroundImage: wallpaper
                        ? `url("${wallpaper}")`
                        : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: wallpaper ? 'cover' : 'auto',
                    backgroundRepeat: wallpaper ? 'no-repeat' : 'repeat',
                    backgroundPosition: 'center',
                }}
        <div className="flex flex-col justify-end min-h-full">
                <div className="space-y-1">
                    {visibleMessages.length === 0 && chatSettings?.lastClearedTimestamp && (
                        <div className="text-center py-6">
                            <span className="bg-[#1f2c33] text-[#8696a0] text-xs px-3 py-1.5 rounded-full border border-[#2a3942]">
                                Messages cleared. Use menu to retrieve.
                            </span>
                        </div>
                    )}
                    {visibleMessages.map((msg) => (
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

            {/* Reply Preview - WhatsApp Style */ }
    {
        replyingTo && (
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
        )
    }

    {/* Emoji Picker - Dark Theme */ }
    {
        showEmojiPicker && (
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
        )
    }

    {/* Input - WhatsApp Style - Fixed at Bottom */ }
    <div className="flex-shrink-0 bg-[#202c33] px-2 py-2 sm:px-4 sm:py-3 z-50 w-full mb-[env(safe-area-inset-bottom)]">
        {image && (
            <div className="mb-3 relative inline-block mx-2">
                <img src={image} alt="Preview" className="h-20 rounded-lg border border-[#2a3942]" />
                <button
                    onClick={() => setImage(null)}
                    className="absolute -top-2 -right-2 bg-[#ea4335] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                >
                    ✕
                </button>
            </div>
        )}
        <form onSubmit={handleSend} className="flex items-end gap-2 max-w-screen-2xl mx-auto">
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageSelect}
            />

            {/* Left Icons Group */}
            <div className="flex items-center pb-2">
                <button
                    type="button"
                    onClick={toggleEmojiPicker}
                    className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'text-[#00a884]' : 'text-[#8696a0] hover:text-[#e9edef]'}`}
                    title="Emoji"
                >
                    <Smile size={24} />
                </button>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#8696a0] hover:text-[#e9edef] p-2 rounded-full transition-colors"
                    title="Attach Image"
                >
                    <ImageIcon size={24} />
                </button>
            </div>

            {/* Input Field */}
            <div className="flex-1 min-w-0 bg-[#2a3942] rounded-2xl flex items-center min-h-[42px] py-1 px-4 mb-1">
                <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder={replyingTo ? "Type your reply..." : "Message"}
                    className="w-full bg-transparent text-[#e9edef] placeholder-[#8696a0] text-[15px] focus:outline-none"
                />
            </div>

            {/* Send Button */}
            <div className="pb-1">
                <button
                    type="submit"
                    disabled={sending || (!newMessage && !image)}
                    className="rounded-full bg-[#00a884] p-3 text-[#111b21] hover:bg-[#06cf9c] disabled:opacity-40 disabled:scale-95 transition-all shadow-md items-center justify-center flex"
                >
                    <Send size={20} className="ml-0.5" />
                </button>
            </div>
        </form>
    </div>
    {/* Pin Modal */ }
            <PinModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onSuccess={onPinSuccess}
                title="Retrieve Hidden Messages"
            />
            <MediaGallery
                isOpen={showMediaGallery}
                onClose={() => setShowMediaGallery(false)}
                messages={messages}
                onImageClick={(src) => setViewingImage(src)}
            />
            <ImageModal
                src={viewingImage}
                onClose={() => setViewingImage(null)}
            />
            <WallpaperModal 
                isOpen={showWallpaperModal}
                onClose={() => setShowWallpaperModal(false)}
                onSelect={handleWallpaperSelect}
                currentWallpaper={wallpaper}
            />
        </div >
    );
}
