import { getBlogPosts } from "@/lib/contentful"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ブログ</h1>
          <p className="text-lg text-gray-600">スタジオの最新情報をお届けします</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {post.featuredImage && (
                <div className="relative h-48">
                  <Image
                    src={`https:${post.featuredImage.fields.file.url}`}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <time className="text-sm text-gray-500 mb-2 block">
                  {format(new Date(post.publishedDate), "yyyy年MM月dd日", { locale: ja })}
                </time>
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{post.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  続きを読む →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
