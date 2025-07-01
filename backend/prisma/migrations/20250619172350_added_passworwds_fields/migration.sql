/*
  Warnings:

  - Added the required column `password` to the `HR` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Teamlead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `HR` ADD COLUMN `password` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Teamlead` ADD COLUMN `password` VARCHAR(191) NOT NULL;
