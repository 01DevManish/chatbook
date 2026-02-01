"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Settings,
    BarChart3,
    Clock,
    Zap,
    Bell,
    CheckCircle2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', messages: 400 },
    { name: 'Tue', messages: 300 },
    { name: 'Wed', messages: 550 },
    { name: 'Thu', messages: 450 },
    { name: 'Fri', messages: 700 },
    { name: 'Sat', messages: 350 },
    { name: 'Sun', messages: 200 },
];

export default function BusinessDashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar dashboard */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-slate-300 flex flex-col z-10">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="bg-blue-600 w-2 h-2 rounded-full inline-block"></span>
                        Admin Panel
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "overview" ? "bg-blue-600 text-white" : "hover:bg-slate-800"}`}
                    >
                        <LayoutDashboard size={18} /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "analytics" ? "bg-blue-600 text-white" : "hover:bg-slate-800"}`}
                    >
                        <BarChart3 size={18} /> Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab("automation")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "automation" ? "bg-blue-600 text-white" : "hover:bg-slate-800"}`}
                    >
                        <Zap size={18} /> Automation
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                            <span className="text-white font-bold">B</span>
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">Business Corp</p>
                            <p className="text-xs text-slate-500">Pro Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-500">Welcome back, here's what's happening.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600">
                            <Bell size={20} />
                        </button>
                    </div>
                </header>

                {/* Content based on Tab - Simplified for Demo */}
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-slate-500 text-sm font-semibold uppercase">Total Messages</h3>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <MessageSquare size={20} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">12,450</p>
                            <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                                <span className="font-bold">↑ 12%</span> vs last month
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-slate-500 text-sm font-semibold uppercase">Response Time</h3>
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <Clock size={20} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">1m 30s</p>
                            <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                                <span className="font-bold">↑ 5%</span> faster
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-slate-500 text-sm font-semibold uppercase">Active Customers</h3>
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <Users size={20} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">890</p>
                            <p className="text-slate-500 text-sm mt-2">
                                Currently active
                            </p>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Message Volume</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="messages" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Automation Settings (Mock) */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Zap className="text-amber-500" />
                            <h3 className="text-lg font-bold text-slate-900">Quick Automations</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                <div>
                                    <h4 className="font-semibold text-slate-900">Away Message</h4>
                                    <p className="text-sm text-slate-500">Automatically reply when you are offline.</p>
                                </div>
                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-pointer">
                                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-blue-600 transition" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                <div>
                                    <h4 className="font-semibold text-slate-900">Greeting Message</h4>
                                    <p className="text-sm text-slate-500">Send a welcome message to new customers.</p>
                                </div>
                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 cursor-pointer">
                                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
