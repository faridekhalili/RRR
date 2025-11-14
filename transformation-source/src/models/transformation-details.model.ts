
import { NodePath } from '@babel/core';
import { Node } from '@babel/types';
import { GlobalConfig } from '../config/global.config';
import { LogLevel } from '../enums/log-level.enum';
import { TransformationType } from '../enums/transformation-type.enum';
import { logger } from '../utils/logger.util';
import { Log } from './log.model';
import { resolve } from 'path';

export class TransformationDetails {

  public constructor(
    private _rawString: string,
    private _file: string,
    private _startLine: number,
    private _endLine: number,
    private _startCol: number,
    private _endCol: number,
    private _type: TransformationType,
    private _transformationPriority: number,
    private _astNodeBefore: NodePath<Node>,
    private _astNodeAfter: NodePath<Node>,
    private _additionalInfo: { [key: string]: any }
  ) { }

  public get rawString(): string {
    return this._rawString;
  }

  public set astNodeBefore(astNode: NodePath<Node>) {
    this._astNodeBefore = astNode;
  }

  public get astNodeBefore(): NodePath<Node> {
    return this._astNodeBefore;
  }

  public set astNodeAfter(astNode: NodePath<Node>) {
    this._astNodeAfter = astNode;
  }

  public get astNodeAfter(): NodePath<Node> {
    return this._astNodeAfter;
  }

  public get file(): string {
    return this._file;
  }

  public get startLine(): number {
    return this._startLine;
  }

  public get endLine(): number {
    return this._endLine;
  }

  public get startCol(): number {
    return this._startCol;
  }

  public get endCol(): number {
    return this._endCol;
  }

  public get type(): TransformationType {
    return this._type;
  }

  public get transformationPriority(): number {
    return this._transformationPriority;
  }

  public get additionalInfo(): { [key: string]: any } {
    return this._additionalInfo;
  }

  // parse "/path/to/file.js:<5,11>--<7,1>~~~insert-IIFE???{\"key\":\"value\"}" into the fields of this class.
  public static fromString(line: string, pathToProjectDir: string): null | TransformationDetails {

    if (line === '' || line === '"transformation"' || line === '"col0"') {
      return null;
    }

    line = line.slice(1, line.length - 1);
    // // Gets rid of all quotes (")
    // line = line.replace(/"/g, '');

    const [sourceInfo, additionalInfo]: string[] = line.split('???');

    // Note: the '>' here gets rid of the '>' so we don't have to remove it later.
    // eslint-disable-next-line prefer-const
    let [lhs, rawType]: string[] = sourceInfo.split('>~~~');

    rawType = rawType.replace(/-/g, '_').toLowerCase();
    // Figure out the type.
    const enumIndex: number = Object.values(TransformationType).indexOf(<any>rawType);
    if (enumIndex === -1) {
      logger.log(new Log.Builder()
        .withSeverity(LogLevel.ERROR)
        .withModule('TransformationInput.fromString')
        .withMessage('Invalid Transformation Type')
        .withDetails('Invalid transformation type in: ' + line)
        .build());

      return null;
    }
    const enumKey: string = Object.keys(TransformationType)[enumIndex];
    const type: TransformationType = TransformationType[enumKey as keyof typeof TransformationType];

    // Extract the rest of the information.
    // Note: the '<' here gets rid of the '<' so we don't have to remove it later.
    const [file, lineInfo]: string[] = lhs.split(':<');

    // Note: the '>' and '<' here get rid of the last chevrons.
    const [startLineInfo, endLineInfo]: string[] = lineInfo.split('>--<');

    // startLineInfo and endLineInfo should be #,#.
    const [startLine, startCol]: number[] = startLineInfo
      .split(',')
      .map((num: string): number => Number.parseInt(num, 10));
    const [endLine, endCol]: number[] = endLineInfo
      .split(',')
      .map((num: string): number => Number.parseInt(num, 10));

    // Are any NaN?
    if ([startLine, startCol, endLine, endCol].indexOf(NaN) > -1) {
      logger.log(new Log.Builder()
        .withSeverity(LogLevel.ERROR)
        .withModule('TransformationInput.fromString')
        .withMessage('Invalid source location')
        .withDetails('Invalid line or column number in: ' + line)
        .build());
      return null;
    }

    let additionalInfoFinal: any;

    if (type === TransformationType.use_callback_dep) {
      additionalInfoFinal = {deps: [additionalInfo] };
    } else {
      if (additionalInfo) {
        additionalInfoFinal = additionalInfo.replace('{varName:', '').replace('}', '');
        additionalInfoFinal = { varName: additionalInfoFinal };
      } else {
        additionalInfoFinal = { varName: 'dummy' };
      }
    }

    // Ok, we've passed all the checks at this point.
    return new TransformationDetails.Builder()
      .withRawString(line.split('???')[0])
      .withFile(pathToProjectDir ? resolve(pathToProjectDir, file) : file)
      .withStartCol(Math.max(startCol - 1, 0)) // Error correction for difference in QL and Babel start col.
    // (Math.max(..., 0) is to deal with the <0,0>--<0,0> situation.)
      .withEndCol(endCol)
      .withStartLine(startLine)
      .withEndLine(endLine)
      .withType(type)
      .withTransformationPriority(GlobalConfig.transformationOrderMap[enumKey])
      .withAdditionalInfo(additionalInfoFinal)
      .build();
  }

  public static Builder: any = class Builder {

    private _rawString: string;
    private _file: string;
    private _startLine: number;
    private _endLine: number;
    private _startCol: number;
    private _endCol: number;
    private _type: TransformationType;
    private _transformationPriority: number;
    private _astNodeBefore: NodePath<Node>;
    private _astNodeAfter: NodePath<Node>;
    private _additionalInfo: { [key: string]: string };

    public withRawString(rawString: string): Builder {
      this._rawString = rawString;
      return this;
    }

    public withFile(file: string): Builder {
      this._file = file;
      return this;
    }

    public withStartLine(startLine: number): Builder {
      this._startLine = startLine;
      return this;
    }

    public withEndLine(endLine: number): Builder {
      this._endLine = endLine;
      return this;
    }

    public withStartCol(startCol: number): Builder {
      this._startCol = startCol;
      return this;
    }

    public withEndCol(endCol: number): Builder {
      this._endCol = endCol;
      return this;
    }

    public withType(type: TransformationType): Builder {
      this._type = type;
      return this;
    }

    public withTransformationPriority(transformationPriority: number): Builder {
      this._transformationPriority = transformationPriority;
      return this;
    }

    public withASTNodeBefore(astNode: NodePath<Node>): Builder {
      this._astNodeBefore = astNode;
      return this;
    }

    public withASTNodeAfter(astNode: NodePath<Node>): Builder {
      this._astNodeAfter = astNode;
      return this;
    }

    public withAdditionalInfo(additionalInfo: { [key: string]: string }): Builder {
      this._additionalInfo = additionalInfo;
      return this;
    }

    public build(): TransformationDetails {
      return new TransformationDetails(
        this._rawString,
        this._file,
        this._startLine,
        this._endLine,
        this._startCol,
        this._endCol,
        this._type,
        this._transformationPriority,
        this._astNodeBefore,
        this._astNodeAfter,
        this._additionalInfo
      );
    }

  };

}
