-- CreateEnum
CREATE TYPE "ParentSalutation" AS ENUM ('MR', 'MRS', 'MS', 'MX');

-- AlterTable
ALTER TABLE "ParentProfile" ADD COLUMN     "salutation" "ParentSalutation" NOT NULL DEFAULT 'MR';
