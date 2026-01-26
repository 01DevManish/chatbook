"use client";

import { useRef } from "react";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Reply } from "lucide-react";
import type { Message } from "./ChatWindow";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";

interface MessageBubbleProps {
    message: Message;
    onReply: (message: Message) => void;
    getReplyName: (senderId: string) => string;
    onReplyClick?: (messageId: string) => void;
    onImageClick?: (src: string) => void;
    senderName?: string; // New Prop
}

export default function MessageBubble({ message, onReply, getReplyName, onReplyClick, onImageClick, senderName }: MessageBubbleProps) {
    const { user } = useAuth();
    const isMe = message.senderId === user?.uid;

    // Swipe to reply logic
    const x = useMotionValue(0);
    const opacity = useTransform(x, [0, 50], [0, 1]);
    const scale = useTransform(x, [0, 50], [0.5, 1]);

    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.x > 50) { // Threshold for reply
            onReply(message);
        }
    };

    return (
        <div id={`message-${message.id}`} className="relative w-full mb-1 group">
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
                    className={cn(
                        "max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] rounded-2xl px-4 py-3 shadow-md relative transition-all hover:shadow-lg",
                        isMe
                            ? "bg-gradient-to-br from-[#005c4b] to-[#004a3c] text-[#e9edef] rounded-tr-none"
                            : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                    )}
                >
                    {/* Sender Name for Groups */}
                    {senderName && !isMe && (
                        <p className="text-xs font-bold text-[#53bdeb] mb-1">
                            {senderName}
                        </p>
                    )}

                    {/* Modern Message Tail */}
                    <svg
                        className={cn(
                            "absolute top-0 w-3 h-3 text-current",
                            isMe ? "right-0 -mr-2 text-[#005c4b] fill-current" : "left-0 -ml-2 text-[#202c33] fill-current"
                        )}
                        viewBox="0 0 10 10"
                        style={{ color: isMe ? '#005c4b' : '#202c33' }}
                    >
                        {isMe ? (
                            <path d="M0 0 L10 0 L0 10 Z" />
                        ) : (
                            <path d="M10 0 L0 0 L10 10 Z" />
                        )}
                    </svg>

                    {/* Reply Preview */}
                    {message.replyTo && (
                        <div
                            onClick={() => onReplyClick && message.replyTo && onReplyClick(message.replyTo.id)}
                            className={cn(
                                "mb-2 px-3 py-2 rounded-md text-sm border-l-4 cursor-pointer hover:opacity-90 transition-opacity",
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
                        <div className="mb-2 -mx-1">
                            <img
                                src={message.image}
                                alt="Sent image"
                                className="max-w-full max-h-72 rounded-lg object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => onImageClick && onImageClick(message.image!)}
                            />
                        </div>
                    )}

                    {message.text && (
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
                    )}

                    <div
                        className={cn(
                            "mt-1 text-[10px] flex items-center gap-1",
                            isMe ? "justify-end text-[#8696a0]" : "justify-start text-[#8696a0]"
                        )}
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
