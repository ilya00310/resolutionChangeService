import { PrismaClient } from "@prisma/client"
import fsp from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()
const processingProcess = {
    'unprocessed': 'unprocessed',
    'compressing': 'compressing',
    'finished': 'finished',
}
const getVideoPath =  (UUID) => path.join(process.cwd(),'videos', `${UUID}.mp4`)

export const fixedVideoProcessInDb =  async (UUID) => {
    try {
    const newF = await prisma.videoProcess.create({
        data: {
            video_id: UUID,
            processing_stage: processingProcess.unprocessed,
        }
        
    })
    console.log(newF);
 } catch (err) {
    console.log(err)
        throw new error(err)
    }
}

export const deleteVideo = async (UUID) => {
    const videoPath = getVideoPath(UUID);
    const deleteVideo = await fsp.rm(videoPath)
    await prisma.videoProcess.delete({
        where:{
            video_id: UUID
        }
    })
    return deleteVideo
}