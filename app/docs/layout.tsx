"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS_CONTENT } from "@/lib/docs-content";
import { cn } from "@/lib/utils";
import { ArrowLeft, Book, Menu, X } from "lucide-react";
import { useState } from "react";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#111b21] text-[#e9edef]">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 w-full z-50 bg-[#202c33] border-b border-[#2a3942] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="text-[#aebac1]" />
                    </button>
                    <span className="font-semibold text-white">Documentation</span>
                </div>
                <Link href="/" className="text-[#00a884] font-medium text-sm">
                    Back to App
                </Link>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={cn(
                "fixed lg:static inset-y-0 left-0 w-64 bg-[#111b21] border-r border-[#2a3942] overflow-y-auto transform transition-transform duration-300 z-[60] pt-16 lg:pt-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8 hidden lg:flex">
                        <div className="p-2 bg-[#00a884]/10 rounded-lg">
                            <Book className="w-6 h-6 text-[#00a884]" />
                        </div>
                        <h1 className="text-xl font-bold text-white">Chatbook Docs</h1>
                    </div>

                    <div className="space-y-1">
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 text-[#aebac1] hover:text-white hover:bg-[#202c33] rounded-lg mb-6 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            <span>Back to App</span>
                        </Link>

                        <div className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-3 px-4">
                            Topics
                        </div>

                        {DOCS_CONTENT.map((doc) => {
                            const href = `/docs/${doc.id}`;
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={doc.id}
                                    href={href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={cn(
                                        "block px-4 py-2 rounded-lg text-sm transition-colors",
                                        isActive
                                            ? "bg-[#202c33] text-[#00a884] font-medium"
                                            : "text-[#d1d7db] hover:bg-[#202c33] hover:text-white"
                                    )}
                                >
                                    {doc.title}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full pt-16 lg:pt-0">
                <div className="max-w-4xl mx-auto p-6 lg:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
