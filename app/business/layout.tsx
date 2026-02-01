import "@/app/globals.css"; // Ensure globals are loaded
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Chatbook Business",
    description: "Tools for professional communication.",
};

export default function BusinessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Distinct Business Header would go here usually, but we might do it per page or layout */}
            {children}
        </div>
    );
}
