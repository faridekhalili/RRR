
import { parse, ParserOptions } from '@babel/parser';
import generator, { GeneratorResult } from '@babel/generator';
import { createReadStream, promises as fsPromises, ReadStream } from 'fs';
import { createInterface, Interface } from 'readline';
import { TransformationDetails } from '../models/transformation-details.model';
import { Store } from '../store/store';
import { ParseResult } from '@babel/core';


export class FileProcessor {

  public static async processInputCSVFiles(filePath: string, pathToProjectDir?: string): Promise<void> {

    const fileStream: ReadStream = createReadStream(filePath);
    const lines: Interface = createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of lines) {
      const td: TransformationDetails = TransformationDetails.fromString(line, pathToProjectDir);
      Store.addTransformation(td);
    }

  }

  public static async processSourceFile(filePath: string, babelConfig: ParserOptions): Promise<void> {

    try {
      const sourceContents: string = await fsPromises.readFile(filePath, 'utf8');
      const ast: ParseResult = parse(sourceContents, babelConfig);
      const astClone: ParseResult = parse(sourceContents, babelConfig);

      Store.setAST(filePath, ast);
      Store.setASTClone(filePath, astClone);
    } catch (e) {
      console.log(e);
      console.log('...in', filePath);
    }

  }

  public static async writeTransformedSourceFile(filePath: string): Promise<void> {

    const ast: ParseResult = Store.getAST(filePath);
    const sourceCode: GeneratorResult = generator(ast);

    fsPromises.writeFile(filePath, sourceCode.code, 'utf8');

  }

}
