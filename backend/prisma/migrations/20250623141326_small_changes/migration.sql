/*
  Warnings:

  - You are about to drop the column `InternId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `hrId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `teamleadId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_InternId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_hrId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_teamleadId_fkey`;

-- DropIndex
DROP INDEX `Message_InternId_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Message_hrId_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Message_teamleadId_fkey` ON `Message`;

-- AlterTable
ALTER TABLE `Message` DROP COLUMN `InternId`,
    DROP COLUMN `hrId`,
    DROP COLUMN `teamleadId`,
    ADD COLUMN `senderId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `fk_message_hr` FOREIGN KEY (`senderId`) REFERENCES `Hr`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `fk_message_teamlead` FOREIGN KEY (`senderId`) REFERENCES `Teamlead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `fk_message_intern` FOREIGN KEY (`senderId`) REFERENCES `Intern`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
