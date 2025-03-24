import { PrismaClient, ProcessingProcess, ProcessingSuccess } from "@prisma/client"
import fsp from 'fs/promises'
import { existsSync } from "fs"
import path from 'path'
import ffmpeg from "fluent-ffmpeg"
import createError from 'http-errors'
const prisma = new PrismaClient()

const getVideoPath =  (filename) => path.join(process.cwd(),'videos', filename)
const addVideoInDb = async (filename) => {
const { id } = await prisma.video.create({
    data: { filename }
})
return id

}
const addVideoInFolder = async (videoPath, buffer) => {
 try {
    await fsp.writeFile(videoPath, buffer)
}catch{
    throw createError(500, 'Video wasn\'t added in the file system') 
}
}

const deleteVideoFile = async (filePath) => await fsp.rm(filePath);

export const addVideoFile =  async (fileData) => {
    const {originalname, buffer} = fileData;
    const videoPath = getVideoPath(originalname)
        if (existsSync(videoPath)){
            throw createError(409, 'The video already exists in the folder')
        }

    return prisma.$transaction(async () => {
        await addVideoInFolder(videoPath, buffer)
        try {
        const videoId = await addVideoInDb(originalname)
        return videoId
        }catch(err) {
        await deleteVideoFile(videoPath)
        throw createError(500, 'Video wasn\'t added in the database')            
        }
    })
}

export const getFileNameById = async (id) => {
    try {
    const { filename } = await prisma.video.findFirst({
        where: { id }
    })
    return filename
}catch {
    throw createError(404, 'Video don\'t found')
}
}
const deleteVideoFromDb = async (id) => { 
    try {
    await prisma.video.delete({
    where:{ id }
});
}catch {
    throw createError(404, 'Video don\t found')
}
}

export const deleteVideo = async (id)  => {
    const filename = await getFileNameById(id)
    const filePath = getVideoPath(filename);
        try {
        await deleteVideoFile(filePath)
        } catch(err) {
            console.error(`Error with delete ${filePath}:`, err.stack || err.message)
        }
        await deleteVideoFromDb(id);
}

const getUpdateDataForDb = (err) =>  ({
    processing: err ? ProcessingProcess.unprocessed : ProcessingProcess.finished,
    processingSuccess: err ?  ProcessingSuccess.false : ProcessingSuccess.true
 })
 const updateDbData = async (id, newValue) =>  await prisma.video.update({
    where: { id },
    data: newValue
})
const changeDbFromSuccess = async (id) =>{
const newValue = getUpdateDataForDb()
await updateDbData(id, newValue)
}

const changeDbFromError = async (id, err) => {
const newValue = getUpdateDataForDb(err)
await updateDbData(id,newValue)
}

const errorHandler = async (id, videoPath,videoOldPath,err) => {
    try {
    await changeDbFromError(id,err)
    await deleteVideoFile(videoPath);
    await fsp.rename(videoOldPath, videoPath)
    }catch(err) {
        console.error(`Error in errorHandler for video ${id}:`, err.stack || err.message);
        console.error(`Video path: ${videoPath}, Old video path: ${videoOldPath}`);
    }
}

const changeDbFromStartCompression = async (id) =>  {
    await prisma.video.update({
    where: { id },
    data : {
        processing: ProcessingProcess.compressing
    }
})
}

const getOldVideoPath = (videoName) =>{
    const [videoNameWithoutFormat, formatData] = videoName.split('.');
    const oldFileName = `${videoNameWithoutFormat}Old.${formatData}`;
   return getVideoPath(oldFileName)
}

export const changePermission = async (newPermission, videoName,id) => {
    try {
    const videoPath = getVideoPath(videoName);
    const videoOldPath = getOldVideoPath(videoName);
    const { width, height } = newPermission;
    await fsp.rename(videoPath, videoOldPath);
    return new Promise((resolve, reject) => {
        ffmpeg(videoOldPath)
            .size(`${width}x${height}`)
            .save(videoPath)
            .on('start', async () => {
                try {
                    await changeDbFromStartCompression(id);
                } catch (err) {
                    await fsp.rename(videoOldPath, videoPath);
                    console.error(`Error updating database for video ${id}:`, err.stack || err.message);                    
                    reject(err);
                }
            })
            .on('end', async () => {
                try {
                    await prisma.$transaction(async () => {
                        console.log(3)
                        await changeDbFromSuccess(id); 
                        await deleteVideoFile(videoOldPath);
                    });
                    resolve();
                } catch (err) {
                    await errorHandler(id, videoPath, videoOldPath, err);
                    console.error(`Error deleting old file or updating database for video ${id}:`, err.stack || err.message);                    
                    reject(err)
                }
            })
            .on('error', async (err) => {
                await errorHandler(id, videoPath, videoOldPath, err);
                reject(err);
            });
    });
} catch(err){
    console.error(`Error in changePermission for video ${id}:`, err.stack || err.message);
    throw err
}
};

export const getFileInfo = async (id) => { 
    const currentVideoInfo = await prisma.video.findFirst({
    where: { id }
});
if(!currentVideoInfo) throw createError(404, 'Video with current id don\'t found')
    return currentVideoInfo
}

