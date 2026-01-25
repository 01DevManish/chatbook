"use client";

import { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    onSnapshot,
    DocumentData,
    getDocs,
    doc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { LogOut, User as UserIcon, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarProps {
    selectedUser: DocumentData | null;
    onSelectUser: (user: DocumentData) => void;
}

export default function Sidebar({ selectedUser, onSelectUser }: SidebarProps) {
    const { user } = useAuth();
    const [users, setUsers] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fetch ALL users (simple approach for testing)
    useEffect(() => {
        if (!user) {
            console.log("No current user, skipping fetch");
            return;
        }

        console.log("Current user UID:", user.uid);
        console.log("Fetching users from Firestore...");

        const unsubscribe = onSnapshot(
            collection(db, "users"),
            (snapshot) => {
                console.log("Snapshot received! Total docs:", snapshot.size);

                snapshot.docs.forEach((doc) => {
                    console.log("User doc:", doc.id, doc.data());
                });

                const userList = snapshot.docs
                    .map((doc) => doc.data())
                    .filter((u) => u.uid !== user.uid);

                console.log("Filtered user list (excluding self):", userList.length);
                setUsers(userList);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching users:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => {
        await auth.signOut();
        router.push("/login");
    };

    return (
        <div className="flex h-full w-full flex-col border-r bg-white md:w-80">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 bg-gray-50">
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-600 overflow-hidden">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <UserIcon size={24} />
                        )}
                    </div>
                    <span className="font-semibold text-gray-800 truncate max-w-[120px]">
                        {user?.displayName || "Me"}
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-200"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <RefreshCw className="animate-spin text-gray-400" size={24} />
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500 p-4 text-center">
                        <UserIcon size={32} className="mb-2 opacity-50" />
                        <p>No other users yet.</p>
                        <p className="text-xs mt-1">Ask a friend to sign up!</p>
                    </div>
                ) : (
                    users.map((otherUser) => (
                        <div
                            key={otherUser.uid}
                            onClick={() => onSelectUser(otherUser)}
                            className={cn(
                                "flex cursor-pointer items-center space-x-3 border-b p-4 transition-colors hover:bg-gray-50",
                                selectedUser?.uid === otherUser.uid && "bg-gray-100"
                            )}
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-500 overflow-hidden">
                                {otherUser.photoURL ? (
                                    <img
                                        src={otherUser.photoURL}
                                        alt={otherUser.displayName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-lg font-semibold">
                                        {otherUser.displayName?.[0]?.toUpperCase() || "?"}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">
                                    {otherUser.displayName || "Unknown"}
                                </h3>
                                <p className="text-sm text-gray-500 truncate">
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
