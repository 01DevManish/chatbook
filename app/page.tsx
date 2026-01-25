"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
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
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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
            // Tablet: 320px width
            "sm:w-[320px]",
            // Desktop: 400px width  
            "lg:w-[400px]",
            // Hide on mobile when chat is selected
            selectedUser ? "hidden sm:flex" : "flex"
          )}
        >
          <Sidebar
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
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
              onBack={() => setSelectedUser(null)}
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
