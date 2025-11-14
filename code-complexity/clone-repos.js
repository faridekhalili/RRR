(function(){

  const {clean, makeDirectories} = require('./helpers');
  const path = require('path');
  const config = require('./config');
  const execSync = require('child_process').execSync;

  const pathToRepos = path.resolve(__dirname, '..', '..', 'candidates');

  clean(pathToRepos);
  makeDirectories(pathToRepos);
  
  Object.values(config).forEach(project => {
    console.log(execSync(`cd ${pathToRepos} && git clone ${project.githubUrl}`).toString());
  });

}());