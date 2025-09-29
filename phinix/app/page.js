
import Link from "next/link";
const mockPosts = [
  {
    id: 1,
    title: "Hello from the Next.js WordPress clone",
    excerpt:
      "This is a sample excerpt demonstrating how a post card will look. Replace this mock data with real API content.",
    slug: "hello-next-wp",
    date: "2025-09-01",
    author: "Admin",
    cover: "https://picsum.photos/seed/1/800/600",
  },
  {
    id: 2,
    title: "How to go headless: Next.js + WordPress",
    excerpt:
      "A short guide showing how to fetch posts from WordPress REST API or GraphQL and render them with server components.",
    slug: "headless-next-wordpress",
    date: "2025-08-22",
    author: "Editor",
    cover: "https://picsum.photos/seed/2/800/600",
  },
  {
    id: 3,
    title: "Designing themes with Tailwind",
    excerpt:
      "Build a flexible theme layer for your headless CMS using Tailwind utility classes and component-driven design.",
    slug: "tailwind-themes",
    date: "2025-07-10",
    author: "Theme Dev",
    cover: "https://picsum.photos/seed/3/800/600",
  },
];

function Header() {
  return (
    <header className="bg-gray-700 border-b border-gray-600">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">W</div>
          <div className="text-lg font-semibold">NextWP</div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/">Home</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/pages">Pages</Link>
          <Link href="/about">About</Link>
          <Link href="/admin" className="px-3 py-1 rounded-md border text-xs">Admin</Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-r from-white via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">A modern front‑end for your content</h1>
          <p className="mt-4 text-lg text-gray-600">
            Build a headless WordPress experience with Next.js: fast pages, nested layouts, and component-driven themes.
          </p>

          <div className="mt-6 flex gap-3">
            <Link href="/blog" className="inline-block px-5 py-3 rounded-2xl shadow-md bg-indigo-600 text-white font-medium">Browse posts</Link>
            <Link href="/about" className="inline-block px-5 py-3 rounded-2xl border">Learn more</Link>
          </div>
        </div>

        <div className="order-first md:order-last">
          <img src="https://picsum.photos/seed/hero/900/600" alt="Hero" className="rounded-2xl shadow-lg w-full object-cover" />
        </div>
      </div>
    </section>
  );
}

function PostCard({ post }) {
  return (
    <article className="bg-gray-700 rounded-2xl shadow-sm overflow-hidden border border-gray-600">
      <div className="h-48 w-full overflow-hidden">
        <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-5">
        <div className="text-xs text-gray-500">{new Date(post.date).toLocaleDateString()} • {post.author}</div>
        <h3 className="mt-2 text-xl font-semibold">
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="mt-3 text-gray-600 text-sm">{post.excerpt}</p>
        <div className="mt-4">
          <Link href={`/posts/${post.slug}`} className="text-indigo-600 text-sm font-medium">Read more →</Link>
        </div>
      </div>
    </article>
  );
}

function Sidebar() {
  return (
    <aside className="space-y-6">
      <div className="bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-600">
        <h4 className="font-semibold">Search</h4>
        <input placeholder="Search posts..." className="mt-3 w-full border rounded-md px-3 py-2 text-sm" />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold">Categories</h4>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li><Link href="/category/news">News</Link></li>
          <li><Link href="/category/tutorials">Tutorials</Link></li>
          <li><Link href="/category/theme">Theme</Link></li>
        </ul>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold">Recent posts</h4>
        <ul className="mt-3 space-y-3 text-sm">
          {mockPosts.slice(0, 3).map(p => (
            <li key={p.id} className="text-gray-700">
              <Link href={`/posts/${p.slug}`}>{p.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Hero />

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Latest posts</h2>
              <div className="text-sm text-gray-500">Showing {mockPosts.length} posts</div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {mockPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* pagination placeholder */}
            <div className="flex items-center justify-center mt-6">
              <button className="px-4 py-2 rounded-md border">Previous</button>
              <div className="mx-3 text-sm text-gray-600">Page 1</div>
              <button className="px-4 py-2 rounded-md border">Next</button>
            </div>
          </section>

          <aside className="lg:col-span-1">
            <Sidebar />
          </aside>
        </div>
      </main>

      <footer className="border-t border-gray-600 bg-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-gray-600">© {new Date().getFullYear()} NextWP — demo frontend</div>
      </footer>
    </div>
  );
}
