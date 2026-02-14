"use client";

import { MessageSquare, Send, CheckCheck, Eye, Clock, TrendingUp, ArrowUpRight, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const chartData = [
    { name: 'Mon', sent: 1240, delivered: 1180, read: 920 },
    { name: 'Tue', sent: 1580, delivered: 1520, read: 1100 },
    { name: 'Wed', sent: 1350, delivered: 1290, read: 980 },
    { name: 'Thu', sent: 2100, delivered: 2020, read: 1650 },
    { name: 'Fri', sent: 1890, delivered: 1810, read: 1420 },
    { name: 'Sat', sent: 980, delivered: 940, read: 720 },
    { name: 'Sun', sent: 650, delivered: 620, read: 480 },
];

const stats = [
    { label: "Messages Sent", value: "48,290", change: "+12.5%", up: true, icon: Send, color: "bg-blue-50 text-blue-600" },
    { label: "Delivered", value: "46,830", change: "+11.2%", up: true, icon: CheckCheck, color: "bg-green-50 text-green-600" },
    { label: "Read Rate", value: "78.4%", change: "+3.1%", up: true, icon: Eye, color: "bg-purple-50 text-purple-600" },
    { label: "Avg Response", value: "1m 24s", change: "-8.3%", up: true, icon: Clock, color: "bg-orange-50 text-orange-600" },
];

const recentConversations = [
    { name: "Rahul Sharma", message: "Thanks for the quick response!", time: "2m ago", unread: true, avatar: "RS" },
    { name: "Priya Patel", message: "When will my order be delivered?", time: "15m ago", unread: true, avatar: "PP" },
    { name: "Amit Kumar", message: "I'd like to know about premium plans", time: "1h ago", unread: false, avatar: "AK" },
    { name: "Sneha Gupta", message: "Payment confirmed, order #4521", time: "2h ago", unread: false, avatar: "SG" },
    { name: "Vikash Singh", message: "Can you help me with returns?", time: "3h ago", unread: false, avatar: "VS" },
];

export default function DashboardOverview() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Welcome back! Here&apos;s your WhatsApp Business overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-500 text-sm font-medium">{s.label}</span>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                        <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${s.up ? 'text-green-600' : 'text-red-500'}`}>
                            <TrendingUp className="w-3 h-3" /> {s.change} <span className="text-slate-400 font-normal">vs last week</span>
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Message Volume</h3>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Sent</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Delivered</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Read</span>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgb(0 0 0 / 0.1)', fontSize: '13px' }} />
                                <Area type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={2} fill="url(#colorSent)" />
                                <Area type="monotone" dataKey="delivered" stroke="#22C55E" strokeWidth={2} fill="url(#colorDelivered)" />
                                <Line type="monotone" dataKey="read" stroke="#A855F7" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Conversations */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Recent Chats</h3>
                        <button className="text-xs text-[#25d366] font-semibold hover:underline">View All</button>
                    </div>
                    <div className="space-y-1">
                        {recentConversations.map((c, i) => (
                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-bold">{c.avatar}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                                        <span className="text-[10px] text-slate-400 flex-shrink-0">{c.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{c.message}</p>
                                </div>
                                {c.unread && <span className="w-2 h-2 rounded-full bg-[#25d366] flex-shrink-0" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4">
                <button className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-md hover:border-[#25d366]/30 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                        <Send className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-slate-900 text-sm">New Broadcast</p>
                        <p className="text-xs text-slate-500">Send campaign message</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 ml-auto" />
                </button>
                <button className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-md hover:border-[#25d366]/30 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-slate-900 text-sm">Create Template</p>
                        <p className="text-xs text-slate-500">New message template</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 ml-auto" />
                </button>
                <button className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-md hover:border-[#25d366]/30 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-slate-900 text-sm">Import Contacts</p>
                        <p className="text-xs text-slate-500">Upload CSV file</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 ml-auto" />
                </button>
            </div>
        </div>
    );
}
