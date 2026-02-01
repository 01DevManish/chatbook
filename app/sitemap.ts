import { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/lib/blog-content';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://chatbook-01devmanish.vercel.app'; // Replace with your actual domain

    // Static pages
    const routes = [
        '',
        '/chat',
        '/blog',
        '/privacy',
        '/terms',
        '/contact',
        '/login',
        '/signup',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Blog Posts
    const blogPosts = BLOG_POSTS.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date).toISOString().split('T')[0] || new Date().toISOString(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [...routes, ...blogPosts];
}
