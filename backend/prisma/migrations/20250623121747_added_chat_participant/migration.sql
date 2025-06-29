/*
  Warnings:

  - You are about to drop the `_ChatToHR` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChatToIntern` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChatToTeamlead` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_ChatToHR` DROP FOREIGN KEY `_ChatToHR_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ChatToHR` DROP FOREIGN KEY `_ChatToHR_B_fkey`;

-- DropForeignKey
ALTER TABLE `_ChatToIntern` DROP FOREIGN KEY `_ChatToIntern_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ChatToIntern` DROP FOREIGN KEY `_ChatToIntern_B_fkey`;

-- DropForeignKey
ALTER TABLE `_ChatToTeamlead` DROP FOREIGN KEY `_ChatToTeamlead_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ChatToTeamlead` DROP FOREIGN KEY `_ChatToTeamlead_B_fkey`;

-- DropTable
DROP TABLE `_ChatToHR`;

-- DropTable
DROP TABLE `_ChatToIntern`;

-- DropTable
DROP TABLE `_ChatToTeamlead`;

-- CreateTable
CREATE TABLE `ChatParticipant` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('HR', 'TEAMLEAD', 'INTERN', 'DEVELOPER') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `ChatParticipant_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `fk_chat_hr` FOREIGN KEY (`userId`) REFERENCES `HR`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `fk_chat_teamlead` FOREIGN KEY (`userId`) REFERENCES `Teamlead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `fk_chat_intern` FOREIGN KEY (`userId`) REFERENCES `Intern`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
