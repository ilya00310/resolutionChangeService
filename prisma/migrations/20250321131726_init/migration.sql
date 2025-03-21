-- CreateEnum
CREATE TYPE "ProcessingProcess" AS ENUM ('unprocessed', 'compressing', 'finished');

-- CreateEnum
CREATE TYPE "ProcessingSuccess" AS ENUM ('null', 'true', 'false');

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "video_name" TEXT NOT NULL,
    "processing_stage" "ProcessingProcess" NOT NULL DEFAULT 'unprocessed',
    "processing_success" "ProcessingSuccess" NOT NULL DEFAULT 'null',

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_video_name_key" ON "Video"("video_name");
