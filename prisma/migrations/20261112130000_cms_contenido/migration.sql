-- CreateTable
CREATE TABLE "CmsDocument" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "draft" JSONB,
    "published" JSONB,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "CmsDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "data" JSONB,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT,

    CONSTRAINT "CmsVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CmsDocument_kind_deleted_idx" ON "CmsDocument"("kind", "deleted");

-- CreateIndex
CREATE UNIQUE INDEX "CmsDocument_kind_key_key" ON "CmsDocument"("kind", "key");

-- CreateIndex
CREATE INDEX "CmsVersion_documentId_createdAt_idx" ON "CmsVersion"("documentId", "createdAt");

-- AddForeignKey
ALTER TABLE "CmsDocument" ADD CONSTRAINT "CmsDocument_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsVersion" ADD CONSTRAINT "CmsVersion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsVersion" ADD CONSTRAINT "CmsVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CmsDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

