import { PrismaClient } from "@prisma/client"
import fsp from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const prisma = new PrismaClient()

const getVideoPath =  (videoId) => path.join(process.cwd(),'videos', `${videoId}.mp4`)
const addVideoInDb = async (videoId) => {
await prisma.video.create({
    data: {
        video_id: videoId,
    }
})
}
const addVideoInFolder = async (videoData, videoId) => {
const videoPath = getVideoPath(videoId);
await fsp.writeFile(videoPath, videoData.buffer);
}

export const addVideoFile =  async (videoData) => {
    try {
    const videoId = crypto.randomUUID();
    await prisma.$transaction(async () => {
        await addVideoInDb(videoId);
        await addVideoInFolder(videoData, videoId)
    })
    return videoId
 } catch (err) {
        throw (err)
    }
}

const deleteVideoFromDb = async (id) => await prisma.video.delete({
        where:{
            video_id: id
        }
    });
const deleteVideoFile = async (videoPath) => await fsp.rm(videoPath);

export const deleteVideo = async (id)  => {
        const videPath = getVideoPath(id);
        await prisma.$transaction(async () => {
            await deleteVideoFromDb(id);
            await deleteVideoFile(videPath)
        })
}

export const startChangePermission = (newPermission) => {
    

}