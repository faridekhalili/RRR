(function(){

  'use strict';

  const fs = require('fs');
  const path = require('path');

  function generateFileList(filePath) {

    return new Promise(async (resolve, reject) => {

      if (!fs.existsSync(filePath)) {
        return reject(new Error('File not found: ' + filePath));
      }

      const fileList = [];

      async function findCodeFilesInDirectory(fileName) {
        const promises = [];
        const stat = await fs.promises.stat(fileName);
        if (stat.isDirectory()) {
          const files = (await fs.promises.readdir(fileName)).filter(file => file != 'node_modules');
          files.forEach(async (file) => {
            promises.push(findCodeFilesInDirectory(path.resolve(fileName, file)));
          });
          return Promise.all(promises)
            .catch((e) => reject(e));
        } else {
          if (fileName.endsWith('.ts') || fileName.endsWith('.tsx') || fileName.endsWith('.js') || fileName.endsWith('.jsx')) {
            fileList.push(fileName);
          }
          return Promise.resolve();
        }

      }

      await findCodeFilesInDirectory(filePath);
      return resolve(fileList);

    });

  }

  function getBaseLog(x, y) {
    return Math.log(x) / Math.log(y);
  }

  const resultsDir = path.join(__dirname, 'results');

  function clean() {
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
      return;
    }

    for (const name of fs.readdirSync(resultsDir)) {
      const fullPath = path.join(resultsDir, name);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }

  function makeDirectories(filePath) {
    if(fs.existsSync(filePath)) {
      return;
    }
    fs.mkdirSync(filePath, { recursive: true });
  }

  module.exports = {
    getBaseLog,
    generateFileList,
    clean,
    makeDirectories
  }

}());