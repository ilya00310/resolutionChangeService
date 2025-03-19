-- CreateTable
CREATE TABLE "VideoProcess" (
    "id" SERIAL NOT NULL,
    "video_id" TEXT NOT NULL,
    "processing_stage" TEXT NOT NULL,

    CONSTRAINT "VideoProcess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoProcess_video_id_key" ON "VideoProcess"("video_id");
