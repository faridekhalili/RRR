(function() {

  'use strict';
  const path = require('path');
  const config = require('./config');
  const fs = require('fs');

  const beforeDir = path.resolve(__dirname, 'results', 'before');
  const afterDir = path.resolve(__dirname, 'results', 'after');

  function compareComplexity() {

    const numProjects = Object.keys(config).length;
    const average = {
      name: 'Average',
      files: 0,
      sloc: {
        before: 0,
        after: 0
      },
      cyclomatic: {
        before: 0,
        after: 0,
      },
      halstead: {
        volume: {
          before: 0,
          after: 0,
        },
        difficulty: {
          before: 0,
          after: 0,
        },
        effort: {
          before: 0,
          after: 0,
        },
        bugs: {
          before: 0,
          after: 0,
        }
      }
    };

    const comparison = []
    Object.keys(config).forEach((projectName) => {
      const before = JSON.parse(fs.readFileSync(path.resolve(beforeDir, projectName + '.json')));
      const after = JSON.parse(fs.readFileSync(path.resolve(afterDir, projectName + '.json')));

      average.files += before.project.numFiles;
      
      average.sloc.before += before.project.sloc.physical;
      average.sloc.after += after.project.sloc.physical;
      
      average.cyclomatic.before += before.project.cyclomatic.value;
      average.cyclomatic.after += after.project.cyclomatic.value

      average.halstead.volume.before += before.project.halstead.volume;
      average.halstead.volume.after += after.project.halstead.volume;
      average.halstead.difficulty.before += before.project.halstead.difficulty;
      average.halstead.difficulty.after += after.project.halstead.difficulty;
      average.halstead.effort.before += before.project.halstead.effort;
      average.halstead.effort.after += after.project.halstead.effort;
      average.halstead.bugs.before += before.project.halstead.bugs;
      average.halstead.bugs.after += after.project.halstead.bugs;

      comparison.push({
        name: projectName,
        files: before.project.numFiles.toString(),
        sloc: {
          before: before.project.sloc.physical.toString(),
          after: after.project.sloc.physical.toString()
        },
        cyclomatic: {
          before: before.project.cyclomatic.value.toString(),
          after: after.project.cyclomatic.value.toString(),
        },
        halstead: {
          volume: {
            before: (before.project.halstead.volume/1000).toFixed(2),
            after: (after.project.halstead.volume/1000).toFixed(2),
          },
          difficulty: {
            before: before.project.halstead.difficulty.toFixed(2),
            after: after.project.halstead.difficulty.toFixed(2),
          },
          effort: {
            before: (before.project.halstead.effort/1000000).toFixed(2),
            after: (after.project.halstead.effort/1000000).toFixed(2),
          },
          bugs: {
            before: before.project.halstead.bugs.toFixed(2),
            after: after.project.halstead.bugs.toFixed(2),
          }
        }
      });

    });
  
    average.files = (average.files / numProjects).toFixed(2);

    average.sloc.before = (average.sloc.before / numProjects).toFixed(2);
    average.sloc.after = (average.sloc.after / numProjects).toFixed(2);
    
    average.cyclomatic.before = (average.cyclomatic.before / numProjects).toFixed(2);
    average.cyclomatic.after = (average.cyclomatic.after / numProjects).toFixed(2);

    average.halstead.volume.before = ((average.halstead.volume.before / numProjects) / 1000).toFixed(2)
    average.halstead.volume.after = ((average.halstead.volume.after / numProjects) / 1000).toFixed(2)
    average.halstead.difficulty.before = ((average.halstead.difficulty.before / numProjects)).toFixed(2)
    average.halstead.difficulty.after = ((average.halstead.difficulty.after / numProjects)).toFixed(2)
    average.halstead.effort.before = ((average.halstead.effort.before / numProjects) / 1000000).toFixed(2)
    average.halstead.effort.after = ((average.halstead.effort.after / numProjects) / 1000000).toFixed(2)
    average.halstead.bugs.before = ((average.halstead.bugs.before / numProjects)).toFixed(2)
    average.halstead.bugs.after = ((average.halstead.bugs.after / numProjects)).toFixed(2)


      console.log(`\n\n ||-------------------------------------------||-------||-----------------||-----------------||-------------------------------------------------------------------------------||`);
      console.log(` ||                    name                   || files ||       sloc      ||   cyclomatic    ||                                      Halstead                                 ||`);
      console.log(` ||-------------------------------------------||-------||-----------------||-----------------||-------------------------------------------------------------------------------||`);
      console.log(` ||                                           ||       ||                 ||                 ||    Volume(10^3)   |     Difficulty    |    Effort(10^6)   |        Bugs       ||`);
      console.log(` ||                                           ||       || before |  after || before |  after ||  before |  after  |  before |  after  |  before |  after  |  before |  after  ||`);
      console.log(` ||-------------------------------------------||-------||-----------------||-----------------||-------------------------------------------------------------------------------||`);
      comparison.forEach(item => {
      // console.log(item);
      console.log(` || ${item.name.padEnd('41', ' ')} ||${item.files.padStart(6, ' ')} ||${item.sloc.before.padStart(7, ' ')} |${item.sloc.after.padStart(7, ' ')} ||${item.cyclomatic.before.padStart(7, ' ')} |${item.cyclomatic.after.padStart(7, ' ')} ||${item.halstead.volume.before.padStart(8, ' ')} |${item.halstead.volume.after.padStart(8, ' ')} |${item.halstead.difficulty.before.padStart(8, ' ')} |${item.halstead.difficulty.after.padStart(8, ' ')} |${item.halstead.effort.before.padStart(8, ' ')} |${item.halstead.effort.after.padStart(8, ' ')} |${item.halstead.bugs.before.padStart(8, ' ')} |${item.halstead.bugs.after.padStart(8, ' ')} ||`);
    });
      console.log(` ||-------------------------------------------||-------||-----------------||-----------------||-------------------------------------------------------------------------------||`);
      console.log(` || ${average.name.padEnd('41', ' ')} ||${average.files.padStart(6, ' ')} ||${average.sloc.before.padStart(7, ' ')} |${average.sloc.after.padStart(7, ' ')} ||${average.cyclomatic.before.padStart(7, ' ')} |${average.cyclomatic.after.padStart(7, ' ')} ||${average.halstead.volume.before.padStart(8, ' ')} |${average.halstead.volume.after.padStart(8, ' ')} |${average.halstead.difficulty.before.padStart(8, ' ')} |${average.halstead.difficulty.after.padStart(8, ' ')} |${average.halstead.effort.before.padStart(8, ' ')} |${average.halstead.effort.after.padStart(8, ' ')} |${average.halstead.bugs.before.padStart(8, ' ')} |${average.halstead.bugs.after.padStart(8, ' ')} ||`)
      console.log(` ||---------------------------------------------------------------------------------------------------------------------------------------------------------------------------||\n\n`);
  }   

  module.exports = compareComplexity;

}());