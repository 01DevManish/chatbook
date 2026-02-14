"use client";

import { useState } from "react";
import { Bot, Plus, Play, Pause, Copy, Trash2, MessageSquare, GitBranch, Clock, Zap, Globe, ArrowRight, Settings, CheckCircle2 } from "lucide-react";

const flows = [
    {
        id: 1, name: "Welcome Flow", status: "active", triggers: "New conversation", messages: 5, interactions: 8420,
        nodes: [
            { type: "trigger", label: "New Conversation" },
            { type: "message", label: "Welcome Message" },
            { type: "buttons", label: "Choose Option" },
            { type: "condition", label: "Check Choice" },
            { type: "message", label: "Response" },
        ]
    },
    {
        id: 2, name: "Customer Support", status: "active", triggers: "Keyword: help, support", messages: 8, interactions: 5230,
        nodes: [
            { type: "trigger", label: "Keyword Match" },
            { type: "message", label: "Support Menu" },
            { type: "buttons", label: "Issue Type" },
            { type: "condition", label: "Route Agent" },
            { type: "api", label: "Create Ticket" },
        ]
    },
    {
        id: 3, name: "FAQ Bot", status: "active", triggers: "Keyword: faq, question", messages: 12, interactions: 3150,
        nodes: [
            { type: "trigger", label: "FAQ Trigger" },
            { type: "message", label: "FAQ Categories" },
            { type: "buttons", label: "Select Topic" },
            { type: "message", label: "Answer" },
        ]
    },
    {
        id: 4, name: "Order Tracking", status: "paused", triggers: "Keyword: track, order", messages: 4, interactions: 1890,
        nodes: [
            { type: "trigger", label: "Track Trigger" },
            { type: "message", label: "Ask Order ID" },
            { type: "api", label: "Fetch Status" },
            { type: "message", label: "Show Status" },
        ]
    },
    {
        id: 5, name: "Feedback Collection", status: "draft", triggers: "After purchase", messages: 3, interactions: 0,
        nodes: [
            { type: "trigger", label: "Purchase Event" },
            { type: "delay", label: "Wait 24h" },
            { type: "message", label: "Request Feedback" },
        ]
    },
];

const nodeTypeConfig: Record<string, { icon: any; color: string; bg: string }> = {
    trigger: { icon: Zap, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
    message: { icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    buttons: { icon: GitBranch, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
    condition: { icon: GitBranch, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
    api: { icon: Globe, color: "text-cyan-600", bg: "bg-cyan-50 border-cyan-200" },
    delay: { icon: Clock, color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: "Active", color: "bg-green-50 text-green-700 border-green-200" },
    paused: { label: "Paused", color: "bg-amber-50 text-amber-700 border-amber-200" },
    draft: { label: "Draft", color: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function ChatbotPage() {
    const [selectedFlow, setSelectedFlow] = useState<number | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Chatbot Builder</h1>
                    <p className="text-slate-500 text-sm mt-1">Create automated conversation flows</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#25d366] text-white rounded-xl font-medium hover:bg-[#1da851] transition-all shadow-lg shadow-green-500/20">
                    <Plus className="w-4 h-4" /> New Flow
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">Total Flows</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{flows.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">Active</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{flows.filter(f => f.status === "active").length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">Total Interactions</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{flows.reduce((a, f) => a + f.interactions, 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">Automation Rate</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">72%</p>
                </div>
            </div>

            {/* Flows Grid */}
            <div className="grid lg:grid-cols-2 gap-4">
                {flows.map((flow) => {
                    const sc = statusConfig[flow.status];
                    return (
                        <div
                            key={flow.id}
                            className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer ${selectedFlow === flow.id ? 'border-[#25d366] ring-2 ring-[#25d366]/20' : 'border-slate-100'}`}
                            onClick={() => setSelectedFlow(selectedFlow === flow.id ? null : flow.id)}
                        >
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Bot className="w-5 h-5 text-[#25d366]" />
                                            <h3 className="font-bold text-slate-900">{flow.name}</h3>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Trigger: {flow.triggers}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${sc.color}`}>
                                        {sc.label}
                                    </span>
                                </div>

                                {/* Mini flow visualization */}
                                <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1">
                                    {flow.nodes.map((node, ni) => {
                                        const nc = nodeTypeConfig[node.type];
                                        return (
                                            <div key={ni} className="flex items-center gap-1.5 flex-shrink-0">
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium ${nc.bg}`}>
                                                    <nc.icon className={`w-3 h-3 ${nc.color}`} />
                                                    <span className={nc.color}>{node.label}</span>
                                                </div>
                                                {ni < flow.nodes.length - 1 && (
                                                    <ArrowRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Stats row */}
                                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-50 text-xs text-slate-500">
                                    <span>{flow.messages} messages</span>
                                    <span>{flow.interactions.toLocaleString()} interactions</span>
                                    <div className="flex-1" />
                                    <div className="flex gap-1">
                                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title={flow.status === "active" ? "Pause" : "Activate"} onClick={e => e.stopPropagation()}>
                                            {flow.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                        </button>
                                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Duplicate" onClick={e => e.stopPropagation()}>
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Delete" onClick={e => e.stopPropagation()}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Node Types Legend */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 text-sm mb-3">Node Types</h3>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(nodeTypeConfig).map(([type, config]) => (
                        <div key={type} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${config.bg}`}>
                            <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
                            <span className={config.color}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
