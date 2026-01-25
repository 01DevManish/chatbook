"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb, auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { LogOut, User as UserIcon, RefreshCw, Search, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    username?: string;
}

interface SidebarProps {
    selectedUser: UserData | null;
    onSelectUser: (user: UserData) => void;
}

export default function Sidebar({ selectedUser, onSelectUser }: SidebarProps) {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    // Fetch ALL users from Realtime Database
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const usersRef = ref(rtdb, "users");

        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const userList: UserData[] = Object.keys(data)
                    .map((key) => ({
                        uid: key,
                        ...data[key]
                    }))
                    .filter((u) => u.uid !== user.uid);
                setUsers(userList);
            } else {
                setUsers([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => {
        await auth.signOut();
        router.push("/login");
    };

    // Filter users based on search
    const filteredUsers = users.filter((u) =>
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-full w-full flex-col bg-[#111b21]">
            {/* Header - WhatsApp Style */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#202c33]">
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6b7c85] overflow-hidden cursor-pointer">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <UserIcon size={24} className="text-[#cfd8dc]" />
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleLogout}
                        className="rounded-full p-2 text-[#aebac1] hover:bg-[#374248] transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                    <button className="rounded-full p-2 text-[#aebac1] hover:bg-[#374248] transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-3 py-2 bg-[#111b21]">
                <div className="flex items-center bg-[#202c33] rounded-lg px-4 py-2">
                    <Search size={18} className="text-[#8696a0] mr-4" />
                    <input
                        type="text"
                        placeholder="Search or start new chat"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent text-[#e9edef] placeholder-[#8696a0] text-sm outline-none"
                    />
                </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <RefreshCw className="animate-spin text-[#8696a0]" size={24} />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-[#8696a0] p-4 text-center">
                        <UserIcon size={32} className="mb-2 opacity-50" />
                        <p>{searchQuery ? "No users found" : "No other users yet."}</p>
                        <p className="text-xs mt-1">
                            {searchQuery ? "Try a different search" : "Ask a friend to sign up!"}
                        </p>
                    </div>
                ) : (
                    filteredUsers.map((otherUser) => (
                        <div
                            key={otherUser.uid}
                            onClick={() => onSelectUser(otherUser)}
                            className={cn(
                                "flex cursor-pointer items-center px-3 py-3 transition-colors hover:bg-[#202c33] border-b border-[#222d34]",
                                selectedUser?.uid === otherUser.uid && "bg-[#2a3942]"
                            )}
                        >
                            {/* Avatar */}
                            <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-[#6b7c85] overflow-hidden mr-3">
                                {otherUser.photoURL ? (
                                    <img
                                        src={otherUser.photoURL}
                                        alt={otherUser.displayName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-lg font-medium text-[#cfd8dc]">
                                        {otherUser.displayName?.[0]?.toUpperCase() || "?"}
                                    </span>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-[#e9edef] truncate text-base">
                                        {otherUser.displayName || "Unknown"}
                                    </h3>
                                    <span className="text-xs text-[#8696a0] ml-2 flex-shrink-0">
                                        {/* Time placeholder */}
                                    </span>
                                </div>
                                <p className="text-sm text-[#8696a0] truncate mt-0.5">
                                    {otherUser.email}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
