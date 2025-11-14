import { LogLevel } from '../enums/log-level.enum';
import { Log } from '../models/log.model';
import { logger } from '../utils/logger.util';

import { TransformationDetails } from '../models/transformation-details.model';
import * as T from '@babel/types';
import { NodePath } from '@babel/traverse';

export default function useCallback(td: TransformationDetails): void {

  const theNode: NodePath<T.Node> = td.astNodeAfter;

  if (!theNode.isFunction()) {
    logger.log(
      new Log.Builder()
        .withSeverity(LogLevel.LOG)
        .withModule('transformations.useCallback()')
        .withMessage('Expected function, got a ' + theNode.type)
        .build()
    );
    return;
  }

  let expression: T.Expression = null;
  if (T.isExpression(theNode.node)) {
    expression = theNode.node as T.Expression;
  } else {
    expression = T.functionExpression(
      (<T.FunctionDeclaration>theNode.node).id,
      (<T.FunctionDeclaration>theNode.node).params,
      (<T.FunctionDeclaration>theNode.node).body,
      (<T.FunctionDeclaration>theNode.node).generator,
      (<T.FunctionDeclaration>theNode.node).async);
  }

  const dependencyList: T.ArrayExpression = T.arrayExpression();
  const callbackWrappedFunction: T.CallExpression = T.callExpression(T.identifier('useCallback'),
    [expression, dependencyList]);

  if (theNode.parentPath.isExportNamedDeclaration() || (!theNode.parentPath.isExportDeclaration() &&
  !theNode.parentPath.isVariableDeclarator() && !theNode.parentPath.isVariableDeclaration()
  && !theNode.parentPath.isAssignmentExpression() && theNode.isFunctionDeclaration())) {

    const functionName: string = (<T.Identifier>(<T.FunctionDeclaration>theNode.node).id).name;
    const variableDeclarator: T.VariableDeclarator = T.variableDeclarator(T.identifier(functionName), callbackWrappedFunction);
    const variableDeclaration: T.VariableDeclaration = T.variableDeclaration('const', [variableDeclarator]);
    theNode.replaceWith(variableDeclaration);

  } else {
    theNode.replaceWith(callbackWrappedFunction);
  }

}
