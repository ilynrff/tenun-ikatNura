-- CreateEnum
CREATE TYPE "CompletionSource" AS ENUM ('CUSTOMER_CONFIRMED', 'ADMIN_CONFIRMED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "receivedAt" TIMESTAMP(3),
ADD COLUMN "completionSource" "CompletionSource";

