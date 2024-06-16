const express = require('express')
import {Request, Response} from 'express'


require('dotenv').config()
const PORT: number = parseInt((process.env.PORT) ? process.env.PORT : '0');

const app = express();
const posts = require('./routes/posts');

// setting up post routes defined in './routes/posts.ts'
app.use(posts)


app.get('/', (request: Request, response: Response) => {
    response.send('unrecognized endpoint')
})

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})