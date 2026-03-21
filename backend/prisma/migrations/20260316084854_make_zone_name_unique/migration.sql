/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `zones` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "zones_name_key" ON "zones"("name");
