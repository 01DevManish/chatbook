"use client";

import { useEffect, useState } from "react";
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

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get('chat');

  // We need to fetch/have access to the user list to hydrate selectedUser from ID
  // But Sidebar handles fetching users. 
  // Solution: Lift user state or fetch specific user if ID exists?
  // Easier: Just pass the ID to Sidebar/ChatWindow and let them handle it?
  // Or: Let's fetch the selected User Data if we have an ID but no object.
  // Actually, standard pattern: Sidebar has the list. 
  // Let's keep it simple: When Sidebar selects, we do router.push('?chat=uid').
  // Then we need to know the UserData for that UID.
  // We can fetch it or find it. 
  // Let's modify Sidebar to take `selectedUserId` string instead of object.

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Sync URL -> State
  useEffect(() => {
    if (selectedUserId) {
      // We need to get the user data. 
      // For now, if we don't have it, we might show loading or fetch it.
      // Let's simple fetch it from RTDB if missing?
      // Or wait for Sidebar to pass it back?
      // Let's implement a direct fetch here to ensure deep linking works.
      // Actually, just passing ID to ChatWindow is enough if ChatWindow fetches?
      // No, ChatWindow expects object.
      // Let's fetch it.
      const fetchUser = async () => {
        // Import these dynamically or move imports up? 
        // We need rtdb/ref/get
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

  const handleSelectUser = (u: UserData) => {
    // Push state so back button works
    router.push(`/?chat=${u.uid}`);
    setSelectedUser(u);
  };

  const handleBack = () => {
    router.push('/');
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen h-[100dvh] items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="text-gray-500 text-sm">Loading Chatbook...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-[#111b21] safe-area-top">
      {/* Container with max width for large screens */}
      <div className="flex w-full max-w-[1600px] mx-auto shadow-2xl h-full">

        {/* Sidebar - WhatsApp style */}
        <div
          className={cn(
            "flex-shrink-0 bg-[#111b21] border-r border-[#2a3942] transition-all duration-200 ease-in-out",
            // Mobile: full width, hidden when chat open
            "w-full",
            // Tablet: Fixed width, slightly wider for better read
            "sm:w-[360px]",
            // Desktop: Fluid width, max 450px for premium feel
            "lg:w-[400px] xl:w-[30%] xl:max-w-[450px]",
            // Hide on mobile when chat is selected
            selectedUser ? "hidden sm:flex" : "flex"
          )}
        >
          <Sidebar
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
          />
        </div>

        {/* Chat Window - WhatsApp style */}
        <div
          className={cn(
            "flex-1 flex-col bg-[#0b141a] min-w-0 transition-all duration-200 ease-in-out",
            // Show/hide based on selection
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
              {/* WhatsApp-style empty state */}
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
                  Use Chatbook on up to 4 linked devices and 1 phone at the same time.
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
