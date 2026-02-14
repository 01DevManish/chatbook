"use client";

import { useState } from "react";
import { Search, Plus, Upload, Tag, Users, UserPlus, Phone, Mail, MoreVertical, Filter, Download, Trash2 } from "lucide-react";

const contacts = [
    { id: 1, name: "Rahul Sharma", phone: "+91 98765 43210", email: "rahul@example.com", tags: ["VIP", "Active"], lastMessage: "2h ago", messages: 45, status: "active" },
    { id: 2, name: "Priya Patel", phone: "+91 87654 32109", email: "priya@example.com", tags: ["New"], lastMessage: "15m ago", messages: 12, status: "active" },
    { id: 3, name: "Amit Kumar", phone: "+91 76543 21098", email: "amit@example.com", tags: ["VIP"], lastMessage: "1d ago", messages: 89, status: "active" },
    { id: 4, name: "Sneha Gupta", phone: "+91 65432 10987", email: "sneha@example.com", tags: ["Inactive"], lastMessage: "7d ago", messages: 23, status: "inactive" },
    { id: 5, name: "Vikash Singh", phone: "+91 54321 09876", email: "vikash@example.com", tags: ["Premium"], lastMessage: "3h ago", messages: 67, status: "active" },
    { id: 6, name: "Anita Verma", phone: "+91 43210 98765", email: "anita@example.com", tags: ["New"], lastMessage: "5m ago", messages: 3, status: "active" },
    { id: 7, name: "Deepak Joshi", phone: "+91 32109 87654", email: "deepak@example.com", tags: ["VIP", "Premium"], lastMessage: "2d ago", messages: 112, status: "active" },
    { id: 8, name: "Kavita Rao", phone: "+91 21098 76543", email: "kavita@example.com", tags: ["Inactive"], lastMessage: "30d ago", messages: 8, status: "inactive" },
];

const tagColors: Record<string, string> = {
    VIP: "bg-amber-50 text-amber-700 border-amber-200",
    Active: "bg-green-50 text-green-700 border-green-200",
    New: "bg-blue-50 text-blue-700 border-blue-200",
    Premium: "bg-purple-50 text-purple-700 border-purple-200",
    Inactive: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function ContactsPage() {
    const [search, setSearch] = useState("");
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

    const filtered = contacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
    );

    const toggleSelect = (id: number) => {
        setSelectedContacts(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedContacts.length === filtered.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(filtered.map(c => c.id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your customer contacts</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm">
                        <Upload className="w-4 h-4" /> Import CSV
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#25d366] text-white rounded-xl font-medium hover:bg-[#1da851] transition-all shadow-lg shadow-green-500/20 text-sm">
                        <UserPlus className="w-4 h-4" /> Add Contact
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">Total Contacts</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">12,450</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">Active</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">10,890</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">New This Month</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">1,240</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">Opted Out</p>
                    <p className="text-2xl font-bold text-slate-400 mt-1">320</p>
                </div>
            </div>

            {/* Search + Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or phone..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 focus:border-[#25d366] text-sm bg-white"
                    />
                </div>
                {selectedContacts.length > 0 && (
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                            <Tag className="w-3.5 h-3.5" /> Add Tag
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                            <Download className="w-3.5 h-3.5" /> Export
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedContacts.length === filtered.length && filtered.length > 0}
                                        onChange={toggleAll}
                                        className="rounded border-slate-300 text-[#25d366] focus:ring-[#25d366]"
                                    />
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Contact</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Phone</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Tags</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Last Message</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Messages</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedContacts.includes(c.id)}
                                            onChange={() => toggleSelect(c.id)}
                                            className="rounded border-slate-300 text-[#25d366] focus:ring-[#25d366]"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-xs font-bold">{c.name.split(' ').map(n => n[0]).join('')}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                                                <p className="text-xs text-slate-500">{c.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-700 font-mono">{c.phone}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 flex-wrap">
                                            {c.tags.map((tag) => (
                                                <span key={tag} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${tagColors[tag] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{c.lastMessage}</td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-700">{c.messages}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
