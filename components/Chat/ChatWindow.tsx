"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ref, onValue, push, set, update, remove, query, limitToLast } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useCall } from "@/context/CallContext";
import MessageBubble from "./MessageBubble";
import { Image as ImageIcon, Send, ArrowLeft, X, Reply, Smile, MoreVertical, Video, Phone, Mic } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import PinModal from "@/components/UI/PinModal";
import MediaGallery from "./MediaGallery";
import ImageModal from "@/components/UI/ImageModal";
import WallpaperModal from "./WallpaperModal";
import ProfileModal from "@/components/UI/ProfileModal";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { sendPushNotification } from "@/lib/sendNotification";

interface UserData {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    username?: string;
    lastSeen?: number;
    isGroup?: boolean;
    participants?: Record<string, boolean>;
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
    audio?: string;
    type?: 'text' | 'image' | 'audio';
    timestamp: number;
    read: boolean;
    edited?: boolean;
    reactions?: Record<string, string[]>; // emoji -> userIds
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
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
    const [messageLimit, setMessageLimit] = useState(50);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
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
            // Highlight effect using CSS animation
            element.classList.add("message-highlight");
            setTimeout(() => {
                element.classList.remove("message-highlight");
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

    const handleVoiceSend = async (audioBlob: Blob) => {
        setIsRecording(false);
        try {
            const formData = new FormData();
            formData.append('file', audioBlob);

            const upRes = await fetch('/api/upload/voice', {
                method: 'POST',
                body: formData
            });

            if (!upRes.ok) throw new Error('Upload failed');
            const { url } = await upRes.json();

            const newMessageRef = push(ref(rtdb, `chats/${chatId}/messages`));
            const messageData: Message = {
                id: newMessageRef.key!,
                audio: url,
                senderId: user!.uid,
                receiverId: selectedUser.uid,
                timestamp: Date.now(),
                read: false,
                type: 'audio',
                text: 'Voice Message' // Fallback text
            };
            await set(newMessageRef, messageData);

            // Send notification
            if (!isOtherTyping) {
                await sendPushNotification({
                    receiverId: selectedUser.uid,
                    senderName: user?.displayName || 'User',
                    messageText: `🎤 Voice Message`,
                    chatId: chatId!,
                    senderId: user!.uid
                });
            }

        } catch (err) {
            console.error(err);
            alert("Failed to send voice message");
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        // If in edit mode, save the edit instead
        if (editingMessage) {
            await handleSaveEdit();
            return;
        }

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

        // Keep keyboard open - refocus input immediately
        setTimeout(() => inputRef.current?.focus(), 10);

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

            // Send push notification to receiver
            sendPushNotification({
                receiverId: selectedUser.uid,
                senderName: user.displayName || "Someone",
                messageText: msgText || (imageUrl ? "📷 Image" : ""),
                chatId,
                senderId: user.uid,
            });

            // 🚀 AUTOMATICALLY ADD TO ACTIVE CHATS FOR BOTH USERS
            // This ensures they show up in each other's sidebar without "Add Contact"
            try {
                const updates: any = {};
                updates[`users/${user.uid}/chats/${selectedUser.uid}`] = true;
                updates[`users/${selectedUser.uid}/chats/${user.uid}`] = true;
                await update(ref(rtdb), updates);
            } catch (err) {
                console.error("Error updating active chats:", err);
            }

        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const getReplyPreviewName = (senderId: string) => {
        if (senderId === user?.uid) return "You";
        return selectedUser.displayName || "User";
    };

    // Message Actions
    const handleDeleteMessage = async (messageId: string) => {
        if (!chatId) return;
        try {
            await remove(ref(rtdb, `chats/${chatId}/messages/${messageId}`));
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    const handleEditMessage = (message: Message) => {
        setEditingMessage(message);
        setNewMessage(message.text);
        inputRef.current?.focus();
    };

    const handleSaveEdit = async () => {
        if (!editingMessage || !chatId || !newMessage.trim()) return;
        try {
            await update(ref(rtdb, `chats/${chatId}/messages/${editingMessage.id}`), {
                text: newMessage,
                edited: true
            });
            setEditingMessage(null);
            setNewMessage("");
        } catch (error) {
            console.error("Error editing message:", error);
        }
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
        setNewMessage("");
    };

    const handleReactToMessage = async (messageId: string, emoji: string) => {
        if (!chatId || !user) return;
        try {
            const reactionRef = ref(rtdb, `chats/${chatId}/messages/${messageId}/reactions/${emoji}`);
            // Toggle reaction - if user already reacted with this emoji, remove it
            const msg = messages.find(m => m.id === messageId);
            const existingReactions = msg?.reactions?.[emoji] || [];

            if (existingReactions.includes(user.uid)) {
                // Remove reaction
                const newReactions = existingReactions.filter(uid => uid !== user.uid);
                if (newReactions.length === 0) {
                    await remove(reactionRef);
                } else {
                    await set(reactionRef, newReactions);
                }
            } else {
                // Add reaction
                await set(reactionRef, [...existingReactions, user.uid]);
            }
        } catch (error) {
            console.error("Error reacting to message:", error);
        }
    };

    const handleForwardMessage = (message: Message) => {
        setForwardingMessage(message);
        // TODO: Open forward modal to select contact
        alert("Forward feature coming soon!");
    };

    // Force body scroll lock - Mobile only
    useEffect(() => {
        if (window.innerWidth < 640) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-40 sm:z-auto sm:static sm:inset-auto flex flex-col bg-[var(--whatsapp-bg)] h-[100dvh] sm:h-full w-full overflow-hidden supports-[height:100dvh]:h-[100dvh]">
            {/* Header - Fixed at Top - WhatsApp Exact Style */}
            <header className="flex-shrink-0 flex items-center gap-2 bg-[var(--whatsapp-header)] px-2 py-1.5 sm:px-4 sm:py-2.5 z-50 border-b border-[var(--whatsapp-border)]" style={{ paddingTop: 'max(6px, env(safe-area-inset-top))' }}>
                <button
                    onClick={onBack}
                    className="sm:hidden text-[var(--whatsapp-text-primary)] p-1.5 active:bg-[var(--whatsapp-panel)] rounded-full transition-colors flex-shrink-0"
                >
                    <ArrowLeft size={22} />
                </button>
                <div
                    className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-300 overflow-hidden flex-shrink-0 cursor-pointer active:opacity-80 transition-opacity"
                    onClick={() => setShowProfileModal(true)}
                >
                    {selectedUser.photoURL ? (
                        <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="h-full w-full object-cover" />
                    ) : (
                        <span className="font-medium text-gray-600 text-base">{selectedUser.displayName?.[0]?.toUpperCase()}</span>
                    )}
                </div>
                <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setShowProfileModal(true)}
                >
                    <h3 className="font-medium text-[var(--whatsapp-text-primary)] truncate">{selectedUser.displayName}</h3>
                    {isOtherTyping ? (
                        <p className="text-xs text-[var(--whatsapp-green)] font-medium">
                            typing...
                        </p>
                    ) : selectedUser.lastSeen ? (
                        <p className="text-xs text-[var(--whatsapp-text-secondary)]">
                            last seen {new Date(selectedUser.lastSeen).toLocaleTimeString()}
                        </p>
                    ) : (
                        <p className="text-xs text-[var(--whatsapp-text-secondary)]">online</p>
                    )}
                </div>
                {/* Call Buttons - Compact on mobile */}
                <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
                    <button
                        onClick={() => startCall(selectedUser, 'video')}
                        className="p-1.5 sm:p-2 text-[var(--whatsapp-text-secondary)] active:bg-[rgba(0,0,0,0.1)] rounded-full transition-colors"
                        title="Video Call"
                    >
                        <Video size={20} className="sm:w-6 sm:h-6" />
                    </button>
                    <button
                        onClick={() => startCall(selectedUser, 'audio')}
                        className="p-1.5 sm:p-2 text-[var(--whatsapp-text-secondary)] active:bg-[rgba(0,0,0,0.1)] rounded-full transition-colors"
                        title="Voice Call"
                    >
                        <Phone size={18} className="sm:w-[22px] sm:h-[22px]" />
                    </button>
                </div>
                {/* Menu Button */}
                <div className="relative flex-shrink-0" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 sm:p-2 text-[var(--whatsapp-text-secondary)] active:bg-[rgba(0,0,0,0.1)] rounded-full transition-colors"
                    >
                        <MoreVertical size={20} className="sm:w-6 sm:h-6" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-12 w-48 bg-[var(--whatsapp-panel)] rounded-md shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-100 origin-top-right ring-1 ring-black/5">
                            <button
                                onClick={handleClearChat}
                                className="w-full text-left px-4 py-3 text-[var(--whatsapp-text-primary)] hover:bg-[rgba(0,0,0,0.05)] transition-colors text-sm"
                            >
                                Clear Chat
                            </button>
                            {chatSettings?.lastClearedTimestamp && (
                                <button
                                    onClick={handleRetrieveChat}
                                    className="w-full text-left px-4 py-3 text-[var(--whatsapp-text-primary)] hover:bg-[rgba(0,0,0,0.05)] transition-colors text-sm"
                                >
                                    Retrieve Messages
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    setShowMediaGallery(true);
                                }}
                                className="w-full text-left px-4 py-3 text-[var(--whatsapp-text-primary)] hover:bg-[rgba(0,0,0,0.05)] transition-colors text-sm border-t border-[var(--whatsapp-border)]"
                            >
                                Media, Links, and Docs
                            </button>
                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    setShowWallpaperModal(true);
                                }}
                                className="w-full text-left px-4 py-3 text-[var(--whatsapp-text-primary)] hover:bg-[rgba(0,0,0,0.05)] transition-colors text-sm"
                            >
                                Change Wallpaper
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Messages - WhatsApp Dark Pattern - Scrollable */}
            <div
                id="messages-container"
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2 sm:px-6 lg:px-12 smooth-scroll"
                style={{
                    backgroundColor: 'var(--whatsapp-bg)',
                    backgroundImage: wallpaper
                        ? `url("${wallpaper}")`
                        : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667781' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: wallpaper ? 'cover' : 'auto',
                    backgroundRepeat: wallpaper ? 'no-repeat' : 'repeat',
                    backgroundPosition: 'center',
                }}
            >
                <div className="flex flex-col justify-end min-h-full">
                    <div className="space-y-1">
                        {visibleMessages.length === 0 && chatSettings?.lastClearedTimestamp && (
                            <div className="text-center py-6">
                                <span className="bg-[rgba(0,0,0,0.2)] text-[var(--whatsapp-text-secondary)] text-xs px-3 py-1.5 rounded-full border border-[var(--whatsapp-border)]">
                                    Messages cleared. Use menu to retrieve.
                                </span>
                            </div>
                        )}
                        {visibleMessages.map((msg, index) => {
                            // Date Separator Logic
                            const msgDate = new Date(msg.timestamp);
                            const prevMsg = index > 0 ? visibleMessages[index - 1] : null;
                            const prevDate = prevMsg ? new Date(prevMsg.timestamp) : null;

                            const showDateSeparator = !prevDate ||
                                msgDate.toDateString() !== prevDate.toDateString();

                            const getDateLabel = (date: Date) => {
                                const today = new Date();
                                const yesterday = new Date(today);
                                yesterday.setDate(yesterday.getDate() - 1);

                                if (date.toDateString() === today.toDateString()) return "Today";
                                if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
                                return date.toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: msgDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined
                                });
                            };

                            return (
                                <div key={msg.id}>
                                    {showDateSeparator && (
                                        <div className="flex justify-center py-2 my-2">
                                            <span className="bg-[var(--whatsapp-panel)] dark:bg-[#182229] text-[var(--whatsapp-text-secondary)] text-[11px] px-3 py-1 rounded-lg shadow-sm uppercase tracking-wide">
                                                {getDateLabel(msgDate)}
                                            </span>
                                        </div>
                                    )}
                                    <MessageBubble
                                        message={msg}
                                        onReply={handleReply}
                                        getReplyName={getReplyPreviewName}
                                        onReplyClick={scrollToMessage}
                                        onImageClick={(src) => setViewingImage(src)}
                                        onDelete={handleDeleteMessage}
                                        onEdit={handleEditMessage}
                                        onForward={handleForwardMessage}
                                        onReact={handleReactToMessage}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div ref={messagesEndRef} className="h-2" />
                </div>
            </div>

            {/* Reply Preview - WhatsApp Style */}
            {
                replyingTo && (
                    <div className="bg-[var(--whatsapp-header)] border-l-4 border-[var(--whatsapp-green)] px-4 py-2 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm text-[var(--whatsapp-green)] font-medium">
                                <Reply size={14} />
                                Replying to {getReplyPreviewName(replyingTo!.senderId)}
                            </div>
                            <p className="text-sm text-[var(--whatsapp-text-secondary)] truncate">
                                {replyingTo.text || (replyingTo.image ? "📷 Image" : "")}
                            </p>
                        </div>
                        <button onClick={cancelReply} className="text-[var(--whatsapp-text-secondary)] hover:text-[var(--whatsapp-text-primary)] p-1">
                            <X size={20} />
                        </button>
                    </div>
                )
            }

            {/* Edit Mode Indicator */}
            {
                editingMessage && (
                    <div className="bg-[var(--whatsapp-header)] border-l-4 border-[var(--whatsapp-blue-tick)] px-4 py-2 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm text-[var(--whatsapp-blue-tick)] font-medium">
                                ✏️ Editing message
                            </div>
                            <p className="text-sm text-[var(--whatsapp-text-secondary)] truncate">
                                {editingMessage.text}
                            </p>
                        </div>
                        <button onClick={handleCancelEdit} className="text-[var(--whatsapp-text-secondary)] hover:text-[var(--whatsapp-text-primary)] p-1">
                            <X size={20} />
                        </button>
                    </div>
                )
            }

            {/* Emoji Picker - Dark Theme */}
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

            {/* Input - WhatsApp Style - Fixed Bottom */}
            <div className="flex-shrink-0 bg-[var(--whatsapp-header)] px-1.5 py-1 sm:px-3 sm:py-2" style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom))' }}>
                {/* Image Preview */}
                {image && (
                    <div className="mb-2 relative inline-block ml-2">
                        <img src={image || undefined} alt="Preview" className="h-14 rounded-lg border border-[var(--whatsapp-border)]" />
                        <button
                            onClick={() => { setImage(null); setSelectedFile(null); }}
                            className="absolute -top-1 -right-1 bg-[#ea4335] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold shadow-lg"
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

                    {/* Main Input Container - WhatsApp Style (Hidden when recording) */}
                    {!isRecording && (
                        <>
                            {/* Emoji Button - Outside Input on Mobile, Inside on Desktop */}
                            <button
                                type="button"
                                onClick={toggleEmojiPicker}
                                className={`p-2 rounded-full transition-colors flex-shrink-0 hover:bg-[rgba(0,0,0,0.05)] ${showEmojiPicker ? 'text-[var(--whatsapp-green)]' : 'text-[var(--whatsapp-text-secondary)]'}`}
                            >
                                <Smile size={24} />
                            </button>

                            {/* Attachment Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-[var(--whatsapp-text-secondary)] rounded-full transition-colors flex-shrink-0 hover:bg-[rgba(0,0,0,0.05)] -ml-1 mr-1"
                            >
                                <ImageIcon size={24} />
                            </button>

                            <div className="flex-1 flex items-center bg-[var(--whatsapp-input-bg)] rounded-2xl px-2 py-1.5 sm:py-2 border border-transparent focus-within:border-[rgba(0,0,0,0.1)]">
                                {/* Text Input */}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={handleInputChange}
                                    placeholder={editingMessage ? "Edit message..." : replyingTo ? "Reply..." : "Type a message"}
                                    className="flex-1 min-w-0 bg-transparent text-[var(--whatsapp-text-primary)] placeholder-[var(--whatsapp-text-secondary)] text-[15px] focus:outline-none px-2"
                                />
                            </div>
                        </>
                    )}

                    {/* Voice Recorder Component replaces input when active */}
                    {isRecording && (
                        <VoiceRecorder
                            onSend={handleVoiceSend}
                            onCancel={() => setIsRecording(false)}
                        />
                    )}

                    {/* Send / Mic Button */}
                    {!isRecording && (
                        <button
                            type={newMessage.trim() || image ? "submit" : "button"}
                            onClick={(e) => {
                                if (!newMessage.trim() && !image) {
                                    e.preventDefault();
                                    setIsRecording(true);
                                }
                            }}
                            className={`p-2 rounded-full flex-shrink-0 flex items-center justify-center transition-all 
                                ${(newMessage.trim() || image) ? 'text-[var(--whatsapp-green)]' : 'text-[var(--whatsapp-text-secondary)]'}
                                hover:bg-[rgba(0,0,0,0.05)] active:scale-95`}
                        >
                            {(newMessage.trim() || image) ? <Send size={24} /> : <Mic size={24} />}
                        </button>
                    )}
                </form>
            </div>
            {/* Pin Modal */}
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
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                user={selectedUser}
            />
        </div>
    );
}

