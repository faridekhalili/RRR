

import { ParseResult } from '@babel/parser';
import { File } from '@babel/types';
import { TransformationDetails } from '../models/transformation-details.model';
import { TransformationType } from '../enums/transformation-type.enum';

export class Store {

  private static _transformationDetailsMap: {[key: string]: { [key: string]: TransformationDetails } } = {};
  private static _sourceFiles: Set<string> = new Set();
  private static _astCache: {[key: string]: ParseResult<File>} = { };
  private static _astCacheClone: {[key: string]: ParseResult<File>} = { };

  public static setASTClone(fileName: string, ast: ParseResult<File>): void {
    Store._astCacheClone[fileName] = ast;
  }

  public static getASTClone(fileName: string): ParseResult<File> {
    return Store._astCacheClone[fileName];
  }

  public static setAST(fileName: string, ast: ParseResult<File>): void {
    Store._astCache[fileName] = ast;
  }

  public static getAST(fileName: string): ParseResult<File> {
    return Store._astCache[fileName];
  }

  public static addSourceFile(fileName: string): void {
    Store._sourceFiles.add(fileName);
  }

  public static get sourceFiles(): string[] {
    return Array.from(Store._sourceFiles);
  }

  public static addTransformation(td: TransformationDetails): void {
    if (!td) {
      return;
    }
    const fileName: string = td.file;
    if (!this._transformationDetailsMap[fileName]) {
      this._transformationDetailsMap[fileName] = { };
    }
    Store.addSourceFile(fileName);

    if (this._transformationDetailsMap[fileName][`${td.rawString}_value`] && td.type === TransformationType.add_dot_current) {
      return;
    }

    if (td.type === TransformationType.add_dot_current_value) {
      this._transformationDetailsMap[fileName][td.rawString] = td;
      if (this._transformationDetailsMap[fileName][td.rawString.replace('_value', '')]) {
        delete this._transformationDetailsMap[fileName][td.rawString.replace('_value', '')];
      }
      return;
    }


    if (this._transformationDetailsMap[fileName][`${td.rawString}_value`] &&
      td.type === TransformationType.set_state_to_assignment_current) {
      return;
    }

    if (td.type === TransformationType.set_state_to_assignment_current_value) {
      this._transformationDetailsMap[fileName][td.rawString] = td;
      if (this._transformationDetailsMap[fileName][td.rawString.replace('_value', '')]) {
        delete this._transformationDetailsMap[fileName][td.rawString.replace('_value', '')];
      }
      return;
    }


    if (this._transformationDetailsMap[fileName][`${td.rawString}_dep`] && td.type === TransformationType.use_callback) {
      return;
    }

    if (this._transformationDetailsMap[fileName][td.rawString] && td.type === TransformationType.use_callback_dep) {
      this._transformationDetailsMap[fileName][td.rawString].additionalInfo.deps.push(td.additionalInfo.deps[0]);
      if (this._transformationDetailsMap[fileName][td.rawString.replace('_dep', '')]) {
        delete this._transformationDetailsMap[fileName][td.rawString.replace('_dep', '')];
      }
      return;
    }

    this._transformationDetailsMap[fileName][td.rawString] = td;

  }

  public static getTransformationsByFileName(fileName: string): TransformationDetails[] {
    return Object.values(Store._transformationDetailsMap[fileName]);
  }

  public static get listOfTransformations(): TransformationDetails[] {
    return [].concat.apply([], Object.values(Store._transformationDetailsMap)
      .map((obj: { [key: string]: TransformationDetails }): TransformationDetails[] => Object.values(obj)));
  }

}
