/*
  Warnings:

  - A unique constraint covering the columns `[conversationId]` on the table `sandbox_sessions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `sandbox_sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ConversationMode" AS ENUM ('CHAT', 'AGENT');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "mode" "ConversationMode" NOT NULL DEFAULT 'CHAT';

-- AlterTable
ALTER TABLE "sandbox_sessions" ADD COLUMN     "conversationId" TEXT,
ADD COLUMN     "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "sandbox_sessions_conversationId_key" ON "sandbox_sessions"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "sandbox_sessions_externalId_key" ON "sandbox_sessions"("externalId");

-- AddForeignKey
ALTER TABLE "sandbox_sessions" ADD CONSTRAINT "sandbox_sessions_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
