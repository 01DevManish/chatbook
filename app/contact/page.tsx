import { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact Us - Chatbook",
    description: "Get in touch with the Chatbook support team.",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#111b21] text-[#e9edef] flex flex-col items-center py-20 px-6">
            <h1 className="text-4xl font-bold text-white mb-10">Contact Us</h1>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl w-full">
                {/* Contact Info */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-[#00a884]">Get in Touch</h2>
                    <p className="text-[#d1d7db]">
                        Have a question, feedback, or need support? We're here to help.
                        Reach out to us through any of the channels below.
                    </p>

                    <div className="flex items-center gap-4">
                        <div className="bg-[#202c33] p-3 rounded-full">
                            <Mail className="text-[#00a884]" />
                        </div>
                        <div>
                            <p className="font-semibold">Email</p>
                            <a href="mailto:support@chatbook.com" className="text-[#00a884] hover:underline">support@chatbook.com</a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-[#202c33] p-3 rounded-full">
                            <Phone className="text-[#00a884]" />
                        </div>
                        <div>
                            <p className="font-semibold">Phone</p>
                            <p className="text-[#d1d7db]">+1 (555) 123-4567</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-[#202c33] p-3 rounded-full">
                            <MapPin className="text-[#00a884]" />
                        </div>
                        <div>
                            <p className="font-semibold">Address</p>
                            <p className="text-[#d1d7db]">123 Tech Park, Silicon Valley, CA</p>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-[#202c33] p-8 rounded-2xl shadow-lg">
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <input type="text" className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg p-3 outline-none focus:border-[#00a884]" placeholder="Your Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input type="email" className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg p-3 outline-none focus:border-[#00a884]" placeholder="email@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Message</label>
                            <textarea className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg p-3 h-32 outline-none focus:border-[#00a884]" placeholder="How can we help?"></textarea>
                        </div>
                        <button type="button" className="w-full bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] font-bold py-3 rounded-lg transition-colors">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
