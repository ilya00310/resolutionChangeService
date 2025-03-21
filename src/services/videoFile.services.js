import { PrismaClient, ProcessingProcess, ProcessingSuccess } from "@prisma/client"
import fsp from 'fs/promises'
import path from 'path'
import ffmpeg from "fluent-ffmpeg"

const prisma = new PrismaClient()

const getVideoPath =  (fileName) => path.join(process.cwd(),'videos', fileName)
const addVideoInDb = async (filename) => {
const { id } = await prisma.video.create({
    data: { filename }
})
return id
}
const addVideoInFolder = async (fileData) => {
    const { originalname, buffer } = fileData
const videoPath = getVideoPath(originalname);
await fsp.writeFile(videoPath, buffer);
}

export const addVideoFile =  async (fileData) => {
    try {
    const fileName = fileData.originalname; 
    return  prisma.$transaction(async () => {
        const videoId = await addVideoInDb(fileName);
        await addVideoInFolder(fileData)
        return videoId
       
    })
 } catch (err) {
        throw (err)
    }
}

const getVideoNameById = async (id) => {
    const { filename } = await prisma.video.findFirst({
        where: { id }
    })
    return filename
}
const deleteVideoFromDb = async (id) => await prisma.video.delete({
    where:{ id }
});
const deleteVideoFile = async (filePath) => await fsp.rm(filePath);

export const deleteVideo = async (id)  => {
    const filename = await getVideoNameById(id)
    const filePath = getVideoPath(filename);
    await prisma.$transaction(async () => {
        await deleteVideoFromDb(id);
        await deleteVideoFile(filePath)
    })
}

const changeDbFromSuccessOrError = async (id,err) =>{ 
 const newValue = {
    processing: err ? ProcessingProcess.unprocessed : ProcessingProcess.finished,
    processingSuccess: err ?  ProcessingSuccess.false : ProcessingSuccess.true
 }
 await prisma.video.update({
    where: { id },
    data: newValue
})
}

const changeDbFromStartCompression = async (id) => await prisma.video.update({
    where: { id },
    data : {
        processing: ProcessingProcess.compressing
    }
})
const errorHandler = async (id, videoPath,videoOldPath,err) => {
    await changeDbFromSuccessOrError(id,err)
    await deleteVideoFile(videoPath);
    await fsp.rename(videoOldPath, videoPath)
}

export const changePermission = async(newPermission,id) => {
    try {
    const videoName = await getVideoNameById(id)
    const videoPath = getVideoPath(videoName);
    const videoOldPath = getVideoPath(`${id}Old`)
    const { width, height } = newPermission

    await fsp.rename(videoPath, videoOldPath)
    return new Promise ((resolve, reject) => {
    ffmpeg(videoOldPath)
    .size(`${width}x${height}`)
    .save(videoPath)
    .on('start', async () => {
        try {
        await changeDbFromStartCompression(id)
        }catch(err){
            await errorHandler(id, videoPath,videoOldPath,err)
            reject(err)
        }
    })
    .on('end', async () =>   {
        try {
        await prisma.$transaction(async () => { 
            await changeDbFromSuccessOrError()
            await deleteVideoFile(videoOldPath);
        });
        resolve()
        } catch(err) {
    await errorHandler(id, videoPath,videoOldPath,err)
    reject(err)
    }
    })
})
}catch(err){
    throw(err)
}
}

export const getFileInfo = async (id) =>  await prisma.video.findFirst({
    where: { id }
});

