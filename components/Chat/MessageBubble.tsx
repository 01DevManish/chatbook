"use client";

import { useState, useRef, useEffect } from "react";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Reply, Copy, Forward, Trash2, Pencil, Smile, MoreHorizontal, Play, Pause } from "lucide-react";
import type { Message } from "./ChatWindow";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from "framer-motion";

interface MessageBubbleProps {
    message: Message;
    onReply: (message: Message) => void;
    getReplyName: (senderId: string) => string;
    onReplyClick?: (messageId: string) => void;
    onImageClick?: (src: string) => void;
    senderName?: string;
    onDelete?: (messageId: string) => void;
    onEdit?: (message: Message) => void;
    onForward?: (message: Message) => void;
    onReact?: (messageId: string, emoji: string) => void;
}

const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "🙏", "👍"];

function AudioPlayer({ src, isMe }: { src: string, isMe: boolean }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(100);
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);
        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex items-center gap-3 w-full pr-2">
            <audio ref={audioRef} src={src} className="hidden" />
            <button
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[rgba(100,100,100,0.1)] text-[var(--whatsapp-text-secondary)] hover:bg-[rgba(100,100,100,0.2)]"
            >
                {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-0.5" />}
            </button>
            <div className="flex-1">
                <div className="h-1 bg-[var(--whatsapp-text-secondary)] bg-opacity-30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--whatsapp-text-secondary)] transition-all duration-100"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            {/* Avatar Headset Icon (Visual only for now) */}
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[var(--whatsapp-text-secondary)] bg-opacity-10 flex items-center justify-center">
                    <span className="text-xl">🎤</span>
                </div>
                <div className="absolute -bottom-1 -right-1">
                    {/* Microphone small icon */}
                </div>
            </div>
        </div>
    );
}

export default function MessageBubble({
    message,
    onReply,
    getReplyName,
    onReplyClick,
    onImageClick,
    senderName,
    onDelete,
    onEdit,
    onForward,
    onReact
}: MessageBubbleProps) {
    const { user } = useAuth();
    const isMe = message.senderId === user?.uid;
    const [showMenu, setShowMenu] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    // Swipe to reply logic
    const x = useMotionValue(0);
    const opacity = useTransform(x, [0, 50], [0, 1]);
    const scale = useTransform(x, [0, 50], [0.5, 1]);

    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.x > 50) {
            onReply(message);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
                setShowReactions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Long press handling
    const handleTouchStart = () => {
        longPressTimer.current = setTimeout(() => {
            setShowMenu(true);
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowMenu(true);
    };

    const handleCopy = async () => {
        if (message.text) {
            await navigator.clipboard.writeText(message.text);
        }
        setShowMenu(false);
    };

    const handleReaction = (emoji: string) => {
        onReact?.(message.id, emoji);
        setShowReactions(false);
        setShowMenu(false);
    };

    const hasReactions = message.reactions && Object.keys(message.reactions).length > 0;

    return (
        <div id={`message-${message.id}`} className={cn("relative w-full group", hasReactions ? "mb-5" : "mb-1")}>
            {/* Swipe Reply Indicator */}
            <motion.div
                style={{ opacity, scale, x: -30 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--whatsapp-text-secondary)] z-0"
            >
                <div className="bg-[var(--whatsapp-header)] p-2 rounded-full border border-[var(--whatsapp-border)]">
                    <Reply size={20} />
                </div>
            </motion.div>

            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0, right: 0.5 }}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className={cn(
                    "flex w-full relative z-10",
                    isMe ? "justify-end" : "justify-start"
                )}
            >
                {/* Reply button - shows on hover (left side for own messages) */}
                {isMe && (
                    <button
                        onClick={() => onReply(message)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity self-center mr-2 p-1.5 rounded-full hover:bg-[rgba(0,0,0,0.05)]"
                        title="Reply"
                    >
                        <Reply size={16} className="text-[var(--whatsapp-text-secondary)]" />
                    </button>
                )}

                <div
                    ref={menuRef}
                    onContextMenu={handleContextMenu}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    className={cn(
                        "max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] w-fit rounded-xl px-2.5 py-1.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] relative transition-all select-none",
                        isMe
                            ? "bg-[var(--whatsapp-message-out)] text-[var(--whatsapp-text-primary)] rounded-tr-none"
                            : "bg-[var(--whatsapp-message-in)] text-[var(--whatsapp-text-primary)] rounded-tl-none"
                    )}
                >
                    {/* Reactions Display */}
                    {hasReactions && (
                        <div className={cn(
                            "absolute -bottom-4 flex gap-0.5 bg-[var(--whatsapp-panel)] rounded-full px-2 py-0.5 border border-[var(--whatsapp-border)] shadow-lg z-20",
                            isMe ? "right-2" : "left-2"
                        )}>
                            {Object.entries(message.reactions!).slice(0, 3).map(([emoji, users]) => (
                                <span key={emoji} className="text-sm">{emoji}</span>
                            ))}
                            {Object.keys(message.reactions!).length > 3 && (
                                <span className="text-xs text-[var(--whatsapp-text-secondary)] ml-0.5">+{Object.keys(message.reactions!).length - 3}</span>
                            )}
                        </div>
                    )}

                    {/* Context Menu */}
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className={cn(
                                    "absolute z-50 bg-[var(--whatsapp-panel)] rounded-xl shadow-2xl border border-[var(--whatsapp-border)] overflow-hidden min-w-[180px]",
                                    isMe ? "right-0 bottom-full mb-2" : "left-0 bottom-full mb-2"
                                )}
                            >
                                {/* Quick Reactions */}
                                <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--whatsapp-border)] bg-[var(--whatsapp-header)]">
                                    {QUICK_REACTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReaction(emoji)}
                                            className="text-xl hover:scale-125 transition-transform p-1 hover:bg-[rgba(0,0,0,0.05)] rounded-full"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setShowReactions(!showReactions)}
                                        className="p-1.5 hover:bg-[rgba(0,0,0,0.05)] rounded-full text-[var(--whatsapp-text-secondary)]"
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="py-1">
                                    <button
                                        onClick={() => { onReply(message); setShowMenu(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[var(--whatsapp-text-primary)] hover:bg-[rgba(0,0,0,0.05)] transition-colors text-sm"
                                    >
                                        <Reply size={18} className="text-[var(--whatsapp-text-secondary)]" />
                                        Reply
                                    </button>

                                    {message.text && (
                                        <button
                                            onClick={handleCopy}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[var(--whatsapp-text-primary)] hover:bg-[rgba(0,0,0,0.05)] transition-colors text-sm"
                                        >
                                            <Copy size={18} className="text-[var(--whatsapp-text-secondary)]" />
                                            Copy
                                        </button>
                                    )}

                                    <button
                                        onClick={() => { onForward?.(message); setShowMenu(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[var(--whatsapp-text-primary)] hover:bg-[rgba(0,0,0,0.05)] transition-colors text-sm"
                                    >
                                        <Forward size={18} className="text-[var(--whatsapp-text-secondary)]" />
                                        Forward
                                    </button>

                                    {isMe && message.text && (
                                        <button
                                            onClick={() => { onEdit?.(message); setShowMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[var(--whatsapp-text-primary)] hover:bg-[rgba(0,0,0,0.05)] transition-colors text-sm"
                                        >
                                            <Pencil size={18} className="text-[var(--whatsapp-text-secondary)]" />
                                            Edit
                                        </button>
                                    )}

                                    {isMe && (
                                        <button
                                            onClick={() => { onDelete?.(message.id); setShowMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#ea4335] hover:bg-[rgba(0,0,0,0.05)] transition-colors text-sm"
                                        >
                                            <Trash2 size={18} />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Sender Name for Groups */}
                    {senderName && !isMe && (
                        <p className="text-xs font-bold text-[var(--whatsapp-text-secondary)] mb-1">
                            {senderName}
                        </p>
                    )}

                    {/* WhatsApp Style Message Tail */}
                    <svg
                        className={cn(
                            "absolute top-0 w-[8px] h-[13px]",
                            isMe
                                ? "right-[-8px] fill-[var(--whatsapp-message-out)]"
                                : "left-[-8px] fill-[var(--whatsapp-message-in)]"
                        )}
                        viewBox="0 0 8 13"
                        preserveAspectRatio="none"
                    >
                        {isMe ? (
                            <path d="M5.188,1H0v11.193l6.467-8.625C7.526,2.156,6.958,1,5.188,1z" />
                        ) : (
                            <path d="M1.533,3.568L8,12.193V1H2.812C1.042,1,0.474,2.156,1.533,3.568z" />
                        )}
                    </svg>

                    {/* Reply Preview */}
                    {message.replyTo && (
                        <div
                            onClick={() => onReplyClick && message.replyTo && onReplyClick(message.replyTo.id)}
                            className={cn(
                                "mb-1 px-3 py-2 rounded-md text-sm border-l-4 cursor-pointer hover:opacity-90 transition-opacity",
                                isMe
                                    ? "bg-[#025144] border-l-[#25d366]"
                                    : "bg-[#1a262d] border-l-[#8696a0]"
                            )}
                        >
                            <p className={cn(
                                "font-medium text-xs",
                                message.replyTo.senderId === user?.uid ? "text-[#25d366]" : "text-[#53bdeb]"
                            )}>
                                {getReplyName(message.replyTo.senderId)}
                            </p>
                            <p className="text-[#8696a0] truncate text-xs mt-0.5">
                                {message.replyTo.text}
                            </p>
                        </div>
                    )}

                    {message.image && (
                        <div className="mb-1 -mx-1">
                            <img
                                src={message.image}
                                alt="Sent image"
                                className="max-w-full max-h-72 rounded-lg object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => onImageClick && onImageClick(message.image!)}
                            />
                        </div>
                    )}

                    <div className="relative text-[14.2px] leading-[19px] text-[var(--whatsapp-text-primary)] whitespace-pre-wrap break-words">
                        {message.text}
                        {message.edited && <span className="text-[11px] text-[var(--whatsapp-text-secondary)] italic ml-1">edited</span>}

                        {/* Spacer to reserve room for float */}
                        <span className="inline-block w-[70px] opacity-0 pointer-events-none align-middle h-0">&nbsp;</span>

                        {/* Timestamp Container: Floated right */}
                        <span className="float-right mt-1.5 -ml-[70px] flex items-center justify-end gap-1 select-none">
                            <span className="text-[11px] text-[var(--whatsapp-text-time)] min-w-fit antialiased leading-none">
                                {message.timestamp ? formatDate(new Date(message.timestamp)) : "..."}
                            </span>
                            {isMe && (
                                <span className={cn("ml-0.5", message.read ? "text-[var(--whatsapp-blue-tick)]" : "text-[var(--whatsapp-text-secondary)]")}>
                                    <svg viewBox="0 0 16 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" className="block fill-current">
                                        <path d="M11.5153 0.270923C11.1611 -0.089856 10.5878 -0.0905476 10.2343 0.269434L4.85694 5.75961L2.8312 3.75058C2.4727 3.39501 1.89436 3.3986 1.54041 3.75861C1.1895 4.11553 1.19232 4.69083 1.54668 5.04416L4.22558 7.71537C4.40263 7.8919 4.63935 7.98502 4.8817 7.98144C5.12285 7.9778 5.35336 7.8778 5.52554 7.702L11.5033 1.56475C11.8543 1.20443 11.8573 0.628929 11.5153 0.270923Z" />
                                        <path d="M14.9095 0.270923C14.5553 -0.089856 13.982 -0.0905476 13.6285 0.269434L13.1165 0.792443C12.7816 1.13452 12.7661 1.68114 13.0822 2.04169C13.0822 2.04169 13.0826 2.04213 13.083 2.04257C13.083 2.04257 14.8058 4.02029 14.8058 4.02029C15.0116 4.25656 15.0116 4.60948 14.8058 4.84575L9.62319 10.7963C9.29654 11.1714 8.71887 11.1983 8.36034 10.8562L7.69708 10.2234C7.69578 10.2222 7.69449 10.2209 7.6932 10.2197C7.30606 9.85025 7.28854 9.23232 7.65349 8.8407L8.71186 7.62551C8.71186 7.62551 6.84055 5.7562 6.84055 5.7562L7.50294 5.08013C7.50294 5.08013 9.40776 6.97985 9.40776 6.97985C9.40776 6.97985 14.8975 1.56475 14.8975 1.56475C15.2486 1.20443 15.2515 0.628929 14.9095 0.270923Z" />
                                    </svg>
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Reply button - shows on hover (right side for other's messages) */}
                {!isMe && (
                    <button
                        onClick={() => onReply(message)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity self-center ml-2 p-1.5 rounded-full hover:bg-[rgba(0,0,0,0.05)]"
                        title="Reply"
                    >
                        <Reply size={16} className="text-[var(--whatsapp-text-secondary)]" />
                    </button>
                )}
            </motion.div>
        </div>
    );
}
