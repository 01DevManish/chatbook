import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy - Chatbook",
    description: "Our commitment to your privacy and data protection.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#111b21] text-[#e9edef] py-20 px-6">
            <div className="max-w-4xl mx-auto prose prose-invert prose-green">
                <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
                <p className="text-sm text-[#8696a0] mb-8">Last Updated: February 1, 2026</p>

                <h2>1. Introduction</h2>
                <p>
                    Chatbook ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and mobile application.
                </p>

                <h2>2. Information We Collect</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Account Information:</strong> Phone number, profile name, and profile picture.</li>
                    <li><strong>Messages:</strong> Messages are End-to-End Encrypted. We cannot read them. Undelivered messages are stored temporarily in encrypted form on our servers until delivery.</li>
                    <li><strong>Usage Data:</strong> Diagnostic logs and performance reports (anonymous).</li>
                </ul>

                <h2>3. How We Use Information</h2>
                <p>We use your information to operate, provide, improve, understand, customize, support, and market our Services.</p>

                <h2>4. Third-Party Sharing</h2>
                <p>We do not sell your personal data to advertisers. We process data with third-party providers (like Cloudflare and Firebase) solely to provide the service.</p>

                <h2>5. Contact Us</h2>
                <p>If you have questions about this policy, please contact us at privacy@chatbook.com.</p>
            </div>
        </div>
    );
}
