import { DOCS_CONTENT } from "@/lib/docs-content";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return DOCS_CONTENT.map((doc) => ({
        slug: doc.id,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const doc = DOCS_CONTENT.find((d) => d.id === slug);
    if (!doc) return { title: "Not Found" };
    return {
        title: `${doc.title} - Chatbook Docs`,
    };
}

export default async function DocPage({ params }: PageProps) {
    // Await the params object (Next.js 15+ requirement/pattern)
    const { slug } = await params;

    // Redirect /docs to the first page if needed, but this is a specific page route
    // If slug is not provided? This is [slug] so it is provided.

    const doc = DOCS_CONTENT.find((d) => d.id === slug);

    if (!doc) {
        notFound();
    }

    return (
        <article className="max-w-4xl mx-auto">
            <ReactMarkdown
                components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-[#e9edef] mb-6 mt-2 pb-4 border-b border-[#2a3942]" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-[#00a884] mt-8 mb-4 flex items-center gap-2" {...props} />,
                    p: ({ node, ...props }) => <p className="text-[#d1d7db] leading-7 mb-4 text-[15px]" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-[#d1d7db]" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-[#d1d7db]" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-[#e9edef]" {...props} />,
                }}
            >
                {doc.content}
            </ReactMarkdown>
        </article>
    );
}
