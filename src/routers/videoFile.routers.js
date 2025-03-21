import express from 'express'
import {addVideoFile, deleteVideo, changePermission, getFileInfo } from '../services/videoFile.services.js';
import multer from 'multer'; 
import { validationResult, checkSchema } from 'express-validator'
import { newPermissionSchema } from '../../schema/newPermission.schema.js';

export const router = express.Router();

const upload = multer()
router.route('').post(upload.single('video'),async (req, res) => {
    try {
    const videoData = req.file
    const videoId = await addVideoFile(videoData)
    res.json({ id: videoId }).status(200)
    }
    catch (err) {
        res.status(500).send({ error: err })
    }
})


router.route('/:id').delete(async (req,res) => {
    try {    
    const { id } = req.params;
    await deleteVideo(id)
    res.json({success: true}).status(200)
    } catch(err) {
        console.log(err)
        res.json({success: false}).status(200)
    }
})

router.route('/:id').patch(checkSchema(newPermissionSchema),async (req,res) => {
    try {
    const { id } = req.params;
     const isValidatePermission = validationResult(req);
     if (!isValidatePermission.isEmpty()){
        throw (false)
     }
     const newPermission = req.body;
      changePermission(newPermission,id)
     res.json({success: true}).status(200)
    }catch{
        res.json({success: false}).status(200)
    }
})

router.route('/:id').get(async (req,res) => {
    const { id } = req.params;
    const fileInfo = await getFileInfo(id);
    res.json(fileInfo).status(200)
})