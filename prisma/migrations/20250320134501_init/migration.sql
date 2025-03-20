-- CreateEnum
CREATE TYPE "ProcessingProcess" AS ENUM ('unprocessed', 'compressing', 'finished');

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "video_id" TEXT NOT NULL,
    "processing_stage" "ProcessingProcess" NOT NULL DEFAULT 'unprocessed',

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_video_id_key" ON "Video"("video_id");
