import express from 'express'
import { fixedVideoProcessInDb } from '../controllers/controllersVideoFile.js';
export const router = express.Router();
import multer from 'multer'; 

const UUIDVideo = crypto.randomUUID();
const storage = multer.diskStorage({
    destination: 'videos/',
    filename: function (req, file, cb) {
        cb(null,`${UUIDVideo}.mp4` )
    }
})

const upload = multer({ storage })
router.route('/file').post(upload.single('video'),async (req, res) => {
    try {
    fixedVideoProcessInDb(UUIDVideo)
    res.json({ id: UUIDvideo }).status(200) 
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ error: err.code })
    }
})

