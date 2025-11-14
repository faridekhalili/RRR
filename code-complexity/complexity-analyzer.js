(function() {

  'use strict';

  const escomplex = require('escomplex');
  const babelCore = require('@babel/core');
  const fs = require('fs');
  const { getBaseLog, generateFileList } = require('./helpers');


  async function analyze(projectPath) {

    const fileList = await generateFileList(projectPath);

    const complexity = { project: {}, files: {} };
    
    fileList.forEach(filePath => {
      
      const code = fs.readFileSync(filePath, 'utf8');
      const babelConfig = {
        filename: filePath,
        // plugins: ['@babel/plugin-transform-typescript', '@babel/plugin-transform-react-jsx', ['@babel/plugin-proposal-decorators', {version: 'legacy'}]],
        plugins: [['@babel/plugin-proposal-decorators', { version: "legacy" }], 'babel-plugin-parameter-decorator'],
        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
      }
      
      const transformedCode = babelCore.transformSync(code, babelConfig);

      const result = escomplex.analyse(transformedCode.code);

      const n1 = result.aggregate.halstead.operators.distinct;
      const N1 = result.aggregate.halstead.operators.total;
      
      const n2 = result.aggregate.halstead.operands.distinct;
      const N2 = result.aggregate.halstead.operands.total;

      const programVocabulary = n1 + n2;
      const programLength = N1 + N2;
      const estimatedProgramLength = (n1*getBaseLog(n2, 2)) + (n2*getBaseLog(n2, 2));
      const volume = programLength * getBaseLog(programVocabulary, 2);
      const difficulty = (n1/2) * (N2/n2);
      const effort = volume * difficulty;
      const timeRequiredToProgram =  effort / 18;
      const bugsDelivered = volume/3000; 

      const slocPhysical = result.aggregate.sloc.physical;
      const slocLogical = result.aggregate.sloc.logical;

      const cyclomaticComplexity = result.aggregate.cyclomatic;
      const cyclomaticDensity = (cyclomaticComplexity / slocLogical) * 100;

      complexity.files[filePath] = {
        sloc: {
          physical: slocPhysical,
          logical: slocLogical
        },
        cyclomatic: {
          value: cyclomaticComplexity,
          density: cyclomaticDensity
        },
        halstead: {
          distinctOperators: n1,
          totalOperators: N1,
          distinctOperands: n2,
          totalOperands: N2,
          vocabulary: programVocabulary,
          length: programLength,
          estimatedLength: estimatedProgramLength,
          volume: volume,
          difficulty: difficulty,
          effort: effort,
          time: timeRequiredToProgram,
          bugs: bugsDelivered
        }
      };
    });

    complexity.project = {
      numFiles: 0,
      sloc: {
        physical: 0,
        logical: 0
      },
      cyclomatic: {
        value: 0,
        density: 0
      },
      halstead: {
        distinctOperators: 0,
        totalOperators: 0,
        distinctOperands: 0,
        totalOperands: 0,
        vocabulary: 0,
        length: 0,
        estimatedLength: 0,
        volume: 0,
        difficulty: 0,
        effort: 0,
        time: 0,
        bugs: 0
      }
    };

    complexity.project = Object.values(complexity.files).reduce((accumulator, fileComplexity) => {
      
      accumulator.sloc.physical = accumulator.sloc.physical + fileComplexity.sloc.physical;
      accumulator.sloc.logical = accumulator.sloc.logical + fileComplexity.sloc.logical;

      accumulator.cyclomatic.value = accumulator.cyclomatic.value + fileComplexity.cyclomatic.value;

      accumulator.halstead.distinctOperators = accumulator.halstead.distinctOperators + fileComplexity.halstead.distinctOperators;
      accumulator.halstead.totalOperators = accumulator.halstead.totalOperators + fileComplexity.halstead.totalOperators;
      accumulator.halstead.distinctOperands = accumulator.halstead.distinctOperands + fileComplexity.halstead.distinctOperands;
      accumulator.halstead.totalOperands = accumulator.halstead.totalOperands + fileComplexity.halstead.totalOperands;

      return accumulator;

    }, complexity.project);


    const n1 = complexity.project.halstead.distinctOperators;
    const N1 = complexity.project.halstead.totalOperators;
    
    const n2 = complexity.project.halstead.distinctOperands;
    const N2 = complexity.project.halstead.totalOperands;

    const programVocabulary = n1 + n2;
    const programLength = N1 + N2;
    const estimatedProgramLength = (n1*getBaseLog(n2, 2)) + (n2*getBaseLog(n2, 2));
    const volume = programLength * getBaseLog(programVocabulary, 2);
    const difficulty = (n1/2) * (N2/n2);
    const effort = volume * difficulty;
    const timeRequiredToProgram =  effort / 18;
    const bugsDelivered = volume/3000; 

    const slocLogical = complexity.project.sloc.logical;

    const cyclomaticComplexity = complexity.project.cyclomatic.value;
    const cyclomaticDensity = (cyclomaticComplexity / slocLogical) * 100;

    complexity.project.numFiles = Object.keys(complexity.files).length;
    complexity.project.cyclomatic.density = cyclomaticDensity;
    complexity.project.halstead.vocabulary = programVocabulary;
    complexity.project.halstead.length = programLength;
    complexity.project.halstead.estimatedLength = estimatedProgramLength;
    complexity.project.halstead.volume = volume;
    complexity.project.halstead.difficulty = difficulty;
    complexity.project.halstead.effort = effort;
    complexity.project.halstead.time = timeRequiredToProgram;
    complexity.project.halstead.bugs = bugsDelivered;

    return complexity;
    
  }

  module.exports = analyze;

}());