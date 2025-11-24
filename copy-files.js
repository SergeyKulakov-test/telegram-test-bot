// copy-files.js
const fs = require('fs-extra');
const path = require('path');

async function copyFiles() {
  try {
    // Копируем папку data
    if (fs.existsSync('src/data')) {
      await fs.copy('src/data', 'dist/data');
      console.log('✓ Папка data скопирована');
    }
    
    // Копируем types.ts если существует
    if (fs.existsSync('src/types.ts')) {
      await fs.copy('src/types.ts', 'dist/types.ts');
      console.log('✓ types.ts скопирован');
    }
    
    console.log('✓ Все файлы успешно скопированы');
  } catch (error) {
    console.error('✗ Ошибка при копировании файлов:', error);
    process.exit(1);
  }
}

copyFiles();