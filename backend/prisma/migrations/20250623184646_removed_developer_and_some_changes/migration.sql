/*
  Warnings:

  - The values [DEVELOPER] on the enum `Message_senderRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `InternId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `hrId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `teamleadId` on the `Comment` table. All the data in the column will be lost.
  - The values [DEVELOPER] on the enum `Message_senderRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [DEVELOPER] on the enum `Message_senderRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [DEVELOPER] on the enum `Message_senderRole` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `senderId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderRole` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderRole` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ChatParticipant` DROP FOREIGN KEY `fk_chat_hr`;

-- DropForeignKey
ALTER TABLE `ChatParticipant` DROP FOREIGN KEY `fk_chat_intern`;

-- DropForeignKey
ALTER TABLE `ChatParticipant` DROP FOREIGN KEY `fk_chat_teamlead`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_InternId_fkey`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_hrId_fkey`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_teamleadId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `fk_message_hr`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `fk_message_intern`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `fk_message_teamlead`;

-- DropIndex
DROP INDEX `fk_chat_hr` ON `ChatParticipant`;

-- DropIndex
DROP INDEX `Comment_InternId_fkey` ON `Comment`;

-- DropIndex
DROP INDEX `Comment_hrId_fkey` ON `Comment`;

-- DropIndex
DROP INDEX `Comment_teamleadId_fkey` ON `Comment`;

-- DropIndex
DROP INDEX `fk_message_intern` ON `Message`;

-- AlterTable
ALTER TABLE `ChatParticipant` MODIFY `role` ENUM('HR', 'TEAMLEAD', 'INTERN') NOT NULL;

-- AlterTable
ALTER TABLE `Comment` DROP COLUMN `InternId`,
    DROP COLUMN `hrId`,
    DROP COLUMN `teamleadId`,
    ADD COLUMN `senderId` VARCHAR(191) NOT NULL,
    ADD COLUMN `senderRole` ENUM('HR', 'TEAMLEAD', 'INTERN') NOT NULL;

-- AlterTable
ALTER TABLE `Hr` MODIFY `role` ENUM('HR', 'TEAMLEAD', 'INTERN') NOT NULL;

-- AlterTable
ALTER TABLE `Intern` MODIFY `role` ENUM('HR', 'TEAMLEAD', 'INTERN') NOT NULL;

-- AlterTable
ALTER TABLE `Message` ADD COLUMN `senderRole` ENUM('HR', 'TEAMLEAD', 'INTERN') NOT NULL;

-- AlterTable
ALTER TABLE `Teamlead` MODIFY `role` ENUM('HR', 'TEAMLEAD', 'INTERN') NOT NULL;
