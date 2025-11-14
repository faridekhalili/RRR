(async function(){

  'use strict';
  const analyze = require('./complexity-analyzer');
  const {clean, makeDirectories} = require('./helpers');
  const path = require('path');
  const fs = require('fs');
  const config = require('./config');
  const execSync = require('child_process').execSync;

  const outputDir = path.resolve(__dirname, 'results');

  async function calculateComplexity() {
    clean(outputDir);
    makeDirectories(path.resolve(outputDir, 'before'));
    makeDirectories(path.resolve(outputDir, 'after'));

    console.log('\nCollecting code complexity before transformation...\n');
    await Promise.all(Object.values(config).map(async (project) => {
      console.log(`processing project: ${project.name}`);
      console.log(execSync(`cd ${project.srcPath} && git reset HEAD --hard && git clean -fd && git checkout before_transformation`).toString());
      const complexity = await analyze(project.srcPath);
      await fs.promises.writeFile(path.resolve(outputDir, 'before', project.name + '.json'), JSON.stringify(complexity, null, 2), 'utf-8');
      console.log(`project done: ${project.name}`);
    }));

    console.log('\nCollecting code complexity after transformation...\n');
    await Promise.all(Object.values(config).map(async (project) => {
      console.log(`processing project: ${project.name}`);
      console.log(execSync(`cd ${project.srcPath} && git reset HEAD --hard && git clean -fd && git checkout after_transformation`).toString());
      const complexity = await analyze(project.srcPath);
      await fs.promises.writeFile(path.resolve(outputDir, 'after', project.name + '.json'), JSON.stringify(complexity, null, 2), 'utf-8');
      console.log(`project done: ${project.name}`);
    }));

    console.log('\nDone');
  }

  module.exports = calculateComplexity;

}());