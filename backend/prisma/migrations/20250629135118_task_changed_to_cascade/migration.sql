-- DropForeignKey
ALTER TABLE `Task` DROP FOREIGN KEY `Task_stageId_fkey`;

-- DropIndex
DROP INDEX `Task_stageId_fkey` ON `Task`;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `Stage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
