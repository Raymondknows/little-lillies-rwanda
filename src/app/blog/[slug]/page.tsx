import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { blogPosts, getBlogPostBySlug, getRelatedPosts } from '../data'

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: 'Blog Post Not Found | SchoolBase',
      description: 'The requested blog post could not be found.',
    }
  }

  return {
    title: `${post.title} | SchoolBase`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `https://schoolbase.live/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://schoolbase.live/blog/${post.slug}`,
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(slug)

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-surface py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-light px-3 py-1 text-sm font-medium text-brand">
            <Sparkles className="h-4 w-4" />
            {post.category}
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{post.description}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted">
            <span>{post.readingTime}</span>
            <span>•</span>
            <span>{post.publishedAt}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {post.keywords.map((keyword) => (
              <span key={keyword} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
            <p className="text-lg leading-8 text-muted">{post.hero}</p>
          </div>

          <article className="mt-10 space-y-10">
            {post.sections.map((section) => (
              <section key={section.heading} className="rounded-2xl border border-border bg-background p-8">
                <h2 className="text-2xl font-semibold text-foreground">{section.heading}</h2>
                <div className="mt-4 space-y-4 text-base leading-8 text-muted">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets && (
                  <ul className="mt-6 space-y-3 text-sm leading-7 text-muted">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-1 text-brand">✓</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>

          <div className="mt-12 rounded-2xl border border-border bg-surface p-8">
            <div className="flex items-center gap-2 text-sm font-medium text-brand">
              <BookOpen className="h-4 w-4" />
              Related reading
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {relatedPosts.map((item) => (
                <Link key={item.slug} href={`/blog/${item.slug}`} className="rounded-xl border border-border bg-background p-5 hover:border-brand/40 hover:bg-brand-light/40">
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-brand/20 bg-brand-light/50 p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground">Ready to modernize your school?</h2>
            <p className="mt-3 text-lg text-muted">
              Explore the full SchoolBase platform and see how it supports smarter operations, stronger communication, and better educational outcomes.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link href="/features" className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand/90">
                Explore features <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-surface">
                Book a demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
