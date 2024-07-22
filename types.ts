
export interface Tag {
    id: string,
    slug: string,
    name: string,
    description: string,
    accent_color: string
}

export interface Post {
    slug: string,
    id: string,
    title: string, 
    custom_excerpt: string,
    feature_image: string,
    feature_image_alt: string,
    published_at: Date,
    html?: string,
    tags?: Tag[]
} 

export interface PostMetadata {
    pages: number,
    page: number,
    limit: number,
    total: number,
    prev: number | null,
    next: number | null
}

export interface PostResponse {
    posts: Post[],
    meta?: PostMetadata
}

