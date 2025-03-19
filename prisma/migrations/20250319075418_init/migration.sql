-- CreateTable
CREATE TABLE "VideoProcess" (
    "id" SERIAL NOT NULL,
    "processing_stage" TEXT NOT NULL,

    CONSTRAINT "VideoProcess_pkey" PRIMARY KEY ("id")
);
