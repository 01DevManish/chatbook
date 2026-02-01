"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Chat/Sidebar";
import ChatWindow from "@/components/Chat/ChatWindow";
import { cn } from "@/lib/utils";

interface UserData {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    username?: string;
    lastSeen?: number;
}

function WebContent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedUserId = searchParams.get('chat');
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    // Sync URL -> State
    useEffect(() => {
        if (selectedUserId) {
            const fetchUser = async () => {
                // Dynamic imports for performance
                const { ref, get } = await import("firebase/database");
                const { rtdb } = await import("@/lib/firebase");
                const snap = await get(ref(rtdb, `users/${selectedUserId}`));
                if (snap.exists()) {
                    setSelectedUser({ uid: selectedUserId, ...snap.val() });
                }
            };

            fetchUser();
        } else {
            setSelectedUser(null);
        }
    }, [selectedUserId]);

    // Redirect to Login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login"); // Or maybe back to landing page? No, login is correct for app access
        }
    }, [user, loading, router]);

    const handleSelectUser = (u: UserData) => {
        router.push(`/chat?chat=${u.uid}`, { scroll: false });
        setSelectedUser(u);
    };

    const handleBack = () => {
        router.back();
    };

    if (loading || !user) {
        return (
            <div className="flex h-[100dvh] items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                    <p className="text-gray-500 text-sm">Loading Chatbook...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-[#111b21] safe-area-top">
            <div className="flex w-full max-w-[1600px] mx-auto shadow-2xl h-full">

                {/* Sidebar */}
                <div
                    className={cn(
                        "flex-shrink-0 bg-[#111b21] border-r border-[#2a3942] transition-all duration-200 ease-in-out",
                        "w-full",
                        "sm:w-[360px]",
                        "lg:w-[400px] xl:w-[30%] xl:max-w-[450px]",
                        selectedUser ? "hidden sm:flex" : "flex"
                    )}
                >
                    <Sidebar
                        selectedUser={selectedUser}
                        onSelectUser={handleSelectUser}
                    />
                </div>

                {/* Chat Window */}
                <div
                    className={cn(
                        "flex-1 flex-col bg-[#0b141a] min-w-0 transition-all duration-200 ease-in-out",
                        selectedUser ? "flex" : "hidden sm:flex"
                    )}
                >
                    {selectedUser ? (
                        <ChatWindow
                            selectedUser={selectedUser}
                            onBack={handleBack}
                        />
                    ) : (
                        <div className="hidden h-full flex-col items-center justify-center text-center sm:flex bg-[#222e35]">
                            <div className="max-w-md px-8">
                                <div className="mb-6 flex justify-center">
                                    <img
                                        src="/logo.png"
                                        alt="Chatbook"
                                        className="w-24 h-24 opacity-80"
                                    />
                                </div>
                                <h2 className="text-2xl font-light text-[#e9edef] mb-3">
                                    Chatbook Web
                                </h2>
                                <p className="text-sm text-[#8696a0] leading-relaxed">
                                    Send and receive messages without keeping your phone online.
                                    <br />
                                    Use Chatbook on up to 4 linked devices.
                                </p>
                                <div className="mt-8 pt-6 border-t border-[#2a3942]">
                                    <p className="text-xs text-[#667781] flex items-center justify-center gap-2">
                                        <span className="inline-block w-4 h-4">🔒</span>
                                        End-to-end encrypted
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function WebPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WebContent />
        </Suspense>
    );
}
