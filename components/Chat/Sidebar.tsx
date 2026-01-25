"use client";

import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { rtdb, auth, storage, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { LogOut, User as UserIcon, RefreshCw, Search, MoreVertical, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useRef } from "react"; // Added missing import

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
    const [uploading, setUploading] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
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
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Listen for typing status from ALL chats I'm involved in
    useEffect(() => {
        if (!user || users.length === 0) return;

        const typingStatus: Record<string, boolean> = {};
        const unsubscribes: (() => void)[] = [];

        users.forEach(otherUser => {
            const chatId = [user.uid, otherUser.uid].sort().join("_");
            const typingRef = ref(rtdb, `chats/${chatId}/typing/${otherUser.uid}`);

            const unsub = onValue(typingRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    if (data.timestamp && Date.now() - data.timestamp < 5000) {
                        setTypingUsers(prev => ({ ...prev, [otherUser.uid]: true }));
                    } else {
                        setTypingUsers(prev => ({ ...prev, [otherUser.uid]: false }));
                    }
                } else {
                    setTypingUsers(prev => ({ ...prev, [otherUser.uid]: false }));
                }
            });
            unsubscribes.push(unsub);
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [users, user]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            const file = e.target.files[0];
            setUploading(true);

            try {
                const imageRef = storageRef(storage, `profile_images/${user.uid}`);
                await uploadBytes(imageRef, file);
                const downloadURL = await getDownloadURL(imageRef);

                // Update Auth Profile
                await updateProfile(user, { photoURL: downloadURL });

                // Update Firestore User Document
                await updateDoc(doc(db, "users", user.uid), {
                    photoURL: downloadURL
                });

                // Update Realtime Database User Node (since we fetch users from here)
                await update(ref(rtdb, `users/${user.uid}`), {
                    photoURL: downloadURL
                });

                // Start Notification
                if (Notification.permission === "granted") {
                    new Notification("Profile Updated", { body: "Your profile photo has been updated successfully!" });
                }

            } catch (error) {
                console.error("Error uploading image:", error);
                alert("Failed to upload image. Please try again.");
            } finally {
                setUploading(false);
            }
        }
    };

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
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#6b7c85] overflow-hidden cursor-pointer">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <UserIcon size={24} className="text-[#cfd8dc]" />
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <RefreshCw className="animate-spin text-white" size={16} />
                            </div>
                        )}
                        {!uploading && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                                <Camera className="text-white" size={20} />
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
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
                                {typingUsers[otherUser.uid] ? (
                                    <p className="text-sm text-[#25d366] font-medium mt-0.5 truncate">
                                        typing...
                                    </p>
                                ) : (
                                    <p className="text-sm text-[#8696a0] truncate mt-0.5">
                                        {otherUser.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
