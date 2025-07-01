1. после скачивания прописать npm install в папке dist.
2. удалить в появившемся node_mofules prisma и .prisma (или @prisma).
3. создать папки, должно получиться так - dist/uploads/chats (для хранения файлов из чатов)
4. распаковать архив prisma_files.rar, и из распакованной папки перенести prisma и .prisma (или @prisma) в node_modules (по отдельности, а не всю папку prisma_files)
5. зайти в ecosystem.config.cjs и настроить два env_production (и на всякий env) местах. там все подписано
   
