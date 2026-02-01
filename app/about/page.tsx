import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us - Chatbook",
    description: "Learn about the mission, vision, and team behind Chatbook.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#111b21] text-[#e9edef] flex flex-col items-center py-20 px-6">
            <h1 className="text-4xl font-bold text-white mb-6">About Chatbook</h1>
            <div className="max-w-3xl space-y-6 text-lg text-[#d1d7db] leading-relaxed">
                <p>
                    Chatbook was born from a simple idea: <strong>Communication should be seamless, private, and beautiful.</strong>
                </p>
                <p>
                    In a world of cluttered apps and invasive tracking, we wanted to build a sanctuary. A place where you can talk to your friends, share your moments, and conduct your business without worrying about who is watching.
                </p>

                <h2 className="text-2xl font-semibold text-[#00a884] mt-8">Our Mission</h2>
                <p>
                    To connect the world through secure, high-quality, and reliable messaging technology. Whether you are a student, a professional, or a grandparent, Chatbook is designed for you.
                </p>

                <h2 className="text-2xl font-semibold text-[#00a884] mt-8">Why Choose Us?</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Privacy First:</strong> End-to-end encryption is our standard.</li>
                    <li><strong>Speed:</strong> Built on modern tech for instant delivery.</li>
                    <li><strong>Design:</strong> A clean, distraction-free interface (Dark Mode native).</li>
                </ul>
            </div>
        </div>
    );
}
