"use client";

import { useState, useRef, useEffect } from "react";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Reply, Copy, Forward, Trash2, Pencil, Smile, MoreHorizontal } from "lucide-react";
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
                className="absolute left-0 top-1/2 -translate-y-1/2 text-[#8696a0] z-0"
            >
                <div className="bg-[#202c33] p-2 rounded-full border border-[#2a3942]">
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
                        className="opacity-0 group-hover:opacity-100 transition-opacity self-center mr-2 p-1.5 rounded-full hover:bg-[#2a3942]"
                        title="Reply"
                    >
                        <Reply size={16} className="text-[#8696a0]" />
                    </button>
                )}

                <div
                    ref={menuRef}
                    onContextMenu={handleContextMenu}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    className={cn(
                        "max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] rounded-2xl px-4 py-3 shadow-md relative transition-all hover:shadow-lg select-none",
                        isMe
                            ? "bg-gradient-to-br from-[#005c4b] to-[#004a3c] text-[#e9edef] rounded-tr-none"
                            : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                    )}
                >
                    {/* Reactions Display */}
                    {hasReactions && (
                        <div className={cn(
                            "absolute -bottom-4 flex gap-0.5 bg-[#1f2c33] rounded-full px-2 py-0.5 border border-[#2a3942] shadow-lg z-20",
                            isMe ? "right-2" : "left-2"
                        )}>
                            {Object.entries(message.reactions!).slice(0, 3).map(([emoji, users]) => (
                                <span key={emoji} className="text-sm">{emoji}</span>
                            ))}
                            {Object.keys(message.reactions!).length > 3 && (
                                <span className="text-xs text-[#8696a0] ml-0.5">+{Object.keys(message.reactions!).length - 3}</span>
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
                                    "absolute z-50 bg-[#233138] rounded-xl shadow-2xl border border-[#2a3942] overflow-hidden",
                                    isMe ? "right-0 bottom-full mb-2" : "left-0 bottom-full mb-2"
                                )}
                            >
                                {/* Quick Reactions */}
                                <div className="flex items-center gap-1 px-3 py-2 border-b border-[#2a3942]">
                                    {QUICK_REACTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReaction(emoji)}
                                            className="text-xl hover:scale-125 transition-transform p-1 hover:bg-[#374248] rounded-full"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setShowReactions(!showReactions)}
                                        className="p-1.5 hover:bg-[#374248] rounded-full text-[#8696a0]"
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="py-1">
                                    <button
                                        onClick={() => { onReply(message); setShowMenu(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[#e9edef] hover:bg-[#374248] transition-colors text-sm"
                                    >
                                        <Reply size={18} className="text-[#8696a0]" />
                                        Reply
                                    </button>

                                    {message.text && (
                                        <button
                                            onClick={handleCopy}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#e9edef] hover:bg-[#374248] transition-colors text-sm"
                                        >
                                            <Copy size={18} className="text-[#8696a0]" />
                                            Copy
                                        </button>
                                    )}

                                    <button
                                        onClick={() => { onForward?.(message); setShowMenu(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[#e9edef] hover:bg-[#374248] transition-colors text-sm"
                                    >
                                        <Forward size={18} className="text-[#8696a0]" />
                                        Forward
                                    </button>

                                    {isMe && message.text && (
                                        <button
                                            onClick={() => { onEdit?.(message); setShowMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#e9edef] hover:bg-[#374248] transition-colors text-sm"
                                        >
                                            <Pencil size={18} className="text-[#8696a0]" />
                                            Edit
                                        </button>
                                    )}

                                    {isMe && (
                                        <button
                                            onClick={() => { onDelete?.(message.id); setShowMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#ea4335] hover:bg-[#374248] transition-colors text-sm"
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
                        <p className="text-xs font-bold text-[#53bdeb] mb-1">
                            {senderName}
                        </p>
                    )}

                    {/* WhatsApp Style Message Tail */}
                    <svg
                        className={cn(
                            "absolute top-0 w-[8px] h-[13px] text-current",
                            isMe ? "right-[-8px] text-[#005c4b] fill-current" : "left-[-8px] text-[#202c33] fill-current"
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

                    {message.text && (
                        <p className="text-[14.2px] leading-[19px] break-words whitespace-pre-wrap">{message.text}</p>
                    )}

                    {/* Edited indicator */}
                    {message.edited && (
                        <span className="text-[10px] text-[#8696a0] italic ml-1">edited</span>
                    )}

                    <div
                        className={cn(
                            "mt-1 text-[11px] flex items-center gap-1 opacity-60 h-[15px]",
                            isMe ? "justify-end text-[#e9edef]" : "justify-end text-[#e9edef]"
                        )}
                        style={{ float: 'right', marginLeft: '8px' }}
                    >
                        {message.timestamp
                            ? formatDate(new Date(message.timestamp))
                            : "Sending..."}

                        {isMe && message.read && (
                            <span className="text-[#53bdeb] font-medium ml-1">✓✓</span>
                        )}
                        {isMe && !message.read && (
                            <span className="text-[#8696a0] ml-1">✓✓</span>
                        )}
                    </div>
                </div>

                {/* Reply button - shows on hover (right side for other's messages) */}
                {!isMe && (
                    <button
                        onClick={() => onReply(message)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity self-center ml-2 p-1.5 rounded-full hover:bg-[#2a3942]"
                        title="Reply"
                    >
                        <Reply size={16} className="text-[#8696a0]" />
                    </button>
                )}
            </motion.div>
        </div>
    );
}
