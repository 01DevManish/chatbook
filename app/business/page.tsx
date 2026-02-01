import Link from "next/link";
import { Building2, MessageSquare, BarChart3, ShieldCheck } from "lucide-react";

export default function BusinessLandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Building2 className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl text-slate-800 tracking-tight">Chatbook <span className="text-blue-600">Business</span></span>
                    </div>
                    <nav className="flex items-center gap-6">
                        <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">Features</Link>
                        <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">Pricing</Link>
                        <Link href="/dashboard" className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-colors">
                            Go to Dashboard
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-6">
                <div className="container mx-auto text-center max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                        Connect with your customers <span className="text-blue-600">professionally.</span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Scale your customer service, automate replies, and get deep insights with Chatbook Business. The professional way to chat.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/dashboard" className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                            Get Started Free
                        </Link>
                        <button className="w-full sm:w-auto px-8 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                            View Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section id="features" className="py-20 px-6 bg-white">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to grow</h2>
                        <p className="text-slate-500">Powerful tools designed for modern businesses.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl transition-shadow cursor-default group">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <MessageSquare className="text-green-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Quick Replies</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Save frequent messages and send them with a single tap. Speed up your workflow.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl transition-shadow cursor-default group">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 className="text-purple-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Analytics</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Track message volume, response times, and customer satisfaction in real-time.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl transition-shadow cursor-default group">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="text-orange-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Badge</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Build trust with a green verified badge on your business profile.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 py-12 px-6 border-t border-slate-800">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Building2 className="text-blue-500 w-5 h-5" />
                        <span className="font-bold text-white tracking-tight">Chatbook Business</span>
                    </div>
                    <div className="text-slate-400 text-sm">
                        © 2026 Chatbook Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
