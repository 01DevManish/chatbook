import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Marketing/Navbar';
import Footer from '@/components/Marketing/Footer';
import { BLOG_POSTS } from '@/lib/blog-content';
import { Shield, Lock, Globe, Zap, Smartphone, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chatbook - Secure, Fast, and Private Messaging for Everyone',
  description: 'Connect with friends and family globally with Chatbook. Enjoy end-to-end encrypted messaging, voice calls, and video chats. Simple, reliable, and secure.',
  keywords: ['chat app', 'secure messaging', 'end-to-end encryption', 'private chat', 'video call', 'Chatbook'],
  openGraph: {
    title: 'Chatbook - Secure Real-time Messaging',
    description: 'Experience the next generation of private communication. Free, secure, and fast for everyone.',
    images: ['/og-image.jpg'],
  },
};

export default function LandingPage() {
  const recentPosts = BLOG_POSTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#111b21] text-[#e9edef] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-[#00a884]/10 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Simple. Secure. <br />
              <span className="text-[#00a884] bg-clip-text text-transparent bg-gradient-to-r from-[#00a884] to-[#25d366]">Reliable.</span>
            </h1>
            <p className="text-xl text-[#8696a0] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              With Chatbook, you get fast, simple, secure messaging and calling for free*, available on phones all over the world.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/web"
                className="px-8 py-4 bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-xl shadow-[#00a884]/20 w-full sm:w-auto text-center"
              >
                Open Chatbook Web
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-[#202c33] hover:bg-[#2a3942] text-white rounded-full font-semibold text-lg transition-colors border border-[#2a3942] w-full sm:w-auto text-center"
              >
                Learn More
              </Link>
            </div>
            <p className="text-sm text-[#54656f]">
              *Data charges may apply. Contact your provider for details.
            </p>
          </div>

          {/* Hero Image Mockup */}
          <div className="relative mx-auto lg:ml-auto w-full max-w-[500px] lg:max-w-none">
            <div className="relative rounded-[2.5rem] border-[8px] border-[#2a3942] bg-[#0b141a] overflow-hidden shadow-2xl aspect-[9/16] sm:aspect-[4/3] lg:aspect-square flex items-center justify-center">
              {/* Simulate Chat UI */}
              <div className="w-full h-full bg-[#0b141a] p-4 flex flex-col gap-4 opacity-80">
                <div className="flex items-center gap-3 p-2 border-b border-[#2a3942]">
                  <div className="w-10 h-10 rounded-full bg-gray-600"></div>
                  <div className="h-4 w-32 bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-4 overflow-hidden">
                  <div className="bg-[#202c33] p-3 rounded-lg rounded-tl-none self-start max-w-[80%] ml-0 mr-auto">
                    <div className="h-2 w-24 bg-gray-600 rounded mb-2"></div>
                    <div className="h-2 w-48 bg-gray-600 rounded"></div>
                  </div>
                  <div className="bg-[#005c4b] p-3 rounded-lg rounded-tr-none self-end max-w-[80%] ml-auto mr-0">
                    <div className="h-2 w-32 bg-green-800 rounded mb-2"></div>
                    <div className="h-2 w-40 bg-green-800 rounded"></div>
                  </div>
                  <div className="bg-[#202c33] p-3 rounded-lg rounded-tl-none self-start max-w-[80%] ml-0 mr-auto">
                    <div className="h-2 w-56 bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <div className="text-center">
                  <Globe size={64} className="text-[#00a884] mx-auto mb-4 animate-pulse" />
                  <span className="text-2xl font-bold">Connecting the World</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#0b141a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why Chatbook?</h2>
            <p className="text-lg text-[#8696a0] max-w-2xl mx-auto">
              Built for people, not for profit. Your privacy is our priority.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#111b21] border border-[#2a3942] hover:border-[#00a884] transition-colors group">
              <div className="w-14 h-14 bg-[#00a884]/10 rounded-xl flex items-center justify-center text-[#00a884] mb-6 group-hover:bg-[#00a884] group-hover:text-[#111b21] transition-all">
                <Lock size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">End-to-End Encryption</h3>
              <p className="text-[#8696a0] leading-relaxed">
                Security by default. Only you and the person you're communicating with can read or listen to them. Nobody in between, not even Chatbook.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111b21] border border-[#2a3942] hover:border-[#00a884] transition-colors group">
              <div className="w-14 h-14 bg-[#00a884]/10 rounded-xl flex items-center justify-center text-[#00a884] mb-6 group-hover:bg-[#00a884] group-hover:text-[#111b21] transition-all">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Speed</h3>
              <p className="text-[#8696a0] leading-relaxed">
                Messages are delivered instantly. Even on slow connections, Chatbook is optimized to perform reliably and efficiently.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111b21] border border-[#2a3942] hover:border-[#00a884] transition-colors group">
              <div className="w-14 h-14 bg-[#00a884]/10 rounded-xl flex items-center justify-center text-[#00a884] mb-6 group-hover:bg-[#00a884] group-hover:text-[#111b21] transition-all">
                <Smartphone size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Sync Across Devices</h3>
              <p className="text-[#8696a0] leading-relaxed">
                Seamlessly access your chats from your phone, tablet, and desktop. Your conversations are always up to date.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Banner */}
      <section className="py-24 bg-[#00a884] text-[#111b21] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Shield className="w-20 h-20 mx-auto mb-8 opacity-80" />
          <h2 className="text-4xl md:text-5xl font-black mb-8">Security You Can Trust</h2>
          <p className="text-xl md:text-2xl font-medium mb-12 opacity-90 max-w-2xl mx-auto">
            We don't sell your data. We don't read your messages. We just build the best technology to connect you with the people who matter most.
          </p>
          <Link
            href="/privacy"
            className="inline-block px-8 py-4 bg-[#111b21] text-white rounded-full font-bold text-lg hover:bg-black transition-transform hover:scale-105"
          >
            Read Our Privacy Policy
          </Link>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-24 bg-[#111b21]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Latest from our Blog</h2>
              <p className="text-[#8696a0]">Stay updated with the latest in security and tech.</p>
            </div>
            <Link href="/blog" className="text-[#00a884] font-bold hover:underline hidden md:block">
              View All Articles &rarr;
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <div key={post.slug} className="group">
                <Link href={`/blog/${post.slug}`}>
                  <div className="bg-[#202c33] rounded-xl overflow-hidden h-full flex flex-col hover:ring-2 hover:ring-[#00a884] transition-all">
                    <div className="h-48 bg-[#2a3942] flex items-center justify-center text-[#54656f] group-hover:bg-[#0b141a] transition-colors">
                      <span className="text-4xl">📝</span>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-xs font-bold text-[#00a884] mb-2">{post.category}</span>
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#00a884] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-[#8696a0] text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="mt-auto pt-4 border-t border-[#2a3942] flex justify-between text-xs text-[#667781]">
                        <span>{post.date}</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link href="/blog" className="text-[#00a884] font-bold hover:underline">
              View All Articles &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-[#0b141a]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "Is Chatbook really free?", a: "Yes, Chatbook uses your phone's Internet connection (4G/3G/2G/EDGE or Wi-Fi, as available) to let you message and call friends and family, so you don't have to pay for every message or call." },
              { q: "How secure is Chatbook?", a: "Extremely. We use end-to-end encryption for all messages and calls. This means only you and the person you're communicating with can read or listen to them." },
              { q: "Can I use Chatbook on my computer?", a: "Yes! You can use Chatbook Web directly from your browser to chat on your laptop or desktop computer." }
            ].map((faq, i) => (
              <div key={i} className="bg-[#111b21] p-6 rounded-xl border border-[#2a3942]">
                <h3 className="text-lg font-bold text-white mb-3">{faq.q}</h3>
                <p className="text-[#8696a0] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
