"use client";

import Link from "next/link";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#0b141a] text-[#8696a0] py-16 border-t border-[#2a3942]">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Brand */}
                <div className="col-span-1 md:col-span-1">
                    <Link href="/" className="flex items-center gap-2 mb-6">
                        <img src="/logo.png" alt="Chatbook" className="h-8 w-auto opacity-90" />
                        <span className="text-xl font-bold text-white">Chatbook</span>
                    </Link>
                    <p className="text-sm leading-relaxed mb-6">
                        Simple, reliable, private messaging and calling for free, available all over the world.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-[#00a884] transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="hover:text-[#00a884] transition-colors"><Github size={20} /></a>
                        <a href="#" className="hover:text-[#00a884] transition-colors"><Linkedin size={20} /></a>
                        <a href="mailto:support@chatbook.com" className="hover:text-[#00a884] transition-colors"><Mail size={20} /></a>
                    </div>
                </div>

                {/* Product */}
                <div>
                    <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-xs">Product</h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link href="/web" className="hover:text-[#00a884] transition-colors">Chat Web</Link></li>
                        <li><Link href="/features" className="hover:text-[#00a884] transition-colors">Features</Link></li>
                        <li><Link href="/security" className="hover:text-[#00a884] transition-colors">Security</Link></li>
                        <li><Link href="/download" className="hover:text-[#00a884] transition-colors">Download</Link></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-xs">Resources</h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link href="/blog" className="hover:text-[#00a884] transition-colors">Blog</Link></li>
                        <li><Link href="/help" className="hover:text-[#00a884] transition-colors">Help Center</Link></li>
                        <li><Link href="/community" className="hover:text-[#00a884] transition-colors">Community</Link></li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-xs">Legal</h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link href="/privacy" className="hover:text-[#00a884] transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-[#00a884] transition-colors">Terms of Service</Link></li>
                        <li><Link href="/cookies" className="hover:text-[#00a884] transition-colors">Cookie Policy</Link></li>
                        <li><Link href="/contact" className="hover:text-[#00a884] transition-colors">Contact Us</Link></li>
                    </ul>
                </div>

            </div>

            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-[#2a3942] text-center text-xs">
                <p>&copy; {new Date().getFullYear()} Chatbook. All rights reserved.</p>
            </div>
        </footer>
    );
}
