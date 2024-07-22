import { Request, Response } from 'express'
import { TSGhostContentAPI, Post } from "@ts-ghost/content-api";
import { PostResponse } from '../types';
import { selectPostFields } from '../util';
import { PostCache } from '../cache';


require('dotenv').config()
const crypto = require('crypto')
const express = require('express')


const router = express.Router();

const api = new TSGhostContentAPI(
    process.env.GHOST_URL || "",
    process.env.GHOST_CONTENT_API_KEY || "",
    "v5.84"
);

const cache = new PostCache(api);

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// receives authenticated webhook from Ghost client. On authentication, resets the cache.
router.post('/api/posts/update', (request: Request, response: Response) => {

    if(!request.headers['x-ghost-signature'] || typeof request.headers['x-ghost-signature'] != "string") {
        return response.sendStatus(401); 
    } 

    // if formatted inproperly, key will be set to empty string
    let key: string = request.headers['x-ghost-signature'].split(', ')[0].split('=')[1] || "";
    let secret = crypto.createHmac('sha256', WEBHOOK_SECRET).update(JSON.stringify(request.body)).digest('hex'); 

    if (secret != key) {
        return response.sendStatus(401); 
    }
    
    // IF AUTHENTICATED, UPDATE CACHE HERE: 
    cache.refresh();
    return response.sendStatus(200);
    
})


// mirrors the getPosts(count) frontend function. 
// gets [count] most recent posts from our ghost webserver, without pagination.
router.get('/api/posts/browse/:count', (request: Request, response: Response) => {

    let count: number = parseInt(request.params.count);

    if ((Number.isNaN(count) || count < 0)) {
        return response.sendStatus(400) // bad request
    }

    // first try to get from cache
    let cacheResponse = cache.get(request.url)

    if (cacheResponse.success) {
        return response.send(cacheResponse.item?.data);
    }

    api.posts
        .browse({ limit: count })
        .include({ tags: true })
        .fetch()
        .then((result) => {
            if (result.success) {
                let filteredResult = result.data.map(selectPostFields);
                cache.set(request.url, { data: { posts: filteredResult } })
                return response.send({ posts: filteredResult })
            } else {
                return response.sendStatus(404);
            }
        })
        .catch((error) => {
            console.log(error);
            return response.sendStatus(500);
        })

})


// mirrors the getPostsPaginated(count, page) frontend function. 
// gets [count] most recent posts from our ghost webserver, starting with offset determinted by [page] number.
router.get('/api/posts/browse/:count/:page', (request: Request, response: Response) => {

    let count = parseInt(request.params.count);
    let page = parseInt(request.params.page);

    if ((Number.isNaN(count) || count < 0) || (Number.isNaN(page) || page < 0)) {
        return response.sendStatus(400) // bad request
    }

    // first try to get from cache
    let cacheResponse = cache.get(request.url)

    if (cacheResponse.success) {
        return response.send(cacheResponse.item?.data);
    }

    let options = {
        limit: count,
        page: page
    }

    // if unsuccessful, get from api.
    api.posts
        .browse(options)
        .include({ tags: true })
        .fetch()
        .then((result) => {
            if (result.success) {
                let filteredResult = result.data.map(selectPostFields);
                cache.set(request.url, { data: { posts: filteredResult, meta: result.meta.pagination } })
                return response.send({ posts: filteredResult, meta: result.meta.pagination })
            } else {
                return response.sendStatus(404);
            }
        })
        .catch((error) => {
            console.log(error);
            return response.sendStatus(500);
        })

})


// mirrors the getPostsBySearch(count, page, search, tags) frontend function. 
// gets [count] most recent posts matching query. depending on provided values [search] and [tags], creates filter which
// posts must match. call is paginated according to provided [page] value. 
router.get('/api/posts/search/:count/:page', (request: Request, response: Response) => {

    let apiCall;
    let cachedResponse: PostResponse | null = null;

    let count = parseInt(request.params.count);
    let page = parseInt(request.params.page);

    let searchStr: string = typeof request.query.search === "undefined" ? "" : String(request.query.search);
    let searchTags = !request.query.tags ? [] : request.query.tags;

    if ((Number.isNaN(count) || count < 0) || (Number.isNaN(page) || page < 0)) {
        return response.sendStatus(400) // bad request
    }

    // try doing search from cached data, if available.
    if (Array.isArray(searchTags)) {
        cachedResponse = cache.search(count, page, searchStr, searchTags as string[]);
        if (cachedResponse !== null) {
            return response.send(cachedResponse);
        }
    }
    else
        return response.sendStatus(400) // bad request

    // workaround for annoying quirks in typescript ghost module: define our browse call here so we can have variable filter values
    if (request.query.tags) {
        if (request.query.search) // tags and search query provided
            apiCall = api.posts.browse({
                limit: count,
                page: page,     //  filter: p and (q or r) = (p and q) or (p and r)
                filter: `tags:[${request.query.tags}]+custom_excerpt:~'${request.query.search}',tags:[${request.query.tags}]+title:~'${request.query.search}'`
            })
        else  // tag query, but no search query
            apiCall = api.posts.browse({
                limit: count,
                page: page,
                filter: `tags:[${request.query.tags}]`
            })
    } else {
        if (request.query.search) // no tag query, but search query provided
            apiCall = api.posts.browse({
                limit: count,
                page: page,
                filter: `custom_excerpt:~'${request.query.search}',title:~'${request.query.search}'`
            })
        else  // neither tag nor search query
            apiCall = api.posts.browse({ 
                limit: count,
                page: page,
            })
    }

    apiCall.include({ tags: true })
        .fetch()
        .then((result) => {
            if (result.success) {
                let filteredResult = result.data.map(selectPostFields);
                return response.send({ posts: filteredResult, meta: result.meta.pagination })
            } else {
                return response.sendStatus(404); // not found
            }
        })
        .catch((error) => {
            console.log(error);
            return response.sendStatus(500);
        })

})

// mirrors the getPostBySlug(slug) frontend function. 
// gets a single post matching its unique [slug] identifier
router.get('/api/posts/read/:slug', (request: Request, response: Response) => {

    // try to get from cache
    let cacheResponse = cache.get(request.url);

    if (cacheResponse.success)
        return response.send(cacheResponse.item?.data);

    api.posts
        .read({ slug: request.params.slug })
        .fields({
            slug: true,
            id: true,
            title: true,
            html: true,
            custom_excerpt: true,
            feature_image: true,
            feature_image_alt: true,
            published_at: true
        })
        .fetch()
        .then((result) => {
            if (result.success) {
                cache.set(request.url, { data: { post: result.data } })
                return response.send({ post: result.data });
            } else {
                return response.sendStatus(404);
            }
        })
        .catch((error) => {
            console.log(error);
            return response.sendStatus(500);
        })

})


// mirrors the getTags() frontend function.
// gets a list of all tags. will not return tags without any associated post
router.get('/api/tags', (request: Request, response: Response) => {

    // try to get from cache
    let cacheResponse = cache.get(request.url);

    if (cacheResponse.success)
        return response.send(cacheResponse.item?.data);


    api.tags
        .browse({limit: 'all'})
        .fields({
            id: true,
            slug: true,
            name: true,
            description: true,
            accent_color: true
        })
        .fetch()
        .then((result) => {
            if (result.success) {
                cache.set(request.url, { data: { tags: result.data } })
                return response.send({ tags: result.data })
            } else {
                return response.sendStatus(404);
            }
        })
        .catch((error) => {
            console.log(error);
            return response.sendStatus(500)
        })
 
})

module.exports = router;