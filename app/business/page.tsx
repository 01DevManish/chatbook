import Link from "next/link";
import {
    MessageSquare, BarChart3, ShieldCheck, Users, Bot, Send, Zap, Globe,
    CheckCircle2, ArrowRight, Star
} from "lucide-react";

const features = [
    { icon: Send, title: "Broadcast Campaigns", desc: "Send personalized messages to thousands of customers instantly with full tracking.", color: "bg-green-100 text-green-600" },
    { icon: MessageSquare, title: "Template Messages", desc: "Create pre-approved WhatsApp templates with dynamic placeholders for quick replies.", color: "bg-blue-100 text-blue-600" },
    { icon: Bot, title: "AI Chatbot Builder", desc: "Build intelligent chatbot flows for 24/7 automated customer support.", color: "bg-purple-100 text-purple-600" },
    { icon: BarChart3, title: "Real-time Analytics", desc: "Track delivery, read rates, click-through rates, and customer engagement live.", color: "bg-orange-100 text-orange-600" },
    { icon: Users, title: "Multi-Agent Chat", desc: "Manage customer conversations with multiple agents in real-time.", color: "bg-pink-100 text-pink-600" },
    { icon: Globe, title: "REST API Access", desc: "Integrate WhatsApp messaging into your apps with our powerful API.", color: "bg-cyan-100 text-cyan-600" },
];

const pricing = [
    {
        name: "Starter", price: "Free", period: "", desc: "For small businesses getting started",
        features: ["1,000 messages/month", "1 Agent", "Basic templates", "Standard support"],
        cta: "Start Free", popular: false
    },
    {
        name: "Pro", price: "₹2,499", period: "/mo", desc: "For growing businesses",
        features: ["50,000 messages/month", "5 Agents", "Chatbot builder", "Broadcast campaigns", "Priority support", "API access"],
        cta: "Get Pro", popular: true
    },
    {
        name: "Enterprise", price: "Custom", period: "", desc: "For large-scale operations",
        features: ["Unlimited messages", "Unlimited agents", "Custom chatbot flows", "Dedicated account manager", "SLA guarantee", "On-premise option"],
        cta: "Contact Sales", popular: false
    },
];

export default function BusinessLandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-[#25d366] p-1.5 rounded-lg">
                            <MessageSquare className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl text-slate-800 tracking-tight">ChatMitra <span className="text-[#25d366]">Business</span></span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
                        <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
                        <Link href="/business/dashboard" className="text-sm font-medium bg-[#25d366] text-white px-5 py-2 rounded-full hover:bg-[#1da851] transition-colors shadow-lg shadow-green-500/20">
                            Go to Dashboard →
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#075e54] via-[#128c7e] to-[#25d366] py-24 px-6">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")` }} />
                <div className="container mx-auto text-center max-w-4xl relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-8 border border-white/20">
                        <ShieldCheck className="w-4 h-4" />
                        Official WhatsApp Business API Partner
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                        Scale Your Business with <span className="text-[#dcf8c6]">WhatsApp</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Send broadcasts, automate with chatbots, manage templates, and track analytics — all from one powerful dashboard.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/business/dashboard" className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#075e54] rounded-xl font-bold hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
                            Get Started Free <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="#features" className="w-full sm:w-auto px-8 py-3.5 bg-white/10 backdrop-blur text-white border border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all">
                            Explore Features
                        </Link>
                    </div>
                    {/* Trust Badges */}
                    <div className="flex items-center justify-center gap-8 mt-12 text-white/60 text-sm">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> No setup fees</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Green tick support</span>
                        <span className="hidden sm:flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> 99.9% uptime</span>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section id="features" className="py-24 px-6 bg-slate-50">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-[#25d366] font-semibold text-sm uppercase tracking-widest mb-3">Features</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to grow</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">Powerful tools designed for modern businesses to engage customers on WhatsApp at scale.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="p-7 bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default group">
                                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-24 px-6 bg-white">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-[#25d366] font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
                        <p className="text-slate-500">Start free and scale as you grow.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {pricing.map((plan, i) => (
                            <div key={i} className={`relative p-8 rounded-2xl border-2 ${plan.popular ? 'border-[#25d366] bg-[#f0fdf4] shadow-xl shadow-green-500/10' : 'border-slate-200 bg-white'} transition-all hover:shadow-lg`}>
                                {plan.popular && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#25d366] text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" /> Most Popular
                                    </div>
                                )}
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h3>
                                <p className="text-slate-500 text-sm mb-5">{plan.desc}</p>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                                    {plan.period && <span className="text-slate-500 text-sm">{plan.period}</span>}
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2.5 text-sm text-slate-700">
                                            <CheckCircle2 className="w-4 h-4 text-[#25d366] flex-shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/business/dashboard"
                                    className={`w-full block text-center py-3 rounded-xl font-semibold transition-all ${plan.popular ? 'bg-[#25d366] text-white hover:bg-[#1da851] shadow-lg shadow-green-500/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#075e54] py-12 px-6">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="text-[#25d366] w-5 h-5" />
                        <span className="font-bold text-white tracking-tight">ChatMitra Business</span>
                    </div>
                    <div className="flex items-center gap-6 text-white/60 text-sm">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                    <div className="text-white/40 text-sm">
                        © 2026 ChatMitra Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
