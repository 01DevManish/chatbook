"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Send, CheckCheck, Eye, MessageSquare, Clock, ArrowDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';

const deliveryData = [
    { name: 'Mon', sent: 2100, delivered: 2020, read: 1650, replied: 420 },
    { name: 'Tue', sent: 1800, delivered: 1720, read: 1380, replied: 360 },
    { name: 'Wed', sent: 2400, delivered: 2310, read: 1890, replied: 510 },
    { name: 'Thu', sent: 2800, delivered: 2690, read: 2200, replied: 580 },
    { name: 'Fri', sent: 3100, delivered: 2980, read: 2450, replied: 620 },
    { name: 'Sat', sent: 1500, delivered: 1440, read: 1100, replied: 280 },
    { name: 'Sun', sent: 900, delivered: 860, read: 680, replied: 170 },
];

const funnelData = [
    { name: "Sent", value: 48290, color: "#3B82F6" },
    { name: "Delivered", value: 46830, color: "#22C55E" },
    { name: "Read", value: 37850, color: "#A855F7" },
    { name: "Replied", value: 12940, color: "#F59E0B" },
];

const campaignPerf = [
    { name: "Diwali Sale", sent: 12450, delivered: 12100, read: 9800, readRate: 78.7 },
    { name: "New Year", sent: 8200, delivered: 7980, read: 6100, readRate: 74.4 },
    { name: "Republic Day", sent: 10500, delivered: 10200, read: 8400, readRate: 80.0 },
    { name: "Flash Sale", sent: 5000, delivered: 4800, read: 3600, readRate: 72.0 },
];

const responseTimeData = [
    { range: "<1m", count: 4200 },
    { range: "1-5m", count: 3100 },
    { range: "5-15m", count: 1800 },
    { range: "15-30m", count: 900 },
    { range: "30m-1h", count: 450 },
    { range: "1h+", count: 280 },
];

const stats = [
    { label: "Total Sent", value: "48,290", icon: Send, color: "bg-blue-50 text-blue-600", change: "+12.5%" },
    { label: "Delivery Rate", value: "97.0%", icon: CheckCheck, color: "bg-green-50 text-green-600", change: "+0.8%" },
    { label: "Read Rate", value: "78.4%", icon: Eye, color: "bg-purple-50 text-purple-600", change: "+3.1%" },
    { label: "Reply Rate", value: "26.8%", icon: MessageSquare, color: "bg-amber-50 text-amber-600", change: "+1.4%" },
];

export default function AnalyticsPage() {
    const [period, setPeriod] = useState("week");

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-slate-500 text-sm mt-1">Track your messaging performance</p>
                </div>
                <div className="flex bg-white border border-slate-200 rounded-xl p-0.5">
                    {["day", "week", "month"].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all ${period === p ? 'bg-[#25d366] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            {p === "day" ? "Today" : p === "week" ? "This Week" : "This Month"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-500 text-xs font-medium">{s.label}</span>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                        <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> {s.change}
                        </p>
                    </div>
                ))}
            </div>

            {/* Delivery Funnel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Delivery Funnel</h3>
                <div className="grid grid-cols-4 gap-3">
                    {funnelData.map((step, idx) => {
                        const pct = ((step.value / funnelData[0].value) * 100).toFixed(1);
                        return (
                            <div key={idx} className="text-center">
                                <div className="relative mx-auto mb-3" style={{ width: `${100 - idx * 15}%` }}>
                                    <div
                                        className="h-16 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: step.color + '15', border: `2px solid ${step.color}30` }}
                                    >
                                        <span className="text-lg font-bold" style={{ color: step.color }}>{step.value.toLocaleString()}</span>
                                    </div>
                                    {idx < funnelData.length - 1 && (
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                                            <ArrowDown className="w-4 h-4 text-slate-300" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs font-medium text-slate-700 mt-4">{step.name}</p>
                                <p className="text-[10px] text-slate-500">{pct}%</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Message Volume Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Message Volume</h3>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deliveryData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgb(0 0 0 / 0.1)', fontSize: '13px' }} />
                                <Bar dataKey="sent" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="delivered" fill="#22C55E" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="read" fill="#A855F7" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Response Time Distribution */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Response Time</h3>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={responseTimeData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                <YAxis dataKey="range" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} width={60} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgb(0 0 0 / 0.1)', fontSize: '13px' }} />
                                <Bar dataKey="count" fill="#25d366" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Campaign Performance */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 pb-4">
                    <h3 className="text-lg font-bold text-slate-900">Campaign Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-y border-slate-100">
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Campaign</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Sent</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Delivered</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Read</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Read Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {campaignPerf.map((c, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{c.name}</td>
                                    <td className="px-4 py-4 text-sm text-right text-slate-700">{c.sent.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-sm text-right text-slate-700">{c.delivered.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-sm text-right text-slate-700">{c.read.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#25d366] rounded-full" style={{ width: `${c.readRate}%` }} />
                                            </div>
                                            <span className="font-semibold text-slate-900">{c.readRate}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
