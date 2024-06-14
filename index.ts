import express from 'express';

require('dotenv').config()
const PORT: number = parseInt((process.env.PORT) ? process.env.PORT : '0');

const app = express();

app.get('/', (req, res) => {
    res.send('testing testing')
})

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})