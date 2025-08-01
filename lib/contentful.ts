import { createClient } from "contentful"

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
})

export interface BlogPost {
  title: string
  slug: string
  content: string
  publishedDate: string
  featuredImage: {
    fields: {
      file: {
        url: string
      }
    }
  }
  excerpt: string
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const entries = await client.getEntries({
    content_type: "blogPost",
    order: "-fields.publishedDate",
  })

  return entries.items.map((item: any) => ({
    title: item.fields.title,
    slug: item.fields.slug,
    content: item.fields.content,
    publishedDate: item.fields.publishedDate,
    featuredImage: item.fields.featuredImage,
    excerpt: item.fields.excerpt,
  }))
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const entries = await client.getEntries({
    content_type: "blogPost",
    "fields.slug": slug,
    limit: 1,
  })

  if (entries.items.length === 0) {
    return null
  }

  const item = entries.items[0] as any
  return {
    title: item.fields.title,
    slug: item.fields.slug,
    content: item.fields.content,
    publishedDate: item.fields.publishedDate,
    featuredImage: item.fields.featuredImage,
    excerpt: item.fields.excerpt,
  }
}
