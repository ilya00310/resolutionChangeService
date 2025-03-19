import express from 'express'
// import bodyParser from "body-parser"
import dotenv from "dotenv";
import { router } from './routes/routesVideoFile.js';

dotenv.config()
const app = express();
const port = process.env.port || 3000;

// app.use(bodyParser.json())

app.use('/', router)

app.listen(port, () => {
        console.log(`App listen ${port}`)
    })
