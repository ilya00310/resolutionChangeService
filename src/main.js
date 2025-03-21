import express from 'express'
import dotenv from "dotenv";
import { router } from './routers/videoFile.routers.js';

dotenv.config()
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json())
app.use('/file', router)

app.listen(port, () => {
        console.log(`App listen ${port}`)
    })
