import express from 'express'
import { fixedVideoProcessInDb, deleteVideo } from '../controllers/controllersVideoFile.js';
import multer from 'multer'; 
import crypto from 'crypto'

export const router = express.Router();
let UUIDVideo = crypto.randomUUID();
const storage = multer.diskStorage({
    destination: 'videos/',
    filename: function (req, file, cb) {
        cb(null,`${UUIDVideo}.mp4` )
    }
})


const upload = multer({ storage })
router.route('').post(upload.single('video'),async (req, res) => {
    console.log(UUIDVideo, crypto.randomUUID())
    try {
    fixedVideoProcessInDb(UUIDVideo)
    res.json({ id: UUIDVideo }).status(200)
    UUIDVideo = crypto.randomUUID();
    }
    catch (err) {
        crypto.randomUUID()
        res.status(500).send({ error: err.code })
    }
})


router.route('/:UUID').delete(async (req,res) => {
    try {    
    const { UUID } = req.params;
    console.log(await deleteVideo(UUID))
    res.json({success: true}).status(200)
    } catch(err) {
        res.json({success: false}).status(200)
    }
})
