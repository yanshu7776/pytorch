import { getBlogPost, getBlogPosts } from "@/lib/contentful"
import { notFound } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"
import { BLOCKS } from "@contentful/rich-text-types"

const renderOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const { file, title } = node.data.target.fields
      return (
        <div className="my-8">
          <Image src={`https:${file.url}`} alt={title || ""} width={800} height={400} className="rounded-lg" />
        </div>
      )
    },
  },
}

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white py-16">
      <article className="container mx-auto px-4 max-w-4xl">
        <header className="mb-8">
          <time className="text-sm text-gray-500 mb-4 block">
            {format(new Date(post.publishedDate), "yyyy年MM月dd日", { locale: ja })}
          </time>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
          {post.featuredImage && (
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
              <Image
                src={`https:${post.featuredImage.fields.file.url}`}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none">{documentToReactComponents(post.content, renderOptions)}</div>
      </article>
    </div>
  )
}
