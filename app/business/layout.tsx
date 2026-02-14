import "@/app/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ChatMitra Business — WhatsApp Business API Platform",
    description: "Scale your business with WhatsApp. Send broadcasts, automate with chatbots, manage templates, and track analytics from one powerful dashboard.",
    keywords: "WhatsApp Business API, chatbot, broadcast, template messages, analytics, CRM",
};

export default function BusinessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {children}
        </div>
    );
}
