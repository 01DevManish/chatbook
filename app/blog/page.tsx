import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chatbook Blog - Privacy, Security & Tech",
  description: "Read our latest articles on end-to-end encryption, online safety, and the future of secure messaging.",
  keywords: ["chatbook blog", "privacy blog", "security tips", "messaging tech"],
};

export default function BlogIndexPage() {
  const categories = Array.from(new Set(BLOG_POSTS.map(post => post.category)));

  return (
    <div className="min-h-screen bg-[#111b21] text-[#e9edef]">
      {/* Hero */}
      <div className="bg-[#202c33] py-16 px-6 text-center border-b border-[#2a3942]">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Chatbook Blog</h1>
        <p className="text-[#8696a0] text-lg max-w-2xl mx-auto">
          Insights into the technology, security, and ethics of modern communication.
        </p>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto p-6 md:p-12">

        {categories.map((category) => (
          <div key={category} className="mb-16">
            <h2 className="text-2xl font-bold text-[#00a884] mb-6 border-b border-[#2a3942] pb-2 inline-block">
              {category}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BLOG_POSTS.filter(p => p.category === category).map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
                  <article className="bg-[#202c33] rounded-xl overflow-hidden hover:ring-2 hover:ring-[#00a884] transition-all h-full flex flex-col">
                    {/* Image */}
                    <div className="h-48 bg-[#2a3942] relative overflow-hidden group-hover:bg-[#111b21] transition-colors">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.imageAlt || post.title}
                          className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[#54656f]">
                          <span className="text-4xl">📄</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00a884] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[#8696a0] text-sm mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-[#54656f] mt-4 pt-4 border-t border-[#2a3942]">
                        <span>{post.date}</span>
                        <span className="flex items-center gap-1">⏱️ {post.readTime}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
