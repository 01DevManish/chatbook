import { cn, formatDate } from "@/lib/utils";
import { DocumentData } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface MessageBubbleProps {
    message: DocumentData;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const { user } = useAuth();
    const isMe = message.senderId === user?.uid;

    return (
        <div
            className={cn(
                "flex w-full mb-4",
                isMe ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2 shadow-sm relative",
                    isMe
                        ? "bg-green-100 text-gray-900 rounded-tr-none"
                        : "bg-white text-gray-900 rounded-tl-none"
                )}
            >
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
                    {message.timestamp?.seconds
                        ? formatDate(message.timestamp.toDate())
                        : "Sending..."}

                    {isMe && message.read && (
                        <span className="text-blue-500 font-bold">✓✓</span>
                    )}
                    {isMe && !message.read && (
                        <span className="text-gray-400">✓</span>
                    )}
                </div>
            </div>
        </div>
    );
}
