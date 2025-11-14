
import yargs from 'yargs';                          // Parsing for CLI.
import { hideBin } from 'yargs/helpers';            // (Makes the process.argv parsing a little nicer.)
import { burp } from './burp';


// Usage:
// node dist/doTransformation.js
//  --project /path/to/project/
//  --transformations /path/to/list/of/transformations.csv
//  --imports /path/to/list/of/imports/to/remove.csv
// [--babelConfig /path/to/babel/config/file/for/parsing/the/project.json]

(async function(): Promise<void> {

  const argv: any = await yargs(hideBin(process.argv))
    .option('project',  { type : 'string', demandOption : false  })
    .option('transformations',  { type : 'string', demandOption : true  })
    .option('babelConfig',      { type : 'string', demandOption : false })
    .boolean('printOnly')
    .parse();

  const pathToProjectDir: string = argv.project;
  const pathToTransformations: string = argv.transformations;
  const pathToBabelConfig: string = argv.babelConfig;
  const printOnly: boolean = argv.printOnly ? true : false;

  burp(pathToProjectDir, pathToTransformations, pathToBabelConfig, printOnly);

}());
