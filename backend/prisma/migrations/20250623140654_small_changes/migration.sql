-- DropForeignKey
ALTER TABLE `Intern` DROP FOREIGN KEY `Intern_positionId_fkey`;

-- DropIndex
DROP INDEX `Intern_positionId_fkey` ON `Intern`;

-- AlterTable
ALTER TABLE `Intern` MODIFY `positionId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Intern` ADD CONSTRAINT `Intern_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `Position`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
