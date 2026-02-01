"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    return (
        <nav className="fixed w-full z-50 bg-[#111b21]/90 backdrop-blur-md border-b border-[#2a3942]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Chatbook" className="h-8 w-auto" />
                        <span className="text-xl font-bold text-white tracking-tight">Chatbook</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-[#aebac1] hover:text-white transition-colors text-sm font-medium">
                            Home
                        </Link>
                        <Link href="/blog" className="text-[#aebac1] hover:text-white transition-colors text-sm font-medium">
                            Blog
                        </Link>
                        <Link href="/privacy" className="text-[#aebac1] hover:text-white transition-colors text-sm font-medium">
                            Privacy
                        </Link>
                        <Link href="/contact" className="text-[#aebac1] hover:text-white transition-colors text-sm font-medium">
                            Contact
                        </Link>

                        <Link
                            href={user ? "/web" : "/login"}
                            className="px-5 py-2.5 bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] rounded-full font-bold text-sm transition-all shadow-lg shadow-[#00a884]/20"
                        >
                            {user ? "Open Web" : "Get Started"}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-[#aebac1] hover:text-white p-2"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-[#202c33] border-b border-[#2a3942]">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 text-[#e9edef] hover:bg-[#2a3942] rounded-md"
                        >
                            Home
                        </Link>
                        <Link
                            href="/blog"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 text-[#e9edef] hover:bg-[#2a3942] rounded-md"
                        >
                            Blog
                        </Link>
                        <Link
                            href="/privacy"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 text-[#e9edef] hover:bg-[#2a3942] rounded-md"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/contact"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 text-[#e9edef] hover:bg-[#2a3942] rounded-md"
                        >
                            Contact
                        </Link>
                        <div className="pt-4">
                            <Link
                                href={user ? "/web" : "/login"}
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-center px-5 py-3 bg-[#00a884] text-[#111b21] rounded-full font-bold"
                            >
                                {user ? "Open Chatbook Web" : "Login / Sign Up"}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
