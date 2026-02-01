import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service - Chatbook",
    description: "The rules and regulations for using Chatbook.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#111b21] text-[#e9edef] py-20 px-6">
            <div className="max-w-4xl mx-auto prose prose-invert prose-green">
                <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
                <p className="text-sm text-[#8696a0] mb-8">Last Updated: February 1, 2026</p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing and using Chatbook, you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h2>2. User Conduct</h2>
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Violate any local, state, national, or international law.</li>
                    <li>Send spam, unsolicited messages, or automated queries.</li>
                    <li>Harass, threaten, or intimidate other users.</li>
                </ul>

                <h2>3. Termination</h2>
                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

                <h2>4. Limitation of Liability</h2>
                <p>In no event shall Chatbook be liable for any indirect, incidental, special, consequential or punitive damages.</p>
            </div>
        </div>
    );
}
