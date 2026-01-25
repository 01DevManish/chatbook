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
                "flex w-full mb-4 group",
                isMe ? "justify-end" : "justify-start"
            )}
        >
            {/* Reply button - shows on hover (left side for own messages) */}
            {isMe && (
                <button
                    onClick={() => onReply(message)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity self-center mr-2 p-1 rounded-full hover:bg-gray-200"
                    title="Reply"
                >
                    <Reply size={16} className="text-gray-500" />
                </button>
            )}

            <div
                className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2 shadow-sm relative",
                    isMe
                        ? "bg-green-100 text-gray-900 rounded-tr-none"
                        : "bg-white text-gray-900 rounded-tl-none"
                )}
            >
                {/* Reply Preview */}
                {message.replyTo && (
                    <div className={cn(
                        "mb-2 px-3 py-2 rounded-md border-l-3 text-sm",
                        isMe
                            ? "bg-green-50 border-l-green-400"
                            : "bg-gray-100 border-l-gray-400"
                    )}
                        style={{ borderLeftWidth: "3px" }}
                    >
                        <p className={cn(
                            "font-medium text-xs",
                            message.replyTo.senderId === user?.uid ? "text-green-600" : "text-blue-600"
                        )}>
                            {getReplyName(message.replyTo.senderId)}
                        </p>
                        <p className="text-gray-600 truncate text-xs">
                            {message.replyTo.text}
                        </p>
                    </div>
                )}

                {message.image && (
                    <div className="mb-2">
                        <img
                            src={message.image}
                            alt="Sent image"
                            className="max-h-60 rounded-md object-cover"
                        />
                    </div>
                )}

                {message.text && <p className="text-sm leading-relaxed">{message.text}</p>}

                <div
                    className={cn(
                        "mt-1 text-[10px] text-gray-500 flex items-center gap-1",
                        isMe ? "justify-end" : "justify-start"
                    )}
                >
                    {message.timestamp
                        ? formatDate(new Date(message.timestamp))
                        : "Sending..."}

                    {isMe && message.read && (
                        <span className="text-blue-500 font-bold">✓✓</span>
                    )}
                    {isMe && !message.read && (
                        <span className="text-gray-400">✓</span>
                    )}
                </div>
            </div>

            {/* Reply button - shows on hover (right side for other's messages) */}
            {!isMe && (
                <button
                    onClick={() => onReply(message)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity self-center ml-2 p-1 rounded-full hover:bg-gray-200"
                    title="Reply"
                >
                    <Reply size={16} className="text-gray-500" />
                </button>
            )}
        </div>
    );
}
