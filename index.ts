const express = require('express')
const cors = require('cors')

import {Request, Response} from 'express'


require('dotenv').config()
const PORT: number = parseInt((process.env.PORT) ? process.env.PORT : '0');

const app = express();
const posts = require('./routes/posts');


// TODO: FIGURE OUT CORS STUFF LATER, THIS IS PLACEHOLDER CODE THAT FUNCTIONS
const allow = [process.env.BASE_URL]
const corsOptions = {
    origin: function (origin: any, callback: any) {
        if (allow.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

if (process.env.USE_CORS === 'y') {
    app.use(cors(corsOptions))
} else {
    app.use(cors())
}

// setting up post routes defined in './routes/posts.ts'
app.use(posts)


app.get('/', (request: Request, response: Response) => {
    response.send('unrecognized endpoint')
})

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})