-- CreateEnum
CREATE TYPE "ExecutionMode" AS ENUM ('CLOUD', 'LOCAL');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "executionMode" "ExecutionMode" NOT NULL DEFAULT 'CLOUD';
