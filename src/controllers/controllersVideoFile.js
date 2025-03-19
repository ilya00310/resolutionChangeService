import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
const processingProcess = {
    'unprocessed': 'unprocessed',
    'compressing': 'compressing',
    'finished': 'finished',
}

export const fixedVideoProcessInDb =  async (UUID) => {
    await prisma.videoProcess.create({
        data: {
            video_id: UUID,
            processing_stage: processingProcess.unprocessed,
        }
    })
}
