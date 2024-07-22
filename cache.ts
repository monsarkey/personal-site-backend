
import { TSGhostContentAPI } from '@ts-ghost/content-api';
import { Request, Response } from 'express'
import { Post, PostMetadata, PostResponse, CacheResponse, CacheItem } from './types';
import { selectPostFields } from './util';
import { match } from 'assert';


export class PostCache {

  private _postList: Post[] = [];
  private _cache: Map<string, CacheItem>;
  private _api: TSGhostContentAPI;

  private _retry_num: number;
  private _setup_failure: boolean = false;

  constructor(api: TSGhostContentAPI, retry_num: number = 5) {

    this._api = api;
    this._retry_num = retry_num;

    this._cache = new Map<string, CacheItem>();
    this._getPosts();

  }

  private _getPosts(): void  {

    this._api.posts
      .browse()
      .include({ tags: true })
      .fetch()
      .then((result) => {
        if (result.success) {
          this._setup_failure = false;
          this._postList = result.data.map(selectPostFields);
        } else {
          console.log(`failed to fetch posts`)
          this._setup_failure = true;
        }
      })
      .catch((error) => {
        console.log(error);
        this._setup_failure = true;
      })   

  }

  public refresh() {
    console.log('refreshing cache...')
    this._cache = new Map<string, CacheItem>();
    this._getPosts();
  }

  public search(count: number, page: number, search: string, tags: string[]): PostResponse | null {

    // if posts aren't stored locally, we can't search via cache.
    if (this._setup_failure)
      return null;

    let matchingPosts: Post[] = [];
    let postMeta: PostMetadata;

    this._postList.forEach((post) => {

      let hasTags = false;
      let hasQuery = false;

      if(tags.length) {
        const tagStringArr = post.tags?.map(tag => tag.slug) || [];

        // if none of the queried tags exist in the post's tag array
        if (tags.some((tag) => tagStringArr.includes(tag))) {
          hasTags = true;
        } 
      }

      if(search) {       
        search = search.toLowerCase();

        if ((post.title.toLowerCase().includes(search) || post.custom_excerpt?.toLowerCase().includes(search))) {
          hasQuery = true;
        }
      }

      if (((tags.length && hasTags) && (search && hasQuery)) 
        || (!tags.length && (search && hasQuery))
        || ((tags.length && hasTags) && !search)
        || (!tags.length && !search)) {
          matchingPosts.push(post);
        }

    })

    const totalPages = Math.ceil(matchingPosts.length / count);

    postMeta = {
      pages: totalPages,
      page: page,
      limit: count,
      total: matchingPosts.length,
      prev: (page - 1) || null,
      next: (page < totalPages) ? page + 1 : null
    }
  
    return {
      posts: matchingPosts.slice((page-1)*count, page*count),
      meta: postMeta
    }

  }

  public get(requestUrl: string): CacheResponse {

    let item = this._cache.get(requestUrl);

    if (item) 
      return { "success": true, "data": item }
    else 
      return { "success": false }

  }

  public set(requestUrl: string, data: CacheItem): void {

    this._cache.set(requestUrl, data);

  }
}