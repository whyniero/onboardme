/*
  Warnings:

  - You are about to drop the column `hRId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `hRId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `HR` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ChatParticipant` DROP FOREIGN KEY `fk_chat_hr`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_hRId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_hRId_fkey`;

-- DropIndex
DROP INDEX `Comment_hRId_fkey` ON `Comment`;

-- DropIndex
DROP INDEX `Message_hRId_fkey` ON `Message`;

-- AlterTable
ALTER TABLE `Comment` DROP COLUMN `hRId`,
    ADD COLUMN `hrId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Message` DROP COLUMN `hRId`,
    ADD COLUMN `hrId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `HR`;

-- CreateTable
CREATE TABLE `Hr` (
    `id` VARCHAR(191) NOT NULL,
    `login` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `lastOnline` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `role` ENUM('HR', 'TEAMLEAD', 'INTERN', 'DEVELOPER') NOT NULL,

    UNIQUE INDEX `Hr_login_key`(`login`),
    UNIQUE INDEX `Hr_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_hrId_fkey` FOREIGN KEY (`hrId`) REFERENCES `Hr`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `fk_chat_hr` FOREIGN KEY (`userId`) REFERENCES `Hr`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_hrId_fkey` FOREIGN KEY (`hrId`) REFERENCES `Hr`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
