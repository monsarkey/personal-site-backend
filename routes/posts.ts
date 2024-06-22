import { Request, Response } from 'express'
import { TSGhostContentAPI, Post } from "@ts-ghost/content-api";
import { selectPostFields } from '../util';
import { request } from 'http';

require('dotenv').config()
const express = require('express')


const router = express.Router();

const api = new TSGhostContentAPI(
    process.env.GHOST_URL || "",
    process.env.GHOST_CONTENT_API_KEY || "",
    "v5.84"
);



// mirrors the getPosts(count) frontend function. 
// gets [count] most recent posts from our ghost webserver, without pagination.
router.get('/api/posts/browse/:count', (request: Request, response: Response) => {

    let count: number = parseInt(request.params.count);

    api.posts
        .browse({ limit: count })
        .include({ tags: true })
        .fetch()
        .then((result) => {
            if (result.success) {
                let filteredResult = result.data.map(selectPostFields);
                response.send({ posts: filteredResult })
            } else {
                response.sendStatus(404);
            }
        })
        .catch((error) => {
            console.log(error);
            response.sendStatus(500);
        })

})


// mirrors the getPostsPaginated(count, page) frontend function. 
// gets [count] most recent posts from our ghost webserver, starting with offset determinted by [page] number.
router.get('/api/posts/browse/:count/:page', (request: Request, response: Response) => {

    let options = {
        limit: parseInt(request.params.count),
        page: parseInt(request.params.page)
    }

    api.posts
        .browse(options)
        .include({ tags: true })
        .fetch()
        .then((result) => {
            if (result.success) {
                let filteredResult = result.data.map(selectPostFields);
                response.send({ posts: filteredResult, meta: result.meta.pagination })
            } else {
                response.sendStatus(404);
            }
        })
        .catch((error) => {
            console.log(error);
            response.sendStatus(500);
        })
})


// mirrors the getPostsBySearch(count, page, search, tags) frontend function. 
// gets [count] most recent posts matching query. depending on provided values [search] and [tags], creates filter which
// posts must match. call is paginated according to provided [page] value. 
router.get('/api/posts/search/:count/:page', (request: Request, response: Response) => {

    let apiCall;

    // workaround for annoying quirks in typescript ghost module: define our browse call here so we can have variable filter values
    if (request.query.tags) {
        if (request.query.search) // tags and search query provided
            apiCall = api.posts.browse({
                    limit: parseInt(request.params.count),
                    page: parseInt(request.params.page),     //  filter: p and (q or r) = (p and q) or (p and r)
                    filter: `tags:[${request.query.tags}]+custom_excerpt:~'${request.query.search}',tags:[${request.query.tags}]+title:~'${request.query.search}'`
            })
        else  // tag query, but no search query
            apiCall = api.posts.browse({
                limit: parseInt(request.params.count),
                page: parseInt(request.params.page),
                filter: `tags:[${request.query.tags}]`
            })
    } else {
        if (request.query.search) // no tag query, but search query provided
            apiCall = api.posts.browse({
                limit: parseInt(request.params.count),
                page: parseInt(request.params.page),
                filter: `custom_excerpt:~'${request.query.search}',title:~'${request.query.search}'`
            })
        else  // neither tag nor search query
            apiCall = api.posts.browse({ 
                limit: parseInt(request.params.count),
                page: parseInt(request.params.page),
            })
    }

    apiCall.include({ tags: true })
        .fetch()
        .then((result) => {
            if (result.success) {
                let filteredResult = result.data.map(selectPostFields);
                response.send({ posts: filteredResult, meta: result.meta.pagination })
            } else {
                response.sendStatus(404);
            }
        })
        .catch((error) => {
            console.log(error);
            response.sendStatus(500);
        })

})


// mirrors the getPostBySlug(slug) frontend function. 
// gets a single post matching its unique [slug] identifier
router.get('/api/posts/read/:slug', (request: Request, response: Response) => {

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
                response.send({ posts: result.data });
            } else {
                response.sendStatus(404);
            }
        })
        .catch((error) => {
            console.log(error);
            response.sendStatus(500);
        })

})


// mirrors the getTags() frontend function.
// gets a list of all tags. will not return tags without any associated post
router.get('/api/tags', (request: Request, response: Response) => {

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
                response.send({ tags: result.data })
            } else {
                response.sendStatus(404);
            }
        })
        .catch((error) => {
            console.log(error);
            response.sendStatus(500)
        })
 
})

module.exports = router;