import { BLOG_POSTS } from "@/lib/blog-content";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = BLOG_POSTS.find((p) => p.slug === slug);
    if (!post) return { title: "Not Found" };

    return {
        title: `${post.title} | Chatbook Blog`,
        description: post.excerpt,
        keywords: post.keywords,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: ['Chatbook Team'],
            tags: post.tags,
        }
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = BLOG_POSTS.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#111b21] text-[#e9edef] pb-20">
            {/* Header / Nav */}
            <div className="bg-[#202c33] border-b border-[#2a3942] sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
                    <Link href="/blog" className="flex items-center gap-2 text-[#aebac1] hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-medium">All Articles</span>
                    </Link>
                </div>
            </div>

            <article className="max-w-3xl mx-auto px-6 mt-12">
                {/* Meta Header */}
                <header className="mb-10 text-center">
                    <div className="inline-block px-3 py-1 bg-[#00a884]/10 text-[#00a884] rounded-full text-sm font-medium mb-4">
                        {post.category}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-sm text-[#8696a0]">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                    </div>
                </header>

                {/* Content */}
                <div className="prose prose-invert prose-lg prose-green max-w-none">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-white mt-12 mb-6" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold text-[#e9edef] mt-10 mb-4 border-l-4 border-[#00a884] pl-4" {...props} />,
                            p: ({ node, ...props }) => <p className="text-[#d1d7db] leading-8 mb-6 text-[18px]" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc ml-6 mb-6 space-y-2 text-[#d1d7db]" {...props} />,
                            li: ({ node, ...props }) => <li className="pl-2" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>

                {/* Tags */}
                <div className="mt-16 pt-8 border-t border-[#2a3942]">
                    <h3 className="text-sm font-bold text-[#8696a0] uppercase mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-[#202c33] text-[#d1d7db] rounded-lg text-sm hover:bg-[#2a3942] cursor-default">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </article>
        </div>
    );
}
