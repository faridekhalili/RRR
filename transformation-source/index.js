(function() {

  'use strict';

  const fs = require('fs');
  const path = require('path');

  const evaluationPath = path.resolve(__dirname, 'evaluation'); 
  const rawDataPath = path.resolve(evaluationPath, 'raw-data');

  const queryNames = fs.readdirSync(rawDataPath, 'utf8');
  queryNames.forEach(queryName => {

    const queryResultPath = path.resolve(rawDataPath, queryName);
    const resultFiles = fs.readdirSync(queryResultPath, 'utf8').filter(fileName => fileName.endsWith('csv'));

    resultFiles.forEach(resultFile => {
      const projectName = resultFile.replace('.csv', '');
      const projectPath = path.resolve(evaluationPath, projectName);
      if(!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath);
      }

      fs.copyFileSync(path.resolve(queryResultPath, resultFile), path.resolve(projectPath, queryName + '.csv'));

    });


  }); 


}());