/*
  Warnings:

  - You are about to drop the column `hRId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `teamleadId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChatToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Chat` DROP FOREIGN KEY `Chat_hRId_fkey`;

-- DropForeignKey
ALTER TABLE `Chat` DROP FOREIGN KEY `Chat_teamleadId_fkey`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_userId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_positionId_fkey`;

-- DropForeignKey
ALTER TABLE `_ChatToUser` DROP FOREIGN KEY `_ChatToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ChatToUser` DROP FOREIGN KEY `_ChatToUser_B_fkey`;

-- DropIndex
DROP INDEX `Chat_hRId_fkey` ON `Chat`;

-- DropIndex
DROP INDEX `Chat_teamleadId_fkey` ON `Chat`;

-- DropIndex
DROP INDEX `Comment_userId_fkey` ON `Comment`;

-- DropIndex
DROP INDEX `Message_userId_fkey` ON `Message`;

-- AlterTable
ALTER TABLE `Chat` DROP COLUMN `hRId`,
    DROP COLUMN `teamleadId`;

-- AlterTable
ALTER TABLE `Comment` DROP COLUMN `userId`,
    ADD COLUMN `InternId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Message` DROP COLUMN `userId`,
    ADD COLUMN `InternId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `User`;

-- DropTable
DROP TABLE `_ChatToUser`;

-- CreateTable
CREATE TABLE `Intern` (
    `id` VARCHAR(191) NOT NULL,
    `login` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `positionId` VARCHAR(191) NOT NULL,
    `mentorId` VARCHAR(191) NULL,
    `role` ENUM('HR', 'TEAMLEAD', 'INTERN', 'DEVELOPER') NOT NULL,

    UNIQUE INDEX `Intern_login_key`(`login`),
    UNIQUE INDEX `Intern_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ChatToIntern` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ChatToIntern_AB_unique`(`A`, `B`),
    INDEX `_ChatToIntern_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ChatToHR` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ChatToHR_AB_unique`(`A`, `B`),
    INDEX `_ChatToHR_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ChatToTeamlead` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ChatToTeamlead_AB_unique`(`A`, `B`),
    INDEX `_ChatToTeamlead_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Intern` ADD CONSTRAINT `Intern_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `Position`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Intern` ADD CONSTRAINT `Intern_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `Teamlead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_InternId_fkey` FOREIGN KEY (`InternId`) REFERENCES `Intern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_InternId_fkey` FOREIGN KEY (`InternId`) REFERENCES `Intern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ChatToIntern` ADD CONSTRAINT `_ChatToIntern_A_fkey` FOREIGN KEY (`A`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ChatToIntern` ADD CONSTRAINT `_ChatToIntern_B_fkey` FOREIGN KEY (`B`) REFERENCES `Intern`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ChatToHR` ADD CONSTRAINT `_ChatToHR_A_fkey` FOREIGN KEY (`A`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ChatToHR` ADD CONSTRAINT `_ChatToHR_B_fkey` FOREIGN KEY (`B`) REFERENCES `HR`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ChatToTeamlead` ADD CONSTRAINT `_ChatToTeamlead_A_fkey` FOREIGN KEY (`A`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ChatToTeamlead` ADD CONSTRAINT `_ChatToTeamlead_B_fkey` FOREIGN KEY (`B`) REFERENCES `Teamlead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
