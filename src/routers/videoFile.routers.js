import express from 'express'
import {addVideoFile, deleteVideo, changePermission, getFileInfo, getFileNameById } from '../services/videoFile.services.js';
import multer from 'multer'; 
import { validationResult, checkSchema } from 'express-validator'
import { newPermissionSchema } from '../../schema/newPermission.schema.js';
import asyncHandler from 'express-async-handler';
/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       required:
 *         - filename
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the video
 *         filename:
 *           type: string
 *           description: Name of your video file
 *         processing:
 *           type: string
 *           enum: [unprocessed, compressing, finished]
 *           description: Current video processing stage
 *         processingSuccess:
 *           type: [boolean, null]
 *           description: Success of the last process
 *       example:
 *         id: d5fE_asz
 *         filename: videoNumberOne.mp4
 *         processing: unprocessed
 *         processingSuccess: null
 */

export const router = express.Router();
const upload = multer()
/** 
* @swagger
* /file:
*   post:
*     summary: Save mp4 file on device
*     consumes:
*       - multipart/form-data
*     parameters:
*       - in: formData
*         name: video
*         type: file
*         required: true
*         description: The video file to upload
*     responses:
*       200:
*         description: Conservation success
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 id:
*                   type: string
*                   example: "12345"
*/
router.route('/file').post(upload.single('video'),asyncHandler(async (req, res) => {
    const videoData = req.file
    const videoId = await addVideoFile(videoData)
    res.json({ id: videoId }).status(200)

})
)
/**
 * @swagger
 * /file/{id}:
 *   delete:
 *     summary: Delete mp4 file from device
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *         description: Id for delete video file
 *     responses:
 *       200:
 *         description: Removal success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 */
router.route('/file/:id').delete(asyncHandler(async (req,res) => {    
    const { id } = req.params;
    await deleteVideo(id)
    res.json({success: true}).status(200)
})
)


/**
 * @swagger
 * /file/{id}:
 *   patch:
 *     summary: Start change permission
 *     consumes: 
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *         description: Id for change video file
 *       - in: body
 *         name: newPermission
 *         description: New permission format
 *         schema:
 *           type: object
 *           required:
 *            - width
 *            - height
 *           properties:
 *              width:
 *                type: integer
 *                minimum: 22
 *                multipleOf: 2
 *              height:
 *                type: integer
 *                minimum: 22
 *                multipleOf: 2
 *     responses:
 *       200:
 *         description: Successful start of resolution change
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 */

router.route('/file/:id').patch(checkSchema(newPermissionSchema), asyncHandler(async (req,res) => {
    try {
    const { id } = req.params;
    const videoName = await getFileNameById(id)
     const isValidatePermission = validationResult(req);
     if (!isValidatePermission.isEmpty()){
        res.json({error: false}).status(400)
     }
     const newPermission = req.body;
    changePermission(newPermission,videoName,id)
    res.json({success: true}).status(200)
     }catch (err){
        res.status(500).json({success: false})
     }
})
)

/**
 * @swagger
 * /file/{id}:
 *   get:
 *     summary: Get video with current state 
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *         description: Id for get video file
 *     responses:
 *       200:
 *         description: Video with current state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 12345
 *                 filename:
 *                   type: string
 *                   example: videFileOne.mp4
 *                 processing:
 *                   type: string
 *                   enum: [unprocessed, compressing, finished]
 *                   example: unprocessed
 *                 processingSuccess:
 *                   type: [null,boolean]
 *                   example: null
 */
router.route('/file/:id').get( asyncHandler(async (req,res) => {
    const { id } = req.params;
    const fileInfo = await getFileInfo(id);
    res.json(fileInfo).status(200)
})
)