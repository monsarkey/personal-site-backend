import { Request, Response } from 'express'
import { TSGhostContentAPI, Post } from "@ts-ghost/content-api";
import { selectPostFields } from '../util';

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
                response.send({posts: filteredResult})
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
                response.send({posts: filteredResult, meta: result.meta.pagination})
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
            feature_image: true
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

module.exports = router;