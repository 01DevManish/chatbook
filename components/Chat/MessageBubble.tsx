"use client";

import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Reply } from "lucide-react";
import type { Message } from "./ChatWindow";

interface MessageBubbleProps {
    message: Message;
    onReply: (message: Message) => void;
    getReplyName: (senderId: string) => string;
}

export default function MessageBubble({ message, onReply, getReplyName }: MessageBubbleProps) {
    const { user } = useAuth();
    const isMe = message.senderId === user?.uid;

    return (
        <div
            className={cn(
                "flex w-full mb-1 group",
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
                    "max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] rounded-lg px-3 py-2 shadow-sm relative",
                    isMe
                        ? "bg-[#005c4b] text-[#e9edef] rounded-tr-sm"
                        : "bg-[#202c33] text-[#e9edef] rounded-tl-sm"
                )}
            >
                {/* WhatsApp-style message tail */}
                <div
                    className={cn(
                        "absolute top-0 w-3 h-3",
                        isMe
                            ? "right-0 -mr-2"
                            : "left-0 -ml-2"
                    )}
                    style={{
                        borderTop: isMe ? '8px solid #005c4b' : '8px solid #202c33',
                        borderLeft: isMe ? '8px solid transparent' : 'none',
                        borderRight: isMe ? 'none' : '8px solid transparent',
                    }}
                />

                {/* Reply Preview */}
                {message.replyTo && (
                    <div className={cn(
                        "mb-2 px-3 py-2 rounded-md text-sm border-l-4",
                        isMe
                            ? "bg-[#025144] border-l-[#25d366]"
                            : "bg-[#1a262d] border-l-[#8696a0]"
                    )}>
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
                            className="max-w-full max-h-72 rounded-lg object-cover"
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
        </div>
    );
}
