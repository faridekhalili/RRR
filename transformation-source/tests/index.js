const babelParser = require('@babel/parser');
const fs = require('fs');
const path = require('path');

const contents = fs.readFileSync(path.resolve(__dirname, 'original', 'pattern3', 'noProps2.tsx'), 'utf8');
console.log(contents);

console.log(JSON.stringify(babelParser.parse(contents, {
  sourceType: 'module',
  plugins: [
    'tsx', 'jsx', 'typescript'
  ]
}), null, 2));
