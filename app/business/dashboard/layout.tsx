"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Send, MessageSquare, Users, Bot, BarChart3,
    Settings, Bell, ChevronLeft, Menu, LogOut, Inbox
} from "lucide-react";
import { useState } from "react";

const sidebarLinks = [
    { href: "/business/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/business/dashboard/inbox", label: "Inbox", icon: Inbox },
    { href: "/business/dashboard/broadcasts", label: "Broadcasts", icon: Send },
    { href: "/business/dashboard/templates", label: "Templates", icon: MessageSquare },
    { href: "/business/dashboard/contacts", label: "Contacts", icon: Users },
    { href: "/business/dashboard/chatbot", label: "Chatbot", icon: Bot },
    { href: "/business/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/business/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#f8fafb]">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0b1a1f] flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <Link href="/business" className="flex items-center gap-2.5">
                        <div className="bg-[#25d366] p-1.5 rounded-lg">
                            <MessageSquare className="text-white w-4 h-4" />
                        </div>
                        <span className="font-bold text-white text-lg">ChatMitra</span>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white p-1">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/business/dashboard" && pathname?.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? "bg-[#25d366] text-white shadow-lg shadow-green-500/20"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <link.icon className="w-[18px] h-[18px]" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">B</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">Business Corp</p>
                            <p className="text-xs text-slate-500 truncate">Pro Plan</p>
                        </div>
                        <button className="text-slate-500 hover:text-white transition-colors p-1" title="Logout">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 lg:px-8 h-14 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
