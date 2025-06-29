-- AlterTable
ALTER TABLE `Teamlead` ADD COLUMN `positionId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Teamlead` ADD CONSTRAINT `Teamlead_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `Position`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
