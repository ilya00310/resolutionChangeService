import express from 'express'
export const router = express.Router();
import { getHello } from '../controllers/controllersVideoFile.js';

router.route('/file').post((req, res) => {
    const hello = getHello();
    res.send(hello).status(200)
})