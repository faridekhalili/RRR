
import { ParseResult } from '@babel/parser';
import traverse from '@babel/traverse';
import { File, SourceLocation } from '@babel/types';
import { TransformationDetails } from '../models/transformation-details.model';
import { NodePath } from '@babel/core';


export class ASTProcessor {

  public static traverseAndCacheNodes(ast: ParseResult<File>, astClone: ParseResult<File>,
    listOfTransformations: TransformationDetails[]): void {

    traverse(ast, {
      enter(path: NodePath): void {
        if (path.node.type === 'Program') {
          const tdList: TransformationDetails[] = ASTProcessor.isTransformationDetailForProgram(listOfTransformations);
          if (tdList.length !== 0) {
            tdList.forEach((td: TransformationDetails): void => {
              td.astNodeAfter = path;
            });
          }
        } else {
          const tdList: TransformationDetails[] = ASTProcessor.isLocationOfInterest(path.node.loc, listOfTransformations);
          if (tdList.length !== 0) {
            tdList.forEach((td: TransformationDetails): void => {
              td.astNodeAfter = path;
            });
          }
        }
      }
    });

    traverse(astClone, {
      enter(path: NodePath): void {
        if (path.node.type === 'Program') {
          const tdList: TransformationDetails[] = ASTProcessor.isTransformationDetailForProgram(listOfTransformations);
          if (tdList.length !== 0) {
            tdList.forEach((td: TransformationDetails): void => {
              td.astNodeBefore = path;
            });
          }
        } else {
          const tdList: TransformationDetails[] = ASTProcessor.isLocationOfInterest(path.node.loc, listOfTransformations);
          if (tdList.length !== 0) {
            tdList.forEach((td: TransformationDetails): void => {
              td.astNodeBefore = path;
            });
          }
        }
      }
    });

  }

  private static isTransformationDetailForProgram(listOfTransformations: TransformationDetails[]): TransformationDetails[] {
    return listOfTransformations.filter((td: TransformationDetails): boolean =>
      (td.startLine === 0) &&
			(td.endLine === 0) &&
			(td.startCol === 0) &&
			(td.endCol === 0)
    );
  }

  private static isLocationOfInterest(loc: SourceLocation,
    listOfTransformations: TransformationDetails[]): TransformationDetails[] {
    // || (td.startCol - 1) === loc.start.column is for methods:
    // the location given by CodeQL in methodName() { } matches only () { }, so we have a hack to try
    // to get `methodName() { }` by subtracting the length of the name from the startCol, but sometimes people
    // write methodName () { }, so this extra - 1 moves startCol a lil earlier in that case.
    // oh, it turns out you can mark class methods as private with #, and babel thinks the name starts there.
    // so we also check - 1 again if the initial one doesn't work.
    // Finally, for good measure, we're subtracting 6 in case the method is called `refresh`

    return listOfTransformations.filter((td: TransformationDetails): boolean =>
      (td.startLine === loc.start.line) &&
			(td.endLine === loc.end.line) &&
			((td.startCol === loc.start.column) || (td.startCol - 1) === loc.start.column ||
				(td.startCol - 2) === loc.start.column || (td.startCol - 6) === loc.start.column) &&
			(td.endCol === loc.end.column)
    );
  }

}
