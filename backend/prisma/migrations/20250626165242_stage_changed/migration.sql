/*
  Warnings:

  - Added the required column `internId` to the `Stage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Stage` ADD COLUMN `internId` VARCHAR(191) NOT NULL,
    ADD COLUMN `teamleadId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Stage` ADD CONSTRAINT `Stage_teamleadId_fkey` FOREIGN KEY (`teamleadId`) REFERENCES `Teamlead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stage` ADD CONSTRAINT `Stage_internId_fkey` FOREIGN KEY (`internId`) REFERENCES `Intern`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
