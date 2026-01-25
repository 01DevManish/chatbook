"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Chat/Sidebar";
import ChatWindow from "@/components/Chat/ChatWindow";
import { DocumentData } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<DocumentData | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar - Hidden on mobile if chat is open */}
      <div
        className={cn(
          "w-full md:w-80 flex-shrink-0 bg-white transition-all duration-300",
          selectedUser ? "hidden md:flex" : "flex"
        )}
      >
        <Sidebar
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
      </div>

      {/* Chat Window - Hidden on mobile if no chat selected */}
      <div
        className={cn(
          "flex-1 flex-col bg-gray-200 transition-all duration-300",
          selectedUser ? "flex" : "hidden md:flex"
        )}
      >
        {selectedUser ? (
          <ChatWindow
            selectedUser={selectedUser}
            onBack={() => setSelectedUser(null)}
          />
        ) : (
          <div className="hidden h-full flex-col items-center justify-center text-center text-gray-500 md:flex">
            <div className="mb-4 rounded-full bg-gray-300 p-6">
              <span className="text-4xl">💬</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-700">
              Welcome to Chatbook
            </h2>
            <p className="mt-2 text-sm">
              Select a chat to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
