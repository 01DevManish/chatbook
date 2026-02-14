"use client";

import { useState } from "react";
import { Plus, Search, MessageSquare, CheckCircle2, Clock, XCircle, Eye, Copy, Image, FileText, Link2 } from "lucide-react";

const templates = [
    {
        id: 1, name: "order_confirmation", category: "Utility", status: "approved", language: "en",
        header: "Order Confirmed! 🎉",
        body: "Hi {{1}}, your order #{{2}} has been confirmed. Expected delivery: {{3}}. Track your order here.",
        footer: "ChatMitra Business",
        buttons: ["Track Order", "Contact Support"]
    },
    {
        id: 2, name: "promotional_offer", category: "Marketing", status: "approved", language: "en",
        header: "🎊 Special Offer Just For You!",
        body: "Hey {{1}}! Don't miss our {{2}} sale — up to {{3}}% off on everything! Use code: {{4}}. Offer ends {{5}}.",
        footer: "Reply STOP to opt out",
        buttons: ["Shop Now", "View Offers"]
    },
    {
        id: 3, name: "welcome_message", category: "Marketing", status: "approved", language: "en",
        header: "Welcome to {{1}}! 👋",
        body: "Hi {{1}}, thanks for joining us! We're excited to have you. Here's what you can do:\n✅ Browse products\n✅ Track orders\n✅ Get instant support",
        footer: "ChatMitra Business",
        buttons: ["Get Started"]
    },
    {
        id: 4, name: "payment_reminder", category: "Utility", status: "pending", language: "en",
        header: "Payment Reminder 💳",
        body: "Hi {{1}}, this is a friendly reminder that your payment of ₹{{2}} is due on {{3}}. Please complete your payment to avoid any disruption.",
        footer: "",
        buttons: ["Pay Now"]
    },
    {
        id: 5, name: "feedback_request", category: "Marketing", status: "rejected", language: "en",
        header: "How was your experience? ⭐",
        body: "Hi {{1}}, we'd love to hear about your recent experience with order #{{2}}. Your feedback helps us improve!",
        footer: "ChatMitra Business",
        buttons: ["Rate Us", "Skip"]
    },
    {
        id: 6, name: "otp_verification", category: "Authentication", status: "approved", language: "en",
        header: "",
        body: "Your verification code is {{1}}. This code expires in 10 minutes. Do not share this code with anyone.",
        footer: "",
        buttons: ["Copy Code"]
    },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    approved: { label: "Approved", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
    pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    rejected: { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

const categoryColors: Record<string, string> = {
    Marketing: "bg-purple-50 text-purple-700",
    Utility: "bg-blue-50 text-blue-700",
    Authentication: "bg-orange-50 text-orange-700",
};

export default function TemplatesPage() {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [showCreate, setShowCreate] = useState(false);

    const filtered = templates.filter(t =>
        (categoryFilter === "all" || t.category === categoryFilter) &&
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your WhatsApp message templates</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#25d366] text-white rounded-xl font-medium hover:bg-[#1da851] transition-all shadow-lg shadow-green-500/20"
                >
                    <Plus className="w-4 h-4" /> Create Template
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-slate-900">Create New Template</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Template Name</label>
                            <input type="text" placeholder="e.g. order_update" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 focus:border-[#25d366] text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 text-sm bg-white">
                                <option>Marketing</option>
                                <option>Utility</option>
                                <option>Authentication</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Header (optional)</label>
                        <input type="text" placeholder="e.g. Your order is ready! 🎉" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Body</label>
                        <textarea rows={4} placeholder="Use {{1}}, {{2}} for dynamic variables..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 text-sm resize-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Footer (optional)</label>
                        <input type="text" placeholder="e.g. ChatMitra Business" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 text-sm" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button className="px-5 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-medium hover:bg-[#1da851] transition-colors">Submit for Approval</button>
                        <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 text-slate-500 text-sm hover:text-slate-700">Cancel</button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search templates..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 focus:border-[#25d366] text-sm bg-white"
                    />
                </div>
                <div className="flex gap-2">
                    {["all", "Marketing", "Utility", "Authentication"].map(c => (
                        <button
                            key={c}
                            onClick={() => setCategoryFilter(c)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${categoryFilter === c ? 'bg-[#25d366] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                        >
                            {c === "all" ? "All" : c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Template Cards */}
            <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((t) => {
                    const sc = statusConfig[t.status];
                    return (
                        <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{t.name}</h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoryColors[t.category] || 'bg-slate-100 text-slate-700'}`}>
                                                {t.category}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${sc.color}`}>
                                                <sc.icon className="w-2.5 h-2.5" /> {sc.label}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Copy">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Preview */}
                                <div className="bg-[#e5ddd5] rounded-xl p-3 mt-3">
                                    <div className="bg-[#dcf8c6] rounded-lg p-3 max-w-[90%] ml-auto shadow-sm">
                                        {t.header && <p className="font-semibold text-sm text-slate-900 mb-1">{t.header}</p>}
                                        <p className="text-sm text-slate-800 whitespace-pre-line">{t.body}</p>
                                        {t.footer && <p className="text-[10px] text-slate-500 mt-2">{t.footer}</p>}
                                        {t.buttons.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-green-200 space-y-1">
                                                {t.buttons.map((btn, bi) => (
                                                    <div key={bi} className="text-center text-xs text-blue-600 font-medium py-1">
                                                        {btn}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
