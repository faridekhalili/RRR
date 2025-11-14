
import { Store } from './store/store';
import { ParserOptions } from '@babel/parser';
import { FileProcessor } from './utils/file-processor.util';
import { ASTProcessor } from './utils/ast-processor.util';
import * as transformations from './transformations';
import { TransformationDetails } from './models/transformation-details.model';
import { promises as fsPromises, appendFileSync } from 'fs';
import { ParseResult } from '@babel/core';
import { resolve } from 'path';
import { TransformationType } from './enums/transformation-type.enum';

interface Itransformations { [key: string ]: (td: TransformationDetails) => void };

// basic babel configuration, can be overwritten by supplying a new one.
// Good for JSX and TypeScript. Vue and React need special plugins.
let babelConfig: ParserOptions = {
  sourceType: 'unambiguous',
  plugins: [
    'jsx', 'typescript' /* "@vue/babel-plugin-jsx" */
  ]
};

export async function burp(
  pathToProjectDir: string,
  pathToTransformations: string,
  pathToBabelConfig: string,
  printOnly: boolean): Promise<void> {

  const startTime: number = new Date().getTime();

  const csvFiles: Array<string> = (await fsPromises.readdir(pathToTransformations))
    .map((file: string): string => resolve(pathToTransformations, file));
  const inputCSVPromises: Promise<void>[] = [...csvFiles]
    .map((csvFile: string): Promise<void> => FileProcessor.processInputCSVFiles(csvFile, pathToProjectDir));

  // babel config is optional (as we have a default one)
  if (pathToBabelConfig) {
    if (pathToBabelConfig.endsWith('.json')) {
      const babelConfigFileContents: string = await fsPromises.readFile(pathToBabelConfig, 'utf8');
      babelConfig = JSON.parse(babelConfigFileContents);
    } else if (pathToBabelConfig.endsWith('.js')) {
      const babelConfigFileContents: string = await fsPromises.readFile(pathToBabelConfig, 'utf8');
      // eslint-disable-next-line no-eval
      const theFn: Function = eval(babelConfigFileContents);
      babelConfig = theFn();
    }
  }

  // Enable topLevelAwaits for babel, regardless of what the config file says.
  if (babelConfig.plugins === undefined) {
    babelConfig.plugins = [];
  }

  babelConfig.plugins = [...babelConfig.plugins, 'topLevelAwait'];

  await Promise.all(inputCSVPromises);

  const sourceFilesTransformed: number = Store.sourceFiles.length;
  let totalTransformations: number = 0;
  let componentsMemoized: number = 0;
  let stateChangedToRef: number = 0;


  const sourceFilePromises: Promise<void>[] = Store.sourceFiles
    .map(async (filePath: string): Promise<void> => {
      await FileProcessor.processSourceFile(filePath, babelConfig);

      const tdList: TransformationDetails[] = Store.getTransformationsByFileName(filePath);
      totalTransformations += tdList.length;

      componentsMemoized += tdList.filter((td: TransformationDetails): boolean =>
        td.type === TransformationType.memoize || td.type === TransformationType.component_no_props).length;

      stateChangedToRef += tdList.filter((td: TransformationDetails): boolean =>
        td.type === TransformationType.use_state_to_use_ref).length;

      const ast: ParseResult = Store.getAST(filePath);

      const astClone: ParseResult = Store.getASTClone(filePath);
      ASTProcessor.traverseAndCacheNodes(ast, astClone, tdList);

      tdList
        .sort((a: TransformationDetails, b: TransformationDetails): number => a.transformationPriority - b.transformationPriority)
        .sort((a: TransformationDetails, b: TransformationDetails): number => {
          if (a.startLine > b.startLine && a.endLine < b.endLine) {
            // a is contained in b, and should be first
            return -1;
          } else if (a.startLine > b.startLine && a.endLine === b.endLine &&
                                a.endCol <= b.endCol) {
            // a brushes up against the end of b
            return -1;
          } else if (a.startLine === b.startLine && a.endLine < b.endLine &&
                                a.startCol >= b.startCol) {
            // a brushes up against the beginning of b
            return -1;
          } else if (
            a.startLine === b.startLine && a.endLine === b.endLine &&
                        a.startCol > b.startCol && a.endCol < b.endCol) {
            // a is again contained in b, and should be first
            return -1;
          } else {
            // otherwise, doesn't matter
            return 0;
          }
        })
        .forEach((td: TransformationDetails): void => (<Itransformations>transformations)[td.type](td));

    });

  await Promise.all(sourceFilePromises);

  if (!printOnly) {
    const writeFilePromises: Promise<void>[] = Store.sourceFiles
      .map(FileProcessor.writeTransformedSourceFile);
    await Promise.all(writeFilePromises);
  }

  const endTime: number = new Date().getTime();

  // const metadataPath: string = '/home/spitfire/react-rerendering/rendering-optimization/transformation-source/metadata.csv';
  // eslint-disable-next-line max-len
  const data: string = `${pathToTransformations}\t${sourceFilesTransformed}\t\t\t${totalTransformations}\t\t\t${componentsMemoized}\t\t\t${stateChangedToRef}\t\t${endTime - startTime}\n`;
  console.log('path to CSVs\tnum files\tTotal transformations\tComponents memoized\tState to Ref\t time taken');
  console.log(data);
  // appendFileSync(metadataPath, data, 'utf8');

}
