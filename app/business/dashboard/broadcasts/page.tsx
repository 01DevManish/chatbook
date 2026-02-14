"use client";

import { useState } from "react";
import { Send, Plus, Search, Calendar, Clock, CheckCircle2, XCircle, Loader2, Eye, Users, Filter } from "lucide-react";

const broadcasts = [
    { id: 1, name: "Diwali Sale 2026", status: "sent", audience: 12450, sent: 12450, delivered: 12100, read: 9800, date: "2026-01-15", time: "10:00 AM" },
    { id: 2, name: "New Year Offers", status: "sent", audience: 8200, sent: 8200, delivered: 7980, read: 6100, date: "2026-01-01", time: "12:00 PM" },
    { id: 3, name: "February Flash Sale", status: "scheduled", audience: 15000, sent: 0, delivered: 0, read: 0, date: "2026-02-20", time: "09:00 AM" },
    { id: 4, name: "Valentine's Special", status: "draft", audience: 0, sent: 0, delivered: 0, read: 0, date: "", time: "" },
    { id: 5, name: "Republic Day Campaign", status: "sent", audience: 10500, sent: 10500, delivered: 10200, read: 8400, date: "2026-01-26", time: "08:00 AM" },
    { id: 6, name: "Budget Deals March", status: "failed", audience: 5000, sent: 5000, delivered: 2100, read: 0, date: "2026-02-10", time: "11:00 AM" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    sent: { label: "Sent", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
    scheduled: { label: "Scheduled", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
    draft: { label: "Draft", color: "bg-slate-50 text-slate-600 border-slate-200", icon: Loader2 },
    failed: { label: "Failed", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

export default function BroadcastsPage() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [showCreate, setShowCreate] = useState(false);

    const filtered = broadcasts.filter(b =>
        (filter === "all" || b.status === filter) &&
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Broadcasts</h1>
                    <p className="text-slate-500 text-sm mt-1">Send personalized campaigns to your audience</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#25d366] text-white rounded-xl font-medium hover:bg-[#1da851] transition-all shadow-lg shadow-green-500/20"
                >
                    <Plus className="w-4 h-4" /> New Broadcast
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 animate-in slide-in-from-top-2">
                    <h3 className="font-bold text-slate-900">Create New Broadcast</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Campaign Name</label>
                            <input type="text" placeholder="e.g. Summer Sale 2026" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 focus:border-[#25d366] text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Template</label>
                            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 text-sm bg-white">
                                <option>Select a template</option>
                                <option>order_confirmation</option>
                                <option>promotional_offer</option>
                                <option>welcome_message</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Audience</label>
                            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 text-sm bg-white">
                                <option>All Contacts (12,450)</option>
                                <option>VIP Customers (2,100)</option>
                                <option>New Users (3,500)</option>
                                <option>Inactive Users (1,800)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Schedule</label>
                            <input type="datetime-local" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 text-sm" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button className="px-5 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-medium hover:bg-[#1da851] transition-colors">
                            <Send className="w-4 h-4 inline mr-1.5" />Send Now
                        </button>
                        <button className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
                            <Calendar className="w-4 h-4 inline mr-1.5" />Schedule
                        </button>
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
                        placeholder="Search broadcasts..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 focus:border-[#25d366] text-sm bg-white"
                    />
                </div>
                <div className="flex gap-2">
                    {["all", "sent", "scheduled", "draft", "failed"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-[#25d366] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Campaign</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Sent</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Delivered</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Read</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((b) => {
                                const sc = statusConfig[b.status];
                                return (
                                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900 text-sm">{b.name}</p>
                                            <p className="text-xs text-slate-500">Audience: {b.audience > 0 ? b.audience.toLocaleString() : '—'}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.color}`}>
                                                <sc.icon className="w-3 h-3" /> {sc.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right text-sm font-medium text-slate-700">{b.sent > 0 ? b.sent.toLocaleString() : '—'}</td>
                                        <td className="px-4 py-4 text-right text-sm font-medium text-slate-700">{b.delivered > 0 ? b.delivered.toLocaleString() : '—'}</td>
                                        <td className="px-4 py-4 text-right text-sm text-slate-700">
                                            {b.read > 0 ? (
                                                <span className="font-medium">{((b.read / b.sent) * 100).toFixed(1)}%</span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-500">
                                            {b.date ? <>{b.date}<br /><span className="text-xs">{b.time}</span></> : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
