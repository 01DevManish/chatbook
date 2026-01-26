"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/UI/Dialog";
import { X, Users } from "lucide-react";

interface UserData {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    username?: string;
    lastSeen?: number;
    createdAt?: number;
    isGroup?: boolean;
    participants?: Record<string, boolean>;
}

interface ParticipantData {
    uid: string;
    displayName?: string;
    photoURL?: string;
}

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData | null;
    participants?: ParticipantData[]; // For groups
}

export default function ProfileModal({ isOpen, onClose, user, participants }: ProfileModalProps) {
    if (!user) return null;

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "Unknown";
        return new Date(timestamp).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return "Unknown";
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        if (diffDays === 1) return "Yesterday";
        return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#111b21] text-[#e9edef] border border-[#2a3942] p-0 overflow-hidden">
                {/* Header with large DP */}
                <div className="relative bg-[#202c33] pt-6 pb-8 flex flex-col items-center">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 text-[#aebac1] hover:text-white hover:bg-[#374248] rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Avatar */}
                    <div className="h-32 w-32 rounded-full bg-[#6b7c85] overflow-hidden flex items-center justify-center border-4 border-[#111b21] shadow-xl">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
                        ) : user.isGroup ? (
                            <Users size={48} className="text-[#cfd8dc]" />
                        ) : (
                            <span className="text-5xl font-bold text-[#cfd8dc]">
                                {user.displayName?.[0]?.toUpperCase() || "?"}
                            </span>
                        )}
                    </div>

                    {/* Name */}
                    <h2 className="mt-4 text-xl font-semibold text-[#e9edef]">{user.displayName || "Unknown"}</h2>
                    {!user.isGroup && user.email && (
                        <p className="text-sm text-[#8696a0] mt-1">{user.email}</p>
                    )}
                </div>

                {/* Details Section */}
                <div className="p-5 space-y-4">
                    {!user.isGroup ? (
                        <>
                            {/* Last Seen */}
                            <div className="flex justify-between items-center py-3 border-b border-[#2a3942]">
                                <span className="text-[#8696a0] text-sm">Last Seen</span>
                                <span className="text-[#e9edef] text-sm font-medium">
                                    {user.lastSeen ? formatTime(user.lastSeen) : "Online"}
                                </span>
                            </div>

                            {/* Joined */}
                            <div className="flex justify-between items-center py-3 border-b border-[#2a3942]">
                                <span className="text-[#8696a0] text-sm">Joined</span>
                                <span className="text-[#e9edef] text-sm font-medium">
                                    {formatDate(user.createdAt)}
                                </span>
                            </div>

                            {/* Username */}
                            {user.username && (
                                <div className="flex justify-between items-center py-3 border-b border-[#2a3942]">
                                    <span className="text-[#8696a0] text-sm">Username</span>
                                    <span className="text-[#e9edef] text-sm font-medium">@{user.username}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Group Participants */}
                            <div className="py-2">
                                <p className="text-[#8696a0] text-sm mb-3">{participants?.length || 0} Participants</p>
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {participants?.map((p) => (
                                        <div key={p.uid} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[#202c33]">
                                            <div className="h-10 w-10 rounded-full bg-[#6b7c85] overflow-hidden flex items-center justify-center">
                                                {p.photoURL ? (
                                                    <img src={p.photoURL} alt={p.displayName} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-lg font-medium text-[#cfd8dc]">
                                                        {p.displayName?.[0]?.toUpperCase() || "?"}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[#e9edef] font-medium">{p.displayName || "Unknown"}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
