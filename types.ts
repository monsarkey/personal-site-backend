
export interface Tag {
    id: string,
    slug: string,
    name: string,
    description: string | null,
    accent_color: string | null
}

export interface Post {
    slug: string,
    id: string,
    title: string, 
    custom_excerpt: string | null,
    feature_image: string | null,
    feature_image_alt: string | null,
    published_at?: string | null,
    html?: string,
    tags?: Tag[]
} 

export interface PostMetadata {
    pages: number,
    page: number,
    limit: number | "all",
    total: number,
    prev: number | null,
    next: number | null
}

export interface PostResponse {
    posts: Post[],
    meta?: PostMetadata
}

export interface TagResponse {
    tags: Tag[]
}

export interface PostReadResponse {
    post: Post
}

export interface CacheItem {
    data: PostResponse | PostReadResponse | TagResponse;
}

export interface CacheResponse {
    success: boolean,
    item?: CacheItem
}

