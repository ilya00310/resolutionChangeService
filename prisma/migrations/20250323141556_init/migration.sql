-- CreateEnum
CREATE TYPE "ProcessingProcess" AS ENUM ('unprocessed', 'compressing', 'finished');

-- CreateEnum
CREATE TYPE "ProcessingSuccess" AS ENUM ('null', 'true', 'false');

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "processing" "ProcessingProcess" NOT NULL DEFAULT 'unprocessed',
    "processingSuccess" "ProcessingSuccess" NOT NULL DEFAULT 'null',

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_filename_key" ON "Video"("filename");
