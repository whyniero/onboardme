/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Position` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[color]` on the table `Position` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Position_name_key` ON `Position`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Position_color_key` ON `Position`(`color`);
