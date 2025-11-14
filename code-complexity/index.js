(async function(){

  'use strict';
  const calculateComplexity = require('./calculate-complexity');
  const compareComplexity = require('./compare-complexity');

  await calculateComplexity();
  compareComplexity();

}());