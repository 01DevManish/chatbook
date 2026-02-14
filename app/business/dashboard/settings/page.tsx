"use client";

import { useState } from "react";
import {
    Settings, User, Key, Globe, Users, Shield, Copy, Eye, EyeOff,
    RefreshCw, Plus, Trash2, CheckCircle2, Camera, Save, Bell, Mail
} from "lucide-react";

const teamMembers = [
    { id: 1, name: "Manish Kumar", email: "manish@business.com", role: "Admin", status: "active", avatar: "MK" },
    { id: 2, name: "Rahul Sharma", email: "rahul@business.com", role: "Agent", status: "active", avatar: "RS" },
    { id: 3, name: "Priya Patel", email: "priya@business.com", role: "Agent", status: "active", avatar: "PP" },
    { id: 4, name: "Amit Verma", email: "amit@business.com", role: "Viewer", status: "inactive", avatar: "AV" },
];

const roleColors: Record<string, string> = {
    Admin: "bg-red-50 text-red-700 border-red-200",
    Agent: "bg-blue-50 text-blue-700 border-blue-200",
    Viewer: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [showApiKey, setShowApiKey] = useState(false);
    const [copied, setCopied] = useState(false);

    const apiKey = "sk_live_chatmitra_4a8b3c2d1e0f9g8h7i6j5k4l3m2n1o0p";
    const webhookUrl = "https://yourserver.com/api/whatsapp/webhook";

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tabs = [
        { id: "profile", label: "Business Profile", icon: User },
        { id: "api", label: "API & Webhooks", icon: Key },
        { id: "team", label: "Team", icon: Users },
        { id: "notifications", label: "Notifications", icon: Bell },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your business configuration</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-[#25d366] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "profile" && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                    <h3 className="font-bold text-slate-900">Business Profile</h3>

                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center relative group">
                            <span className="text-white text-2xl font-bold">B</span>
                            <button className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">Business Corp</p>
                            <p className="text-sm text-slate-500">Upload a logo or brand image</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Name</label>
                            <input type="text" defaultValue="Business Corp" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 focus:border-[#25d366] text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
                            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 text-sm bg-white">
                                <option>E-Commerce</option>
                                <option>Healthcare</option>
                                <option>Education</option>
                                <option>Finance</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <input type="email" defaultValue="contact@business.com" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                            <input type="tel" defaultValue="+91 98765 43210" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                            <textarea rows={3} defaultValue="We are a leading e-commerce platform providing premium products to our customers across India." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 text-sm resize-none" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                            <input type="text" defaultValue="123 Business Park, Mumbai, Maharashtra 400001" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 text-sm" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#25d366] text-white rounded-xl font-medium hover:bg-[#1da851] transition-all text-sm">
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "api" && (
                <div className="space-y-4">
                    {/* API Key */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Key className="w-5 h-5 text-[#25d366]" />
                            <h3 className="font-bold text-slate-900">API Key</h3>
                        </div>
                        <p className="text-sm text-slate-500">Use this key to authenticate API requests. Keep it secret.</p>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-700 overflow-hidden">
                                {showApiKey ? apiKey : '•'.repeat(40)}
                            </div>
                            <button
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600"
                                title={showApiKey ? "Hide" : "Show"}
                            >
                                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => handleCopy(apiKey)}
                                className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600"
                                title="Copy"
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button className="p-2.5 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-slate-600" title="Regenerate">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Webhook */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-[#25d366]" />
                            <h3 className="font-bold text-slate-900">Webhook Configuration</h3>
                        </div>
                        <p className="text-sm text-slate-500">Receive real-time events when messages are sent, delivered, or read.</p>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Webhook URL</label>
                            <input type="url" defaultValue={webhookUrl} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 focus:border-[#25d366] text-sm font-mono" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Verify Token</label>
                            <input type="text" defaultValue="chatmitra_verify_token_2026" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25d366]/30 text-sm font-mono" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Events to Subscribe</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {["messages", "message_status", "message_reads", "contacts", "errors", "webhooks"].map(event => (
                                    <label key={event} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                                        <input type="checkbox" defaultChecked={event !== "webhooks"} className="rounded border-slate-300 text-[#25d366] focus:ring-[#25d366]" />
                                        <span className="text-xs font-medium text-slate-700">{event}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#25d366] text-white rounded-xl font-medium hover:bg-[#1da851] transition-all text-sm">
                                <Save className="w-4 h-4" /> Save Webhook
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "team" && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Team Members</h3>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#25d366] text-white rounded-xl font-medium hover:bg-[#1da851] transition-all text-sm">
                            <Plus className="w-4 h-4" /> Invite Member
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-y border-slate-100">
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Member</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Role</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {teamMembers.map(member => (
                                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">{member.avatar}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                                                    <p className="text-xs text-slate-500">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${roleColors[member.role]}`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`flex items-center gap-1.5 text-xs font-medium ${member.status === 'active' ? 'text-green-600' : 'text-slate-400'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                {member.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                                                    <Settings className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "notifications" && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                    <h3 className="font-bold text-slate-900">Notification Preferences</h3>

                    <div className="space-y-4">
                        {[
                            { title: "New messages", desc: "Get notified when customers send messages", enabled: true },
                            { title: "Campaign completion", desc: "When a broadcast campaign finishes sending", enabled: true },
                            { title: "Template approvals", desc: "When a template is approved or rejected", enabled: true },
                            { title: "Daily digest", desc: "Daily summary of all activities", enabled: false },
                            { title: "Weekly report", desc: "Weekly analytics report via email", enabled: true },
                            { title: "System alerts", desc: "API errors, downtime, and critical issues", enabled: true },
                        ].map((n, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900">{n.title}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                                </div>
                                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${n.enabled ? 'bg-[#25d366]' : 'bg-slate-200'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${n.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-2">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#25d366] text-white rounded-xl font-medium hover:bg-[#1da851] transition-all text-sm">
                            <Save className="w-4 h-4" /> Save Preferences
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
