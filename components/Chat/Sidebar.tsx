"use client";

import { useEffect, useState, useRef } from "react";
import { ref, onValue, update, get, query, limitToLast, orderByChild } from "firebase/database";
import { rtdb, auth, storage, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { LogOut, User as UserIcon, RefreshCw, Search, MoreVertical, Camera, UserPlus, Users as GroupIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import AddContactModal from "@/components/Chat/AddContactModal";
import CreateGroupModal from "@/components/Chat/CreateGroupModal";
import SettingsModal from "@/components/Chat/SettingsModal";
import { sendPushNotification } from "@/lib/sendNotification";

interface UserData {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    username?: string;
    // Group fields
    isGroup?: boolean;
    id?: string;
    participants?: Record<string, boolean>;
    lastMessage?: string;
    lastMessageSenderId?: string;
    lastMessageTimestamp?: number;
    unreadCount?: number;
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
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    // Pull to refresh logic
    const [pullDiff, setPullDiff] = useState(0);
    const touchStartY = useRef(0);
    const listRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Fetch Contacts ONLY from Realtime Database
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const contactsRef = ref(rtdb, `users/${user.uid}/contacts`);
        const groupsRef = ref(rtdb, `users/${user.uid}/groups`);

        const unsubscribe = onValue(contactsRef, async (contactSnapshot) => {
            const loadedContacts: UserData[] = [];
            if (contactSnapshot.exists()) {
                const contactsData = contactSnapshot.val();
                const contactIds = Object.keys(contactsData);

                for (const contactId of contactIds) {
                    const userSnap = await get(ref(rtdb, `users/${contactId}`));
                    if (userSnap.exists()) {
                        loadedContacts.push({
                            uid: contactId,
                            ...userSnap.val()
                        });
                    }
                }
            }

            // Sync with groups
            onValue(groupsRef, async (groupSnapshot) => {
                const loadedGroups: UserData[] = [];
                if (groupSnapshot.exists()) {
                    const groupIds = Object.keys(groupSnapshot.val());
                    for (const groupId of groupIds) {
                        const groupSnap = await get(ref(rtdb, `groups/${groupId}`));
                        if (groupSnap.exists()) {
                            const gData = groupSnap.val();
                            loadedGroups.push({
                                uid: groupId,
                                displayName: gData.name,
                                photoURL: gData.photoURL,
                                isGroup: true,
                                ...gData
                            });
                        }
                    }
                }

                const allItems = [...loadedContacts, ...loadedGroups];
                setUsers(allItems);
                setLoading(false);
            }, { onlyOnce: false });

        }, (error) => {
            console.error("Error fetching contacts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch Last Message & Unread Counts for each user
    useEffect(() => {
        if (!user || users.length === 0) return;

        const unsubscribes: (() => void)[] = [];

        users.forEach((contact) => {
            const chatId = contact.isGroup
                ? contact.uid
                : [user.uid, contact.uid].sort().join("_");

            const messagesRef = query(ref(rtdb, `chats/${chatId}/messages`), limitToLast(50));

            const unsub = onValue(messagesRef, (snapshot) => {
                let lastMsg: any = null;
                let unreadProxy = 0;

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const messages = Object.values(data);

                    // Get last message
                    lastMsg = messages[messages.length - 1];

                    // Calculate unread count (messages aimed at ME that are NOT read)
                    unreadProxy = messages.filter((m: any) =>
                        m.receiverId === user.uid && !m.read
                    ).length;
                }

                setUsers(prev => prev.map(u => {
                    if (u.uid === contact.uid) {
                        return {
                            ...u,
                            lastMessage: lastMsg ? (lastMsg.text || (lastMsg.image ? "📷 Image" : "")) : "",
                            lastMessageSenderId: lastMsg?.senderId,
                            lastMessageTimestamp: lastMsg?.timestamp,
                            unreadCount: unreadProxy
                        };
                    }
                    return u;
                }));
            });

            unsubscribes.push(unsub);
        });

        return () => {
            unsubscribes.forEach(u => u());
        };
    }, [users.length]); // Re-run only if user list filtered length changes (simplification, ideally check IDs)

    // Listen for typing status
    useEffect(() => {
        if (!user || users.length === 0) return;

        const unsubscribes: (() => void)[] = [];

        users.forEach(otherUser => {
            const chatId = otherUser.isGroup
                ? otherUser.uid
                : [user.uid, otherUser.uid].sort().join("_");

            // For groups, typing indicator is complex, simplified for 1:1
            if (otherUser.isGroup) return;

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

        return () => unsubscribes.forEach(unsub => unsub());
    }, [users.length]); // Simplified dependency

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            const file = e.target.files[0];
            setUploading(true);
            try {
                const imageRef = storageRef(storage, `profile_images/${user.uid}`);
                await uploadBytes(imageRef, file);
                const downloadURL = await getDownloadURL(imageRef);
                await updateProfile(user, { photoURL: downloadURL });
                await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL });
                await update(ref(rtdb, `users/${user.uid}`), { photoURL: downloadURL });
            } catch (error) {
                console.error("Error uploading image:", error);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        router.push("/login");
    };

    // Sort users: Typing > Unread > Last Message > Name
    const sortedUsers = [...users].sort((a, b) => {
        const aTyping = typingUsers[a.uid];
        const bTyping = typingUsers[b.uid];
        if (aTyping && !bTyping) return -1;
        if (!aTyping && bTyping) return 1;

        if ((a.lastMessageTimestamp || 0) > (b.lastMessageTimestamp || 0)) return -1;
        if ((a.lastMessageTimestamp || 0) < (b.lastMessageTimestamp || 0)) return 1;

        return (a.displayName || "").localeCompare(b.displayName || "");
    });

    const filteredUsers = sortedUsers.filter((u) =>
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString();
    };

    const testNotification = async () => {
        if ("Notification" in window) {
            const perm = await Notification.requestPermission();
            if (perm === "granted") {
                new Notification("Test Notification", {
                    body: "This is a test notification from Sidebar!",
                    icon: "/logo.png"
                });
            } else {
                alert("Notification permission denied!");
            }
        }
    };

    return (
        <div className="flex h-full w-full flex-col bg-[#111b21]">
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
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsAddContactOpen(true)} className="rounded-full p-2 text-[#aebac1] hover:bg-[#374248] transition-colors" title="New Chat">
                        <UserPlus size={20} />
                    </button>
                    <button onClick={handleLogout} className="rounded-full p-2 text-[#aebac1] hover:bg-[#374248] transition-colors" title="Logout">
                        <LogOut size={20} />
                    </button>
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="rounded-full p-2 text-[#aebac1] hover:bg-[#374248] transition-colors">
                            <MoreVertical size={20} />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-10 w-48 bg-[#233138] rounded-md shadow-xl py-2 z-50">
                                <button onClick={() => { setShowMenu(false); setIsCreateGroupOpen(true); }} className="w-full text-left px-4 py-3 text-[#e9edef] hover:bg-[#182229] transition-colors text-sm">New Group</button>
                                <button onClick={() => { setShowMenu(false); setIsSettingsOpen(true); }} className="w-full text-left px-4 py-3 text-[#e9edef] hover:bg-[#182229] transition-colors text-sm">Settings</button>
                                <button onClick={() => { setShowMenu(false); testNotification(); }} className="w-full text-left px-4 py-3 text-[#e9edef] hover:bg-[#182229] transition-colors text-sm">Test Notification</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-3 py-2 bg-[#111b21]">
                <div className="flex items-center bg-[#202c33] rounded-lg px-4 py-2">
                    <Search size={18} className="text-[#8696a0] mr-4" />
                    <input type="text" placeholder="Search or start new chat" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-[#e9edef] placeholder-[#8696a0] text-sm outline-none" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <RefreshCw className="animate-spin text-[#8696a0]" size={24} />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-[#8696a0] p-4 text-center">
                        <UserIcon size={32} className="mb-2 opacity-50" />
                        <p>{searchQuery ? "No users found" : "No contacts yet."}</p>
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
                            <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-[#6b7c85] overflow-hidden mr-3">
                                {otherUser.photoURL ? (
                                    <img src={otherUser.photoURL} alt={otherUser.displayName} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-lg font-medium text-[#cfd8dc]">
                                        {otherUser.isGroup ? <GroupIcon size={24} /> : (otherUser.displayName?.[0]?.toUpperCase() || "?")}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-[#e9edef] truncate text-base">
                                        {otherUser.displayName || "Unknown"}
                                    </h3>
                                    <span className="text-xs text-[#8696a0] ml-2 flex-shrink-0">
                                        {formatTime(otherUser.lastMessageTimestamp)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                    <div className="truncate flex-1 pr-2">
                                        {typingUsers[otherUser.uid] ? (
                                            <p className="text-sm text-[#25d366] font-medium truncate">typing...</p>
                                        ) : (
                                            <p className="text-sm text-[#8696a0] truncate">
                                                {/* Show sender prefix only if it's the current user sending, OR for groups show sender name */}
                                                {otherUser.lastMessageSenderId === user?.uid && <span className="text-[#8696a0] mr-1">You:</span>}
                                                {otherUser.lastMessage || otherUser.email}
                                            </p>
                                        )}
                                    </div>
                                    {/* Unread Badge */}
                                    {!!otherUser.unreadCount && otherUser.unreadCount > 0 && (
                                        <div className="flex-shrink-0 bg-[#25d366] text-[#111b21] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                            {otherUser.unreadCount > 99 ? '99+' : otherUser.unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AddContactModal isOpen={isAddContactOpen} onClose={() => setIsAddContactOpen(false)} />
            <CreateGroupModal isOpen={isCreateGroupOpen} onClose={() => setIsCreateGroupOpen(false)} />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
}
